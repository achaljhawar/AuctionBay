import { useEffect, useState } from "react";
import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/button";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Navbar = () => {
  const [userData, setUserData] = useState<{
    lastname: string;
    firstname: string;
    avatar_url: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/auth/fetchuserdetails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const resdata = await response.json();
          setUserData(resdata);
        } catch (error) {
          console.error("Error verifying token:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };

    verifyToken();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("/api/callback/google", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirectUrl;
      } else {
        console.error("Error logging in with Google");
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  return (
    <div className="bg-white sticky top-0 left-0 right-0 z-50 h-16">
      <header className="relative bg-white">
        <div className="flex h-16 items-center justify-between">
          <div className="lg:ml-0.5">
            <Link href="/">
              <Icons.logo className="h-20 w-20" />
            </Link>
          </div>
          {userData ? (<div className="flex flex-1 gap-2 items-center self-stretch justify-center">
            <Button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="flex items-center justify-center gap-2 mr-4"
            >
              Dashboard
            </Button>
          </div>) : null}

          <div className="flex items-center">
            <div className="flex items-center space-x-6 mr-4">
              {userData ? (
                <div className="flex items-center">

                  <div className="flex items-center space-x-1">
                    <Avatar>
                      <AvatarImage
                        src={userData?.avatar_url ?? "No user data"}
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Button variant="link">
                      @{userData?.firstname ?? "No user data"}{" "}
                      {userData?.lastname ?? "No user data"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Login</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
                    <DialogHeader>
                      <DialogTitle>Login</DialogTitle>
                      <DialogDescription>
                        Choose how you want to log in to your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2"
                        variant="outline"
                      >
                        <Icons.google className="h-4 w-4" />
                        Login with Google
                      </Button>
                      <Button
                        onClick={() => {
                          window.location.href = "/login";
                        }}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Login with Email
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {!userData && (
                <Link
                  href="/signup"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Create account
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
