import { serverDays } from "@/lib/api/services/days/server";
import { formatDateDisplay } from "@/lib/utils";
import { DayData } from "@/types/day";
import PublicViewAccordion from "../../public-view-accordion";
import Header from "@/components/shared/header";
import YesterdayTomorrowNav from "@/components/shared/daily-schedule-accordion/yesterday-tomorrow-nav";
import { Metadata } from "next";

interface PublicScheduleViewProps {
    params: Promise<{
        userId: string,
        dateString: string
    }>
}

export async function generateMetadata({ params }: PublicScheduleViewProps): Promise<Metadata> {
    const { dateString } = await params;

    // Use the same timezone-safe parsing to get a readable date
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formattedDate = formatDateDisplay(date);

    const title = `Daily Lesson Plan — ${formattedDate}`;
    const description = `View the daily lesson plan for ${formattedDate}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
    }
}

export default async function PublicScheduleView({ params }: PublicScheduleViewProps) {

    const { userId, dateString } = await params;

    let currentDay: DayData | null = null;

    try {
        currentDay = await serverDays.findSingleDayPublic(userId, dateString);
    } catch (error) {
        console.error("Error fetching public schedule:", error);

    }

    if (!currentDay || !currentDay.schedule || currentDay.schedule.tasks.length === 0) {
        return (
            <main className="wrapper">
                <Header />
                <div className="flex flex-col justify-center items-center mb-4">
                    <h1 className="text-xl font-bold ">Schedule Not Found</h1>
                    <p className="text-muted-foreground strike">{formatDateDisplay(new Date(dateString.replace(/-/g, "/")))}</p>
                </div>
                <YesterdayTomorrowNav
                    userId={userId}
                    dateString={dateString}
                    isPublicView={true}
                    alwaysDisplayCalendar={true}
                />
            </main>
        )
    }

    return (
        <main className="wrapper">
            <Header />
            <div className="max-w-4xl print:max-w-full mx-auto p-5 py-10 -mt-6">
                <div className="text-center mb-2 print:hidden">
                    <h1 className="text-2xl md:text-3xl font-bold">Daily Lesson Plan</h1>
                    <p className="text-muted-foreground">
                        {formatDateDisplay(new Date(currentDay.dayDate.replace(/-/g, "/")))}
                    </p>
                </div>

                <PublicViewAccordion
                    schedule={currentDay?.schedule}
                    dayDate={currentDay?.dayDate}
                    userId={userId}
                />
            </div>
        </main>
    )
}
