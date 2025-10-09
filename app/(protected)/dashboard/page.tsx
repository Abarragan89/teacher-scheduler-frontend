import React from 'react'
import CalendarMonth from '@/components/shared/calendar-month';
import PushNotificationManager from '@/components/push-notifications';
import InstallPrompt from '@/components/install-prompt';

export default async function Dashboard() {

  return (
    <main className='wrapper'>
      <CalendarMonth />
      <div className="mt-8 space-y-4">
        <InstallPrompt />
        <PushNotificationManager />
      </div>
    </main>
  )
}
