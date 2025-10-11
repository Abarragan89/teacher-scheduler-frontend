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
            <Button onClick={goToYesterday} variant={"ghost"} size="sm" className="px-2">
                <FaAnglesLeft className="mr-2" />
            </Button>
            <Button onClick={goToTomorrow} variant={"ghost"} size="sm" className="px-2">
                <FaAnglesRight className="ml-2" />
            </Button>
        </div>
    )
}
