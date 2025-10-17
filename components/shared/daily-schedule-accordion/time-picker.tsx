import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function TimePicker({ 
    startTime, 
    endTime, 
    onChange 
} : {
    startTime: string | null,
    endTime: string | null,
    onChange: (field: "startTime" | "endTime", value: string) => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-col">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime || ""}
          onChange={(e) => onChange("startTime", e.target.value)}
          className="w-40"
        />
      </div>

      <div className="flex flex-col">
        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="time"
          value={endTime || ""}
          onChange={(e) => onChange("endTime", e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  )
}
