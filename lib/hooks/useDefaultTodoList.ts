import { TodoList } from '@/types/todo'
import { useTodoLists } from './useTodoLists'

export function useDefaultTodoList() {
    const { data: todoLists } = useTodoLists()

    // Find the default list or return the first list
    const defaultList = todoLists?.find((list: TodoList) => list.isDefault) || todoLists?.[0]

    return {
        defaultListId: defaultList?.id || '',
        defaultListName: defaultList?.listName || '',
        hasLists: !!todoLists?.length
    }
}