// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { parseJwt } from "@/lib/utils";
type Data = {
  message?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
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

    const { id: firstID, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp < currentTime) {
      return res.status(401).json({ message: 'Token expired' });
    }
    const { secondID } = req.body;

    if (!firstID || !secondID) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check if the chatroom already exists with the provided order of user IDs
    const { data: chatroom1, error: error1 } = await supabase
      .from("chatrooms")
      .select("*")
      .eq("user_id_1", firstID)
      .eq("user_id_2", secondID);

    if (error1) {
      console.error("Error fetching chatroom1:", error1);
      return res.status(500).json({ message: "Database Error" });
    }

    if (chatroom1 && chatroom1.length > 0) {
      // Found a chatroom with the given user IDs
      return res.status(200).json({ data: chatroom1 });
    }

    // Check if the chatroom exists with the reversed order of user IDs
    const { data: chatroom2, error: error2 } = await supabase
      .from("chatrooms")
      .select("*")
      .eq("user_id_1", secondID)
      .eq("user_id_2", firstID);

    if (error2) {
      console.error("Error fetching chatroom2:", error2);
      return res.status(500).json({ message: "Database Error" });
    }

    if (chatroom2 && chatroom2.length > 0) {
      // Found a chatroom with the reversed user IDs
      return res.status(200).json({ data: chatroom2 });
    }

    // No existing chatroom found, create a new one
    const { data, error } = await supabase
      .from("chatrooms")
      .insert([
        {
          user_id_1: firstID,
          user_id_2: secondID,
        },
      ])
      .select();
    if (error) {
      console.error("Error creating chatroom:", error);
      return res.status(500).json({ message: "Database Error" });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}