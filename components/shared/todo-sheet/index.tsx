"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ListTodo } from "lucide-react"
import TodoLists from "./todo-lists"
import { TodoList } from "@/types/todo"
import { useQuery } from "@tanstack/react-query"
import { clientTodoLists } from "@/lib/api/services/todos/client"

export function TodoSheet({ todoLists }: { todoLists: TodoList[] }) {

    const { data: allLists } = useQuery({
        queryKey: ['todos'],
        queryFn: clientTodoLists.getTodoLists,
        initialData: todoLists,
        refetchOnWindowFocus: true,  // ← Add this
        refetchOnMount: true,        // ← Add this
        staleTime: 0,
    })

    // Sort lists to put default list first, then by creation order or name
    const sortedLists = allLists.sort((a: TodoList, b: TodoList) => {
        if (a.isDefault && !b.isDefault) return -1
        if (!a.isDefault && b.isDefault) return 1
        return 0  // Preserve existing order if both have same isDefault value
    })

    const [lists, setLists] = useState<TodoList[]>(sortedLists)

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={'ghost'}>
                    <ListTodo />
                </Button>
            </SheetTrigger>
            <SheetContent className="p-5">
                <SheetHeader>
                    <SheetTitle className="text-muted-foreground">ToDo Lists</SheetTitle>
                </SheetHeader>
                <TodoLists
                    lists={allLists}
                    setLists={setLists}
                />
            </SheetContent>
        </Sheet>
    )
}
