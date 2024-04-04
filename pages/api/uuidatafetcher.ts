// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
 
    const { uuid } = req.body;

    const { data: userData, error: userError } = await supabase
      .from("auth-user")
      .select("*")
      .eq("id", uuid)
    if (userError) {
      console.error(userError);
      return res.status(500).json({ message: "Database Error" });
    }

    if (userData && userData.length > 0) {
      return res.status(200).json(userData);
    }
    return res.status(400).json({ message: "this user doesn't exist" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}