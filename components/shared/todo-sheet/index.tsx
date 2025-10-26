import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ListTodo } from "lucide-react"
import { TodoAccordion } from "./todo-accordion"

export function TodoSheet() {
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
                <TodoAccordion />
            </SheetContent>
        </Sheet>
    )
}
