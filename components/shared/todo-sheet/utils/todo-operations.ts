import { TodoList } from '@/types/todo'
import { TodoState } from './todo-list-operations'
import { clientTodo } from '@/lib/api/services/todos/client'
import { QueryClient } from '@tanstack/react-query'

// Update a todo item text on change (No backend update)
export const updateTodoItem = (listId: string, todoId: string, text: string, queryClient: QueryClient) => {

    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
        if (!oldData) return oldData
        return oldData.map(list => {
            if (list.id === listId) {
                const updatedTodos = list.todos.map(todo =>
                    todo.id === todoId
                        ? { ...todo, text }
                        : todo
                )

                // If user is typing in the last item and it now has text, add a new empty item at the end
                const todoIndex = updatedTodos.findIndex(todo => todo.id === todoId)
                const isLastItem = todoIndex === updatedTodos.length - 1
                const hasText = text.trim() !== ''
                const wasLastItemEmpty = list.todos[todoIndex]?.text.trim() === ''

                if (hasText && isLastItem && wasLastItemEmpty) {
                    // User started typing in the last empty item, add a new empty item at the end
                    updatedTodos.push({
                        id: `temp-todo-${Date.now()}`,
                        text: '',
                        completed: false,
                        priority: 1,
                        dueDate: null,
                    })
                }

                return { ...list, todos: updatedTodos }
            }
            return list;
        })
    })
}

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
    queryClient: QueryClient
) => {
    // Get the current data from the cache directly
    const currentData = queryClient.getQueryData(['todos']) as TodoList[]
    if (!currentData) return

    const todo = findTodo(listId, todoId, currentData) // Use current cache data
    if (!todo) return

    if (!todo.completed) {
        playSoundComplete();

        // Mark as complete IMMEDIATELY in cache
        queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
            if (!oldData) return oldData
            return oldData.map(list =>
                list.id === listId
                    ? {
                        ...list,
                        todos: list.todos.map(t =>
                            t.id === todoId
                                ? { ...t, completed: true, }
                                : t
                        )
                    }
                    : list
            )
        })

        // Schedule deletion after delay
        const timeoutId = setTimeout(() => {
            // Check if todo is still completed before deleting
            const latestData = queryClient.getQueryData(['todos']) as TodoList[]
            const latestTodo = findTodo(listId, todoId, latestData)

            if (latestTodo?.completed) {
                // Mark as deleting
                queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                    if (!oldData) return oldData
                    return oldData.map(list =>
                        list.id === listId
                            ? {
                                ...list,
                                todos: list.todos.map(t =>
                                    t.id === todoId
                                        ? { ...t, deleting: true }
                                        : t
                                )
                            }
                            : list
                    )
                })

                // Remove from UI after animation
                playRemovedSound();
                setTimeout(async () => {
                    // Remove from cache after animation completes
                    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                        if (!oldData) return oldData
                        return oldData.map(list =>
                            list.id === listId
                                ? {
                                    ...list,
                                    todos: list.todos.filter(t => t.id !== todoId)
                                }
                                : list
                        )
                    })

                    // Delete from backend
                    try {
                        await clientTodo.deleteTodo(todoId)
                    } catch (error) {
                        console.error('Failed to delete todo:', error)
                    }

                    pendingDeletions.delete(todoId)
                }, 500)
            }
        }, 2000)

        // Track the pending deletion
        pendingDeletions.set(todoId, timeoutId)

    } else {
        // Uncheck - cancel pending deletion and mark as incomplete
        const pendingTimeout = pendingDeletions.get(todoId)
        if (pendingTimeout) {
            clearTimeout(pendingTimeout)
            pendingDeletions.delete(todoId)
        }

        // Mark as incomplete IMMEDIATELY in cache
        queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
            if (!oldData) return oldData
            return oldData.map(list =>
                list.id === listId
                    ? {
                        ...list,
                        todos: list.todos.map(t =>
                            t.id === todoId
                                ? { ...t, completed: false, deleting: false }
                                : t
                        )
                    }
                    : list
            )
        })

        // Backend API call (don't await)
        clientTodo.updateTodo({ ...todo, completed: false }).catch(error => {
            console.error('Failed to uncheck todo:', error)
        })
    }
}

// Handle todo focus
export const handleTodoFocus = (listId: string, todoId: string, state: TodoState, queryClient: QueryClient) => {
    const { setFocusedText } = state
    // Get fresh data from cache
    const todoLists = queryClient.getQueryData(['todos']) as TodoList[]
    if (!todoLists) return

    const list = todoLists.find(l => l.id === listId)
    const todo = list?.todos.find(t => t.id === todoId)
    if (todo && setFocusedText) {
        setFocusedText(todo.text)
    }
}

// Handle todo blur (Frontend and Backend Update)
export const handleTodoBlur = async (
    listId: string,
    todoId: string,
    text: string,
    state: TodoState,
    queryClient: QueryClient
) => {
    // Get fresh data from cache instead of stale state
    const todoLists = queryClient.getQueryData(['todos']) as TodoList[]
    if (!todoLists) return

    const { focusedText } = state
    const list = todoLists.find(l => l.id === listId)
    if (!list) return
    const todo = list.todos.find(t => t.id === todoId)
    if (!todo) return

    // Check if text actually changed
    const hasTextChanged = text.trim() !== focusedText?.trim()
    const isTemporary = todoId.startsWith('temp-')

    // If text is empty, remove the item unless it's the last one in the list
    if (text.trim() === '') {
        const currentIndex = list.todos.findIndex(todo => todo.id === todoId)
        const isLastItem = currentIndex === list.todos.length - 1

        // Only remove if it's not the last item
        if (!isLastItem) {

            // Remove from UI
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData
                return oldData.map(l => {
                    if (l.id === listId) {
                        const newTodos = l.todos
                            .filter(todo => todo.id !== todoId)
                            .map((todo, index) => ({ ...todo, position: index }))
                        return { ...l, todos: newTodos }
                    }
                    return l
                })
            })
            if (!isTemporary) {
                // Delete from backend
                await clientTodo.deleteTodo(todoId)
            }
        }
        return
    }

    if (hasTextChanged) {
        // Update existing todo in backend
        try {
            const updatedTodo = { ...todo, text: text.trim() }
            await clientTodo.updateTodo(updatedTodo)

            // Update cache with fresh data, keeping existing properties
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData
                return oldData.map(l => {
                    if (l.id === listId) {
                        const updatedTodos = l.todos.map((t, index) => {
                            if (t.id === todoId) {
                                return {
                                    ...t, // Keep existing properties like completed status
                                    text: text.trim(),
                                    position: index
                                }
                            }
                            return { ...t, position: index }
                        })

                        return { ...l, todos: updatedTodos }
                    }
                    return l
                })
            })
        } catch (error) {
            console.error('Error updating todo:', error)
        }
    }
}

// Handle Due Date Update (backend update and frontend update)
export const handleDueDateUpdate = async (
    todoId: string,
    dueDate: String | null,
    queryClient: QueryClient
) => {
    // Get fresh data from cache instead of stale state
    const todoLists = queryClient.getQueryData(['todos']) as TodoList[]
    if (!todoLists) return

    const todo = todoLists
        .flatMap(list => list.todos)
        .find(t => t.id === todoId)
    if (!todo) return

    // Don't mutate the todo directly

    // Update the due date/time in the UI
    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
        if (!oldData) return oldData
        return oldData.map(list => ({
            ...list,
            todos: list.todos.map(todo =>
                todo.id === todoId
                    ? { ...todo, dueDate }
                    : todo
            )
        }))
    })

    try {
        const updatedTodo = { ...todo, dueDate }
        await clientTodo.updateTodo(updatedTodo)
    } catch (error) {
        console.error('Failed to update due date:', error)
    }
}

// Handle Priority Update (backend update and frontend update)
export const handlePriorityUpdate = async (
    todoId: string,
    priority: number,
    queryClient: QueryClient
) => {
    // Get fresh data from cache instead of stale state
    const todoLists = queryClient.getQueryData(['todos']) as TodoList[]
    if (!todoLists) return

    const todo = todoLists
        .flatMap(list => list.todos)
        .find(t => t.id === todoId)
    if (!todo) return

    // Don't mutate the todo directly

    // Update the priority in the UI
    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
        if (!oldData) return oldData
        return oldData.map(list => ({
            ...list,
            todos: list.todos.map(todo =>
                todo.id === todoId
                    ? { ...todo, priority }
                    : todo
            ).sort((a, b) => b.priority - a.priority) // Sort by priority descending
        }))
    })

    try {
        const updatedTodo = { ...todo, priority }
        await clientTodo.updateTodo(updatedTodo)
    } catch (error) {
        console.error('Failed to update priority:', error)
    }
}

// Add a new todo item
export const addTodoItem = async (
    listId: string,
    text: string,
    dueDate: string,
    priority: number,
    queryClient: QueryClient
) => {
    try {
        const newTodo = await clientTodo.createTodoItem(
            listId,
            text,
            dueDate,
            priority,
        )

        // Update cache with the new todo
        queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
            if (!oldData) return oldData
            return oldData.map(list => {
                if (list.id === listId) {
                    return {
                        ...list,
                        todos: [newTodo, ...list.todos]
                    }
                }
                return list
            })
        })
    } catch (error) {
        console.error('Failed to add todo:', error)
    }
}