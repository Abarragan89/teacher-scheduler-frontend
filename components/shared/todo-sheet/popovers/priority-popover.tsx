import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { useState} from 'react'
import { BsFillBookmarkFill } from 'react-icons/bs'
import { handlePriorityUpdate } from '../utils/todo-operations'
import { TodoState } from '../utils/todo-list-operations'
import { TodoItem } from '@/types/todo'

export default function PriorityPopover({ todo, state }: { todo: TodoItem, state: TodoState }) {

    const [isPopOverOpen, setIsPopOverOpen] = useState<boolean>(false);

    return (
        <Popover open={isPopOverOpen} onOpenChange={setIsPopOverOpen}>
            <PopoverTrigger asChild>
                <BsFillBookmarkFill
                    className={`hover:text-foreground cursor-pointer
                        ${todo.priority == 4 ? 'text-red-500' :
                            todo.priority === 3 ? 'text-yellow-500' :
                                todo.priority === 2 ? 'text-blue-500' :
                                    'text-muted-foreground'
                        }
                        `}
                    size={15} />
            </PopoverTrigger>
            <PopoverContent className="w-48 space-y-2" align="end">
                <h4 className="font-medium text-sm mb-3">Set Priority</h4>
                <span className="space-y-1">
                    {[
                        { level: 4, label: 'High Priority', color: 'text-red-500', bgColor: 'hover:bg-red-50' },
                        { level: 3, label: 'Medium Priority', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50' },
                        { level: 2, label: 'Low Priority', color: 'text-blue-500', bgColor: 'hover:bg-blue-50' },
                        { level: 1, label: 'No Priority', color: 'text-muted-foreground', bgColor: 'hover:bg-muted/50' }
                    ].map(({ level, label, color, bgColor }) => (
                        <Button
                            key={level}
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start ${bgColor} ${color}`}
                            onClick={() => {
                                handlePriorityUpdate(todo.id, level, state);
                                setIsPopOverOpen(false);
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${level == 4 ? 'bg-red-500' :
                                    level === 3 ? 'bg-yellow-500' :
                                        level === 2 ? 'bg-blue-500' :
                                            'bg-muted-foreground'
                                    }`} />
                                {label}
                            </span>
                        </Button>
                    ))}
                </span>
            </PopoverContent>
        </Popover>
    )
}
