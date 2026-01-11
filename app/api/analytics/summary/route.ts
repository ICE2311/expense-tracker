import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils'
import { analyticsQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()
        const searchParams = request.nextUrl.searchParams

        const query = analyticsQuerySchema.parse({
            month: searchParams.get('month') || undefined,
            year: searchParams.get('year') || new Date().getFullYear().toString(),
        })

        const startDate = new Date(query.year, query.month ? query.month - 1 : 0, 1)
        const endDate = query.month
            ? new Date(query.year, query.month, 0, 23, 59, 59)
            : new Date(query.year, 11, 31, 23, 59, 59)

        // Get all transactions for the period
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: (user as any).id,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        })

        // Calculate totals
        const income = transactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const expenses = transactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const balance = income - expenses

        // Category breakdown
        const categoryBreakdown: Record<string, { name: string; amount: number; type: string }> = {}

        transactions.forEach((t) => {
            if (!categoryBreakdown[t.categoryId]) {
                categoryBreakdown[t.categoryId] = {
                    name: t.category.name,
                    amount: 0,
                    type: t.type,
                }
            }
            categoryBreakdown[t.categoryId].amount += Number(t.amount)
        })

        const categoryData = Object.entries(categoryBreakdown).map(([id, data]) => ({
            categoryId: id,
            categoryName: data.name,
            type: data.type,
            amount: data.amount,
        }))

        return successResponse({
            summary: {
                income,
                expenses,
                balance,
                period: {
                    startDate,
                    endDate,
                    month: query.month,
                    year: query.year,
                },
            },
            categoryBreakdown: categoryData,
            transactionCount: transactions.length,
        })
    } catch (error: any) {
        console.error('Get analytics error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to fetch analytics', 500)
    }
}
