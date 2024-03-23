import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const Auth = (props: P) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = sessionStorage.getItem("token");
          if (token !== null && token !== undefined) {
            const response = await fetch("/api/auth/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.status == 200) {
              setLoading(false);
            } else {
              window.sessionStorage.removeItem("token");
              router.push("/login");
            }
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error(error);
          router.push("/");
        }
      };
      checkAuth();
    }, [router]);

    return (
      <>
        {loading && (
          <div className="flex fixed left-0 right-0 top-0 h-screen items-center justify-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        )}
        {!loading && <Component {...props} />}
      </>
    );
  };
  return Auth;
};

export default withAuth;