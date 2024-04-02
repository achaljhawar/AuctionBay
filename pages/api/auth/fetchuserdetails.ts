// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { parseJwt } from '@/lib/utils';

type Data = {
  message: string;
  error?: string;
};

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
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Parse the JWT token
    const decoded = parseJwt(token);

    // Check if the decoded token is valid
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { email, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Fetch user data from the database
    const { data: userData, error: userError } = await supabase
      .from('user-details')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Database Error:', userError);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Check if user data is valid
    console.log(userData)
    if (userData) {
      return res.status(200).json(userData);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}