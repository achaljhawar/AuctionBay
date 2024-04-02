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
    const { data: chatroom, error: userError } = await supabase
      .from("messages")
      .select("*")
      .or(
        `(user_id_1.eq.${firstID},user_id_2.eq.${secondID}), (user_id_1.eq.${secondID},user_id_2.eq.${firstID})`
      );

    if (userError) {
      console.error(userError);
      return res.status(500).json({ message: "Database Error" });
    }

    // Return the chatroom data or an empty array if no chatroom exists
    return res.status(200).json({ data: chatroom || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}