import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from '@/components/ui/calendar'
import { clientDays } from '@/lib/api/services/days/client'
import { toast } from "sonner"
import { formatDateDisplay } from '@/lib/utils'
import { Copy } from 'lucide-react'

export default function MoveSchedulePopover({
    scheduleId
}: {
    scheduleId: string
}) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function addScheduleToDate() {
        if (!date || isSubmitting) return;

        setIsSubmitting(true);
        const dateString = date.toISOString().split('T')[0];

        const response = await clientDays.moveScheduleToDate(scheduleId, dateString);
        if (response) {
            setIsOpen(false);
            setIsSubmitting(false);
            toast.success(`Schedule copied successfully to ${formatDateDisplay(date)}`);
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild className='print:hidden'>
                <Button
                    variant={"link"}
                    title='Copy Schedule'
                    className='p-0 hover:cursor-pointer hover:underline text-muted-foreground/80 hover:text-ring'
                >
                    <Copy /> 
                </Button>
            </PopoverTrigger>
            <PopoverContent className='space-y-1 ml-5 p-2'>
                <div className='w-[245px] mx-auto min-h-[330px]'>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md bg-transparent w-full p-1"
                        captionLayout='dropdown'
                        endMonth={new Date(2040, 11)}
                    />
                </div>

                <div className="flex-center gap-x-4 mb-2 mt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={addScheduleToDate}
                        disabled={!date || isSubmitting}
                    >
                        {isSubmitting ? 'Copying...' : 'Copy Schedule'}
                    </Button>
                </div>
            </PopoverContent>

        </Popover>
    )
}
