import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { useState } from 'react'
import { handleDueDateUpdate } from '../utils/todo-operations'
import { TodoItem } from '@/types/todo'
import { TodoState } from '../utils/todo-list-operations'

export default function DueDatePopover({ todo, state }: { todo: TodoItem, state: TodoState }) {

    // const [isOpen, setIsOpen] = useState<boolean>(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string>("12:00");

    console.log('todo ', todo)


    function extractTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    function combineDateAndTime(date: Date, time?: string): string {
        if (!date) throw new Error("Date is required");

        const combined = new Date(date);

        if (time) {
            const [hours, minutes] = time.split(":").map(Number);
            combined.setHours(hours, minutes, 0, 0);
        } else {
            combined.setHours(7, 0, 0, 0); // 7am if no time given
        }
        return combined.toISOString();
    }

    async function setDueDate() {

        if (!date) return;
        const dueDateISO = combineDateAndTime(date, time);

        // Implement setting due date logic here (Backend and Frontend)
        await handleDueDateUpdate(todo.id, dueDateISO, state);

    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="h-auto p-0 text-xs font-normal text-muted-foreground hover:cursor-pointer hover:text-foreground"
                >
                    Due: {date?.toLocaleDateString()} @ {time}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[290px] p-2 mr-7" align="start">
                <div className="space-y-1">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => setDate(date)}
                        captionLayout='dropdown'
                        className="w-full bg-transparent pt-1"
                    />
                    <div className="flex-center mx-auto gap-x-4">
                        <Input
                            id="time"
                            type="time"
                            aria-label='Set due time'
                            defaultValue={time}
                            className="w-fit my-3"
                            onChange={(e) => setTime(e.target.value)}
                        />
                        <Button
                            onClick={setDueDate}
                        >
                            Set Due Date
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
