import { TodoItem, TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'
import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    updateTodoInAllCaches,
    addTodoToAllCaches,
    replaceTodoInAllCaches,
    removeTodoFromAllCaches,
} from '@/lib/utils/todo-cache'

// Helper function to find a todo
const findTodo = (listId: string, todoId: string, todoLists: TodoList[]) => {
    return todoLists
        .find(list => list.id === listId)
        ?.todos.find(todo => todo.id === todoId)
}

// Track pending deletions
const pendingDeletions = new Map<string, NodeJS.Timeout>()

// Toggle todo completion
export const toggleTodoCompletion = async (
    listId: string,
    todoId: string,
    playSoundComplete: () => void,
    playRemovedSound: () => void,
    queryClient: QueryClient,
    context: string = 'dashboard'
) => {
    // Try ['todos'] first, fall back to any flat daily/recurring cache
    const currentData = queryClient.getQueryData<TodoList[]>(['todos'])
    let todo: TodoItem | undefined = currentData ? findTodo(listId, todoId, currentData) : undefined

    if (!todo) {
        const allDailyEntries = queryClient.getQueriesData<TodoItem[]>({ queryKey: ['dailyTodos'] })
        for (const [, data] of allDailyEntries) {
            const found = data?.find(t => t.id === todoId)
            if (found) { todo = found; break }
        }
    }

    if (!todo) return

    if (!todo.completed) {
        playSoundComplete();

        // Mark as complete and pendingRemoval IMMEDIATELY in cache
        updateTodoInAllCaches(queryClient, todoId, t => ({ ...t, completed: true, pendingRemoval: true }))

        // Persist to backend immediately — don't wait for the UI delay
        const resolvedListId = listId || todo.todoListId || ''
        clientTodo.updateTodo({ ...todo, completed: true, todoListId: resolvedListId }).catch(error => {
            console.error('Failed to update todo:', error)
        })

        // Only delete todo if we are in todosheet context
        if (context === 'todosheet') {
            // Schedule deletion after delay
            const timeoutId = setTimeout(() => {
                // Check if todo is still completed before deleting
                const latestData = queryClient.getQueryData(['todos']) as TodoList[]
                const latestTodo = findTodo(listId, todoId, latestData)

                if (latestTodo?.completed) {
                    // Mark as deleting in cache to trigger animation
                    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
                        if (!old) return old
                        return old.map(list => ({
                            ...list,
                            todos: list.todos.map(t => t.id === todoId ? { ...t, deleting: true } : t),
                        }))
                    })


                    // Remove from UI after animation
                    playRemovedSound();
                    setTimeout(async () => {
                        // Clear deleting + pendingRemoval; keep completed: true so calendar shows strike-through
                        updateTodoInAllCaches(queryClient, todoId, t => ({ ...t, deleting: false, pendingRemoval: false }))
                        pendingDeletions.delete(todoId)
                    }, 500)
                }
            }, 2000)
            // Track the pending deletion
            pendingDeletions.set(todoId, timeoutId)
        }
    } else {
        // Uncheck - cancel pending deletion and mark as incomplete
        const pendingTimeout = pendingDeletions.get(todoId)
        if (pendingTimeout) {
            clearTimeout(pendingTimeout)
            pendingDeletions.delete(todoId)
        }

        // Mark as incomplete IMMEDIATELY in cache
        updateTodoInAllCaches(queryClient, todoId, t => ({ ...t, completed: false, deleting: false, pendingRemoval: false }))

        // Backend API call (don't await)
        const resolvedListId = listId || todo.todoListId || ''
        clientTodo.updateTodo({ ...todo, completed: false, todoListId: resolvedListId }).catch(error => {
            console.error('Failed to uncheck todo:', error)
        })
    }
}

// Add a new todo item
export const addTodoItem = async (
    listId: string,
    text: string,
    dueDate: string,
    priority: number,
    queryClient: QueryClient,
    setNewTodoText: (text: string) => void,
    newTodoTextareaRef: React.RefObject<HTMLTextAreaElement | null>,
    viewStartDate: string = '',
    viewEndDate: string = '',
) => {
    if (text.trim() === '') {
        toast.error('Todo text cannot be empty.');
        return;
    }
    // Generate a temporary ID for immediate UI feedback
    const tempId = `temp-new-${Date.now()}`
    const tempTodo = {
        id: tempId,
        text,
        dueDate,
        priority,
        completed: false,
        deleting: false,
        createdAt: new Date().toISOString() // Add current timestamp
    }

    // Immediately add to beginning of list (newest first)
    addTodoToAllCaches(queryClient, listId, tempTodo as TodoItem)

    try {
        setNewTodoText(" ")

        // Create on backend
        const newTodo = await clientTodo.createTodoItem(
            listId,
            text.trim(),
            dueDate,
            priority,
            false,
            undefined,
            viewStartDate,
            viewEndDate,
        )

        // Focus the textarea again
        setTimeout(() => {
            newTodoTextareaRef.current?.focus()
        }, 100)

        // Replace temp todo with real todo from backend
        replaceTodoInAllCaches(queryClient, listId, tempId, newTodo)
    } catch (error) {
        console.error('Failed to add todo:', error)

        // Remove temp todo on error
        removeTodoFromAllCaches(queryClient, listId, tempId)
    }
}