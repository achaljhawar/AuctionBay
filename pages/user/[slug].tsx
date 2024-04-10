import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircleMore, User2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { parseJwt } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export default function Page() {
  const router = useRouter();
  const uuid = router.query.slug;
  const [userData, setUserData] = useState<{
    id: string;
    avatar_url: string;
    firstname: string;
    lastname: string;
    email: string;
    email_visibility: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sameuser, setSameUser] = useState(false);
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      router.push('/login');
      return;
    }
    if (uuid == parseJwt(token).id) {
      setSameUser(true);
    }
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/uuidatafetcher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuid }),
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
          setError(null);
        } else {
          setUserData(null);
          setError(data.message);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (uuid) {
      fetchUserData();
    }
  }, [uuid]);
  if (isLoading) {
    return <p>Loading...</p>;
  }
  const createchat = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch('/api/chat/createChat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secondID: uuid }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Error creating chat:', data.message);
        return;
      }
      router.push(`/chat/${data.data[0].chatroom_id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };
  if (error) {
    return <p>{error}</p>;
  }
  if (userData === null || !userData) {
    return <p>404 User Not Found</p>;
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center mt-24">
        <Card className="w-3/5 max-w-3xl">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>User Details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full gap-8 py-4 max-md:flex-col">
              <div className="flex flex-1 flex-col items-end max-md:items-center">
                <Avatar className="relative h-48 w-48 max-md:h-36 max-md:w-36">
                  <AvatarImage src={userData.avatar_url || ''} />
                  <AvatarFallback>
                    <User2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-1 flex-col items-start justify-center gap-2 max-md:items-center">
                <p className="text-3xl">{userData.firstname ?? 'No user data'} {userData.lastname ?? 'No user data'}</p>
                <p className="text-sm text-secondary-foreground">{userData.email}</p>
                <Badge>@{userData.id ?? 'No user data'}</Badge>
              </div>
            </div>
          </CardContent>
          {!sameuser && (
            <>
              <CardFooter className="items-end justify-between text-xs text-secondary-foreground">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-fit"
                  onClick={createchat}
                >
                  {isLoading ? null : <MessageCircleMore className="mr-2 h-4 w-4" />}
                  Chat
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </>
  );
}