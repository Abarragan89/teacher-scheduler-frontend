import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { BsFillBookmarkFill } from 'react-icons/bs'

export default function PriorityPopover() {
    return (
        <Popover>
            <PopoverTrigger asChild>

                <BsFillBookmarkFill
                    className='hover:text-foreground cursor-pointer'
                    size={15} />
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-3">Set Priority</h4>
                    <div className="space-y-1">
                        {[
                            { level: 'high', label: 'High Priority', color: 'text-red-500', bgColor: 'hover:bg-red-50' },
                            { level: 'medium', label: 'Medium Priority', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50' },
                            { level: 'low', label: 'Low Priority', color: 'text-blue-500', bgColor: 'hover:bg-blue-50' },
                            { level: 'none', label: 'No Priority', color: 'text-muted-foreground', bgColor: 'hover:bg-muted/50' }
                        ].map(({ level, label, color, bgColor }) => (
                            <Button
                                key={level}
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start ${bgColor} ${color}`}
                                onClick={() => {
                                    // TODO: Handle priority selection
                                    console.log('Selected priority:', level)
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${level === 'high' ? 'bg-red-500' :
                                        level === 'medium' ? 'bg-yellow-500' :
                                            level === 'low' ? 'bg-blue-500' :
                                                'bg-muted-foreground'
                                        }`} />
                                    {label}
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
