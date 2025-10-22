import { serverDays } from "@/lib/api/services/days/server";
import { formatDateDisplay } from "@/lib/utils";
import { DayData } from "@/types/day";
import PublicViewAccordion from "../public-view-accordion";
import Image from "next/image";
import Link from "next/link";
import SchedulePrintView from "@/components/shared/daily-schedule-accordion/schedule-print-view";

interface PublicScheduleViewProps {
    params: Promise<{
        dayId: string
    }>
}

export default async function PublicScheduleView({ params }: PublicScheduleViewProps) {

    const { dayId } = await params;

    const currentDay: DayData = await serverDays.findSingleDay(dayId);

    return (
        <main>
            <header className="print:!hidden flex-between px-5 py-3">
                <Link
                    href={"/"}
                    className='flex justify-center items-end'
                >
                    <Image
                        src={'/images/logo.png'}
                        height={45}
                        width={45}
                        alt="Company Logo"
                        priority
                    />
                    <div className='text-xs ml-2 mb-1 text-primary tracking-wider invisible sm:visible'>
                        <p className='font-bold'>Teacher</p>
                        <p>Scheduler</p>
                    </div>
                </Link>
            </header>
            <div className="max-w-4xl mx-auto p-5 py-10 -mt-6">
                <div className="text-center mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">Daily Lesson Plan</h1>
                    <p className="text-muted-foreground">
                        {formatDateDisplay(new Date(currentDay.dayDate.replace(/-/g, "/")))}
                    </p>
                </div>

                <PublicViewAccordion
                    schedule={currentDay?.schedule}
                />
            </div>
        </main>
    )
}
