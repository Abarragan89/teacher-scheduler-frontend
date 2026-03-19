import { TodoItem } from "@/types/todo";
import { useQuery } from "@tanstack/react-query";
import { clientTodo } from "../api/services/todos/client";
import { toLocalDateString } from "../utils/date-formater";

interface UseRecurringTodosParams {
    startDate: string;
    endDate: string;
}

export function useRecurringTodos({ startDate, endDate }: UseRecurringTodosParams) {
    const { data: recurringTodos = [], isLoading, error } = useQuery({
        queryKey: ['recurringTodos', startDate, endDate],
        queryFn: () => clientTodo.getRecurringTodosInRange(startDate, endDate),
        staleTime: 1000 * 60 * 5, // 5 minutes — no need to refetch unless month changes
    })

    return {
        recurringTodos,
        getRecurringTodoForDate: (date: string) =>
            recurringTodos.filter((todo: TodoItem) => {
                if (!todo.dueDate) return false
                const todoLocalDate = toLocalDateString(new Date(todo.dueDate)) // converts UTC instant to local date
                return todoLocalDate === date
            }),
        isLoading,
        error
    }
}