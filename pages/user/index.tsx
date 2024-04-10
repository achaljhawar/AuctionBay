import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircleMore, User2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { parseJwt } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type UserData = {
  id: string;
  avatar_url: string;
  firstname: string;
  lastname: string;
  email: string;
  email_visibility: boolean;
};

export default function UsersPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/alluserfetcher');
        const data = await response.json();
        if (response.ok) {
          setUserData(data.userData);
          setError(null);
        } else {
          setUserData([]);
          setError(data.message);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24 mx-8">
        {userData.map((user) => (
          <Card key={user.id} className="w-full">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>User Details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full gap-8 py-4 max-md:flex-col">
                <div className="flex flex-1 flex-col items-end max-md:items-center">
                  <Avatar className="relative h-48 w-48 max-md:h-36 max-md:w-36">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>
                      <User2 className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-1 flex-col items-start justify-center gap-2 max-md:items-center">
                  <p className="text-3xl">{user.firstname ?? 'No user data'} {user.lastname ?? 'No user data'}</p>
                  <p className="text-sm text-secondary-foreground">{user.email}</p>
                  <Badge>@{user.id ?? 'No user data'}</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="items-end justify-between text-xs text-secondary-foreground">
              <Button
                variant="outline"
                size="lg"
                className="w-fit"
                onClick={() => router.push(`/user/${user.id}`)}
              >
                <MessageCircleMore className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}