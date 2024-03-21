import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';
import { supabase } from "@/lib/supabase";
import cookie from 'cookie';
const mainurl = process.env.PUBLIC_URL || "";
const client_id = process.env.GOOGLE_CLIENT_ID || "";
const client_secret = process.env.GOOGLE_CLIENT_SECRET || "";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;
  const redirectURL = req.headers.referer; // Get the referring URL

  try {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: `${mainurl}auth/google/`,
      grant_type: 'authorization_code',
    };

    const response = await axios.post(
      url,
      querystring.stringify(values),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id_token, access_token } = response.data;

    interface GoogleUserInfo {
      sub: string;
      email: string;
      name: string;
      picture: string;
    }

    const { data: userInfo } = await axios.get<GoogleUserInfo>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const { picture, email } = userInfo;
    const { data: userData, error: userError } = await supabase
      .from("auth-user")
      .select("*")
      .eq("email", email)
      .eq("isverified", true);

    if (userData && userData.length > 0) {
      return res.status(400).redirect(`/`);
    }

    const token = jwt.sign({ picture, email }, 'mySecretKey', { expiresIn: '10m' });
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 10,
        sameSite: 'strict',
        path: '/',
      })
    );

    res.status(200).redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
    res.status(500).redirect(`/`);
  }
}