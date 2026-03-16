'use client'
import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import AddTodoForm from '@/components/forms/add-todo-form.tsx'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function FloatingAddButton() {
    const [sheetOpen, setSheetOpen] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)

    const handleButtonClick = () => {
        // Slide button off to the right, then open sheet
        setButtonVisible(false)
        setTimeout(() => setSheetOpen(true), 300)
    }

    const handleSheetClose = () => {
        setSheetOpen(false)
        // Slide button back in from the right after sheet closes
        setTimeout(() => setButtonVisible(true), 150)
    }

    return (
        <>
            <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) handleSheetClose() }}>
                <SheetContent side="left" className='p-4'>
                    <SheetHeader>
                        <SheetTitle className='mb-3'>New Todo</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className='h-[85vh]'>
                        <AddTodoForm />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <button
                onClick={handleButtonClick}
                aria-label="Add new todo"
                className={`
                    fixed bottom-6 right-6 z-50
                    w-14 h-14 rounded-full
                    bg-primary text-primary-foreground
                    shadow-lg
                    flex items-center justify-center
                    transition-transform duration-300 ease-in-out
                    ${buttonVisible ? 'translate-x-0' : 'translate-x-[calc(100%+1.5rem)]'}
                `}
            >
                <Plus className="w-6 h-6" />
            </button>
        </>
    )
}
