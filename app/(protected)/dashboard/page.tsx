import React from 'react'
// import { getServerSession } from '@/lib/auth/auth-service'
import CalendarMonth from '@/components/shared/calendar-month';

export default async function Dashboard() {
  // const authResult = await getServerSession();

  // if (!authResult.authenticated) {
  //   throw new Error("You Must Log In")
  // }

  return (
    <main className='wrapper'>
        <CalendarMonth />
    </main>
  )
}
