'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export interface Transaction {
    id: string
    type: 'EXPENSE' | 'INCOME'
    amount: number
    currency: string
    categoryId: string
    description?: string
    transactionDate: Date | string
    category: {
        id: string
        name: string
        type: string
    }
}

export interface TransactionInput {
    type: 'EXPENSE' | 'INCOME'
    amount: number
    categoryId: string
    description?: string
    transactionDate: Date
}

export function useTransactions(params?: {
    page?: number
    limit?: number
    type?: 'EXPENSE' | 'INCOME'
    categoryId?: string
    startDate?: Date | string
    endDate?: Date | string
    minAmount?: number | string
    maxAmount?: number | string
    search?: string
}) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.type) queryParams.set('type', params.type)
    if (params?.categoryId && params.categoryId !== 'ALL') queryParams.set('categoryId', params.categoryId)
    if (params?.startDate) {
        const val = typeof params.startDate === 'string' ? params.startDate : params.startDate.toISOString()
        queryParams.set('startDate', val)
    }
    if (params?.endDate) {
        const val = typeof params.endDate === 'string' ? params.endDate : params.endDate.toISOString()
        queryParams.set('endDate', val)
    }
    if (params?.minAmount !== undefined && params.minAmount !== '') queryParams.set('minAmount', params.minAmount.toString())
    if (params?.maxAmount !== undefined && params.maxAmount !== '') queryParams.set('maxAmount', params.maxAmount.toString())
    if (params?.search && params.search.trim()) queryParams.set('search', params.search.trim())

    return useQuery({
        queryKey: ['transactions', params],
        queryFn: async () => {
            const response = await fetch(`/api/transactions?${queryParams.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch transactions')
            return response.json()
        },
    })
}

export function useCreateTransaction() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: async (data: TransactionInput) => {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create transaction')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            toast({
                title: 'Success',
                description: 'Transaction created successfully',
            })
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            })
        },
    })
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionInput> }) => {
            const response = await fetch(`/api/transactions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update transaction')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            toast({
                title: 'Success',
                description: 'Transaction updated successfully',
            })
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            })
        },
    })
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete transaction')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            toast({
                title: 'Success',
                description: 'Transaction deleted successfully',
            })
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            })
        },
    })
}
