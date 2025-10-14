'use client'
import React, { useState, KeyboardEvent } from 'react'
import { Accordion } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Task } from '@/types/tasks'
import { OutlineItem } from '@/types/outline-item'
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { DndContext, KeyboardSensor, TouchSensor, MouseSensor, useSensor, useSensors, useDroppable, DragStartEvent, DragEndEvent, pointerWithin, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import { clientOutlineItems } from '@/lib/api/services/tasks/client'
import { clientTasks } from '@/lib/api/services/tasks/client'
import { Schedule } from '@/types/day'
import YesterdayTomorrowNav from './yesterday-tomorrow-nav'
import { useRouter } from 'next/navigation'
import { ChevronsDownUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    scheduleData,
    currentDay
}: {
    scheduleData: Schedule,
    currentDay: string
}) {

    console.log('scheduleData:', scheduleData);

    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>(() => {
        return scheduleData?.tasks?.map(task => {
            const taskWithClient = {
                ...task,
                clientKey: `client-${task.id}`
            }
            // Ensure each task has exactly one empty outline item at the end
            const outlineItems = [...taskWithClient.outlineItems]
            const lastItem = outlineItems[outlineItems.length - 1]
            const isLastItemEmpty = lastItem && lastItem.text.trim() === ''

            if (!isLastItemEmpty) {
                outlineItems.push({
                    id: `temp-outline-${task.id}-${Date.now()}`,
                    text: '',
                    completed: false,
                    indentLevel: 0,
                    position: outlineItems.length,
                })
            }

            taskWithClient.outlineItems = outlineItems
            return taskWithClient
        }) || []
    })

    const [openAccordions, setOpenAccordions] = useState<string[]>(['0'])
    const [isEditable, setIsEditable] = useState<boolean>(true)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [draggedItemType, setDraggedItemType] = useState<'task' | 'outline' | null>(null)
    const [activeItem, setActiveItem] = useState<Task | OutlineItem | null>(null)
    const [focusedText, setFocusedText] = useState<string>('')

    // Helper function to ensure there's always exactly one empty outline item at the end
    const ensureEmptyOutlineItem = (outlineItems: OutlineItem[]) => {
        const lastItem = outlineItems[outlineItems.length - 1]
        const isLastItemEmpty = lastItem && lastItem.text.trim() === ''

        // If the last item is already empty, we're good - don't mess with it
        if (isLastItemEmpty) {
            return
        }

        // Only if there's no empty item at the end, add one
        outlineItems.push({
            id: `temp-outline-${Date.now()}`,
            text: '',
            completed: false,
            indentLevel: 0,
            position: outlineItems.length,
        })
    }

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
            await clientTasks.updateTask(taskId, task.title, task.position, newCompleted)
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

        // Open the accordion when user starts typing in the task title (if it has content)
        if (title.trim() !== '' && !openAccordions.includes(taskId)) {
            setOpenAccordions(prev => [...prev, taskId])
        }
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
            await clientOutlineItems.updateOutlineItem(itemId, item.text, item.position, item.indentLevel, newCompleted)
        } catch (error) {
            console.error('Failed to update outline item completion:', error)
        }
    }

    const updateOutlineItem = (taskId: string, itemId: string, text: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    const updatedOutlineItems = task.outlineItems.map(item =>
                        item.id === itemId
                            ? { ...item, text }
                            : item
                    )

                    // If user is typing in the last item and it now has text, add a new empty item at the end
                    const itemIndex = updatedOutlineItems.findIndex(item => item.id === itemId)
                    const isLastItem = itemIndex === updatedOutlineItems.length - 1
                    const hasText = text.trim() !== ''
                    const wasLastItemEmpty = task.outlineItems[itemIndex]?.text.trim() === ''

                    if (hasText && isLastItem && wasLastItemEmpty) {
                        // User started typing in the last empty item, add a new empty item at the end
                        updatedOutlineItems.push({
                            id: `temp-outline-${Date.now()}`,
                            text: '',
                            completed: false,
                            indentLevel: 0,
                            position: updatedOutlineItems.length,
                        })
                    }

                    return { ...task, outlineItems: updatedOutlineItems }
                }
                return task
            })
        )
    }

    const handleTaskDelete = async (taskId: string) => {
        try {
            await clientTasks.deleteTask(taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleOutlineItemDelete = async (taskId: string, itemId: string) => {
        try {
            await clientOutlineItems.deleteOutlineItem(itemId);
        } catch (error) {
            console.error('Error deleting outline item:', error);
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

        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        // If text is empty, remove the item unless it's the last one in the list
        if (text.trim() === '') {
            const currentIndex = task.outlineItems.findIndex(item => item.id === itemId)
            const isLastItem = currentIndex === task.outlineItems.length - 1
            // Only remove if it's not the last item
            if (!isLastItem) {
                const isTemporary = itemId.startsWith('temp-')
                if (!isTemporary) {
                    try {
                        await clientOutlineItems.deleteOutlineItem(itemId);
                    } catch (error) {
                        console.error('error deleting outline item', error);
                    }
                }
                // Remove from UI
                setTasks(prev =>
                    prev.map(t => {
                        if (t.id === taskId) {
                            const newOutlineItems = t.outlineItems.filter(item => item.id !== itemId)
                            ensureEmptyOutlineItem(newOutlineItems)
                            return { ...t, outlineItems: newOutlineItems }
                        }
                        return t
                    })
                )
            }
            return
        }

        // If this was a temporary item that got text, ensure there's a new empty one at the end
        if (text.trim() !== '' && itemId.startsWith('temp-')) {
            setTasks(prev =>
                prev.map(t => {
                    if (t.id === taskId) {
                        const newOutlineItems = [...t.outlineItems]
                        ensureEmptyOutlineItem(newOutlineItems)
                        return { ...t, outlineItems: newOutlineItems }
                    }
                    return t
                })
            )
        }
        const isTemporary = itemId.startsWith('temp-')

        if (isTemporary) {
            // Create new item in backend
            try {
                const newItem = await clientOutlineItems.createOutlineItem(
                    taskId,
                    text.trim(),
                    position,
                    indentation,
                    completed
                )

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
            } catch (error) {
                console.error('Failed to create outline item')
            }
        } else {
            // Update existing item
            try {
                await clientOutlineItems.updateOutlineItem(
                    itemId,
                    text.trim(),
                    position,
                    indentation,
                    completed
                )
            } catch (error) {
                console.error('❌ Failed to update outline item:', error)
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
                const newTask = await clientTasks.createTask(
                    scheduleData.id,
                    title.trim(),
                    tasks.length,
                    task.completed
                )
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
            } catch (error) {
                console.error('Failed to create task')
            }
        } else {
            // Update existing task
            try {
                await clientTasks.updateTask(
                    taskId,
                    title.trim(),
                    task.position,
                    task.completed
                )
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

    // Handle pressing the ENTER button on the task input
    const handleTaskTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, taskId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            // Blur the input (lose focus)
            const target = e.target as HTMLTextAreaElement
            target.blur()

            // Open the accordion if it's not already open
            if (!openAccordions.includes(taskId)) {
                setOpenAccordions(prev => [...prev, taskId])
            }
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

        // Focus the new task title input after a short delay
        setTimeout(() => {
            const newTaskInput = document.querySelector(`[data-task-id="${tempId}"] .task-title-input`) as HTMLTextAreaElement
            if (newTaskInput) {
                newTaskInput.focus()
                newTaskInput.select()
            }
        }, 50) // Shorter delay since we don't need to wait for accordion to open
    }

    const updateTaskPositions = async (reorderedTasks: Task[]) => {
        try {
            // Try batch endpoint first
            await clientTasks.batchUpdateTaskPositions(
                reorderedTasks.map((task, index) => ({
                    id: task.id,
                    title: task.title,
                    position: index,
                    completed: task.completed
                }))
            )
        } catch (error) {
            console.error('Batch update failed, falling back to individual requests:', error)
        }
    }

    const updateOutlineItemPositions = async (taskId: string, reorderedItems: OutlineItem[]) => {
        try {
            // Try batch endpoint first
            await clientOutlineItems.batchUpdateOutlineItemPositions(
                reorderedItems.map((item, index) => ({
                    id: item.id,
                    text: item.text,
                    position: index,
                    indentLevel: item.indentLevel,
                    completed: item.completed,
                    taskId: taskId
                }))
            )
        } catch (error) {
            console.error('Batch update failed, falling back to individual requests:', error)
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
    const handleOutlineKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>, taskId: string, itemId: string) => {
        const task = tasks.find(t => t.id === taskId)
        const item = task?.outlineItems.find(i => i.id === itemId)

        if (!task || !item) return

        if (e.key === 'Enter') {
            e.preventDefault();

            // If current item is empty, remove it and don't focus anything
            if (item.text.trim() === '') {
                // Only remove if there are multiple items (keep at least one)
                if (task.outlineItems.length > 1) {
                    setTasks(prev =>
                        prev.map(t => {
                            if (t.id === taskId) {
                                const newOutlineItems = t.outlineItems.filter(i => i.id !== itemId)

                                // Update positions for remaining items
                                const updatedItems = newOutlineItems.map((outlineItem, index) => ({
                                    ...outlineItem,
                                    position: index
                                }))

                                return { ...t, outlineItems: updatedItems }
                            }
                            return t
                        })
                    )
                }
                // Don't focus anything after removing empty item
                return;
            }

            // If current item has text, create a new item right below the current one
            const currentIndex = task.outlineItems.findIndex(i => i.id === itemId)
            const newTempId = `temp-outline-${Date.now()}`

            setTasks(prev =>
                prev.map(t => {
                    if (t.id === taskId) {
                        const newOutlineItems = [...t.outlineItems]

                        // Insert new item right after the current one
                        const newItem = {
                            id: newTempId,
                            text: '',
                            completed: false,
                            indentLevel: item.indentLevel, // ✅ Maintain same indentation level
                            position: currentIndex + 1,
                        }

                        newOutlineItems.splice(currentIndex + 1, 0, newItem)

                        // Update positions for items that come after
                        const updatedItems = newOutlineItems.map((outlineItem, index) => ({
                            ...outlineItem,
                            position: index
                        }))

                        return { ...t, outlineItems: updatedItems }
                    }
                    return t
                })
            )

            // Focus the new input
            setTimeout(() => {
                const newInput = document.querySelector(`textarea[data-item-id="${newTempId}"]`) as HTMLTextAreaElement
                if (newInput) {
                    newInput.focus()
                }
            }, 50)
        }

        if (e.key === 'Backspace') {
            // Only delete if the item is already empty, user presses backspace, and there are multiple items
            const textarea = e.target as HTMLTextAreaElement
            const cursorPosition = textarea.selectionStart
            const hasNoText = item.text.trim() === ''
            const cursorAtStart = cursorPosition === 0

            if (hasNoText && cursorAtStart && task.outlineItems.length > 1) {
                e.preventDefault()

                const currentIndex = task.outlineItems.findIndex(i => i.id === itemId)
                const isTemporary = itemId.startsWith('temp-')

                // Delete from backend if it's not a temporary item
                if (!isTemporary) {
                    try {
                        await clientOutlineItems.deleteOutlineItem(itemId);
                    } catch (error) {
                        console.error('Error deleting outline item:', error);
                    }
                }

                setTasks(prev =>
                    prev.map(t => {
                        if (t.id === taskId) {
                            const newOutlineItems = t.outlineItems.filter(i => i.id !== itemId)

                            // Update positions for remaining items
                            const updatedItems = newOutlineItems.map((outlineItem, index) => ({
                                ...outlineItem,
                                position: index
                            }))

                            return { ...t, outlineItems: updatedItems }
                        }
                        return t
                    })
                )

                // Focus the previous item or the next item if it was the first
                setTimeout(() => {
                    const inputs = document.querySelectorAll(`[data-task-id="${taskId}"] textarea[data-item-id]`)
                    const targetIndex = currentIndex > 0 ? currentIndex - 1 : 0
                    const targetInput = inputs[targetIndex] as HTMLTextAreaElement
                    if (targetInput) {
                        targetInput.focus()
                    }
                }, 50)
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
        document.body.classList.add('dnd-dragging') // Prevent scrolling

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
        document.body.classList.remove('dnd-dragging') // Re-enable scrolling

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
        // Separate mouse and touch sensors for better control
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,        // Shorter delay - prevents phone lookup
                tolerance: 8,      // Allow small movements before canceling
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

    function goToYesterday() {
        const yesterday = new Date(currentDay)
        yesterday.setDate(yesterday.getDate() - 1)
        const formattedDate = yesterday.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}`)
    }

    function goToTomorrow() {
        const tomorrow = new Date(currentDay)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const formattedDate = tomorrow.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}`)
    }

    return (
        <div>
            <div className="flex-between">
                <YesterdayTomorrowNav
                    goToTomorrow={goToTomorrow}
                    goToYesterday={goToYesterday}
                />

                <div className="flex text-sm items-center justify-end my-6 gap-x-2">
                    <Button variant={'ghost'}>
                        <ChevronsDownUp
                            size={19}
                            strokeWidth={2.5}
                            onClick={() => setOpenAccordions([])}
                            className="text-muted-foreground mr-3"
                        >
                            <title>Drag and drop to reorder tasks or outline items</title>
                        </ChevronsDownUp>
                    </Button>
                    <span>View</span>
                    <Switch
                        checked={isEditable}
                        onCheckedChange={setIsEditable}
                    />
                    <span>Edit</span>
                </div>
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
                        className="w-full mt-4 mb-14 p-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-border hover:text-ring"
                    >
                        <span className="text-lg">+</span>
                        <span>Add Task</span>
                    </button>
                )}
            </DndContext>


        </div >
    )
}
