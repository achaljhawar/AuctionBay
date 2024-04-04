import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';
import { supabase } from "@/lib/supabase";
import { authcodecreator, generateEightDigitNumber } from "@/lib/utils"
import { sha256 } from 'js-sha256';

type ResponseData = {
  token?: string;
  error?: string;
};

const JWT_SECRET = process.env.JWT_SECRET || " ";
const TOKEN_EXPIRATION_TIME = '6h';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    const { access_token, id_token } = await exchangeCodeForTokens(code);
    const userInfo = await fetchUserInfo(access_token, id_token);

    const { email, picture } = userInfo;

    if (await checkExistingUser(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    if (!await checkExistingGoogleUser(email)){
      
      await deleteUnverifiedUser(email);
      const uniqueNumber = generateEightDigitNumber();
      const hashedAuthCode = sha256(authcodecreator());
      const timestamp = new Date().toISOString();
  
      const { error } = await supabase.from('auth-user').insert([
        {
          email,
          id: uniqueNumber,
          password: hashedAuthCode,
          timestamp,
          is3rdparty: true,
          authcode: null,
        },
      ]);
      if (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const token = jwt.sign({ hashedAuthCode , picture , email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION_TIME });
      return res.status(200).json({ token });
    } else {
      const { data: userdata, error } = await supabase
      .from("auth-user")
      .select("*")
      .eq("email", email)
      
      if (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      let hashedPassword = null;
      if (userdata && userdata.length > 0){
        hashedPassword = userdata[0].password;
        const id = userdata[0].id;
        const token = jwt.sign({ id,picture, hashedPassword ,email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION_TIME });
        return res.status(200).json({ token });
      } else {
        return res.status(500).json({ error: 'Internal Server Error' });
      }      
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function exchangeCodeForTokens(code: string) {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.PUBLIC_URL,
      grant_type: 'authorization_code',
    };

    const response = await axios.post(url, querystring.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      access_token: response.data.access_token,
      id_token: response.data.id_token,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

async function fetchUserInfo(accessToken: string, idToken: string) {
  try {
    const { data: userInfo } = await axios.get<GoogleUserInfo>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return userInfo;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

async function checkExistingUser(email: string) {
  try {
    const { data: userData, error } = await supabase
      .from("auth-user")
      .select("*")
      .eq("email", email)
      .eq("isverified", true);

    if (error) {
      console.error('Error checking existing user:', error);
      throw error;
    }

    return userData && userData.length > 0;
  } catch (error) {
    console.error('Error checking existing user:', error);
    throw error;
  }
}

async function checkExistingGoogleUser(email: string) {
  try {
    const { data: userData, error } = await supabase
      .from("auth-user")
      .select("*")
      .eq("email", email)
      .is("isverified", null);

    if (error) {
      console.error('Error checking existing Google user:', error);
      throw error;
    }

    return userData && userData.length > 0;
  } catch (error) {
    console.error('Error checking existing Google user:', error);
    throw error;
  }
}

async function deleteUnverifiedUser(email: string) {
  try {
    const { error } = await supabase
      .from('auth-user')
      .delete()
      .eq("email", email)
      .eq("isverified", false);

    if (error) {
      console.error('Error deleting unverified user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting unverified user:', error);
    throw error;
  }
}