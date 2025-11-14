import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion';
import { serverDays } from '@/lib/api/services/days/server';
import { formatDateDisplay } from '@/lib/utils';
import React from 'react'
import { DayData } from '@/types/day';
import TodoList from './todo-list';
import YesterdayTomorrowNav from '@/components/shared/daily-schedule-accordion/yesterday-tomorrow-nav';
import Link from 'next/link';

interface pageProps {
    params: Promise<{
        dateString: string
    }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function page({ params, searchParams }: pageProps) {

    const { dateString } = await params;
    const currentDay: DayData = await serverDays.findOrCreateDay(dateString);

    const view = (await searchParams).view as string

    return (
        <main className='wrapper'>
            {/* <Tabs defaultValue={view || 'schedule'} className="w-full"> */}
            <div className="flex flex-col items-start">
                <h1 className='h1-bold mr-5 print:hidden'>{formatDateDisplay(new Date(currentDay.dayDate.replace(/-/g, "/")))}</h1>
                <YesterdayTomorrowNav dateString={dateString} />

                {/* Link-based tabs */}
                <div className="flex space-x-1 border-b mt-4 mb-1 print:hidden">
                    <Link
                        href={`?view=schedule`}
                        className={`px-4 py-2 border-b-2 transition-colors ${view === 'schedule'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Schedule
                    </Link>
                    <Link
                        href={`?view=todos`}
                        className={`px-4 py-2 border-b-2 transition-colors ${view === 'todos'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Todos
                    </Link>
                    <Link
                        href={`?view=notes`}
                        className={`px-4 py-2 border-b-2 transition-colors ${view === 'notes'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Notes
                    </Link>
                </div>


                <div className="mt-4 w-full">
                    {view === 'schedule' && (
                        <DailyScheduleAccordion
                            dayId={currentDay.id}
                            scheduleData={currentDay.schedule}
                            currentDay={currentDay.dayDate.replace(/-/g, "/")}
                        />
                    )}
                    {view === 'todos' && <TodoList dateString={dateString} />}
                    {view === 'notes' && <p>These are the Notes</p>}
                </div>
            </div>
        </main>

    )
}