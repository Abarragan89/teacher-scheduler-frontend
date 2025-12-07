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
import { useTodoLists } from "@/lib/hooks/useTodoLists"

export function TodoSheet({ todoLists }: { todoLists: TodoList[] }) {


    const {data: allLists} = useTodoLists();

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
