import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

const defaultCategories = [
    // Expense categories
    { name: 'Food & Dining', type: 'EXPENSE' },
    { name: 'Transportation', type: 'EXPENSE' },
    { name: 'Shopping', type: 'EXPENSE' },
    { name: 'Entertainment', type: 'EXPENSE' },
    { name: 'Bills & Utilities', type: 'EXPENSE' },
    { name: 'Healthcare', type: 'EXPENSE' },
    { name: 'Education', type: 'EXPENSE' },
    { name: 'Personal Care', type: 'EXPENSE' },
    { name: 'Home & Garden', type: 'EXPENSE' },
    { name: 'Other Expenses', type: 'EXPENSE' },

    // Income categories
    { name: 'Salary', type: 'INCOME' },
    { name: 'Freelance', type: 'INCOME' },
    { name: 'Investment', type: 'INCOME' },
    { name: 'Gift', type: 'INCOME' },
    { name: 'Other Income', type: 'INCOME' },
]

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validatedData = registerSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                currency: validatedData.currency || 'INR',
            },
        })

        // Create default categories for the user
        await prisma.category.createMany({
            data: defaultCategories.map((category) => ({
                name: category.name,
                type: category.type,
                userId: user.id,
            })),
        })

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
