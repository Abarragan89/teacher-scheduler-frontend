import { useQuery } from '@tanstack/react-query'
import { clientTodoLists } from '@/lib/api/services/todos/client'

export function useTodoLists() {
    return useQuery({
        queryKey: ['todos'],
        queryFn: () => clientTodoLists.getTodoLists(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
    })
}