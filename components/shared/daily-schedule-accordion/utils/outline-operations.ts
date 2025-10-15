import { OutlineItem } from '@/types/outline-item'
import { clientOutlineItems } from '@/lib/api/services/tasks/client'
import { AccordionState } from './types'

// Helper function to ensure there's always exactly one empty outline item at the end
export const ensureEmptyOutlineItem = (outlineItems: OutlineItem[]) => {
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

export const toggleOutlineItemCompletion = async (taskId: string, itemId: string, state: AccordionState) => {
    const { tasks, setTasks } = state
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

export const updateOutlineItem = (taskId: string, itemId: string, text: string, state: AccordionState) => {
    const { setTasks } = state

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

export const handleOutlineItemDelete = async (taskId: string, itemId: string) => {
    try {
        await clientOutlineItems.deleteOutlineItem(itemId);
    } catch (error) {
        console.error('Error deleting outline item:', error);
    }
}

export const handleOutlineBlur = async (
    taskId: string,
    itemId: string,
    text: string,
    position: number,
    indentation: number,
    completed: boolean,
    state: AccordionState
) => {
    const { tasks, setTasks } = state
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
            console.error('Error creating new outline item:', error)
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
            console.error('Error updating outline item:', error)
        }
    }
}

export const updateOutlineItemPositions = async (taskId: string, reorderedItems: OutlineItem[]) => {
    try {
        // Try batch endpoint first
        await clientOutlineItems.batchUpdateOutlineItemPositions(
            reorderedItems.filter(item => item.text !== "").map((item, index) => ({
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
        throw error
    }
}

export const reorderOutlineItems = (taskId: string, reorderedItems: OutlineItem[], state: AccordionState) => {
    const { setTasks } = state

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