import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils'
import { transactionSchema, transactionQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()
        const searchParams = request.nextUrl.searchParams

        const rawStartDate = searchParams.get('startDate')
        const rawEndDate = searchParams.get('endDate')
        const rawMinAmount = searchParams.get('minAmount')
        const rawMaxAmount = searchParams.get('maxAmount')
        const rawSearch = searchParams.get('search')
        const rawCategoryId = searchParams.get('categoryId')
        const rawType = searchParams.get('type')

        const query = transactionQuerySchema.parse({
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '10',
            type: rawType && rawType !== 'ALL' ? rawType : undefined,
            categoryId: rawCategoryId && rawCategoryId !== 'ALL' ? rawCategoryId : undefined,
            startDate: rawStartDate || undefined,
            endDate: rawEndDate || undefined,
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

        if (query.startDate || query.endDate) {
            where.transactionDate = {}
            if (query.startDate) {
                where.transactionDate.gte = query.startDate
            }
            if (query.endDate) {
                const end = new Date(query.endDate)
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

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                },
                orderBy: {
                    transactionDate: 'desc',
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.transaction.count({ where }),
        ])

        return successResponse({
            transactions,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        })
    } catch (error: any) {
        console.error('Get transactions error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to fetch transactions', 500)
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const validatedData = transactionSchema.parse(body)

        // Verify category belongs to user
        const category = await prisma.category.findFirst({
            where: {
                id: validatedData.categoryId,
                userId: (user as any).id,
            },
        })

        if (!category) {
            return errorResponse('Category not found', 404)
        }

        // Verify category type matches transaction type
        if (category.type !== validatedData.type) {
            return errorResponse('Category type does not match transaction type', 400)
        }

        const transaction = await prisma.transaction.create({
            data: {
                type: validatedData.type,
                amount: validatedData.amount,
                currency: (user as any).currency || 'INR',
                categoryId: validatedData.categoryId,
                description: validatedData.description,
                transactionDate: validatedData.transactionDate,
                userId: (user as any).id,
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

        return successResponse(transaction, 201)
    } catch (error: any) {
        console.error('Create transaction error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        if (error.name === 'ZodError') {
            return errorResponse('Validation error', 400)
        }
        return errorResponse('Failed to create transaction', 500)
    }
}
