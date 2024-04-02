// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { parseJwt } from '@/lib/utils';

type Data = {
  message: string;
  data?: any;
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

    const { id: userId, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Fetch user chat rooms where user_id_1 matches the userId
    const { data: chatrooms1, error: chatRoomError1 } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id_1', userId);

    // Fetch user chat rooms where user_id_2 matches the userId
    const { data: chatrooms2, error: chatRoomError2 } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id_2', userId);

    if (chatRoomError1 || chatRoomError2) {
      console.error('Database Error:', chatRoomError1 || chatRoomError2);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Combine the results from both queries
    const chatrooms = [...(chatrooms1 || []), ...(chatrooms2 || [])];

    return res.status(200).json({ message: 'Success', data: chatrooms });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}