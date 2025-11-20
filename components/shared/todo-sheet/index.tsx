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
        // Add more reasonable caching:
        staleTime: 5 * 60 * 1000, // 5 minutes
        // cacheTime: 10 * 60 * 1000, // 10 minutes
    })

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={'ghost'} className='hover:cursor-pointer'>
                    <ListTodo />
                </Button>
            </SheetTrigger>
            <SheetContent className="p-5" tabIndex={-1}>
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
