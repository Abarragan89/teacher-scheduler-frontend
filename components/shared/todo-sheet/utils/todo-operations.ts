import { TodoItem } from '@/types/todo'
import { TodoState, ensureEmptyTodoItem } from './todo-list-operations'
import { clientTodo } from '@/lib/api/services/todos/client'

// Update a todo item text on change (No backend update)
export const updateTodoItem = (listId: string, todoId: string, text: string, state: TodoState) => {
    const { setTodoLists } = state

    setTodoLists(prev =>
        prev.map(list => {
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
            return list
        })
    )
}

// Toggle todo completion
export const toggleTodoCompletion = async (listId: string, todoId: string, state: TodoState) => {
    const { todoLists, setTodoLists } = state
    const list = todoLists.find(l => l.id === listId)
    const todo = list?.todos.find(t => t.id === todoId)
    if (!list || !todo) return

    const newCompleted = !todo.completed
    todo.completed = newCompleted

    // Update UI immediately (optimistic update)
    setTodoLists(prev =>
        prev.map(list =>
            list.id === listId
                ? {
                    ...list,
                    todos: list.todos.map(todo =>
                        todo.id === todoId
                            ? { ...todo, completed: newCompleted }
                            : todo
                    )
                }
                : list
        )
    )

    // Update backend
    try {
        await clientTodo.updateTodo(todo)
    } catch (error) {
        console.error('Failed to update todo completion:', error)
    }
}

// Handle todo focus
export const handleTodoFocus = (listId: string, todoId: string, state: TodoState) => {
    const { todoLists, setFocusedText } = state
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
    completed: boolean,
    priority: number,
    state: TodoState
) => {
    const { todoLists, setTodoLists, focusedText } = state
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
            setTodoLists(prev =>
                prev.map(l => {
                    if (l.id === listId) {
                        const newTodos = l.todos
                            .filter(todo => todo.id !== todoId)
                            .map((todo, index) => ({ ...todo, position: index }))
                        ensureEmptyTodoItem(newTodos)
                        return { ...l, todos: newTodos }
                    }
                    return l
                })
            )

            if (!isTemporary) {
                // Delete from backend
                await clientTodo.deleteTodo(todoId)
            }
        }
        return
    }

    if (isTemporary) {
        try {
            // update it on the backend
            const savedTodo = await clientTodo.createTodoItem(listId, text.trim())

            // Update UI with real ID
            setTodoLists(prev =>
                prev.map(list => {
                    if (list.id === listId) {
                        const updatedTodos = list.todos.map((todo, index) => {
                            if (todo.id === todoId) {
                                return {
                                    ...todo,
                                    id: savedTodo.id,
                                    position: index
                                }
                            }
                            return { ...todo, position: index }
                        })

                        ensureEmptyTodoItem(updatedTodos)
                        return { ...list, todos: updatedTodos }
                    }
                    return list
                })
            )
        } catch (error) {
            console.error('Error creating new todo:', error)
        }
    } else if (hasTextChanged) {
        // Update existing todo in backend
        try {
            await clientTodo.updateTodo(todo)
        } catch (error) {
            console.error('Error updating todo:', error)
        }
    }
}

// Handle keyboard events for todos
export const handleTodoKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    listId: string,
    todoId: string,
    state: TodoState
) => {
    if (e.key === 'Enter') {
        e.preventDefault()

        // Find the current todo index
        const { todoLists, setTodoLists } = state
        const list = todoLists.find(l => l.id === listId)
        if (!list) return

        const currentIndex = list.todos.findIndex(todo => todo.id === todoId)
        if (currentIndex === -1) return

        // Add a new empty todo after the current one
        const newTodo: TodoItem = {
            id: `temp-todo-${Date.now()}`,
            text: '',
            completed: false,
            priority: 1,
            dueDate: null,
        }

        setTodoLists(prev =>
            prev.map(l => {
                if (l.id === listId) {
                    const newTodos = [...l.todos]
                    // Insert the new todo after the current one
                    newTodos.splice(currentIndex + 1, 0, newTodo)
                    // Update positions
                    return {
                        ...l,
                        todos: newTodos.map((todo, index) => ({ ...todo, position: index }))
                    }
                }
                return l
            })
        )

        // Focus the new input after a brief delay
        setTimeout(() => {
            const newInput = document.querySelector(`[data-todo-id="${newTodo.id}"]`) as HTMLInputElement
            if (newInput) {
                newInput.focus()
            }
        }, 10)
    }
}

// Handle Due Date Update (backend update and frontend update)
export const handleDueDateUpdate = async (
    todoId: string,
    dueDate: String | null,
    state: TodoState
) => {
    const { todoLists, setTodoLists } = state
    const todo = todoLists
        .flatMap(list => list.todos)
        .find(t => t.id === todoId)
    if (!todo) return

    todo.dueDate = dueDate

    // Update the due date/time in the UI
    setTodoLists(prev =>
        prev.map(list => ({
            ...list,
            todos: list.todos.map(todo =>
                todo.id === todoId
                    ? { ...todo, dueDate }
                    : todo
            )
        }))
    )

    // Here you would also add the backend update logic if needed
    await clientTodo.updateTodo(todo)
}