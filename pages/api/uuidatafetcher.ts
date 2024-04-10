// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { uuid } = req.body;

    // Check if the data is cached in Redis
    const cachedData = await redis.get(`user-details-${uuid}`);
    if (cachedData) {
      const userData = JSON.parse(cachedData);
      if (userData.email_visibility === false) {
        userData.email = "Email hidden";
      }
      return res.status(200).json(userData);
    }

    // Fetch data from Supabase if not cached
    const { data: userData, error: userError } = await supabase
      .from("user-details")
      .select("*")
      .eq("id", uuid);

    if (userError) {
      console.error(userError);
      return res.status(500).json({ message: "Database Error" });
    }

    if (userData && userData.length > 0) {
      // Cache the data in Redis
      await redis.set(`user_details_${uuid}`, JSON.stringify(userData[0]));

      if (userData[0].email_visibility === false) {
        userData[0].email = "Email hidden";
      }
      return res.status(200).json(userData[0]);
    }

    return res.status(400).json({ message: "this user doesn't exist" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}