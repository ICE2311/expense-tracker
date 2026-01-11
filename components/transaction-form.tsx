'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionInput } from '@/lib/validations'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'

interface TransactionFormProps {
    onSubmit: (data: TransactionInput) => void
    defaultValues?: Partial<TransactionInput>
    isLoading?: boolean
}

// Helper function to format date for input[type="date"]
const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function TransactionForm({ onSubmit, defaultValues, isLoading }: TransactionFormProps) {
    const { data: categories } = useCategories()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'EXPENSE',
            transactionDate: new Date(),
            ...defaultValues,
        },
    })

    // Set the date input value on mount if no default value provided
    useEffect(() => {
        if (!defaultValues?.transactionDate) {
            const today = formatDateForInput(new Date())
            setValue('transactionDate', today as any)
        } else {
            const formattedDate = formatDateForInput(new Date(defaultValues.transactionDate))
            setValue('transactionDate', formattedDate as any)
        }
    }, [defaultValues?.transactionDate, setValue])

    const selectedType = watch('type')
    const filteredCategories = categories?.filter((cat) => cat.type === selectedType) || []

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                    value={selectedType}
                    onValueChange={(value) => {
                        setValue('type', value as 'EXPENSE' | 'INCOME')
                        setValue('categoryId', '') // Reset category when type changes
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount')}
                    disabled={isLoading}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                    value={watch('categoryId')}
                    onValueChange={(value) => setValue('categoryId', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="transactionDate">Date</Label>
                <Input
                    id="transactionDate"
                    type="date"
                    {...register('transactionDate')}
                    disabled={isLoading}
                />
                {errors.transactionDate && (
                    <p className="text-sm text-destructive">{errors.transactionDate.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                    id="description"
                    type="text"
                    placeholder="Enter description"
                    {...register('description')}
                    disabled={isLoading}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
            </div>

            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Transaction'}
                </Button>
            </DialogFooter>
        </form>
    )
}
