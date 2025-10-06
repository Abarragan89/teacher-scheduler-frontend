'use client'
import React, { useState, KeyboardEvent } from 'react'
import { Accordion } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Task } from '@/types/tasks'
import { OutlineItem } from '@/types/outline-item'
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragStartEvent, DragEndEvent, pointerWithin, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import { callJavaAPI } from '@/lib/auth/utils'
import { Schedule } from '@/types/day'

// Make TaskItem dynamic since it uses useSortable hooks and causes hydration errors
const DynamicTaskItem = dynamic(() => import('./task-item'), {
    ssr: false,
    loading: () => (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-3 flex-1" />
            </div>
        </div>
    )
})


export default function DailyScheduleAccordion({
    scheduleData
}: {
    scheduleData: Schedule
}) {

    const [tasks, setTasks] = useState<Task[]>(
        scheduleData?.tasks?.map(task => ({
            ...task,
            clientKey: `client-${task.id}`

        })) || [])

    const [openAccordions, setOpenAccordions] = useState<string[]>(['0'])
    const [isEditable, setIsEditable] = useState<boolean>(true)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [draggedItemType, setDraggedItemType] = useState<'task' | 'outline' | null>(null)
    const [activeItem, setActiveItem] = useState<Task | OutlineItem | null>(null)
    const [focusedText, setFocusedText] = useState<string>('')

    const toggleTaskCompletion = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        const newCompleted = !task.completed

        // Update UI immediately (optimistic update)
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: newCompleted,
                        outlineItems: task.outlineItems.map(item => ({
                            ...item,
                            completed: newCompleted ? true : item.completed
                        }))
                    }
                    : task
            )
        )

        // Update backend
        try {
            await callJavaAPI(`/task/update-task`, 'PUT', {
                id: taskId,
                title: task.title,
                position: task.position,
                completed: newCompleted
            })
        } catch (error) {
            console.error('Failed to update task completion:', error)
        }
    }

    const updateTaskTitle = (taskId: string, title: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, title }
                    : task
            )
        )
    }

    const toggleOutlineItemCompletion = async (taskId: string, itemId: string) => {
        const task = tasks.find(t => t.id === taskId)
        const item = task?.outlineItems.find(i => i.id === itemId)
        if (!task || !item) return

        const newCompleted = !item.completed

        // Update UI immediately (optimistic update)
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        outlineItems: task.outlineItems.map(item =>
                            item.id === itemId
                                ? { ...item, completed: newCompleted }
                                : item
                        )
                    }
                    : task
            )
        )

        // Update backend
        try {
            await callJavaAPI(`/task-outline-item/update-item`, 'PUT', {
                id: itemId,
                text: item.text,
                position: item.position,
                indentLevel: item.indentLevel,
                completed: newCompleted
            })
        } catch (error) {
            console.error('Failed to update outline item completion:', error)
        }
    }

    const updateOutlineItem = (taskId: string, itemId: string, text: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        outlineItems: task.outlineItems.map(item =>
                            item.id === itemId
                                ? { ...item, text }
                                : item
                        )
                    }
                    : task
            )
        )
    }

    const addOutlineItem = (taskId: string, afterItemId?: string) => {
        const tempId = `temp-outline-${Date.now()}`

        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    // Check if there's already an empty outline item (prevent creating multiple empty items)
                    const hasEmptyItem = task?.outlineItems?.some(item => item.text.trim() === '')
                    if (hasEmptyItem) return task

                    const newItem: OutlineItem = {
                        id: `temp-${Date.now()}`,
                        text: '',
                        completed: false,
                        indentLevel: 0,
                        position: task.outlineItems.length
                    }

                    if (afterItemId) {
                        const index = task?.outlineItems?.findIndex(item => item.id === afterItemId)
                        const newItems = [...task.outlineItems]
                        newItems.splice(index + 1, 0, newItem)
                        return { ...task, outlineItems: newItems }
                    }

                    return { ...task, outlineItems: [...task.outlineItems, newItem] }
                }
                return task
            })
        )
        // Focus the new input after a short delay
        setTimeout(() => {
            const newInput = document.querySelector(`[data-outline-id="${tempId}"] input`)
            if (newInput instanceof HTMLInputElement) {
                newInput.focus()
            }
        }, 100)
    }

    const deleteOutlineItem = (taskId: string, itemId: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    const newOutlineItems = task.outlineItems.filter(item => item.id !== itemId)
                    // Ensure at least one outline item exists
                    if (newOutlineItems.length === 0) {
                        newOutlineItems.push({
                            id: `${taskId}-${Date.now()}`,
                            text: '',
                            completed: false,
                            indentLevel: 0,
                            position: 0,
                        })
                    }
                    return { ...task, outlineItems: newOutlineItems }
                }
                return task
            })
        )
    }

    const handleTaskDelete = async (taskId: string) => {
        try {
            const response = await callJavaAPI(`/task/delete/${taskId}`, 'DELETE');
            if (!response.ok) {
                console.log('Failed to delete task from server');
            }
        } catch (error) {
            console.log('Error deleting task:', error);
        }
    };

    const handleOutlineItemDelete = async (taskId: string, itemId: string) => {
        try {
            const response = await callJavaAPI(`/task-outline-item/delete/${itemId}`, 'DELETE');
            if (!response.ok) {
                console.log('Failed to delete outline item from server');
            }
        } catch (error) {
            console.log('Error deleting outline item:', error);
        }
    };

    const handleOutlineBlur = async (
        taskId: string,
        itemId: string,
        text: string,
        position: number,
        indentation: number,
        completed: boolean
    ) => {
        if (focusedText === text.trim()) {
            return // No change, skip API call
        }
        const task = tasks.find(t => t.id === taskId)
        // Delete empty outline items when they lose focus
        if (text.trim() === '') {
            try {
                const response = await callJavaAPI(`/task-outline-item/delete/${itemId}`, 'DELETE');
                if (response.ok) {
                    if (task && task.outlineItems.length > 1) {
                        deleteOutlineItem(taskId, itemId)
                    }
                }
            } catch (error) {
                console.log('error deleting outline item', error);
            } finally {
                return
            }
        }


        // Don't save empty tasks or continue if task is not there
        if (text.trim() === '') return
        const isTemporary = itemId.startsWith('temp-')

        if (isTemporary) {
            // Create new task in backend
            try {
                const response = await callJavaAPI('/task-outline-item/create', 'POST', {
                    taskId: taskId,
                    text: text.trim(),
                    position: position,
                    indentLevel: indentation,
                    completed: completed
                })

                if (response.ok) {
                    const newItem = await response.json()

                    // Update the item ID but preserve accordion state 
                    setTasks(prev =>
                        prev.map(task => {
                            if (task.id === taskId) {
                                return {
                                    ...task,
                                    outlineItems: task.outlineItems.map(item =>
                                        item.id === itemId
                                            ? { ...item, id: newItem.id } // Update item ID, not task ID
                                            : item
                                    )
                                }
                            }
                            return task
                        })
                    )
                }
            } catch (error) {
                console.error('Failed to create task')
            }
        } else {
            // Update existing task
            try {
                // else, update the item
                await callJavaAPI(`/task-outline-item/update-item`, 'PUT', {
                    id: itemId,
                    text: text.trim(),
                    position: position,
                    indentLevel: indentation,
                    completed: completed
                })
            } catch (error) {
                console.error('❌ Failed to update task:', error)
            }
        }
    }

    const handleTaskBlur = async (taskId: string, title: string) => {
        if (title.trim() === '') return // Don't save empty tasks
        const task: Task | null = tasks.find(t => t.id === taskId) || null;

        if (focusedText === task?.title.trim()) {
            return // No change, skip API call
        }

        const isTemporary = taskId.startsWith('temp-')
        if (!task) return;

        if (isTemporary) {
            // Create new task in backend
            try {
                const response = await callJavaAPI('/task/create', 'POST', {
                    scheduleId: scheduleData.id,
                    title: title.trim(),
                    position: tasks.length,
                    completed: task.completed
                })

                if (response.ok) {
                    const newTask = await response.json()
                    // Replace temporary task with real task
                    setTasks(prev =>
                        prev.map(task =>
                            task.id === taskId
                                ? { ...task, id: newTask.id } // Update with real ID
                                : task
                        )
                    )

                    // Maintain open accordions state
                    setOpenAccordions(prev =>
                        prev.map(openId => openId === taskId ? newTask.id : openId)
                    )
                }
            } catch (error) {
                console.error('Failed to create task')
            }
        } else {
            // Update existing task
            try {
                await callJavaAPI(`/task/update-task`, 'PUT', {
                    id: taskId,
                    title: title.trim(),
                    position: task.position,
                    completed: task.completed
                })
            } catch (error) {
                console.error('Failed to update task')
            }
        }
    }

    // On focus - capture the current text
    const handleOutlineFocus = (taskId: string, itemId: string) => {
        const task = tasks.find(t => t.id === taskId)
        const item = task?.outlineItems.find(i => i.id === itemId)
        if (item) {
            setFocusedText(item.text) // Just store the text
        }
    }

    const handleTaskFocus = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
            setFocusedText(task.title) // Just store the title
        }
    }

    // Handle pressing the ENTER button on the task to open the subtasks
    const handleTaskTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Open the accordion if it's not already open
            if (!openAccordions.includes(taskId)) {
                setOpenAccordions(prev => [...prev, taskId])
            }
            // Focus the first subtask after a brief delay
            setTimeout(() => {
                const firstSubtaskInput = document.querySelector(`[data-task-id="${taskId}"] input[data-item-id]`) as HTMLInputElement
                if (firstSubtaskInput) {
                    firstSubtaskInput.focus()
                    firstSubtaskInput.select()
                }
            }, 100)
        }
    }

    const addNewTask = () => {
        const tempId = `temp-${Date.now()}`  // Temporary ID
        const newTask: Task = {
            id: tempId,  // Mark as temporary
            title: '',
            clientKey: `client-${tempId}`,
            position: tasks.length,
            completed: false,
            outlineItems: [{
                id: `temp-outline-${tempId}`,
                text: '',
                completed: false,
                indentLevel: 0,
                position: 0,
            }]
        }
        setTasks(prev => [...prev, newTask])
        setOpenAccordions(prev => [...prev, tempId])
    }

    const updateTaskPositions = async (reorderedTasks: Task[]) => {
        try {
            // Update all task positions in batch
            const updates = reorderedTasks.map((task, index) => ({
                id: task.id,
                title: task.title,
                position: index,
                completed: task.completed
            }))

            // Send individual requests for each task
            await Promise.all(
                updates.map(update =>
                    callJavaAPI(`/task/update-task`, 'PUT', update)
                )
            )
        } catch (error) {
            console.error('Failed to update task positions:', error)
        }
    }

    const updateOutlineItemPositions = async (taskId: string, reorderedItems: OutlineItem[]) => {
        try {
            // Update all outline item positions
            const updates = reorderedItems.map((item, index) => ({
                id: item.id,
                text: item.text,
                position: index,
                indentLevel: item.indentLevel,
                completed: item.completed
            }))

            // Send individual requests for each outline item
            await Promise.all(
                updates.map(update =>
                    callJavaAPI(`/task-outline-item/update-item`, 'PUT', update)
                )
            )
        } catch (error) {
            console.error('Failed to update outline item positions:', error)
        }
    }

    const reorderOutlineItems = (taskId: string, reorderedItems: OutlineItem[]) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, outlineItems: reorderedItems }
                    : task
            )
        )

        // Update backend positions
        updateOutlineItemPositions(taskId, reorderedItems)
    }

    const closeAllAccordions = () => {
        setOpenAccordions([])
    }

    // Handle TAB and ENTER key for indentation (Outline Items)
    const handleOutlineKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string, itemId: string) => {
        const task = tasks.find(t => t.id === taskId)
        const item = task?.outlineItems.find(i => i.id === itemId)

        if (!task || !item) return

        if (e.key === 'Enter') {
            e.preventDefault();
            // Only proceed if current item has text
            if (item.text.trim() !== '') {
                // Find current item index
                const currentIndex = task.outlineItems.findIndex(i => i.id === itemId)
                const nextIndex = currentIndex + 1

                // Check if there's already an outline item below
                if (nextIndex < task.outlineItems.length) {
                    // Focus the next existing input and select all text
                    setTimeout(() => {
                        const inputs = document.querySelectorAll(`[data-task-id="${taskId}"] input[data-item-id]`)
                        const nextInput = inputs[nextIndex] as HTMLInputElement
                        if (nextInput) {
                            nextInput.focus()
                            nextInput.select() // This highlights/selects all text
                        }
                    }, 10)
                } else {
                    // No input below, create a new one
                    addOutlineItem(taskId, itemId)
                    // Focus the new input after a brief delay
                    setTimeout(() => {
                        const inputs = document.querySelectorAll(`[data-task-id="${taskId}"] input[data-item-id]`)
                        const newInput = inputs[inputs.length - 1] as HTMLInputElement
                        if (newInput) {
                            newInput.focus()
                        }
                    }, 10)
                }
            }
        }

        if (e.key === 'Tab') {
            e.preventDefault()
            const maxIndent = 1
            const newIndentLevel = e.shiftKey
                ? Math.max(0, item.indentLevel - 1)
                : Math.min(maxIndent, item.indentLevel + 1)

            setTasks(prev =>
                prev.map(t =>
                    t.id === taskId
                        ? {
                            ...t,
                            outlineItems: t.outlineItems.map(i =>
                                i.id === itemId
                                    ? { ...i, indentLevel: newIndentLevel }
                                    : i
                            )
                        }
                        : t
                )
            )
        }
    }

    const getTaskIndex = (id: string) => tasks.findIndex(task => task.id === id)

    function handleDragStart(event: DragStartEvent) {
        setIsDragging(true)

        // Determine if it's a task or outline item being dragged
        const draggedId = event.active.id as string
        if (tasks.some(task => task.id === draggedId)) {
            setDraggedItemType('task')
            const task = tasks.find(t => t.id === draggedId)
            setActiveItem(task || null)
            // Only close accordions when dragging a task, not outline items
            closeAllAccordions()
        } else {
            setDraggedItemType('outline')
            // Find the outline item
            for (const task of tasks) {
                const outlineItem = task.outlineItems.find(item => item.id === draggedId)
                if (outlineItem) {
                    setActiveItem(outlineItem)
                    break
                }
            }
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setIsDragging(false)
        setDraggedItemType(null)
        setActiveItem(null)

        if (!over) return;

        // Handle deletion if dropped on trash
        if (over.id === 'trash-zone') {
            const draggedId = active.id as string

            if (draggedItemType === 'task') {
                // 🎯 IMMEDIATELY remove from UI (optimistic update)
                setTasks(prev => prev.filter(task => task.id !== draggedId))

                // Then handle API call in background
                handleTaskDelete(draggedId)
            } else if (draggedItemType === 'outline') {
                // Find and immediately remove outline item from UI
                let taskIdToUpdate = ''

                setTasks(prev =>
                    prev.map(task => {
                        const outlineItem = task.outlineItems.find(item => item.id === draggedId)
                        if (outlineItem) {
                            taskIdToUpdate = task.id
                            return {
                                ...task,
                                outlineItems: task.outlineItems.filter(item => item.id !== draggedId)
                            }
                        }
                        return task
                    })
                )

                // Handle API call in background
                if (taskIdToUpdate) {
                    handleOutlineItemDelete(taskIdToUpdate, draggedId)
                }
            }
            return // Exit early, don't process reordering
        }

        // Handle reordering (existing logic)
        if (active.id === over.id) return;

        if (draggedItemType === 'task') {
            // Handle task reordering
            setTasks((currentTasks) => {
                const originalPos = getTaskIndex(active.id as string);
                const newPos = getTaskIndex(over.id as string);
                const reorderedTasks = arrayMove(currentTasks, originalPos, newPos)

                // Update backend positions
                updateTaskPositions(reorderedTasks)

                return reorderedTasks
            })
        } else if (draggedItemType === 'outline') {
            // Handle outline item reordering within the same task
            const draggedId = active.id as string
            const droppedId = over.id as string

            // Find which task contains the dragged item
            for (const task of tasks) {
                const draggedItemIndex = task.outlineItems.findIndex(item => item.id === draggedId)

                if (draggedItemIndex !== -1) {
                    // Check if the drop target is also an outline item in the same task
                    const droppedItemIndex = task.outlineItems.findIndex(item => item.id === droppedId)

                    if (droppedItemIndex !== -1) {
                        // Both items are in the same task, reorder them
                        const reorderedItems = arrayMove(task.outlineItems, draggedItemIndex, droppedItemIndex)
                        reorderOutlineItems(task.id, reorderedItems)
                    }
                    // If dropped on something else, ignore the reordering
                    break
                }
            }
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px of movement before dragging starts
            },
        }),
        useSensor(KeyboardSensor)
    )

    // Circular Trash Drop Zone Component - Fixed position at top center
    function TrashDropZone() {
        const { setNodeRef, isOver } = useDroppable({
            id: 'trash-zone',
        })

        return (
            <div
                ref={setNodeRef}
                className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-50 w-16 h-16 rounded-full border-2 border-dashed transition-all duration-200 flex items-center justify-center shadow-lg ${isOver
                    ? 'bg-destructive/20 border-destructive scale-110 shadow-destructive/50'
                    : 'bg-muted/90 border-muted-foreground/60 hover:border-destructive hover:bg-destructive/10'
                    }`}
                style={{ backdropFilter: 'blur(8px)' }}
            >
                <Trash2
                    className={`w-6 h-6 transition-colors ${isOver ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                />
            </div>
        )
    }

    return (
        <div>
            <div className="flex text-sm items-start justify-end mt-7 mb-5 gap-x-2">
                <span>View</span>
                <Switch
                    checked={isEditable}
                    onCheckedChange={setIsEditable}
                />
                <span>Edit</span>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                collisionDetection={pointerWithin}
            >
                <SortableContext
                    items={tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Accordion
                        type="multiple"
                        className="w-full space-y-2"
                        value={openAccordions}
                        onValueChange={setOpenAccordions}
                    >
                        {tasks.map(task => (
                            <DynamicTaskItem
                                key={task.clientKey}
                                task={task}
                                tasksLength={tasks.length}
                                isEditable={isEditable}
                                isDragging={isDragging}
                                onToggleCompletion={toggleTaskCompletion}
                                onUpdateTitle={updateTaskTitle}
                                onTitleKeyDown={handleTaskTitleKeyDown}
                                onToggleOutlineCompletion={toggleOutlineItemCompletion}
                                onFocusTask={handleTaskFocus}
                                onFocusOutline={handleOutlineFocus}
                                onUpdateOutlineItem={updateOutlineItem}
                                onOutlineKeyDown={handleOutlineKeyDown}
                                onOutlineBlur={handleOutlineBlur}
                                onTaskBlur={handleTaskBlur}
                                onAddOutlineItem={addOutlineItem}
                                onCloseAllAccordions={closeAllAccordions}
                            />
                        ))}
                    </Accordion>
                </SortableContext>

                {/* Fixed position circular trash icon */}
                {isDragging && isEditable && <TrashDropZone />}

                {/* DragOverlay for smooth drag preview outside accordion */}
                <DragOverlay>
                    {activeItem ? (
                        <div className="bg-background border rounded-lg p-3 shadow-lg opacity-90 max-w-md">
                            {'title' in activeItem ? (
                                // Task preview
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                    <div className="font-medium text-foreground">
                                        {activeItem.title || 'Untitled Task'}
                                    </div>
                                </div>
                            ) : (
                                // Outline item preview
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                    <div className="text-muted-foreground">
                                        {activeItem.text || 'Empty note'}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>

                {isEditable && (
                    <button
                        onClick={addNewTask}
                        className="w-full mt-4 p-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-border hover:text-ring"
                    >
                        <span className="text-lg">+</span>
                        <span>Add Task</span>
                    </button>
                )}
            </DndContext>


        </div>
    )
}
