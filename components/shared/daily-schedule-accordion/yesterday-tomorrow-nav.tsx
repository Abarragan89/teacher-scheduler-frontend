"use client";
import { Button } from '@/components/ui/button'
import React from 'react'
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { useRouter } from 'next/navigation';

export default function YesterdayTomorrowNav({ dateString }: { dateString: string }) {

    const router = useRouter();

    function goToYesterday() {
        const yesterday = new Date(dateString)
        yesterday.setDate(yesterday.getDate() - 1)
        const formattedDate = yesterday.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}`)
    }

    function goToTomorrow() {
        const tomorrow = new Date(dateString)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const formattedDate = tomorrow.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}`)
    }

    return (
        <div className="flex flex-start text-muted-foreground">
            <Button title="Go to yesterday" onClick={goToYesterday} variant={"ghost"} size="sm" className='mr-2'>
                <FaAnglesLeft />
            </Button>
            <Button title="Go to tomorrow" onClick={goToTomorrow} variant={"ghost"} size="sm" className='ml-2'>
                <FaAnglesRight />
            </Button>
            
        </div>
    )
}
