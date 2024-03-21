import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/button";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
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
  const user = null;
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
              {user ? null : (
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
                        onClick={() => {
                            window.location.href = "/callback/google";
                        }}
                        className="flex items-center justify-center gap-2"
                        variant="outline"
                      >
                        <Icons.google className="h-4 w-4" />
                        Login with Google
                      </Button>
                      <Button
                        onClick={() => {
                            window.location.href = "/signin";
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
              {user ? (
                <p></p>
              ) : (
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