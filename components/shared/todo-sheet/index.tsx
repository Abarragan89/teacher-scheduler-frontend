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

export function TodoSheet({ todoLists }: { todoLists: TodoList[] }) {
    // Sort lists to put default list first, then by creation order or name
    const sortedLists = todoLists.sort((a, b) => {
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
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-muted-foreground">ToDo Lists</SheetTitle>
                </SheetHeader>
                <TodoLists
                    lists={lists}
                    setLists={setLists}
                />
            </SheetContent>
        </Sheet>
    )
}
