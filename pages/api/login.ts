// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { sha256 } from "js-sha256";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || " ";
const TOKEN_EXPIRATION_TIME = "6h";

type Data = {
  token?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const { email, password } = schema.parse(req.body);

    const { data: userData, error: userError } = await supabase
      .from("auth-user")
      .select("*")
      .eq("email", email)
      .eq("isverified", true);

    if (userError) {
      console.error(userError);
      return res.status(500).json({ message: "Database Error" });
    }

    if (!userData || userData.length === 0) {
      return res.status(402).json({ message: "User not registered" });
    }

    const hashedPassword = sha256(password).toString();
    const isPasswordValid = userData[0].password === hashedPassword;
    const userid = userData[0].id;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userid ,email, hashedPassword }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION_TIME,
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}