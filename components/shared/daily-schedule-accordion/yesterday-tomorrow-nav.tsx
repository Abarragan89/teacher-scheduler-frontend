"use client";
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from '@/components/ui/calendar'
import { useSearchParams } from 'next/navigation';

export default function YesterdayTomorrowNav({
    dateString,
    isPublicView,
    userId,
    alwaysDisplayCalendar = false
}: {
    dateString: string
    isPublicView?: boolean
    userId?: string
    alwaysDisplayCalendar?: boolean
}) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(parseLocalDate(dateString));

    function formatLocalDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function parseLocalDate(str: string): Date {
        const [y, m, d] = str.split('-').map(Number);
        // always produces local midnight for the given date parts
        return new Date(y, m - 1, d);
    }

    function goToYesterday() {
        const date = parseLocalDate(dateString);
        date.setDate(date.getDate() - 1);
        const formattedDate = formatLocalDate(date);
        if (isPublicView && userId) {
            router.push(`/public-schedule-view/${userId}/${formattedDate}`)
        } else {
            router.push(`/dashboard/daily/${formattedDate}${viewParam ? `?view=${viewParam}` : ''}`)
        }
    }

    function goToTomorrow() {
        const date = parseLocalDate(dateString);
        date.setDate(date.getDate() + 1);
        const formattedDate = formatLocalDate(date);
        if (isPublicView && userId) {
            router.push(`/public-schedule-view/${userId}/${formattedDate}`)
        } else {
            router.push(`/dashboard/daily/${formattedDate}${viewParam ? `?view=${viewParam}` : ''}`)
        }
    }

    function goToSelectedDate(date: Date | undefined) {
        if (!date) return;
        const formattedDate = formatLocalDate(date);
        setIsCalendarOpen(false)
        if (isPublicView && userId) {
            router.push(`/public-schedule-view/${userId}/${formattedDate}`)
        } else {
            router.push(`/dashboard/daily/${formattedDate}${viewParam ? `?view=${viewParam}` : ''}`)
        }
    }

    if (isPublicView && alwaysDisplayCalendar) {
        return (
            <Calendar
                mode="single"
                captionLayout="dropdown"
                className="border rounded-lg p-5 max-w-md mx-auto relative"
                onSelect={(date) => {
                    setSelectedDate(date)
                    goToSelectedDate(date)
                }}
                selected={selectedDate}
                classNames={{
                    month_caption: "mb-10 max-w-md mx-auto",
                    months_dropdown: "w-full",
                    root: "w-full",
                    months: "w-full",
                    month: "w-full",
                    month_grid: "w-full",
                    weekdays: "w-full flex",
                    weekday: "flex-1 text-center",
                    week: "w-full flex",
                    day: "flex-1 text-center",
                    day_button: "w-full",
                }}
            />
        )
    }

    return (
        <div className="flex flex-start text-muted-foreground gap-x-2 print:!hidden">
            <Button title="Go to yesterday" onClick={goToYesterday} variant={"ghost"}>
                <FaAnglesLeft />
            </Button>

            <Button title="Go to tomorrow" onClick={goToTomorrow} variant={"ghost"}>
                <FaAnglesRight />
            </Button>

            {/* Calendar Date Picker */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button title="Select date" variant={"ghost"}>
                        <CalendarIcon className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='space-y-1 ml-5 p-2'>
                    <div className='w-[245px] mx-auto min-h-[300px]'>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date)
                                goToSelectedDate(date)
                            }}
                            className="rounded-md bg-transparent w-full p-1"
                            captionLayout='dropdown'
                            endMonth={new Date(2040, 11)}
                        />
                    </div>
                </PopoverContent>
            </Popover>

        </div>
    )
}
