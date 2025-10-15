import { KeyboardEvent } from 'react'
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

// Handle pressing the ENTER button on the task input
export const handleTaskTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, taskId: string, state: AccordionState) => {
    const { openAccordions, setOpenAccordions } = state

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

// Handle TAB and ENTER key for indentation (Outline Items)
export const handleOutlineKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>, taskId: string, itemId: string, state: AccordionState) => {
    const { tasks, setTasks } = state
    const task = tasks.find(t => t.id === taskId)
    const item = task?.outlineItems.find(i => i.id === itemId)

    if (!task || !item) return

    if (e.key === 'Enter') {
        e.preventDefault();

        // If current item is empty, remove it and don't focus anything
        if (item.text.trim() === '') {
            // Only remove if there are multiple items (keep at least one)
            if (task.outlineItems.length > 1) {
                const isTemporary = itemId.startsWith('temp-')

                // Only delete from backend if it's not temporary
                if (!isTemporary) {
                    try {
                        await clientOutlineItems.deleteOutlineItem(itemId);
                        // Update positions in backend after deletion
                        updateBackendPositionsAfterDeletion(taskId, itemId, task.outlineItems)
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
                        indentLevel: item.indentLevel,
                        position: currentIndex + 1,
                    }

                    // Splice in the new item
                    newOutlineItems.splice(currentIndex + 1, 0, newItem)

                    // Update positions for ALL items (but don't save to backend yet)
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
                    // Update positions in backend after deletion
                    updateBackendPositionsAfterDeletion(taskId, itemId, task.outlineItems)
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