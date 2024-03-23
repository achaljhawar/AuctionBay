// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { parseJwt } from "@/lib/utils"
type Data = {
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "POST") {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid token', error: 'Invalid token' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = parseJwt(token);
        const password = decoded.hashedPassword;
        const email = decoded.email;
        const currentTime = Math.floor(Date.now() / 1000);
        const tokenexpiry = decoded.exp;
        const { data: userData, error: userError } = await supabase
          .from("auth-user")
          .select("*")
          .eq("email", email)
          .eq("password", password);
        if (userError) {
            return res.status(500).json({ message: "Database Error" }); 
        } else if (userData && userData.length > 0 && tokenexpiry > currentTime){
            return res.status(200).json({ message: "User Verified" });
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        
        }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}