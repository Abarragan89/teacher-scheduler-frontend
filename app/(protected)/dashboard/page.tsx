import React from 'react'
import CalendarMonth from '@/components/shared/calendar-month';
import DashboardContent from './DashboardContent';
import PushNotificationManager from '@/components/push-notifications';

export default async function Dashboard({
  searchParams
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams;

  return (
    <main className='wrapper'>

      <h1 className='h1-bold'>Dashboard</h1>
      <div className="px-3 sm:px-5 md:px-8 lg:px-20 max-w-5xl mx-auto">
        <PushNotificationManager />
      </div>
      <DashboardContent />
      <CalendarMonth initialMonth={month} />
    </main>
  )
}
