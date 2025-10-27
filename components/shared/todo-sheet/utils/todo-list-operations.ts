import { clientTodoLists } from '@/lib/api/services/todos/client'
import { TodoList, TodoItem } from '@/types/todo'

export interface TodoState {
    todoLists: TodoList[]
    setTodoLists: React.Dispatch<React.SetStateAction<TodoList[]>>
    setCurrentListIndex: React.Dispatch<React.SetStateAction<number>>
    focusedText?: string
    setFocusedText?: React.Dispatch<React.SetStateAction<string>>
}

// Helper function to ensure there's always exactly one empty todo item at the end
export const ensureEmptyTodoItem = (todos: TodoItem[]) => {
    const lastItem = todos[todos.length - 1]
    const isLastItemEmpty = lastItem && lastItem.text.trim() === ''

    // If the last item is already empty, we're good - don't mess with it
    if (isLastItemEmpty) {
        return
    }

    // Only if there's no empty item at the end, add one
    todos.push({
        id: `temp-todo-${Date.now()}`,
        text: '',
        completed: false,
        priority: 1
    })
}

// Add a new todo list
export const addNewTodoList = (state: TodoState) => {
    const { setTodoLists } = state

    const newList: TodoList = {
        id: `temp-list-${Date.now()}`,
        listName: 'Untitled List',
        isDefault: false,
        todos: [{
            id: `temp-todo-${Date.now()}`,
            text: '',
            completed: false,
            priority: 1,
        }],
    }
    setTodoLists(prev => [...prev, newList])
}

// Delete a todo list
export const deleteTodoList = async (listId: string, state: TodoState, currentListIndex?: number) => {
    const { todoLists, setTodoLists, setCurrentListIndex } = state

    // Add API call to delete the list
    await clientTodoLists.deleteTodoList(listId)

    // Find the index of the list being deleted
    const deletedListIndex = todoLists.findIndex(list => list.id === listId)

    // Remove the list from the array
    const updatedLists = todoLists.filter(list => list.id !== listId)

    // Determine the new current list index
    if (updatedLists.length === 0) {
        // No lists remaining
        setCurrentListIndex(0)
    } else if (currentListIndex !== undefined && deletedListIndex === currentListIndex) {
        // The current list was deleted, show the previous list or first list
        const newIndex = Math.max(0, deletedListIndex - 1)
        setCurrentListIndex(newIndex)
    } else if (currentListIndex !== undefined && deletedListIndex < currentListIndex) {
        // A list before the current one was deleted, adjust index
        setCurrentListIndex(currentListIndex - 1)
    }
    // Update the lists
    setTodoLists(updatedLists)
}

export const setDefaultTodoList = async (listId: string, state: TodoState) => {
    const { todoLists, setTodoLists, setCurrentListIndex } = state

    // Call API to set default list
    await clientTodoLists.setDefaultList(listId)

    // Update local state to reflect the change
    const updatedLists = todoLists.map(list => ({
        ...list,
        isDefault: list.id === listId
    }))

    const sortedLists = updatedLists.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return 0  // Preserve existing order if both have same isDefault value
    })

    // Update current list index to point to the default list (which is now at index 0)
    setCurrentListIndex(0)
    setTodoLists(sortedLists)
}

// Update todo list title
export const updateTodoListTitle = (listId: string, listName: string, state: TodoState) => {
    const { setTodoLists } = state

    setTodoLists(prev =>
        prev.map(list =>
            list.id === listId
                ? { ...list, listName }
                : list
        )
    )
}

// Handle todo list title blur
export const handleTodoListTitleBlur = async (
    listId: string,
    title: string,
    state: TodoState
) => {
    const { focusedText } = state

    // Check if title actually changed
    const hasTextChanged = title.trim() !== focusedText?.trim()
    const isTemporary = listId.startsWith('temp-')

    if (title.trim() === '') {
        // Reset to previous title if empty
        updateTodoListTitle(listId, focusedText || 'Untitled List', state)
        return
    }

    if (isTemporary) {

        //  Create new list in backend)
        const newList = await clientTodoLists.createTodoList(title)

        // Update UI with real ID for frontend demo
        const { setTodoLists } = state
        const newListId = newList.id

        setTodoLists(prev =>
            prev.map(list =>
                list.id === listId
                    ? { ...list, id: newListId }
                    : list
            )
        )
    } else if (hasTextChanged) {
        // Update existing list in backend
        await clientTodoLists.updateTodoListTitle(listId, title)
    }
}

// Handle todo list title focus
export const handleTodoListTitleFocus = (listId: string, state: TodoState) => {
    const { todoLists, setFocusedText } = state
    const list = todoLists.find(l => l.id === listId)
    if (list && setFocusedText) {
        setFocusedText(list.listName)
    }
}