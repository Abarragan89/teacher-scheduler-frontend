import { Schedule } from '@/types/day'
import React from 'react'
import { formatDateDisplay } from '@/lib/utils'

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
        <div className="hidden print:block max-w-5xl mx-auto bg-white text-black print:p-2 print:max-w-none">
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
            <div className="border-b border-black pb-4 mb-6 print-avoid-break">
                <h1 className="text-3xl font-bold text-center mb-2">
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
                        <div key={task.id} className="border-2 border-gray-300 rounded-lg p-4 print-avoid-break">
                            {/* Task/Period Header */}
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                                <div className="w-6 h-6 border-2 border-gray-400 rounded flex-shrink-0 flex items-center justify-center">
                                </div>
                                <h2 className={`text-xl font-bold flex-1`}>
                                    {task.title}
                                </h2>
                            </div>

                            {/* Outline Items */}
                            {task.outlineItems && task.outlineItems.length > 0 && (
                                <div className="space-y-2">
                                    {task.outlineItems
                                        .filter(item => item.text.trim() !== '') // Only show non-empty items
                                        .map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-start gap-3"
                                                style={{ marginLeft: `${item.indentLevel * 24}px` }}
                                            >
                                                {/* Checkbox */}
                                                <div className="w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0 mt-1 flex items-center justify-center">
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <p className={`text-base leading-relaxed`}>
                                                        {item.text}
                                                    </p>
                                                </div>
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
