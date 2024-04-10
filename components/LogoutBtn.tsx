"use client";

import { Button } from "@/components/ui/button";
import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
interface LogoutBtnProps {
  className?: string;
}

const LogoutBtn: FC<LogoutBtnProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      sessionStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("w-fit", className)}
      onClick={logout}
    >
      {isLoading ? null : <LogOut className="mr-2 h-4 w-4" />}
      Log Out
    </Button>
  );
};

export default LogoutBtn;