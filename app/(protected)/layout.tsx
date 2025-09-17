"use client";
import Header from '@/components/shared/header';
import { checkSession } from '@/lib/auth-check';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const [userData, setUserData] = useState<User | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const userData = await checkSession()
      setUserData(userData)
    }
    getSession();
  }, [checkSession])


  return (
    <>
      {userData && (
        <>
          <Header isAuthenticated={userData.authenticated} />
          {children}
        </>
      )}
    </>

  )
}
