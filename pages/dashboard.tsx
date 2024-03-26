import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const router = useRouter();

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

        if (!response.ok) {
          router.push("/newuser");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        router.push("/newuser");
      }
    };

    fetchUserDetails();
  }, [router]);

  return (
    <>
      <Navbar />
      <h1>Dashboard</h1>
    </>
  );
};

export default withAuth(Dashboard);