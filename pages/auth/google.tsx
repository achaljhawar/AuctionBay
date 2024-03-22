import { useEffect } from 'react';
import { useRouter } from 'next/router';

const GoogleRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    const { code } = router.query;
    console.log(code)
    if (code) {
      handleGoogleRedirect((Array.isArray(code) ? code[0] : code));
    }
  }, [router.query]);

  const handleGoogleRedirect = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          sessionStorage.setItem('token', data.token);
          router.push('/dashboard');
        } else {
          console.error('No token received from the server');
        }
      } else {
        console.log(response)
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
    }
  };

  return <div>Redirecting...</div>;
};

export default GoogleRedirectPage;