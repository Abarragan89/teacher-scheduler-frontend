'use client'
import React from 'react'
import { BareInput } from '@/components/ui/bare-bones-input'

export default function ToDoInput() {
    return (
        <BareInput
            className={`task-title-input flex-1 mr-2 ${false ? 'line-through text-muted-foreground' : ''}`}
            placeholder="Add todo..."
            style={{ fontSize: '16px' }}  // Add this
        />
    )
}
