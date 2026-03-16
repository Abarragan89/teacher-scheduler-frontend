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
import { useTodoLists } from "@/lib/hooks/useTodoLists"
import { TodoList } from "@/types/todo"

export function TodoSheet() {

    const { data: allLists = [] } = useTodoLists();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={'ghost'} className='hover:cursor-pointer flex flex-col items-center gap-0 h-auto py-1.5 px-2'>
                    <ListTodo size={18} />
                    <span className="text-xs leading-none">My Lists</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="p-5" tabIndex={-1}>
                <SheetHeader>
                    <SheetTitle>ToDo Lists</SheetTitle>
                </SheetHeader>
                <TodoLists
                    todoLists={allLists as TodoList[]}
                />
            </SheetContent>
        </Sheet>
    )
}
