import { useRouter } from 'next/router'
import { useEffect } from 'react'
import querystring from 'querystring'
const OAuthRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    const getGoogleAuthURL = () => {
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const options = {
        redirect_uri: process.env.PUBLIC_URL,
        client_id: process.env.GOOGLE_CLIENT_SECRET,
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
