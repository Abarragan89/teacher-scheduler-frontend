import { formatTime } from '@/lib/utils'
import { Schedule } from '@/types/day'
import React from 'react'

export default function SchedulePrintView({
    scheduleData,
    currentDay
}: {
    scheduleData: Schedule,
    currentDay?: string
}) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Filter out empty tasks and outline items
    const activeTasks = scheduleData.tasks?.filter(task =>
        task.title.trim() !== '' ||
        (task.outlineItems && task.outlineItems.some(item => item.text.trim() !== ''))
    ) || []

    return (
        <div className="hidden print:block max-w-5xl mx-auto bg-white text-black print:max-w-none">
            {/* Print-specific styles */}
            <style jsx>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-break { page-break-before: always; }
                    .print-avoid-break { page-break-inside: avoid; }
                }
            `}</style>

            {/* Header */}
            <div className="pb-2 mb-2 print-avoid-break">
                <h1 className="text-2xl font-bold text-center">
                    Daily Lesson Plan
                </h1>
                <p className="text-center">
                    {currentDay ? formatDate(currentDay) : 'Today'}
                </p>
            </div>

            {/* Tasks/Periods */}
            {activeTasks.length > 0 && (
                <div className="space-y-6">
                    {activeTasks.map(task => (
                        <div key={task.id} className="relative border-2 border-gray-300 rounded-sm p-4 print-avoid-break">
                            {/* Task/Period Header */}
                            <div className={`
                                ${task.outlineItems.length > 0 ? 'flex items-center gap-3  border-gray-200 border-b mb-2 pb-1' : ''}
                                `}>
                                <h2 className={`text-lg font-bold flex-1`}>
                                    {task.title}
                                </h2>
                                <div className='absolute top-[2px] right-2 flex-center gap-x-1 opacity-80 text-xs'>
                                    {task?.startTime && (
                                        <p>{formatTime(task.startTime)}</p>
                                    )}
                                    {task?.endTime && (
                                        <>
                                            <p>-</p>
                                            <p>{formatTime(task.endTime)}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Outline Items */}
                            {task.outlineItems && task.outlineItems.length > 0 && (
                                <div className="space-y-2">
                                    {task.outlineItems
                                        .filter(item => item.text.trim() !== '') // Only show non-empty items
                                        .map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-start gap-1"
                                                style={{ marginLeft: `${item.indentLevel * 24}px` }}
                                            >
                                                {/* Checkbox */}
                                                <div className="min-w-4 min-h-4 border border-gray-500 rounded-sm mt-1">
                                                </div>

                                                {/* Content */}
                                                <p className={`text-md ml-1`}>
                                                    {item.text}
                                                </p>

                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
