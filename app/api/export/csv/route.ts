import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse } from '@/lib/api-utils'
import { exportQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()
        const searchParams = request.nextUrl.searchParams

        const rawFrom = searchParams.get('from') || searchParams.get('startDate')
        const rawTo = searchParams.get('to') || searchParams.get('endDate')
        const rawMinAmount = searchParams.get('minAmount')
        const rawMaxAmount = searchParams.get('maxAmount')
        const rawSearch = searchParams.get('search')
        const rawCategoryId = searchParams.get('categoryId')
        const rawType = searchParams.get('type')

        const query = exportQuerySchema.parse({
            from: rawFrom || undefined,
            to: rawTo || undefined,
            type: rawType && rawType !== 'ALL' ? rawType : undefined,
            categoryId: rawCategoryId && rawCategoryId !== 'ALL' ? rawCategoryId : undefined,
            minAmount: rawMinAmount !== null && rawMinAmount !== '' ? rawMinAmount : undefined,
            maxAmount: rawMaxAmount !== null && rawMaxAmount !== '' ? rawMaxAmount : undefined,
            search: rawSearch?.trim() ? rawSearch.trim() : undefined,
        })

        const where: any = {
            userId: (user as any).id,
        }

        if (query.type) {
            where.type = query.type
        }

        if (query.categoryId) {
            where.categoryId = query.categoryId
        }

        if (query.from || query.to) {
            where.transactionDate = {}
            if (query.from) {
                where.transactionDate.gte = query.from
            }
            if (query.to) {
                const end = new Date(query.to)
                if (end.getUTCHours() === 0 && end.getUTCMinutes() === 0 && end.getUTCSeconds() === 0 && end.getUTCMilliseconds() === 0) {
                    end.setUTCHours(23, 59, 59, 999)
                }
                where.transactionDate.lte = end
            }
        }

        if (query.minAmount !== undefined || query.maxAmount !== undefined) {
            where.amount = {}
            if (query.minAmount !== undefined) {
                where.amount.gte = query.minAmount
            }
            if (query.maxAmount !== undefined) {
                where.amount.lte = query.maxAmount
            }
        }

        if (query.search) {
            where.OR = [
                { description: { contains: query.search, mode: 'insensitive' } },
                { category: { name: { contains: query.search, mode: 'insensitive' } } },
            ]
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                category: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                transactionDate: 'desc',
            },
        })

        // Generate CSV
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description']
        const rows = transactions.map((t) => [
            new Date(t.transactionDate).toISOString().split('T')[0],
            t.type,
            t.category.name,
            t.amount.toString(),
            t.currency,
            t.description || '',
        ])

        const csv = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n')

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })
    } catch (error: any) {
        console.error('Export CSV error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to export transactions', 500)
    }
}
