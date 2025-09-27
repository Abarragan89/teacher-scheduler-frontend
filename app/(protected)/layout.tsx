import Header from '@/components/shared/header';
import { getServerSession } from '@/lib/auth/auth-service';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const authResult = await getServerSession();

  if (!authResult.authenticated) {
    throw new Error("You Must Log In")
  }

  return (
    <>
      <Header
        isAuthenticated={authResult.authenticated}
        username={authResult.user?.email}
      />
      {children}
    </>
  );
}