// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import querystring from 'querystring';

type Data = {
  message?: string;
  redirectUrl?: string;
};

const getGoogleAuthURL = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.PUBLIC_URL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "online",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  return `${rootUrl}?${querystring.stringify(options)}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "POST") {
      const redirectUrl = getGoogleAuthURL();
      res.status(200).json({ redirectUrl });
    } else if (req.method === "GET") {
      res.status(200).json({ message: "Please use POST method for Google authentication" });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}