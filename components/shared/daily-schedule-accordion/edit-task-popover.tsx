import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { EllipsisVertical, Trash2, CalendarIcon, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import { clientTasks } from '@/lib/api/services/tasks/client'
import { handleTaskDelete } from './utils/task-operations'
import { SingleTaskView } from '@/components/single-task-view'
import { Task } from '@/types/tasks'
import { AccordionState } from './utils/types'
import { toast } from 'sonner'
import { formatDateDisplay } from '@/lib/utils'

export default function EditTaskPopover({
    task,
    setTasks,
    state
}: {
    task: Task
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    state: AccordionState
}) {

    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = React.useState(false); // Control popover open state
    const [currentView, setCurrentView] = React.useState<'menu' | 'moving' | 'deleting'>('menu');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isFullScreenView, setIsFullScreenView] = React.useState(false);

    async function addTaskToDate() {
        if (!date || isSubmitting) return;

        setIsSubmitting(true);
        const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const isSuccessful = await clientTasks.moveTaskToLaterDate(task.id, dateString);

        if (isSuccessful) {
            setIsOpen(false);
            toast.success(`Task copied successfully to ${formatDateDisplay(date)}`);
        }
        setIsSubmitting(false);
    }

    async function deleteTask() {
        if (isSubmitting) return;

        setIsSubmitting(true);
        await handleTaskDelete(task.id, setTasks);
        setIsOpen(false); // Close popover after successful delete
        setIsSubmitting(false);
    }

    const resetToMenu = () => {
        setCurrentView('menu');
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset to menu when popover closes
            setCurrentView('menu');
        }
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <EllipsisVertical size={20} className="text-muted-foreground" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-fit h-fit p-2">
                    {currentView === 'menu' && (
                        <div className="flex flex-col justify-center text-center gap-1 p-2">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentView('moving')}
                            >
                                <CalendarIcon /> Copy Task
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => { setIsFullScreenView(true); setIsOpen(false) }}
                            >
                                <Eye /> Task View
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentView('deleting')}
                                className='text-destructive hover:text-destructive'
                            >
                                <Trash2 /> Delete Task
                            </Button>
                        </div>
                    )}

                    {currentView === 'moving' && (
                        <div className="space-y-3">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md bg-transparent w-[250px] min-h-[340px]"
                                captionLayout='dropdown'
                            />

                            <div className="flex-center gap-2 mb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetToMenu}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={addTaskToDate}
                                    disabled={!date || isSubmitting}
                                >
                                    {isSubmitting ? 'Copying...' : 'Copy Task'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentView === 'deleting' && (
                        <div className="space-y-5 w-[200px] p-3">
                            <p className='line-clamp-1 text-sm text-center italic'>"{task.title}"</p>

                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetToMenu}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={deleteTask}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Deleting...' : 'Delete Task'}
                                </Button>
                            </div>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
            {isFullScreenView && (
                <SingleTaskView
                    task={task}
                    onClose={() => setIsFullScreenView(false)}
                    isOpen={isFullScreenView}
                    state={state}
                />
            )}
        </>
    )
}