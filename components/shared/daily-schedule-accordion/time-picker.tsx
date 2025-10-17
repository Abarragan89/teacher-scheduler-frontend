import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function TimePicker() {
    return (

        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"link"}
                >
                    <Clock size={16} className="text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex flex-col">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="time"
                            className="w-40"
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                            className="w-40"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
