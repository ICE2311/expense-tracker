import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils'
import { z } from 'zod'

const monthlyTrendSchema = z.object({
    year: z.coerce.number().int().min(2000).max(2100),
})

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()
        const searchParams = request.nextUrl.searchParams

        const query = monthlyTrendSchema.parse({
            year: searchParams.get('year') || new Date().getFullYear().toString(),
        })

        const startDate = new Date(query.year, 0, 1)
        const endDate = new Date(query.year, 11, 31, 23, 59, 59)

        // Get all transactions for the year
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: (user as any).id,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        })

        // Group by month
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthName: new Date(query.year, i).toLocaleString('en-US', { month: 'short' }),
            income: 0,
            expenses: 0,
            balance: 0,
        }))

        transactions.forEach((t) => {
            const month = new Date(t.transactionDate).getMonth()
            const amount = Number(t.amount)

            if (t.type === 'INCOME') {
                monthlyData[month].income += amount
            } else {
                monthlyData[month].expenses += amount
            }
        })

        // Calculate balance for each month
        monthlyData.forEach((data) => {
            data.balance = data.income - data.expenses
        })

        return successResponse({
            year: query.year,
            monthlyTrend: monthlyData,
        })
    } catch (error: any) {
        console.error('Get monthly trend error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to fetch monthly trend', 500)
    }
}
