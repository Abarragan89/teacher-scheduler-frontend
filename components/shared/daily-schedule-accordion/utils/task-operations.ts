import { Task } from '@/types/tasks'
import { clientTasks } from '@/lib/api/services/tasks/client'
import { AccordionState } from './types'

export const toggleTaskCompletion = async (taskId: string, state: AccordionState) => {
    const { tasks, setTasks } = state
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

export const updateTaskTitle = (taskId: string, title: string, state: AccordionState) => {
    const { setTasks, openAccordions, setOpenAccordions } = state

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

export const handleTaskDelete = async (taskId: string, setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
    try {
        // 🎯 IMMEDIATELY remove from UI (optimistic update)
        setTasks(prev => prev.filter(task => task.id !== taskId))
        await clientTasks.deleteTask(taskId);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

export const handleCreateNewTask = async (state: AccordionState) => {
    const { tasks, setTasks, setOpenAccordions, focusedText, scheduleId } = state

    try {
        const newTask = await clientTasks.createTask(
            scheduleId,
            tasks.length,
            false
        )

        // create and emtpy outline item task
        const tempOutlineItem = {
            id: `temp-outline-${newTask.id}-${Date.now()}`,
            text: '',
            completed: false,
            indentLevel: 0,
            position: newTask?.outlineItems?.length,
        }

        // Update the task ID but preserve accordion state
        setTasks(prev => [...prev, {...newTask, outlineItems: [tempOutlineItem]}])

        // Update open accordion IDs
        setOpenAccordions(prev =>
            prev.map(id => id === newTask.id ? newTask.id : id)
        )

         // Focus the new task title input after component re-renders
        setTimeout(() => {
            const newTaskInput = document.querySelector(
                `[data-task-id="${newTask.id}"] .task-title-input`
            ) as HTMLTextAreaElement
            
            if (newTaskInput) {
                newTaskInput.focus()
                newTaskInput.select() // Select all text (empty in this case)
            }
        }, 100) // Give time for accordion animation and DOM update


    } catch (error) {
        console.error('Error creating new task:', error)
    }
}

export const handleTaskBlur = async (
    taskId: string,
    title: string,
    state: AccordionState
) => {
    const { tasks, focusedText } = state

    if (title?.trim() === '') return
    const hasChanged = title !== focusedText

    if (hasChanged) {
        // Update existing task
        try {
            const task = tasks.find(t => t.id === taskId)
            if (task) {
                await clientTasks.updateTask(taskId, title.trim(), task.position, task.completed)
            }
        } catch (error) {
            console.error('❌ Error updating task:', error)
        }
    }
}

export const handleTaskFocus = (taskId: string, state: AccordionState) => {
    const { tasks, setFocusedText } = state
    const task = tasks.find(t => t.id === taskId)
    if (task) {
        if (setFocusedText) setFocusedText(task.title)
    }
}

export const updateTaskPositions = async (reorderedTasks: Task[]) => {
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