import { serverDays } from "@/lib/api/services/days/server";
import { formatDateDisplay } from "@/lib/utils";
import { DayData } from "@/types/day";
import PublicViewAccordion from "../public-view-accordion";
import Image from "next/image";
import Link from "next/link";
import ModeToggle from "@/components/shared/header/mode-toggle";
import { NavigationMenuList } from "@/components/ui/navigation-menu";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";

interface PublicScheduleViewProps {
    params: Promise<{
        dayId: string
    }>
}

export default async function PublicScheduleView({ params }: PublicScheduleViewProps) {

    const { dayId } = await params;

    const currentDay: DayData = await serverDays.findSingleDayPublic(dayId);

    return (
        <main>
            <header className="print:!hidden flex-between px-6 pt-4">
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
                <NavigationMenu>
                    <NavigationMenuList>
                        <ModeToggle />
                    </NavigationMenuList>
                </NavigationMenu>
            </header>
            <div className="max-w-4xl mx-auto p-5 py-10 -mt-6">
                <div className="text-center mb-2 print:hidden">
                    <h1 className="text-2xl md:text-3xl font-bold">Daily Lesson Plan</h1>
                    <p className="text-muted-foreground">
                        {formatDateDisplay(new Date(currentDay.dayDate.replace(/-/g, "/")))}
                    </p>
                </div>

                <PublicViewAccordion
                    schedule={currentDay?.schedule}
                    dayDate={currentDay?.dayDate}
                />
            </div>
        </main>
    )
}
