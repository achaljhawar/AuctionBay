import { useEffect, useState } from 'react';
function extractSearchParams(url: string): { email: string; authcode: string } {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
  
    const email = searchParams.get('email') || '';
    const authcode = searchParams.get('authcode') || '';
  
    return { email, authcode };
  }
const VerifyPage = () => {
  const [email, setEmail] = useState('');
  const [authcode, setAuthcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const { email, authcode } = extractSearchParams(window.location.href);
    setEmail(email);
    setAuthcode(authcode);

    const verifyUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, authcode }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify user');
        }

      } catch (error) {
        setErrorMessage((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <div>
      <h1>Verify Account</h1>
      {isLoading && <p>Loading...</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <p>Email: {email}</p>
      <p>Auth Code: {authcode}</p>
    </div>
  );
};

export default VerifyPage;

