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

export default function YesterdayTomorrowNav({ dateString }: { dateString: string }) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');
    const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date(dateString));

    function goToYesterday() {
        const yesterday = new Date(dateString)
        yesterday.setDate(yesterday.getDate() - 1)
        const formattedDate = yesterday.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}/${viewParam ? `?view=${viewParam}` : ''}`)
    }

    function goToTomorrow() {
        const tomorrow = new Date(dateString)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const formattedDate = tomorrow.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}/${viewParam ? `?view=${viewParam}` : ''}`)
    }

    function goToSelectedDate(date: Date | undefined) {
        if (!date) return;

        const formattedDate = date.toISOString().split('T')[0]
        setIsCalendarOpen(false)
        router.push(`/dashboard/daily/${formattedDate}/${viewParam ? `?view=${viewParam}` : ''}`)
    }

    return (
        <div className="flex flex-start text-muted-foreground gap-x-2">

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
                    <div className='w-[255px] mx-auto min-h-[330px]'>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date)
                                goToSelectedDate(date)
                            }}
                            className="rounded-md bg-transparent w-full pt-1"
                            captionLayout='dropdown'
                        />
                    </div>
                </PopoverContent>
            </Popover>

        </div>
    )
}
