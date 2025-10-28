'use client'
import React from 'react'
import { BareInput } from '@/components/ui/bare-bones-input'
import { TodoItem as TodoItemType } from '@/types/todo'
import { TodoState } from './utils/todo-list-operations'
import {
    updateTodoItem,
    toggleTodoCompletion,
    handleTodoFocus,
    handleTodoBlur,
    handleTodoKeyDown
} from './utils/todo-operations'
import { CheckCircle, Circle } from 'lucide-react'

interface TodoItemProps {
    todo: TodoItemType
    listId: string
    state: TodoState
}

export default function TodoItem({ todo, listId, state }: TodoItemProps) {
    const isTemporary = todo.id.startsWith('temp-')

    return (
        <div className="flex items-start gap-3 mb-2">
            {/* Checkbox - only show for non-temporary items */}
                <button
                    onClick={() => toggleTodoCompletion(listId, todo.id, state)}
                    className="flex-shrink-0 pt-0 rounded transition-colors"
                >
                    {todo.completed ? (
                        <CheckCircle className="w-5 h-5 text-ring" />
                    ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>

            {/* Input */}
            <BareInput
                className={`flex-1 text-sm
                    ${todo.completed ? 'line-through text-muted-foreground' : ''} 
                    ${isTemporary ? '' : ''}
                `}
                placeholder="Add todo..."
                value={todo.text}
                onChange={(e) => updateTodoItem(listId, todo.id, e.target.value, state)}
                onKeyDown={(e) => handleTodoKeyDown(e, listId, todo.id, state)}
                onBlur={() => handleTodoBlur(listId, todo.id, todo.text, todo.completed, todo.priority, state)}
                onFocus={() => handleTodoFocus(listId, todo.id, state)}
                data-todo-id={todo.id}
            />
        </div>
    )
}
