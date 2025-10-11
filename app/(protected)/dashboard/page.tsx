import React from 'react'
import CalendarMonth from '@/components/shared/calendar-month';
// import PushNotificationManager from '@/components/push-notifications';
// import InstallPrompt from '@/components/install-prompt';
import { sendDelayedTestNotification } from '@/app/actions';

export default async function Dashboard() {

  // Server action to handle the test button click
  async function handleTestNotification() {
    'use server'
    await sendDelayedTestNotification()
  }

  return (
    <main className='wrapper'>
        {/* PWA Components */}
       
        {/* <PushNotificationManager /> */}

        {/* Test Button */}
        {/* <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🧪 Test PWA Notifications</h3>
          <form action={handleTestNotification}>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Send Test Notification (10s delay)
            </button>
          </form>
          <p className="text-sm text-muted-foreground mt-2">
            Click the button, then wait 10 seconds for a push notification!
          </p>
        </div> */}

      <CalendarMonth />
    </main>
  )
}
