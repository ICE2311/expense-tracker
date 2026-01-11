import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

async function main() {
    console.log('🌱 Starting seed...')

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            password: hashedPassword,
            name: 'Demo User',
            currency: 'INR',
        },
    })

    console.log('✅ Created user:', user.email)

    // Create default categories for the user
    for (const category of defaultCategories) {
        await prisma.category.upsert({
            where: {
                userId_name_type: {
                    userId: user.id,
                    name: category.name,
                    type: category.type,
                },
            },
            update: {},
            create: {
                name: category.name,
                type: category.type,
                userId: user.id,
            },
        })
    }

    console.log('✅ Created default categories')

    // Create some sample transactions
    const categories = await prisma.category.findMany({
        where: { userId: user.id },
    })

    const expenseCategories = categories.filter(c => c.type === 'EXPENSE')
    const incomeCategories = categories.filter(c => c.type === 'INCOME')

    const sampleTransactions = [
        {
            type: 'INCOME',
            amount: 50000,
            categoryId: incomeCategories.find(c => c.name === 'Salary')?.id || incomeCategories[0].id,
            description: 'Monthly salary',
            transactionDate: new Date('2026-01-01'),
        },
        {
            type: 'EXPENSE',
            amount: 1500,
            categoryId: expenseCategories.find(c => c.name === 'Food & Dining')?.id || expenseCategories[0].id,
            description: 'Grocery shopping',
            transactionDate: new Date('2026-01-05'),
        },
        {
            type: 'EXPENSE',
            amount: 500,
            categoryId: expenseCategories.find(c => c.name === 'Transportation')?.id || expenseCategories[1].id,
            description: 'Fuel',
            transactionDate: new Date('2026-01-07'),
        },
        {
            type: 'EXPENSE',
            amount: 2000,
            categoryId: expenseCategories.find(c => c.name === 'Bills & Utilities')?.id || expenseCategories[2].id,
            description: 'Electricity bill',
            transactionDate: new Date('2026-01-10'),
        },
    ]

    for (const transaction of sampleTransactions) {
        await prisma.transaction.create({
            data: {
                ...transaction,
                userId: user.id,
                currency: user.currency,
            },
        })
    }

    console.log('✅ Created sample transactions')
    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
