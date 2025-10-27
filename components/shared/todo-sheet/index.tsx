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

export function TodoSheet({todoLists}: {todoLists: TodoList[]}) {
    const [lists, setLists] = useState<TodoList[]>(todoLists)
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={'ghost'}>
                    <ListTodo />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>ToDo Lists</SheetTitle>
                </SheetHeader>
                <TodoLists 
                    lists={lists}
                    setLists={setLists}
                />
            </SheetContent>
        </Sheet>
    )
}
