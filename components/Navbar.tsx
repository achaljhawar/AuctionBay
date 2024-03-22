import { useEffect, useState } from "react";
import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/button";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { parseJwt } from "@/lib/utils"
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
  const [user, setUser] = useState(false);
    useEffect(() => {
      const token = sessionStorage.getItem('token') || "";
      try {
        const currentTime = Math.floor(Date.now() / 1000);
        const decoded = parseJwt(token)
        if (decoded .exp < currentTime) {
          console.log('Token has expired');
          setUser(false);
          sessionStorage.removeItem('token');
        } else {
          setUser(true);
        }
      } catch (error) {
        console.log(error);
        setUser(false)
      }
      
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
    <div className="bg-white sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-white">
        <div className="flex h-16 items-center justify-between">
          <div className="lg:ml-0.5">
            <Link href="/">
              <Icons.logo className="h-20 w-20" />
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden lg:flex lg:items-center lg:space-x-6 mr-4">
              {user ? (
                <Button
                  onClick={() => {
                    window.location.href = "/dashboard";
                  }}
                  className="flex items-center justify-center gap-2"
                >                  
                  Dashboard
                </Button>
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
              {user ? null : (
                <Link
                  href="/signup"
                  className={buttonVariants({ variant: "outline" })}
                >
                  {" "}
                  Create account{" "}
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