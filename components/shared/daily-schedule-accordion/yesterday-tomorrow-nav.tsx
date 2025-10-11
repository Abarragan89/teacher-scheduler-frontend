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
        <div className="flex flex-start">
            <Button onClick={goToYesterday} variant={"ghost"} size="sm" className='mr-2'>
                <FaAnglesLeft />
            </Button>
            <Button onClick={goToTomorrow} variant={"ghost"} size="sm" className='ml-2'>
                <FaAnglesRight />
            </Button>
        </div>
    )
}
