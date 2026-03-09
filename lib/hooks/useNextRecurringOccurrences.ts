import { useQuery } from "@tanstack/react-query";
import { clientTodo } from "../api/services/todos/client";

export function useNextRecurringOccurrences() {
    return useQuery({
        queryKey: ['recurringTodos', 'next'],
        queryFn: () => clientTodo.getNextOccurrences(), 
        staleTime: 1000 * 60 * 5,
    })
}