import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { EllipsisVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import { clientTasks } from '@/lib/api/services/tasks/client'

export default function EditTaskPopover({
    taskId
}: {
    taskId: string
}) {

    const [date, setDate] = React.useState<Date | undefined>(new Date())

    async function addTaskToDate() {
        if (!date) return;
        const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const isSuccessful = await clientTasks.moveTaskToLaterDate(taskId, dateString);
        if (isSuccessful) {
            // Optionally, you can add some UI feedback here, like a toast notification
            console.log(`Task moved to ${dateString}`);
        }
    }

    return (
        <Popover>
            <PopoverTrigger>
                <EllipsisVertical size={20} className="text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-[280px]">
                <div className="">

                    {/* <Button variant={"ghost"}>
                        Add to Another Day
                    </Button> */}

                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border w-full"
                        captionLayout='dropdown'
                    />

                    <div className="flex-center mt-2">
                        <Button onClick={addTaskToDate} disabled={!date}>
                            Add Task to: {date ? date.toDateString() : '...'}
                        </Button>
                    </div>

                    {/* <Button variant={"ghost"}>
                       Delete
                    </Button> */}

                </div>
            </PopoverContent>
        </Popover>
    )
}
