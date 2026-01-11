import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    currency: z.string().default('INR'),
})

// Transaction schemas
export const transactionSchema = z.object({
    type: z.enum(['EXPENSE', 'INCOME'], {
        required_error: 'Transaction type is required',
    }),
    amount: z.coerce
        .number({
            required_error: 'Amount is required',
            invalid_type_error: 'Amount must be a number',
        })
        .positive('Amount must be positive'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    transactionDate: z.coerce.date({
        required_error: 'Transaction date is required',
    }),
})

export const updateTransactionSchema = transactionSchema.partial()

// Category schemas
export const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long'),
    type: z.enum(['EXPENSE', 'INCOME'], {
        required_error: 'Category type is required',
    }),
})

export const updateCategorySchema = categorySchema.partial()

// Query params schemas
export const transactionQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: z.enum(['EXPENSE', 'INCOME']).optional(),
    categoryId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
})

export const analyticsQuerySchema = z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100),
})

export const exportQuerySchema = z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type TransactionQuery = z.infer<typeof transactionQuerySchema>
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>
export type ExportQuery = z.infer<typeof exportQuerySchema>
