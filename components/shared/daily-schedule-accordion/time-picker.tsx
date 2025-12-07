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
import { Task } from '@/types/tasks'

export function TimePicker({
    taskId,
    setTasks,
    initialStartTime,
    initialEndTime
}: {
    taskId: string,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    initialStartTime?: string,
    initialEndTime?: string
}) {

    const [startTime, setStartTime] = useState<string>(initialStartTime || "07:00");
    const [endTime, setEndTime] = useState<string>(initialEndTime || "08:00");
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    async function updateTaskTime() {
        try {
            setIsSaving(true);
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
                ))
            }
        } catch (error) {
            console.error("Failed to update task time:", error);
            throw error;
        } finally {
            setIsSaving(false);
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
                            defaultValue={startTime}
                            autoFocus={false}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                            autoFocus={false}
                            defaultValue={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <Button
                        disabled={isSaving}
                        onClick={updateTaskTime}>
                        {isSaving ? 'Saving...' : 'Set Time'}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
