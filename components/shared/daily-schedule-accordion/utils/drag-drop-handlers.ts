import { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Task } from '@/types/tasks'
import { OutlineItem } from '@/types/outline-item'
import { AccordionState } from './types'
import { handleTaskDelete, updateTaskPositions } from './task-operations'
import { handleOutlineItemDelete, reorderOutlineItems } from './outline-operations'
import { closeAllAccordions } from './accordion-utils'

export const getTaskIndex = (id: string, tasks: Task[]) => tasks.findIndex(task => task.id === id)

export const handleDragStart = (
    event: DragStartEvent,
    state: AccordionState,
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>,
    setDraggedItemType: React.Dispatch<React.SetStateAction<'task' | 'outline' | null>>,
    setActiveItem: React.Dispatch<React.SetStateAction<Task | OutlineItem | null>>
) => {
    const { tasks, setOpenAccordions } = state

    setIsDragging(true)
    document.body.classList.add('dnd-dragging') // Prevent scrolling

    // Determine if it's a task or outline item being dragged
    const draggedId = event.active.id as string
    if (tasks.some(task => task.id === draggedId)) {
        setDraggedItemType('task')
        const task = tasks.find(t => t.id === draggedId)
        setActiveItem(task || null)
        // Only close accordions when dragging a task, not outline items
        closeAllAccordions(setOpenAccordions)
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

export const handleDragEnd = (
    event: DragEndEvent,
    state: AccordionState,
    draggedItemType: 'task' | 'outline' | null,
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>,
    setDraggedItemType: React.Dispatch<React.SetStateAction<'task' | 'outline' | null>>,
    setActiveItem: React.Dispatch<React.SetStateAction<Task | OutlineItem | null>>
) => {
    const { active, over } = event;
    const { tasks, setTasks } = state

    setIsDragging(false)
    setDraggedItemType(null)
    setActiveItem(null)
    document.body.classList.remove('dnd-dragging') // Re-enable scrolling

    if (!over) return;

    // Handle deletion if dropped on trash
    if (over.id === 'trash-zone') {
        const draggedId = active.id as string

        if (draggedItemType === 'task') {
            // Then handle API call in background
            handleTaskDelete(draggedId, setTasks)
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
            const originalPos = getTaskIndex(active.id as string, currentTasks);
            const newPos = getTaskIndex(over.id as string, currentTasks);
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
                    reorderOutlineItems(task.id, reorderedItems, state)
                }
                // If dropped on something else, ignore the reordering
                break
            }
        }
    }
}