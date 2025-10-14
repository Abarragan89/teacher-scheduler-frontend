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
            <Button onClick={goToYesterday} variant={"ghost"} size="sm" className='mr-2'>
                <FaAnglesLeft>
                    <title>Go to Yesterday</title>
                </FaAnglesLeft>
            </Button>
            <Button onClick={goToTomorrow} variant={"ghost"} size="sm" className='ml-2'>
                <FaAnglesRight>
                    <title>Go to Tomorrow</title>
                </FaAnglesRight>
            </Button>
        </div>
    )
}
