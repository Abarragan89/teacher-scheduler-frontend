"use client"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ListTodo, Plus } from "lucide-react"
import TodoLists from "./todo-lists"
import { useTodoLists } from "@/lib/hooks/useTodoLists"
import { TodoList } from "@/types/todo"
import { useState } from "react"

export function TodoSheet() {

    const { data: allLists = [] } = useTodoLists();
    const [isModalOpen, setIsModalOpen] = useState(false);


    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={'ghost'} className='hover:cursor-pointer flex flex-col items-center gap-0 h-auto py-1.5 px-2'>
                    <ListTodo size={18} />
                    <span className="text-xs leading-none">My Lists</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="p-5" tabIndex={-1}>
                <SheetHeader className="flex">
                    <SheetTitle>ToDo Lists</SheetTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full pr-1 text-sm border-dashed text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        New List
                    </Button>
                </SheetHeader>
                <TodoLists
                    todoLists={allLists as TodoList[]}
                    setIsModalOpen={setIsModalOpen}
                    isModalOpen={isModalOpen}
                />
            </SheetContent>
        </Sheet>
    )
}
