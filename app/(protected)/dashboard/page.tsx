import React from 'react'
import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion'
import { formatDateDisplay } from '@/lib/utils'

export default function Dashboard() {



  return (
    <main className='wrapper'>
      <h1 className='h1-bold'>{formatDateDisplay(new Date())}</h1>
      <DailyScheduleAccordion />

    </main>
  )
}
