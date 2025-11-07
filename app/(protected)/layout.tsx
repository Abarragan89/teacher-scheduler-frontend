import Header from '@/components/shared/header';
import { serverAuth } from '@/lib/api/services/auth/server';
export const dynamic = 'force-dynamic';
import ClientQueryProvider from '@/components/providers/ClientQueryProvider';


export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {


  let authResult = { authenticated: false, user: { email: '' } };

  try {
    const user = await serverAuth.getSession();
    authResult = { authenticated: true, user };
  } catch (error) {
    console.error('Authentication check failed:', error);
    authResult = { authenticated: false, user: { email: '' } };
  }

  if (!authResult.authenticated) {
    throw new Error("You Must Log In")
  }


  return (
    <>
      <ClientQueryProvider>
        <Header
          isAuthenticated={authResult.authenticated}
          email={authResult?.user?.email || ''}
        />
        {children}
      </ClientQueryProvider>
    </>
  );
}