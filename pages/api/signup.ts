// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { sha256 } from "js-sha256";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.google.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

type Data = {
  message: string;
};
async function sendVerificationEmail(email: string, verifyUrl: string) {
  try {
    const mailOptions = {
      to: email,
      subject: "Verify your email address",
      html: `
        <html>
          <body>
            <h1>Buy'N'Sell</h1>
            <p>Thank you for signing up with us. We're excited to have you on board!</p>
            <p>To complete your registration and start using our awesome features, please verify your email address by clicking the link below:</p>
            <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
            <p>If you did not sign up for our service, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Buy'N'Sell</p>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}
function authcodecreator(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
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

    if (userData && userData.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    const timestamp = new Date().toISOString();

    const authcode = authcodecreator(8);
    const verifyurl = `http://localhost:3000/verify?email=${email}&authcode=${authcode}`;
    const hashedPassword = sha256(password).toString();
    const { data, error } = await supabase.from("auth-user").insert([
      { email: email, password: hashedPassword, timestamp: timestamp, authcode: authcode }
    ]);
    sendVerificationEmail(email, verifyurl);
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}