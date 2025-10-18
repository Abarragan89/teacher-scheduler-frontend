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
                    <Clock size={16} className="text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-fit h-fit p-5 px-9 mr-5">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="time"
                            defaultValue={"07:00"}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                            defaultValue={"08:00"}
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
