import React from 'react'
import { getServerSession } from '@/lib/auth/auth-service'
import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion';
import CalendarMonth from '@/components/shared/calendar-month';

export default async function Dashboard() {
  const authResult = await getServerSession();

  if (!authResult.authenticated) {
    throw new Error("You Must Log In")
  }

  return (
    <main className='wrapper'>
      {/* <h1 className='h1-bold'>
        Welcome {authResult.user?.email ? `${authResult.user.email}` : 'User'}
      </h1> */}

        <CalendarMonth />
      {/* <DailyScheduleAccordion /> */}
    </main>
  )
}
