import React from 'react'
import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion'
import { formatDateDisplay } from '@/lib/utils'
import { cookies } from 'next/headers'
import { User } from '@/types/user';

export default async function Dashboard() {

  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const userInfoRes = await fetch("http://localhost:3000/api/session", {
    method: "GET",
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (userInfoRes.status === 401) {
    throw new Error("User not authenticated");
  }

  const userInfo = await userInfoRes.json();



  return (
    <main className='wrapper'>
      <h1 className='h1-bold'>{ }</h1>
      {userInfo.authenticated && (
        <DailyScheduleAccordion />
      )}

    </main>
  )
}
