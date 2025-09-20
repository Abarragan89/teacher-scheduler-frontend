'use client'
import React, { useState, KeyboardEvent } from 'react'
import {
    Accordion,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Task, OutlineItem } from '@/types/tasks'
import TaskItem from './task-item'
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'


export default function DailyScheduleAccordion() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Math',
            completed: false,
            outlineItems: [{ id: '1-1', text: '', completed: false, indentLevel: 0 }]
        },
        {
            id: '2',
            title: 'CKLA',
            completed: false,
            outlineItems: [{ id: '2-1', text: '', completed: false, indentLevel: 0 }]
        },
        {
            id: '3',
            title: 'Social Studies',
            completed: false,
            outlineItems: [{ id: '3-1', text: '', completed: false, indentLevel: 0 }]
        }
    ])

    const [openAccordions, setOpenAccordions] = useState<string[]>(['0'])
    const [isEditable, setIsEditable] = useState<boolean>(true)

    const toggleTaskCompletion = (taskId: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        outlineItems: task.outlineItems.map(item => ({
                            ...item,
                            completed: !task.completed ? true : item.completed
                        }))
                    }
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
                        id: `${Date.now()}`,
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

    const reorderOutlineItems = (taskId: string, reorderedItems: OutlineItem[]) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, outlineItems: reorderedItems }
                    : task
            )
        )
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

    const getTaskIndex = (id: string) => tasks.findIndex(task => task.id === id)

    function handleDragEnd(event: { active: any; over: any }) {
        const { active, over } = event;

        if (active.id === over.id) return;

        setTasks((tasks) => {
            const originalPos = getTaskIndex(active.id);
            const newPos = getTaskIndex(over.id);

            return arrayMove(tasks, originalPos, newPos)
        })

    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px of movement before dragging starts
            },
        }),
        useSensor(KeyboardSensor)
    )


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
                <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
                    <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
                        {tasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                tasksLength={tasks.length}
                                isEditable={isEditable}
                                onToggleCompletion={toggleTaskCompletion}
                                onUpdateTitle={updateTaskTitle}
                                onDelete={deleteTask}
                                onTitleKeyDown={handleTaskTitleKeyDown}
                                onToggleOutlineCompletion={toggleOutlineItemCompletion}
                                onUpdateOutlineItem={updateOutlineItem}
                                onOutlineKeyDown={handleOutlineKeyDown}
                                onOutlineBlur={handleOutlineBlur}
                                onAddOutlineItem={addOutlineItem}
                                onReorderOutlineItems={reorderOutlineItems}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </Accordion>

            {isEditable && (
                <button
                    onClick={addNewTask}
                    className="w-full mt-4 p-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-border hover:text-background"
                >
                    <span className="text-lg">+</span>
                    <span>Add Task</span>
                </button>
            )}
        </div>
    )
}
