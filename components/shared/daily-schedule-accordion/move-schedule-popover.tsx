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
                    className='m-0 p-0 pl-2 mb-1 hover:cursor-pointer'
                >
                    Copy Schedule
                </Button>
            </PopoverTrigger>
            <PopoverContent className='ml-5 p-2 w-[290px] min-h-[367px]'>
                <div className="space-y-3">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md bg-transparent w-full pt-1"
                        captionLayout='dropdown'
                    />

                    <div className="flex-center gap-x-4 mb-2">
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
                </div>
            </PopoverContent>

        </Popover>
    )
}
