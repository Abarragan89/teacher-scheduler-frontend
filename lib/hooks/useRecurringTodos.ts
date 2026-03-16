import { TodoItem } from "@/types/todo";
import { useQuery } from "@tanstack/react-query";
import { clientTodo } from "../api/services/todos/client";

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

    console.log('Recurring Todos for Range:', recurringTodos) // Debug log to check the fetched recurring todos for the calendar

    return {
        recurringTodos,
        getRecurringTodoForDate: (date: string) =>
            recurringTodos.filter((todo: TodoItem) =>
                todo.dueDate?.toString().split('T')[0] === date
            ),
        isLoading,
        error
    }
}