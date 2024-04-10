// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { parseJwt } from '@/lib/utils';
import { redis } from '@/lib/redis'; // Import the Redis client

type Data = { message: string; data?: any; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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

    const { id: userId, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired' });
    }

    const { chatroom_id } = req.body;

    // Check if the chatroom data is available in the Redis cache
    const cachedChatroom = await redis.get(`chatroom_users_${chatroom_id}`);
    if (cachedChatroom) {
      const { data: chatrooms, error } = JSON.parse(cachedChatroom);
      if (error) {
        console.error('Error fetching chatroom from cache:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (!(chatrooms && chatrooms.length > 0)) {
        return res.status(404).json({ message: 'this chatroom does not exist' });
      }

      if (chatrooms[0].user_id_1 !== userId && chatrooms[0].user_id_2 !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      return res.status(200).json({ message: 'Chatroom found' });
    }

    // If the data is not in the cache, fetch it from the database
    const { data: chatrooms, error } = await supabase.from('chatrooms').select('*').eq('chatroom_id', chatroom_id);
    if (error) {
      console.error('Error fetching chatroom:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (!(chatrooms && chatrooms.length > 0)) {
      // Store the 'chatroom does not exist' result in the Redis cache
      await redis.set(`chatroom_${chatroom_id}`, JSON.stringify({ data: null, error: 'this chatroom does not exist' }), 'EX', 60 * 60); // Cache for 1 hour
      return res.status(404).json({ message: 'this chatroom does not exist' });
    }

    if (chatrooms[0].user_id_1 !== userId && chatrooms[0].user_id_2 !== userId) {
      // Store the 'unauthorized' result in the Redis cache
      await redis.set(`chatroom_${chatroom_id}`, JSON.stringify({ data: null, error: 'Unauthorized' }), 'EX', 60 * 60); // Cache for 1 hour
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Store the successful result in the Redis cache
    await redis.set(`chatroom_users_${chatroom_id}`, JSON.stringify({ data: chatrooms, error: null }), 'EX', 60 * 60); // Cache for 1 hour

    return res.status(200).json({ message: 'Chatroom found' });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}