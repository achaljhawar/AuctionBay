// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

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

    const { firstID, secondID } = req.body;

    // Check if firstID and secondID are provided
    if (!firstID || !secondID) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check if the chatroom already exists
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
      const chatroom = chatroom1[0];
      return res.status(200).json({ data: chatroom });
    }

    // No chatroom found with the given user IDs in the first query
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
      const chatroom = chatroom2[0];
      return res.status(200).json({ data: chatroom });
    }

    // No chatroom found with either combination of user IDs
    return res.status(404).json({ message: "Chatroom not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}