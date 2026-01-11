import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils'
import { categorySchema } from '@/lib/validations'

export async function GET(request: Request) {
    try {
        const user = await requireAuth()

        const categories = await prisma.category.findMany({
            where: {
                userId: (user as any).id,
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        })

        return successResponse(categories)
    } catch (error: any) {
        console.error('Get categories error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        return errorResponse('Failed to fetch categories', 500)
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const validatedData = categorySchema.parse(body)

        // Check if category already exists for this user
        const existingCategory = await prisma.category.findFirst({
            where: {
                userId: (user as any).id,
                name: validatedData.name,
                type: validatedData.type,
            },
        })

        if (existingCategory) {
            return errorResponse('Category already exists', 400)
        }

        const category = await prisma.category.create({
            data: {
                name: validatedData.name,
                type: validatedData.type,
                userId: (user as any).id,
            },
        })

        return successResponse(category, 201)
    } catch (error: any) {
        console.error('Create category error:', error)
        if (error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401)
        }
        if (error.name === 'ZodError') {
            return errorResponse('Validation error', 400)
        }
        return errorResponse('Failed to create category', 500)
    }
}
