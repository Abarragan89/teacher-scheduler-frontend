"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // First attempt: session check
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
          method: "POST",
          credentials: "include",
        });


        if (res.status === 401) {
          // Try refreshing access token if session is unauthorized
          const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          
          if (!refreshRes.ok) {
            router.push("/"); // Refresh failed → redirect
            return;
          }

          // Retry session check after refresh
          res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
            method: "POST",
            credentials: "include",
          });
        }

        if (!res.ok) {
          router.push("/"); // Still not authenticated
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/"); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
