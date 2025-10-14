import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { EllipsisVertical, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import { clientTasks } from '@/lib/api/services/tasks/client'

export default function EditTaskPopover({
    taskId
}: {
    taskId: string
}) {

    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = React.useState(false); // Control popover open state
    const [currentView, setCurrentView] = React.useState<'menu' | 'moving' | 'deleting'>('menu');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function addTaskToDate() {
        if (!date || isSubmitting) return;
        
        setIsSubmitting(true);
        const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const isSuccessful = await clientTasks.moveTaskToLaterDate(taskId, dateString);
        
        if (isSuccessful) {
            setIsOpen(false); // Close popover after successful move
        }
        setIsSubmitting(false);
    }

    async function deleteTask() {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        // Add your delete logic here
        const isSuccessful = await clientTasks.deleteTask(taskId);
        if (isSuccessful) {

            setIsOpen(false); // Close popover after successful delete
        }
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
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                    <EllipsisVertical size={20} className="text-muted-foreground" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[250px] p-2">
                {currentView === 'menu' && (
                    <div className="flex flex-col gap-2">
                        <Button 
                            variant="ghost" 
                            className="justify-start"
                            onClick={() => setCurrentView('moving')}
                        >
                            📅 Move to Another Date
                        </Button>

                        <Button 
                            variant="ghost" 
                            className="justify-start text-red-600 hover:text-red-700"
                            onClick={() => setCurrentView('deleting')}
                        >
                            🗑️ Delete Task
                        </Button>
                    </div>
                )}

                {currentView === 'moving' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={resetToMenu}
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <h3 className="font-medium text-sm">Move Task</h3>
                        </div>

                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md w-full bg-transparent"
                            captionLayout='dropdown'
                        />

                        <div className="flex gap-2">
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
                                {isSubmitting ? 'Moving...' : 'Move Task'}
                            </Button>
                        </div>
                    </div>
                )}

                {currentView === 'deleting' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={resetToMenu}
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <h3 className="font-medium text-sm">Delete Task</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>

                        <div className="flex gap-2">
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
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}