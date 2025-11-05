import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { useState } from 'react'
import { handleDueDateUpdate } from '../utils/todo-operations'
import { TodoItem } from '@/types/todo'
import { TodoState } from '../utils/todo-list-operations'
import { QueryClient } from '@tanstack/react-query'

export default function DueDatePopover({ todo, state, queryClient }: { todo: TodoItem, state: TodoState, queryClient: QueryClient }) {

    // Initialize with todo's due date if it exists, otherwise use current date
    const [date, setDate] = useState<Date | undefined>(
        todo.dueDate ? new Date(todo.dueDate.toString()) : new Date()
    );
    const [time, setTime] = useState<string>(
        todo.dueDate ? extractTimeFromISO(todo.dueDate.toString()) : "07:00"
    );

    const [isPopOverOpen, setIsPopOverOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    function extractTimeFromISO(isoString: string): string {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    function formatDisplayDate(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleDateString();
    }

    function formatDisplayTime(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        setIsSaving(true);
        if (!date) {
            await handleDueDateUpdate(todo.id, null, state, queryClient);
        } else {
            const dueDateISO = combineDateAndTime(date, time);
            // Implement setting due date logic here (Backend and Frontend)
            await handleDueDateUpdate(todo.id, dueDateISO, state, queryClient);
        }
        setIsPopOverOpen(false);
        setIsSaving(false);
    }

    async function clearDueDate() {
        // Clear the due date by setting it to null
        setDate(undefined);
        setTime("--:--");
    }

    return (
        <Popover open={isPopOverOpen} onOpenChange={setIsPopOverOpen}>
            <PopoverTrigger asChild>
                <button
                    className="h-auto p-0 text-xs font-normal text-muted-foreground hover:cursor-pointer hover:text-foreground"
                >
                    {todo.dueDate
                        ? `Due: ${formatDisplayDate(todo.dueDate.toString())} @ ${formatDisplayTime(todo.dueDate.toString())}`
                        : "Due: N/A"
                    }
                </button>
            </PopoverTrigger>
            <PopoverContent className="space-y-1 p-2 mr-7">
                <div className='w-[255px] min-h-[330px] mx-auto'>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => setDate(date)}
                        captionLayout='dropdown'
                        className="w-full bg-transparent"
                    />
                </div>
                <span className="flex-center mx-auto gap-x-2 mb-2">
                    <Input
                        id="time"
                        type="time"
                        aria-label='Set due time'
                        value={time}
                        className="w-fit"
                        onChange={(e) => setTime(e.target.value)}
                    />
                    <Button
                        onClick={setDueDate}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        onClick={clearDueDate}
                        variant="outline"
                        size="sm"
                    >
                        Clear
                    </Button>
                </span>
            </PopoverContent>
        </Popover>
    )
}
