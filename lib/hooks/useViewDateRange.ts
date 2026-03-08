'use client'
import { usePathname, useSearchParams } from 'next/navigation'

interface ViewDateRange {
    viewStartDate: string
    viewEndDate: string
}

function formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Returns viewStartDate and viewEndDate based on the current URL:
 * - /dashboard/daily/[dateString]  → single day range
 * - /dashboard?month=YYYY-MM       → first and last day of that month
 * - fallback                       → first and last day of current month
 */
export function useViewDateRange(): ViewDateRange {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Daily view: /dashboard/daily/2026-03-08
    const dailyMatch = pathname.match(/\/dashboard\/daily\/(\d{4}-\d{2}-\d{2})/)
    if (dailyMatch) {
        return {
            viewStartDate: dailyMatch[1],
            viewEndDate: dailyMatch[1],
        }
    }

    // Dashboard month view: ?month=2026-03
    const monthParam = searchParams.get('month')
    if (monthParam) {
        const [y, m] = monthParam.split('-').map(Number)
        if (y && m) {
            const firstDay = new Date(y, m - 1, 1)
            const lastDay = new Date(y, m, 0)
            return {
                viewStartDate: formatDate(firstDay),
                viewEndDate: formatDate(lastDay),
            }
        }
    }

    // Fallback: current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
        viewStartDate: formatDate(firstDay),
        viewEndDate: formatDate(lastDay),
    }
}
