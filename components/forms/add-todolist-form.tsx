'use client'

import React, { useState } from 'react'
import { useQueryClient } from "@tanstack/react-query"
import { TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { clientTodoLists } from '@/lib/api/services/todos/client'

interface AddTodoListFormProps {
    isOpen: boolean
    onClose: () => void
    onListCreated?: (newListIndex: number) => void
    todoListsLength: number
}

export default function AddTodoListForm({ 
    isOpen, 
    onClose, 
    onListCreated, 
    todoListsLength 
}: AddTodoListFormProps) {
    const queryClient = useQueryClient()
    const [newListName, setNewListName] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateList = async () => {
        if (!newListName.trim()) return

        setIsCreating(true)
        try {
            // Create list on backend
            const newList = await clientTodoLists.createTodoList(newListName.trim())

            // Update React Query cache
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return [newList]
                return [...oldData, newList]
            })

            // Call the callback with the new list index
            onListCreated?.(todoListsLength)

            // Close modal and reset form
            handleClose()
        } catch (error) {
            console.error('Failed to create todo list:', error)
            // You might want to show a toast notification here
        } finally {
            setIsCreating(false)
        }
    }

    const handleClose = () => {
        onClose()
        setNewListName('')
        setIsCreating(false)
    }

    return (
        <ResponsiveDialog
            isOpen={isOpen}
            setIsOpen={handleClose}
            title="Create New List"
            description="Enter a name for your new todo list."
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="listName">List Name</Label>
                    <Input
                        id="listName"
                        placeholder="Enter list name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newListName.trim()) {
                                handleCreateList()
                            }
                        }}
                        autoFocus
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateList}
                        disabled={!newListName.trim() || isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create List'}
                    </Button>
                </div>
            </div>
        </ResponsiveDialog>
    )
}