import DailyScheduleAccordion from '@/components/shared/daily-schedule-accordion';
import { serverDays } from '@/lib/api/services/days/server';
import { formatDateDisplay } from '@/lib/utils';
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DayData } from '@/types/day';

interface pageProps {
    params: Promise<{
        dateString: string
    }>
}

export default async function page({ params }: pageProps) {

    const { dateString } = await params;

    const currentDay: DayData = await serverDays.findOrCreateDay(dateString);

    return (
        <main className='wrapper'>
            <Tabs defaultValue="schedule" className="w-full">
                <div className="flex justify-center xs:justify-between items-end flex-wrap gap-y-4">
                    <h1 className='h1-bold mr-5'>{formatDateDisplay(new Date(currentDay.dayDate.replace(/-/g, "/")))}</h1>
                    <TabsList className='mb-1'>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="reminders">Reminders</TabsTrigger>
                        <TabsTrigger value="todos">ToDos</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="schedule">
                    <DailyScheduleAccordion
                        scheduleData={currentDay.schedule}
                    />
                </TabsContent>

                <TabsContent value="reminders">
                    <p>These are the Reminders</p>
                </TabsContent>

                <TabsContent value="todos">
                    <p>These are the Todos</p>
                </TabsContent>

                <TabsContent value="notes">
                    <p>These are the Notes</p>
                </TabsContent>
            </Tabs>
        </main>
    )
}