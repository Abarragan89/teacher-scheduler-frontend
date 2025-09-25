"use client";
import Header from '@/components/shared/header';
import { checkSession } from '@/lib/auth-check';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { useCsrf } from '@/providers/csrf-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const { setCsrfToken } = useCsrf();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const userData = await checkSession();
      setCsrfToken(userData.csrfToken)
      setUserData(userData);
      setLoading(false);
    };
    getSession();
  }, []);

  if (loading) return null;

  if (userData?.authenticated === false) {
    // 👇 thrown during render, caught by error.tsx
    throw new Error("You need to be logged in");
  }

  return (
    <>
      {userData && (
        <>
          <Header
            isAuthenticated={userData?.authenticated}
            username={userData?.email}
          />
          {children}
        </>
      )}
    </>

  )
}
