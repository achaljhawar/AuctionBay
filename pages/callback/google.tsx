import { useRouter } from 'next/router'
import { useEffect } from 'react'
import querystring from 'querystring'
import dotenv from 'dotenv'
dotenv.config()
const mainurl = process.env.PUBLIC_URL || "";
const client_id = process.env.GOOGLE_CLIENT_ID || "";

const OAuthRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    const getGoogleAuthURL = () => {
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const options = {
        redirect_uri: `${mainurl}auth/google/`,
        client_id: client_id,
        access_type: "online",
        response_type: "code",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
      };
      return `${rootUrl}?${querystring.stringify(options)}`;
    }

    const oauthUrl = getGoogleAuthURL()
    router.push(oauthUrl)
  }, [router])

  return null
}

export default OAuthRedirect
