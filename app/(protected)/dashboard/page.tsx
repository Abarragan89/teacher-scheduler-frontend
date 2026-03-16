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
      <PushNotificationManager />
      <DashboardContent />
      <div className="-mx-5 sm:mx-0">
        <CalendarMonth initialMonth={month} />
      </div>
    </main>
  )
}
