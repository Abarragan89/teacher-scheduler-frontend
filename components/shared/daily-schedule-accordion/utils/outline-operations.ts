import { OutlineItem } from '@/types/outline-item'
import { clientOutlineItems } from '@/lib/api/services/tasks/client'
import { AccordionState } from './types'

// Helper function to update backend positions only after actual deletion
const updateBackendPositionsAfterDeletion = async (taskId: string, deletedItemId: string, originalItems: any[]) => {
    try {
        const deletedIndex = originalItems.findIndex(item => item.id === deletedItemId)
        if (deletedIndex === -1) return

        // Only update items that come after the deleted item
        const itemsToUpdate = originalItems
            .filter((item, index) => index > deletedIndex && !item.id.startsWith('temp-'))
            .map((item, relativeIndex) => ({
                ...item,
                position: deletedIndex + relativeIndex // New position after deletion
            }))

        if (itemsToUpdate.length > 0) {
            const updatePromises = itemsToUpdate.map(item =>
                clientOutlineItems.updateOutlineItem(
                    item.id,
                    item.text,
                    item.position,
                    item.indentLevel,
                    item.completed
                )
            )

            await Promise.all(updatePromises)
            console.log('✅ Backend positions updated after deletion')
        }
    } catch (error) {
        console.error('❌ Error updating positions after deletion:', error)
    }
}

// Handle outline item focus - store original text for change detection
export const handleOutlineFocus = (taskId: string, itemId: string, state: AccordionState) => {
    const { tasks, setFocusedText } = state
    const task = tasks.find(t => t.id === taskId)
    const item = task?.outlineItems.find(i => i.id === itemId)
    if (item) {
        if (setFocusedText) setFocusedText(item.text) // Store the original text for change detection
    }
}

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
    const { tasks, setTasks, focusedText } = state
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Check if text actually changed - if not, skip backend update
    const hasTextChanged = text.trim() !== focusedText!.trim()
    const isTemporary = itemId.startsWith('temp-')

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
                    // Update backend positions after deletion
                    updateBackendPositionsAfterDeletion(taskId, itemId, task.outlineItems)
                } catch (error) {
                    console.error('error deleting outline item', error);
                }
            }
            // Remove from UI
            setTasks(prev =>
                prev.map(t => {
                    if (t.id === taskId) {
                        const newOutlineItems = t.outlineItems
                            .filter(item => item.id !== itemId)
                            .map((item, index) => ({ ...item, position: index }))
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
    if (text.trim() !== '' && isTemporary) {
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

    if (isTemporary) {
        // 🎯 THIS IS WHERE WE UPDATE BACKEND POSITIONS - when text is actually saved
        const currentIndex = task.outlineItems.findIndex(item => item.id === itemId)

        try {
            // Create the new item in backend
            const newItem = await clientOutlineItems.createOutlineItem(
                taskId,
                text.trim(),
                currentIndex,
                indentation,
                completed
            )

            // Update UI with real ID
            setTasks(prev =>
                prev.map(task => {
                    if (task.id === taskId) {
                        const updatedItems = task.outlineItems.map((item, index) => {
                            if (item.id === itemId) {
                                return { ...item, id: newItem.id, position: index }
                            }
                            return { ...item, position: index }
                        })

                        ensureEmptyOutlineItem(updatedItems)
                        return { ...task, outlineItems: updatedItems }
                    }
                    return task
                })
            )

            // 🎯 NOW update ALL backend positions since a new item was actually created
            await updateAllBackendPositions(taskId, task.outlineItems, itemId, newItem.id)

        } catch (error) {
            console.error('Error creating new outline item:', error)
        }
    } else if (hasTextChanged) {
        // 🎯 EFFICIENCY: Only update backend if text actually changed
        try {
            await clientOutlineItems.updateOutlineItem(
                itemId,
                text.trim(),
                position,
                indentation,
                completed
            )
            console.log('✅ Updated outline item text (changed)')
        } catch (error) {
            console.error('❌ Error updating outline item:', error)
        }
    } else {
        // 🎯 EFFICIENCY: Text didn't change, skip backend update
        console.log('⏭️  Skipped outline item backend update (no text change detected)')
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

// Helper function to update all backend positions when a new item is actually created
const updateAllBackendPositions = async (taskId: string, outlineItems: any[], tempId: string, realId: string) => {
    try {
        const updatePromises = outlineItems
            .filter(item => !item.id.startsWith('temp-') || item.id === tempId)
            .map((item, index) => {
                const actualId = item.id === tempId ? realId : item.id
                return clientOutlineItems.updateOutlineItem(
                    actualId,
                    item.text,
                    index, // Use array index as position
                    item.indentLevel,
                    item.completed
                )
            })

        await Promise.all(updatePromises)
        console.log('✅ All backend positions updated after item creation')
    } catch (error) {
        console.error('❌ Error updating all positions:', error)
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