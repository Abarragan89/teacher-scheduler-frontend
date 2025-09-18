import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion'
import React from 'react'

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
      <h1 className='h1-bold'>Today's Schedule</h1>
      <DailyScheduleAccordion />

    </main>
  )
}
