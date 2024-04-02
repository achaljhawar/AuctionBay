import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<{ id: string } | null>(null);

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
      
      <h1>{userData?.id ?? "No user data"}</h1>
    </>
  );
};

export default withAuth(Dashboard);