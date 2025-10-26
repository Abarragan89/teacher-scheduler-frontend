import { clientTodoLists } from '@/lib/api/services/todos/client'
import { TodoList, TodoItem } from '@/types/todo'

export interface TodoState {
    todoLists: TodoList[]
    setTodoLists: React.Dispatch<React.SetStateAction<TodoList[]>>
    openAccordions: string[]
    setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>
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
    })
}

// Add a new todo list
export const addNewTodoList = (state: TodoState) => {
    const { todoLists, setTodoLists, setOpenAccordions } = state

    const newList: TodoList = {
        id: `temp-list-${Date.now()}`,
        listName: 'Untitled List',
        todos: [{
            id: `temp-todo-${Date.now()}`,
            text: '',
            completed: false,
        }],
    }

    setTodoLists(prev => [...prev, newList])

    // Open the new list
    if (setOpenAccordions) {
        setOpenAccordions(prev => [...prev, newList.id])
    }
}

// Delete a todo list
export const deleteTodoList = async (listId: string, state: TodoState) => {
    const { setTodoLists } = state

    // TODO: Add API call to delete the list
    // await clientTodoLists.deleteTodoList(listId)

    setTodoLists(prev => prev.filter(list => list.id !== listId))
}

// Update todo list title
export const updateTodoListTitle = (listId: string, listName: string, state: TodoState) => {
    console.log('Updating todo list title locally:', listName)
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
        const { setTodoLists, setOpenAccordions } = state
        const newListId = newList.id

        setTodoLists(prev =>
            prev.map(list =>
                list.id === listId
                    ? { ...list, id: newListId }
                    : list
            )
        )

        // Update open accordions to use new ID
        if (setOpenAccordions) {
            setOpenAccordions(prev =>
                prev.map(id => id === listId ? newListId : id)
            )
        }
    } else if (hasTextChanged) {
        // Update existing list in backend
        await clientTodoLists.updateTodoListTitle(listId, title)
        console.log('Updating todo list title:', title)
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