import React from 'react'
import CalendarMonth from '@/components/shared/calendar-month';
import DashboardContent from './DashboardContent';
import PushNotificationManager from '@/components/push-notifications';
import InstallPrompt from '@/components/install-prompt';

export default async function Dashboard() {

  return (
    <main>
      <div className="px-3 sm:px-5 md:px-8 lg:px-20 max-w-5xl mx-auto">
        <PushNotificationManager />
      </div>
      <CalendarMonth />
      <DashboardContent />
    </main>
  )
}
