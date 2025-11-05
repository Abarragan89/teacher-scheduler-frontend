import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bookmark, EllipsisVertical, Trash2Icon } from 'lucide-react'
import React, { useState } from 'react'
import { deleteTodoList, setDefaultTodoList, TodoState } from '../utils/todo-list-operations'
import { QueryClient } from '@tanstack/react-query'

export default function EditListPopover({ currentListId, currentListIndex, state, queryClient }: {
    currentListId: string,
    currentListIndex: number,
    state: TodoState,
    queryClient: QueryClient
}) {


    const [isPopOverOpen, setIsPopoverOpen] = useState<boolean>(false);
    const [confirmDeleteList, setConfirmDeleteList] = useState<boolean>(false);

    return (
        <Popover open={isPopOverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
                <EllipsisVertical size={16} className="text-muted-foreground cursor-pointer" />
            </PopoverTrigger>
            {confirmDeleteList ? (
                <PopoverContent className="flex flex-col gap-y-2 mr-5 px-5 z-50 bg-background border shadow-lg rounded-lg">
                    <p className="text-sm text-destructive mb-4">Are you sure you want to delete this list?</p>
                    <div className="flex-center gap-x-5 mb-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDeleteList(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                deleteTodoList(currentListId, state, queryClient, currentListIndex)
                                setConfirmDeleteList(false)
                                setIsPopoverOpen(false)
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </PopoverContent>
            ) : (
                <PopoverContent className="w-fit flex flex-col gap-y-1 p-3 px-6 mr-5 z-50">
                    <Button
                        onClick={() => setDefaultTodoList(currentListId, state, queryClient)}
                        variant={"ghost"}
                    >
                        <Bookmark /> Make Default
                    </Button>
                    <Button
                        variant='ghost'
                        className='text-destructive hover:text-destructive'
                        onClick={() => setConfirmDeleteList(true)}
                    >
                        <Trash2Icon size={14} /> Delete
                    </Button>
                </PopoverContent>
            )}
        </Popover>
    )
}
