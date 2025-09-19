import React from 'react'
import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion'
import { formatDateDisplay } from '@/lib/utils'

export default function Dashboard() {

  // const [users, setUsers] = useState<User[]>([])

  // async function getUsers(): Promise<void> {
  //   try {
  //     const allUsers = await getAllUsers();
  //     setUsers(allUsers)
  //   } catch (err) {
  //       console.error('error getting users ', err);
  //   }
  // }

  return (
    <main className='wrapper'>
      <h1 className='h1-bold'>{formatDateDisplay(new Date())}</h1>
      <DailyScheduleAccordion />

    </main>
  )
}
