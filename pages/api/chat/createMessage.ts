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
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = parseJwt(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { userid: userId, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired' });
    }

    const { chatroom_id, message } = req.body;

    if (!chatroom_id || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          chatroom_id: `${chatroom_id}`,
          sender_id: `${userId}`,
          text: `${message}`,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting message:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    return res.status(200).json({ message: 'Message sent successfully', data });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}