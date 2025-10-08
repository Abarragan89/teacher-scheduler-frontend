import Header from '@/components/shared/header';
import { callJavaAPI } from '@/lib/auth/utils';
import { getServerCookies } from '@/lib/auth/server-utils';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  
  // Get cookies using the new server-utils approach
  const { cookieHeader, csrfToken } = await getServerCookies();
  
  let authResult = { authenticated: false, user: '' };
  
  try {
    // Pass cookies explicitly to callJavaAPI
    const sessionRes = await callJavaAPI(
      '/auth/session', 
      'GET', 
      undefined,
      cookieHeader,
      csrfToken
    );

    if (sessionRes.ok) {
      const data = await sessionRes.json();
      authResult = { authenticated: true, user: data };
    } else {
      authResult = { authenticated: false, user: '' };
    }
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