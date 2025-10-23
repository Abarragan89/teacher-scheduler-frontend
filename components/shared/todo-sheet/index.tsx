import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
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
                    <SheetDescription>
                        Scheduled ToDos become reminders
                    </SheetDescription>
                </SheetHeader>
                <TodoAccordion />
            </SheetContent>
        </Sheet>
    )
}
