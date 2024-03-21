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
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}