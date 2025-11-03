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
import { useState } from "react"

export function TodoSheet({ todoLists }: { todoLists: TodoList[] }) {

    const [isOpen, setIsOpen] = useState(false)

    const { data: allLists, refetch } = useQuery({
        queryKey: ['todos'],
        queryFn: clientTodoLists.getTodoLists,
        initialData: todoLists,
        refetchOnWindowFocus: true,  // ← Add this
        refetchOnMount: true,        // ← Add this
        staleTime: 0,
    })

    // Force refetch when sheet opens
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            refetch() // This will get fresh data from server
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
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
