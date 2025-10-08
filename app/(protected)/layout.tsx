import Header from '@/components/shared/header';
import { serverAuth } from '@/lib/api/services';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {

  let authResult = { authenticated: false, user: '' };

  try {
    const user = await serverAuth.getSession();
    authResult = { authenticated: true, user };
  } catch (error) {
    console.error('Authentication check failed:', error);
    authResult = { authenticated: false, user: '' };
  }

  if (!authResult.authenticated) {
    throw new Error("You Must Log In")
  }

  return (
    <>
      <Header
        isAuthenticated={authResult.authenticated}
        // username={authResult?.user?.email || ''}
        username={'mike'}
      />
      {children}
    </>
  );
}