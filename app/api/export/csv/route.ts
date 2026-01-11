import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse } from '@/lib/api-utils'
import { exportQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()
        const searchParams = request.nextUrl.searchParams

        const query = exportQuerySchema.parse({
            from: searchParams.get('from') || undefined,
            to: searchParams.get('to') || undefined,
        })

        const where: any = {
            userId: (user as any).id,
        }

        if (query.from || query.to) {
            where.transactionDate = {}
            if (query.from) {
                where.transactionDate.gte = query.from
            }
            if (query.to) {
                where.transactionDate.lte = query.to
            }
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
