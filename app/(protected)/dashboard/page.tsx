import React from 'react'
import CalendarMonth from '@/components/shared/calendar-month';
import DashboardContent from './DashboardContent';

export default async function Dashboard() {

  return (
    <main>
      <CalendarMonth />
      <DashboardContent />
    </main>
  )
}
