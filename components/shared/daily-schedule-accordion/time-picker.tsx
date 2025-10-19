import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { clientTasks } from '@/lib/api/services/tasks/client'
import { toast } from 'sonner'
import { AccordionState } from './utils/types'
import { Task } from '@/types/tasks'
import { previousDay } from 'date-fns'

export function TimePicker({ taskId, setTasks }: { taskId: string, setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) {

    const [startTime, setStartTime] = useState<string>("07:00");
    const [endTime, setEndTime] = useState<string>("08:00");
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    async function updateTaskTime() {
        try {
            const response = await clientTasks.updateTaskTime(taskId, startTime, endTime);
            if (response) {
                toast.success("Task time updated successfully");
                setIsPopoverOpen(false);
                setTasks(prev => (
                    prev.map(task =>
                        task.id === taskId
                            ? { ...task, startTime, endTime }
                            : task
                    )
            ))}
        } catch (error) {
            console.error("Failed to update task time:", error);
            throw error;
        }
    }

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Clock size={16} className="text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-fit h-fit p-5 px-9 mr-5">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="time"
                            defaultValue={"07:00"}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                            defaultValue={"08:00"}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <Button onClick={updateTaskTime}>
                        Set Time
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
