import { Button } from '@/components/ui/button'
import React from 'react'
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";


export default function YesterdayTomorrowNav({
    goToYesterday,
    goToTomorrow
}: {
    goToYesterday: () => void,
    goToTomorrow: () => void
}) {

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
