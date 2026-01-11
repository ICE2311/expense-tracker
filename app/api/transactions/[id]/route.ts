import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils'
import { updateTransactionSchema } from '@/lib/validations'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireAuth()
        const body = await request.json()
        const validatedData = updateTransactionSchema.parse(body)

        // Verify transaction belongs to user
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id: id,
                userId: (user as any).id,
            },
        })

        if (!existingTransaction) {
            return errorResponse('Transaction not found', 404)
        }

        // If categoryId is being updated, verify it belongs to user
        if (validatedData.categoryId) {
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
            const transactionType = validatedData.type || existingTransaction.type
            if (category.type !== transactionType) {
                return errorResponse('Category type does not match transaction type', 400)
            }
        }

        const transaction = await prisma.transaction.update({
            where: { id: id },
            data: validatedData,
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

        return successResponse(transaction)
    } catch (error: any) {
        console.error('Update transaction error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        if (error.name === 'ZodError') {
            return errorResponse('Validation error', 400)
        }
        return errorResponse('Failed to update transaction', 500)
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await requireAuth()

        // Verify transaction belongs to user
        const transaction = await prisma.transaction.findFirst({
            where: {
                id: id,
                userId: (user as any).id,
            },
        })

        if (!transaction) {
            return errorResponse('Transaction not found', 404)
        }

        await prisma.transaction.delete({
            where: { id: id },
        })

        return successResponse({ message: 'Transaction deleted successfully' })
    } catch (error: any) {
        console.error('Delete transaction error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to delete transaction', 500)
    }
}
