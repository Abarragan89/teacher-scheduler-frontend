"use client"
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
                    todoLists={allLists}
                />
            </SheetContent>
        </Sheet>
    )
}
