'use client'
import React, { useState, KeyboardEvent } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { BareInput } from "@/components/ui/bare-bones-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { X } from 'lucide-react'

interface OutlineItem {
    id: string
    text: string
    completed: boolean
    indentLevel: number
}

interface Task {
    id: string
    title: string
    completed: boolean
    outlineItems: OutlineItem[]
}

export default function DailyScheduleAccordion() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: '',
            completed: false,
            outlineItems: [{ id: '1-1', text: '', completed: false, indentLevel: 0 }]
        }
    ])

    const [openAccordions, setOpenAccordions] = useState<string[]>(['0'])
    const [isEditable, setIsEditable] = useState<boolean>(true)

    const toggleTaskCompletion = (taskId: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        )
    }

    const updateTaskTitle = (taskId: string, title: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, title }
                    : task
            )
        )
    }

    const toggleOutlineItemCompletion = (taskId: string, itemId: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        outlineItems: task.outlineItems.map(item =>
                            item.id === itemId
                                ? { ...item, completed: !item.completed }
                                : item
                        )
                    }
                    : task
            )
        )
    }

    const updateOutlineItem = (taskId: string, itemId: string, text: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        outlineItems: task.outlineItems.map(item =>
                            item.id === itemId
                                ? { ...item, text }
                                : item
                        )
                    }
                    : task
            )
        )
    }

    const addOutlineItem = (taskId: string, afterItemId?: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    // Check if there's already an empty outline item (prevent creating multiple empty items)
                    const hasEmptyItem = task.outlineItems.some(item => item.text.trim() === '')
                    if (hasEmptyItem) return task

                    const newItem: OutlineItem = {
                        id: `${taskId}-${Date.now()}`,
                        text: '',
                        completed: false,
                        indentLevel: 0
                    }

                    if (afterItemId) {
                        const index = task.outlineItems.findIndex(item => item.id === afterItemId)
                        const newItems = [...task.outlineItems]
                        newItems.splice(index + 1, 0, newItem)
                        return { ...task, outlineItems: newItems }
                    }

                    return { ...task, outlineItems: [...task.outlineItems, newItem] }
                }
                return task
            })
        )
    }

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId))
    }

    const deleteOutlineItem = (taskId: string, itemId: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === taskId) {
                    const newOutlineItems = task.outlineItems.filter(item => item.id !== itemId)
                    // Ensure at least one outline item exists
                    if (newOutlineItems.length === 0) {
                        newOutlineItems.push({
                            id: `${taskId}-${Date.now()}`,
                            text: '',
                            completed: false,
                            indentLevel: 0
                        })
                    }
                    return { ...task, outlineItems: newOutlineItems }
                }
                return task
            })
        )
    }

    const handleOutlineBlur = (taskId: string, itemId: string, text: string) => {
        // Delete empty outline items when they lose focus
        if (text.trim() === '') {
            const task = tasks.find(t => t.id === taskId)
            if (task && task.outlineItems.length > 1) {
                deleteOutlineItem(taskId, itemId)
            }
        }
    }

    const handleTaskTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Open the accordion if it's not already open
            if (!openAccordions.includes(taskId)) {
                setOpenAccordions(prev => [...prev, taskId])
            }
            // Focus the first subtask after a brief delay
            setTimeout(() => {
                const firstSubtaskInput = document.querySelector(`[data-task-id="${taskId}"] input[data-item-id]`) as HTMLInputElement
                if (firstSubtaskInput) {
                    firstSubtaskInput.focus()
                }
            }, 100)
        }
    }

    const addNewTask = () => {
        const newTaskId = Date.now().toString()
        const newTask: Task = {
            id: newTaskId,
            title: '',
            completed: false,
            outlineItems: [{
                id: `${newTaskId}-1`,
                text: '',
                completed: false,
                indentLevel: 0
            }]
        }
        setTasks(prev => [...prev, newTask])
    }

    const handleOutlineKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string, itemId: string) => {
        const task = tasks.find(t => t.id === taskId)
        const item = task?.outlineItems.find(i => i.id === itemId)

        if (!task || !item) return

        if (e.key === 'Enter') {
            e.preventDefault()
            // Only add new item if current item has text
            if (item.text.trim() !== '') {
                addOutlineItem(taskId, itemId)
                // Focus the new input after a brief delay
                setTimeout(() => {
                    const inputs = document.querySelectorAll(`[data-task-id="${taskId}"] input[data-item-id]`)
                    const currentIndex = Array.from(inputs).findIndex(input =>
                        input.getAttribute('data-item-id') === itemId
                    )
                    if (inputs[currentIndex + 1]) {
                        (inputs[currentIndex + 1] as HTMLInputElement).focus()
                    }
                }, 10)
            }
        }

        if (e.key === 'Backspace' && item.text === '') {
            // Delete current outline item if it's empty and there are multiple items
            if (task.outlineItems.length > 1) {
                e.preventDefault()
                deleteOutlineItem(taskId, itemId)
            }
        }

        if (e.key === 'Tab') {
            e.preventDefault()
            const maxIndent = 2
            const newIndentLevel = e.shiftKey
                ? Math.max(0, item.indentLevel - 1)
                : Math.min(maxIndent, item.indentLevel + 1)

            setTasks(prev =>
                prev.map(t =>
                    t.id === taskId
                        ? {
                            ...t,
                            outlineItems: t.outlineItems.map(i =>
                                i.id === itemId
                                    ? { ...i, indentLevel: newIndentLevel }
                                    : i
                            )
                        }
                        : t
                )
            )
        }
    }

    return (
        <div>
            <div className="flex text-sm items-center justify-end my-5 gap-x-2">
                <span>View</span>
                <Switch
                    checked={isEditable}
                    onCheckedChange={setIsEditable}
                />
                <span>Edit</span>
            </div>

            <Accordion
                type="multiple"
                className="w-full space-y-2"
                value={openAccordions}
                onValueChange={setOpenAccordions}
            >
                {tasks.map(task => (
                    <AccordionItem key={task.id} value={task.id} className="">
                        <div className="flex items-center justify-center gap-3 px-4 py-2">
                            <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => toggleTaskCompletion(task.id)}
                                className='w-[23px] h-[23px] rounded-full'
                            />

                            <BareInput
                                className={`flex-1 text-base tracking-wide font-bold ${task.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                                placeholder="Task title..."
                                value={task.title}
                                onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                                onKeyDown={(e) => handleTaskTitleKeyDown(e, task.id)}
                                disabled={!isEditable}
                                readOnly={!isEditable}
                            />

                            {tasks.length > 1 && isEditable && (
                                <X
                                    onClick={() => deleteTask(task.id)}
                                    className="w-6 h-6 p-1 text-destructive hover:border rounded"

                                />
                            )}

                            <AccordionTrigger className="w-6 h-6 p-0 rounded">
                            </AccordionTrigger>
                        </div>

                        <AccordionContent className="px-4 pb-4" data-task-id={task.id}>
                            <div className="space-y-2 mt-2 ml-7">
                                {task.outlineItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3"
                                        style={{ marginLeft: `${item.indentLevel * 24}px` }}
                                    >
                                        <Checkbox
                                            className='w-[16px] h-[17px]'
                                            checked={item.completed}
                                            onCheckedChange={() => toggleOutlineItemCompletion(task.id, item.id)}
                                        />

                                        <BareInput
                                            className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                                            placeholder="Add a note..."
                                            value={item.text}
                                            onChange={(e) => updateOutlineItem(task.id, item.id, e.target.value)}
                                            onKeyDown={(e) => handleOutlineKeyDown(e, task.id, item.id)}
                                            onBlur={() => handleOutlineBlur(task.id, item.id, item.text)}
                                            data-item-id={item.id}
                                            disabled={!isEditable}
                                            readOnly={!isEditable}
                                        />
                                    </div>
                                ))}

                                {isEditable && (
                                    <button
                                        onClick={() => addOutlineItem(task.id)}
                                        disabled={task.outlineItems.some(item => item.text.trim() === '')}
                                        className={`flex items-center gap-3 text-sm ml-7 text-muted-foreground ${task.outlineItems.some(item => item.text.trim() === '')
                                            ? 'cursor-not-allowed'
                                            : 'hover:text-foreground'
                                            }`}
                                    >
                                        <span>+ Add note</span>
                                    </button>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <button
                onClick={addNewTask}
                className="w-full mt-4 p-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <span className="text-lg">+</span>
                <span>Add Task</span>
            </button>
        </div>
    )
}
