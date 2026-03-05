import Header from '@/components/shared/header';
import { serverAuth } from '@/lib/api/services/auth/server';
import { serverTodoLists } from '@/lib/api/services/todos/server';
export const dynamic = 'force-dynamic';
import ClientQueryProvider from '@/components/providers/ClientQueryProvider';
import PrefetchTodoLists from '@/components/providers/PrefetchTodoLists';
import { UserProvider } from '@/components/providers/UserProvider';


export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {


  let authResult = { authenticated: false, user: { email: '', userId: '' } };
  let todoLists: any[] = [];

  try {
    const user = await serverAuth.getSession();
    authResult = { authenticated: true, user };

    // Fetch todo lists on server - single API call
    // Will pass this to PrefetchTodoLists to prefill React Query cache
    todoLists = await serverTodoLists.getTodoLists();

  } catch (error) {
    console.error('Authentication or data fetch failed:', error);
    authResult = { authenticated: false, user: { email: '', userId: '' } };
  }

  if (!authResult.authenticated) {
    throw new Error("You Must Log In")
  }


  return (
    <>
      <ClientQueryProvider>
        <UserProvider userId={authResult.user.userId} email={authResult.user.email}>
          {/* This prefetch needs to wrap children to ensure useEffect runs before children are rendered */}
          <PrefetchTodoLists initialData={todoLists}>
            <Header
              isAuthenticated={authResult.authenticated}
              email={authResult?.user?.email || ''}
            />
            {children}
          </PrefetchTodoLists>
        </UserProvider>
      </ClientQueryProvider>
    </>
  );
}