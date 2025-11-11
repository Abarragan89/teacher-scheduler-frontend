import { TodoItem } from '@/types/todo'

export type SortBy = 'priority' | 'due-date' | 'created'

export const createSortTodos = (sortBy: SortBy) => (todos: TodoItem[]): TodoItem[] => {
    const sortedTodos = [...todos]

    switch (sortBy) {
        case 'priority':
            sortedTodos.sort((a, b) => b.priority - a.priority)
            break
        case 'due-date':
            sortedTodos.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0
                if (!a.dueDate) return 1
                if (!b.dueDate) return -1
                return new Date(a.dueDate.toString()).getTime() - new Date(b.dueDate.toString()).getTime()
            })
            break
        default:
            return sortedTodos
    }

    return sortedTodos
}

const sortFunctionCache = new Map<SortBy, (todos: TodoItem[]) => TodoItem[]>()

export const getSortFunction = (sortBy: SortBy): ((todos: TodoItem[]) => TodoItem[]) => {
    if (!sortFunctionCache.has(sortBy)) {
        sortFunctionCache.set(sortBy, createSortTodos(sortBy))
    }
    return sortFunctionCache.get(sortBy)!
}