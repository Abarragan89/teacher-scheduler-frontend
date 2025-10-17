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
            <PopoverContent className="w-fit h-fit p-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="time"

                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                        />
                    </div>
                    <Button>
                        Set Time
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
