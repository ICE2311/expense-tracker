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
    startDate?: Date
    endDate?: Date
}) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.type) queryParams.set('type', params.type)
    if (params?.categoryId) queryParams.set('categoryId', params.categoryId)
    if (params?.startDate) queryParams.set('startDate', params.startDate.toISOString())
    if (params?.endDate) queryParams.set('endDate', params.endDate.toISOString())

    return useQuery({
        queryKey: ['transactions', params],
        queryFn: async () => {
            const response = await fetch(`/api/transactions?${queryParams}`)
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
