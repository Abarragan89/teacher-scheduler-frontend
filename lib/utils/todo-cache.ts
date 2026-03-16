import { QueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList } from '@/types/todo'
import { DailyTodoItem } from '@/lib/hooks/useDailyTodos'

function getListName(queryClient: QueryClient, listId: string): string {
    const lists = queryClient.getQueryData<TodoList[]>(['todos'])
    return lists?.find(l => l.id === listId)?.listName ?? ''
}

/**
 * Patch a single todo by ID in all caches.
 * Use for field-level updates that don't change the todo's date or list (e.g. completion toggle).
 */
export function updateTodoInAllCaches(
    queryClient: QueryClient,
    todoId: string,
    updater: (t: TodoItem) => TodoItem,
) {
    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
        if (!old) return old
        return old.map(list => ({
            ...list,
            todos: list.todos.map(t => t.id === todoId ? updater(t) : t),
        }))
    })

    queryClient.setQueriesData<DailyTodoItem[]>(
        { queryKey: ['dailyTodos'], exact: false },
        (old) => old?.map(t => t.id === todoId ? { ...t, ...updater(t) } as DailyTodoItem : t),
    )

    queryClient.setQueriesData<TodoItem[]>(
        { queryKey: ['recurringTodos'], exact: false },
        (old) => old?.map(t => t.id === todoId ? updater(t) : t),
    )
}

/**
 * Insert a new todo into all caches that should show it.
 * Use for optimistic inserts (e.g. from the todo-sheet inline add).
 */
export function addTodoToAllCaches(
    queryClient: QueryClient,
    listId: string,
    todo: TodoItem,
) {
    const listName = getListName(queryClient, listId)

    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
        if (!old) return old
        return old.map(list =>
            list.id === listId
                ? { ...list, todos: [todo, ...list.todos] }
                : list,
        )
    })

    const dueDateStr = todo.dueDate ? todo.dueDate.toString().split('T')[0] : null
    if (dueDateStr) {
        const dailyEntries = queryClient.getQueriesData<DailyTodoItem[]>({ queryKey: ['dailyTodos'] })
        for (const [key, data] of dailyEntries) {
            if (key[1] === dueDateStr && data) {
                queryClient.setQueryData<DailyTodoItem[]>(key, [
                    ...data,
                    { ...todo, listId, listName },
                ])
            }
        }

        if (todo.isRecurring) {
            const recurringEntries = queryClient.getQueriesData<TodoItem[]>({ queryKey: ['recurringTodos'] })
            for (const [key, data] of recurringEntries) {
                const start = key[1] as string
                const end = key[2] as string
                if (data && dueDateStr >= start && dueDateStr <= end) {
                    queryClient.setQueryData<TodoItem[]>(key, [...data, todo])
                }
            }
        }
    }
}

/**
 * Swap a temporary (optimistic) todo ID with the real todo from the backend.
 */
export function replaceTodoInAllCaches(
    queryClient: QueryClient,
    listId: string,
    tempId: string,
    newTodo: TodoItem,
) {
    const listName = getListName(queryClient, listId)

    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
        if (!old) return old
        return old.map(list =>
            list.id === listId
                ? { ...list, todos: list.todos.map(t => t.id === tempId ? newTodo : t) }
                : list,
        )
    })

    queryClient.setQueriesData<DailyTodoItem[]>(
        { queryKey: ['dailyTodos'], exact: false },
        (old) => old?.map(t => t.id === tempId ? { ...newTodo, listId, listName } : t),
    )

    queryClient.setQueriesData<TodoItem[]>(
        { queryKey: ['recurringTodos'], exact: false },
        (old) => old?.map(t => t.id === tempId ? newTodo : t),
    )
}

/**
 * Remove a todo from all caches. Use for error rollback after a failed optimistic insert.
 */
export function removeTodoFromAllCaches(
    queryClient: QueryClient,
    listId: string,
    todoId: string,
) {
    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
        if (!old) return old
        return old.map(list =>
            list.id === listId
                ? { ...list, todos: list.todos.filter(t => t.id !== todoId) }
                : list,
        )
    })

    queryClient.setQueriesData<DailyTodoItem[]>(
        { queryKey: ['dailyTodos'], exact: false },
        (old) => old?.filter(t => t.id !== todoId),
    )

    queryClient.setQueriesData<TodoItem[]>(
        { queryKey: ['recurringTodos'], exact: false },
        (old) => old?.filter(t => t.id !== todoId),
    )
}

/**
 * Full update after editing a todo — handles list moves and dueDate changes.
 * Removes the old entry from every cache and re-inserts at the correct position.
 */
export function moveUpdatedTodoInAllCaches(
    queryClient: QueryClient,
    newListId: string,
    newTodo: TodoItem,
) {
    const listName = getListName(queryClient, newListId)

    // ['todos']: remove from all lists, add only to the target list
    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
        if (!old) return old
        return old.map(list => {
            const withoutTodo = list.todos.filter(t => t.id !== newTodo.id)
            if (list.id === newListId) {
                return { ...list, todos: [...withoutTodo, newTodo] }
            }
            return { ...list, todos: withoutTodo }
        })
    })

    // Flat daily caches: remove old entry, re-insert only in the matching date bucket
    const dueDateStr = newTodo.dueDate ? newTodo.dueDate.toString().split('T')[0] : null
    const dailyEntries = queryClient.getQueriesData<DailyTodoItem[]>({ queryKey: ['dailyTodos'] })
    for (const [key, data] of dailyEntries) {
        if (!data) continue
        const filtered = data.filter(t => t.id !== newTodo.id)
        const updated = key[1] === dueDateStr
            ? [...filtered, { ...newTodo, listId: newListId, listName }]
            : filtered
        queryClient.setQueryData<DailyTodoItem[]>(key, updated)
    }

    // Flat recurring caches: remove old entry, re-insert only if date falls within the cached range
    const recurringEntries = queryClient.getQueriesData<TodoItem[]>({ queryKey: ['recurringTodos'] })
    for (const [key, data] of recurringEntries) {
        if (!data) continue
        const filtered = data.filter(t => t.id !== newTodo.id)
        if (newTodo.isRecurring && dueDateStr) {
            const start = key[1] as string
            const end = key[2] as string
            if (dueDateStr >= start && dueDateStr <= end) {
                queryClient.setQueryData<TodoItem[]>(key, [...filtered, newTodo])
                continue
            }
        }
        queryClient.setQueryData<TodoItem[]>(key, filtered)
    }
}

/**
 * Remove all todos with a given patternId from all caches.
 * Use for optimistic deletes when deleting all future recurrences of a pattern.
 */
export function removeTodosByPatternIdFromAllCaches(
    queryClient: QueryClient,
    patternId: string,
) {
    queryClient.setQueryData<TodoList[]>(['todos'], (old) => {
        if (!old) return old
        return old.map(list => ({
            ...list,
            todos: list.todos.filter(t => t.patternId !== patternId),
        }))
    })

    queryClient.setQueriesData<DailyTodoItem[]>(
        { queryKey: ['dailyTodos'], exact: false },
        (old) => old?.filter(t => t.patternId !== patternId),
    )

    queryClient.setQueriesData<TodoItem[]>(
        { queryKey: ['recurringTodos'], exact: false },
        (old) => old?.filter(t => t.patternId !== patternId),
    )
}

/**
 * Inject a newly created todo into the flat caches only (dailyTodos + recurringTodos).
 * Use when you've already handled the ['todos'] update yourself with custom logic.
 */
export function injectTodoIntoFlatCaches(
    queryClient: QueryClient,
    listId: string,
    todo: TodoItem,
) {
    const listName = getListName(queryClient, listId)
    const dueDateStr = todo.dueDate ? todo.dueDate.toString().split('T')[0] : null
    if (!dueDateStr) return

    const dailyEntries = queryClient.getQueriesData<DailyTodoItem[]>({ queryKey: ['dailyTodos'] })
    for (const [key, data] of dailyEntries) {
        if (key[1] === dueDateStr && data) {
            queryClient.setQueryData<DailyTodoItem[]>(key, [
                ...data,
                { ...todo, listId, listName },
            ])
        }
    }

    if (todo.isRecurring) {
        const recurringEntries = queryClient.getQueriesData<TodoItem[]>({ queryKey: ['recurringTodos'] })
        for (const [key, data] of recurringEntries) {
            const start = key[1] as string
            const end = key[2] as string
            if (data && dueDateStr >= start && dueDateStr <= end) {
                queryClient.setQueryData<TodoItem[]>(key, [...data, todo])
            }
        }
    }
}
