// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";

type UserData = {
  id: string;
  email: string;
  email_visibility: boolean;
  [key: string]: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { data: userData, error: userError } = await supabase .from("user-details") .select("*") 

    if (userError) {
      console.error(userError);
      return res.status(500).json({ message: "Database Error" });
    }

    const sanitizedUserData = userData.map((user) => {
      if (!user.email_visibility) {
        return {
          ...user,
          email: "hidden",
        };
      }
      return user;
    });

    return res.status(200).json({ userData: sanitizedUserData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}