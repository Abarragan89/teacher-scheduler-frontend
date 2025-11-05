import { clientTodoLists } from '@/lib/api/services/todos/client'
import { TodoList, TodoItem } from '@/types/todo'
import { QueryClient } from '@tanstack/react-query'

export interface TodoState {
    todoLists: TodoList[]
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
        priority: 1,
        dueDate: null,
    })
}

// Add a new todo list
export const addNewTodoList = (state: TodoState, queryClient: QueryClient) => {
    const newList: TodoList = {
        id: `temp-list-${Date.now()}`,
        listName: 'Untitled List',
        isDefault: false,
        todos: [{
            id: `temp-todo-${Date.now()}`,
            text: '',
            completed: false,
            priority: 1,
            dueDate: null,
        }],
    }

    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
        if (!oldData) return [newList]
        return [...oldData, newList]
    })
}

// Delete a todo list
export const deleteTodoList = async (listId: string, state: TodoState, queryClient: QueryClient, currentListIndex?: number) => {
    const { todoLists, setCurrentListIndex } = state

    // Add API call to delete the list
    await clientTodoLists.deleteTodoList(listId)

    // Find the index of the list being deleted
    const deletedListIndex = todoLists.findIndex(list => list.id === listId)

    // Remove the list from the array
    const updatedLists = todoLists.filter(list => list.id !== listId)

    // Update React Query cache
    queryClient.setQueryData(['todos'], updatedLists)

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
}

export const setDefaultTodoList = async (listId: string, state: TodoState, queryClient: QueryClient) => {
    const { todoLists, setCurrentListIndex } = state

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

    // Update React Query cache
    queryClient.setQueryData(['todos'], sortedLists)

    // Update current list index to point to the default list (which is now at index 0)
    setCurrentListIndex(0)
}

// Update todo list title
export const updateTodoListTitle = (listId: string, listName: string, state: TodoState, queryClient: QueryClient) => {
    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
        if (!oldData) return oldData
        return oldData.map(list =>
            list.id === listId
                ? { ...list, listName }
                : list
        )
    })
}

// Handle todo list title blur
export const handleTodoListTitleBlur = async (
    listId: string,
    title: string,
    state: TodoState,
    queryClient: QueryClient
) => {
    const { focusedText } = state

    // Check if title actually changed
    const hasTextChanged = title.trim() !== focusedText?.trim()
    const isTemporary = listId.startsWith('temp-')

    if (title.trim() === '') {
        // Reset to previous title if empty
        updateTodoListTitle(listId, focusedText || 'Untitled List', state, queryClient)
        return
    }

    if (isTemporary) {
        //  Create new list in backend)
        const newList = await clientTodoLists.createTodoList(title)

        // Update React Query cache with real ID
        const newListId = newList.id

        queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
            if (!oldData) return oldData
            return oldData.map(list =>
                list.id === listId
                    ? { ...list, id: newListId }
                    : list
            )
        })
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