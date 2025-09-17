import Header from '@/components/shared/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {

  const cookieData = await cookies();
  const refreshCookie = cookieData.get("refresh_token")

  if (refreshCookie) {
    redirect("/dashboard")
  }


  return (
    <>
      <Header />
      <main className="min-h-screen wrapper bg-gradient-to-br p-6">
        <p className="jumbotron text-center mt-10">This is the Jumbotron</p>
      </main>
    </>
  );
}
