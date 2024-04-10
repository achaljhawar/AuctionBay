import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LogoutBtn from "@/components/LogoutBtn";
interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<{ id: string; avatar_url: string; firstname: string; lastname: string; email: string ; email_visibility: boolean} | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/newuser");
        return;
      }
      try {
        const response = await fetch("/api/auth/fetchuserdetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const resdata = await response.json();
        if (!response.ok) {
          router.push("/newuser");
          setUserData(null);
        } else {
          setUserData(resdata);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        router.push("/newuser");
        setUserData(null);
      }
    };
    fetchUserDetails();
  }, [router]);

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
                  <AvatarImage src={userData?.avatar_url || ""} />
                  <AvatarFallback>
                    <User2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-1 flex-col items-start justify-center gap-2 max-md:items-center">
                <p className="text-3xl">
                  {userData?.firstname ?? "No user data"} {userData?.lastname ?? "No user data"}
                </p>
                <p className="text-sm text-secondary-foreground">{userData?.email}</p>
                <Badge>@{userData?.id ?? "No user data"}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="items-end justify-between text-xs text-secondary-foreground">
            Max avatar upload size: 1MB
            <LogoutBtn />
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;