'use client'
import React, { useState, KeyboardEvent } from 'react'
import { Accordion } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Task, OutlineItem } from '@/types/tasks'
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragStartEvent, DragEndEvent, pointerWithin, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'

// Make TaskItem dynamic since it uses useSortable hooks
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


export default function DailyScheduleAccordion() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Math',
            completed: false,
            outlineItems: [{ id: '1-1', text: '', completed: false, indentLevel: 0 }]
        },
        {
            id: '2',
            title: 'CKLA',
            completed: false,
            outlineItems: [{ id: '2-1', text: '', completed: false, indentLevel: 0 }]
        },
        {
            id: '3',
            title: 'Social Studies',
            completed: false,
            outlineItems: [{ id: '3-1', text: '', completed: false, indentLevel: 0 }]
        }
    ])

    const [openAccordions, setOpenAccordions] = useState<string[]>(['0'])
    const [isEditable, setIsEditable] = useState<boolean>(true)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [draggedItemType, setDraggedItemType] = useState<'task' | 'outline' | null>(null)
    const [activeItem, setActiveItem] = useState<Task | OutlineItem | null>(null)

    const toggleTaskCompletion = (taskId: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        outlineItems: task.outlineItems.map(item => ({
                            ...item,
                            completed: !task.completed ? true : item.completed
                        }))
                    }
                    : task
            )
        )
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

    const toggleOutlineItemCompletion = (taskId: string, itemId: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        outlineItems: task.outlineItems.map(item =>
                            item.id === itemId
                                ? { ...item, completed: !item.completed }
                                : item
                        )
                    }
                    : task
            )
        )
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
        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    // Check if there's already an empty outline item (prevent creating multiple empty items)
                    const hasEmptyItem = task.outlineItems.some(item => item.text.trim() === '')
                    if (hasEmptyItem) return task

                    const newItem: OutlineItem = {
                        id: `${Date.now()}`,
                        text: '',
                        completed: false,
                        indentLevel: 0
                    }

                    if (afterItemId) {
                        const index = task.outlineItems.findIndex(item => item.id === afterItemId)
                        const newItems = [...task.outlineItems]
                        newItems.splice(index + 1, 0, newItem)
                        return { ...task, outlineItems: newItems }
                    }

                    return { ...task, outlineItems: [...task.outlineItems, newItem] }
                }
                return task
            })
        )
    }

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId))
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
                            indentLevel: 0
                        })
                    }
                    return { ...task, outlineItems: newOutlineItems }
                }
                return task
            })
        )
    }

    const handleOutlineBlur = (taskId: string, itemId: string, text: string) => {
        // Delete empty outline items when they lose focus
        if (text.trim() === '') {
            const task = tasks.find(t => t.id === taskId)
            if (task && task.outlineItems.length > 1) {
                deleteOutlineItem(taskId, itemId)
            }
        }
    }

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
                }
            }, 100)
        }
    }

    const addNewTask = () => {
        const newTaskId = Date.now().toString()
        const newTask: Task = {
            id: newTaskId,
            title: '',
            completed: false,
            outlineItems: [{
                id: `${newTaskId}-1`,
                text: '',
                completed: false,
                indentLevel: 0
            }]
        }
        setTasks(prev => [...prev, newTask])
    }

    const reorderOutlineItems = (taskId: string, reorderedItems: OutlineItem[]) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, outlineItems: reorderedItems }
                    : task
            )
        )
    }

    const closeAllAccordions = () => {
        setOpenAccordions([])
    }

    const handleOutlineKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string, itemId: string) => {
        const task = tasks.find(t => t.id === taskId)
        const item = task?.outlineItems.find(i => i.id === itemId)

        if (!task || !item) return

        if (e.key === 'Enter') {
            e.preventDefault()
            // Only add new item if current item has text
            if (item.text.trim() !== '') {
                addOutlineItem(taskId, itemId)
                // Focus the new input after a brief delay
                setTimeout(() => {
                    const inputs = document.querySelectorAll(`[data-task-id="${taskId}"] input[data-item-id]`)
                    const currentIndex = Array.from(inputs).findIndex(input =>
                        input.getAttribute('data-item-id') === itemId
                    )
                    if (inputs[currentIndex + 1]) {
                        (inputs[currentIndex + 1] as HTMLInputElement).focus()
                    }
                }, 10)
            }
        }

        if (e.key === 'Backspace' && item.text === '') {
            // Delete current outline item if it's empty and there are multiple items
            if (task.outlineItems.length > 1) {
                e.preventDefault()
                deleteOutlineItem(taskId, itemId)
            }
        }

        if (e.key === 'Tab') {
            e.preventDefault()
            const maxIndent = 2
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
                // Delete task
                deleteTask(draggedId)
            } else if (draggedItemType === 'outline') {
                // Find and delete outline item
                for (const task of tasks) {
                    const outlineItem = task.outlineItems.find(item => item.id === draggedId)
                    if (outlineItem) {
                        deleteOutlineItem(task.id, draggedId)
                        break
                    }
                }
            }
            return
        }

        // Handle reordering (existing logic)
        if (active.id === over.id) return;

        if (draggedItemType === 'task') {
            // Handle task reordering
            setTasks((tasks) => {
                const originalPos = getTaskIndex(active.id as string);
                const newPos = getTaskIndex(over.id as string);

                return arrayMove(tasks, originalPos, newPos)
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
            <div className="flex text-sm items-center justify-end my-5 gap-x-2">
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
                                key={task.id}
                                task={task}
                                tasksLength={tasks.length}
                                isEditable={isEditable}
                                isDragging={isDragging}
                                onToggleCompletion={toggleTaskCompletion}
                                onUpdateTitle={updateTaskTitle}
                                onTitleKeyDown={handleTaskTitleKeyDown}
                                onToggleOutlineCompletion={toggleOutlineItemCompletion}
                                onUpdateOutlineItem={updateOutlineItem}
                                onOutlineKeyDown={handleOutlineKeyDown}
                                onOutlineBlur={handleOutlineBlur}
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
