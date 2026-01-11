import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils'
import { updateCategorySchema } from '@/lib/validations'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const validatedData = updateCategorySchema.parse(body)

        // Verify category belongs to user
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: (user as any).id,
            },
        })

        if (!existingCategory) {
            return errorResponse('Category not found', 404)
        }

        // Check for duplicate name if name is being updated
        if (validatedData.name) {
            const duplicate = await prisma.category.findFirst({
                where: {
                    userId: (user as any).id,
                    name: validatedData.name,
                    type: validatedData.type || existingCategory.type,
                    id: { not: params.id },
                },
            })

            if (duplicate) {
                return errorResponse('Category with this name already exists', 400)
            }
        }

        const category = await prisma.category.update({
            where: { id: params.id },
            data: validatedData,
        })

        return successResponse(category)
    } catch (error: any) {
        console.error('Update category error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        if (error.name === 'ZodError') {
            return errorResponse('Validation error', 400)
        }
        return errorResponse('Failed to update category', 500)
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth()

        // Verify category belongs to user
        const category = await prisma.category.findFirst({
            where: {
                id: params.id,
                userId: (user as any).id,
            },
        })

        if (!category) {
            return errorResponse('Category not found', 404)
        }

        // Check if category has transactions
        const transactionCount = await prisma.transaction.count({
            where: { categoryId: params.id },
        })

        if (transactionCount > 0) {
            return errorResponse(
                'Cannot delete category with existing transactions',
                400
            )
        }

        await prisma.category.delete({
            where: { id: params.id },
        })

        return successResponse({ message: 'Category deleted successfully' })
    } catch (error: any) {
        console.error('Delete category error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to delete category', 500)
    }
}
