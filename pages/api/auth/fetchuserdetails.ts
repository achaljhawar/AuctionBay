// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { parseJwt } from '@/lib/utils';
import { redis } from '@/lib/redis'; // Import the Redis client

type Data = { message: string; data?: any; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { email, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Check if the user data is available in the Redis cache
    const cachedUserData = await redis.get(`user_${email}`);
    if (cachedUserData) {
      return res.status(200).json(JSON.parse(cachedUserData));
    }

    // Fetch user data from the database
    const { data: userData, error: userError } = await supabase.from('user-details').select('*').eq('email', email).single();

    if (userError) {
      console.error('Database Error:', userError);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Cache the user data in Redis
    if (userData) {
      await redis.set(`user_${email}`, JSON.stringify(userData), 'EX', 60 * 60); // Cache for 1 hour
      return res.status(200).json(userData);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}