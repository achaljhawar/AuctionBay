// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, authcode } = req.body;

    if (!email || !authcode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { data: isValid, error: userError } = await supabase
      .from("auth-user")
      .select("*")
      .eq("email", email)
      .eq("authcode", authcode);

    if (userError) {
      return res.status(500).json({ message: "Internal Server Error"});
    }

    if (isValid && isValid.length > 0) {
      const { data: verify, error: updateError } = await supabase
        .from("auth-user")
        .update({ isverified: true })
        .match({ email, authcode });
      if (updateError) {
        return res.status(500).json({ message: "Internal Server Error"});
      }
      return res.status(200).json({ message: "User verified successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}