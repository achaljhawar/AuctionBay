// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {parseJwt} from '@/lib/utils';
import { z } from 'zod';
import { verifyUPI, VerifyVPA } from 'bhimupijs';
import { supabase } from '@/lib/supabase';

type Data = {
  message: string;
  error?: string;
};

const schema = z.object({
  avatarUrl: z.string(),
  firstName: z
    .string()
    .min(5, { message: "First name must be at least 5 characters." }),
  lastName: z
    .string()
    .min(5, { message: "Last name must be at least 5 characters." }),
  shareEmail: z.boolean(),
  upiId: z.string().regex(/^[a-z0-9_.-]{3,}@[a-z]{3,}$/, { message: "Invalid UPI ID format" }),
  shippingAddresses: z
    .array(z.string().min(10, { message: "Address is required" }))
    .max(5, { message: "You can add up to 5 shipping addresses" }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Check if the Authorization header is present and valid
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
    }

    // Parse the JWT token
    const decoded = parseJwt(token);

    // Check if the decoded token is valid
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
    }

    const { email, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired', error: 'Token expired' });
    }

    const { data: userData, error: userError } = await supabase
      .from('auth-user')
      .select('*')
      .eq('email', email);

    if (userError) {
      throw new Error(`Database Error: ${userError.message}`);
    }

    // Check if the user exists in the auth-user table
    if (!(userData && userData.length > 0)) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userData[0].id;

    // Fetch and validate form data
    const formData = req.body;
    const validatedFormData = schema.safeParse(formData);

    if (!validatedFormData.success) {
      return res.status(400).json({ message: 'Invalid form data', error: validatedFormData.error.toString() });
    }

    // Validate UPI ID
    try {
      const response: VerifyVPA = await verifyUPI(formData.upiId);
      const { result, pspBank } = response;

      if (!result || pspBank === 'unknown') {
        return res.status(406).json({ message: 'Invalid UPI ID' });
      }
    } catch (error) {
      console.error('Error verifying UPI ID:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Check if the user already exists in the user-details table
    const { data: checkUser, error: checkUserError } = await supabase
      .from('user-details')
      .select('*')
      .eq('id', userId);

    if (checkUserError) {
      throw new Error(`Database Error: ${checkUserError.message}`);
    }

    if (checkUser && checkUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Insert user data into the user-details table
    const { error } = await supabase
      .from('user-details')
      .insert({
        id: userId,
        email: email,
        firstname: formData.firstName,
        lastname: formData.lastName,
        upi_id: formData.upiId,
        shipping_addresses: formData.shippingAddresses,
        avatar_url: formData.avatarUrl,
        email_visibility: formData.shareEmail,
      })
      .select();

    if (error) {
      throw new Error(`Database Error: ${error.message}`);
    } else {
      return res.status(200).json({ message: 'User Verified' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}