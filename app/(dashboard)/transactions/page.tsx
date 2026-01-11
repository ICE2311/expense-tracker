'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-transactions'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransactionForm } from '@/components/transaction-form'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionInput } from '@/hooks/use-transactions'

export default function TransactionsPage() {
    const { data: session } = useSession()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)
    const [page, setPage] = useState(1)
    const [typeFilter, setTypeFilter] = useState<'EXPENSE' | 'INCOME' | 'ALL'>('ALL')

    const { data: transactionsData, isLoading } = useTransactions({
        page,
        limit: 10,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
    })

    const createMutation = useCreateTransaction()
    const updateMutation = useUpdateTransaction()
    const deleteMutation = useDeleteTransaction()

    const currency = (session?.user as any)?.currency || 'INR'

    const handleCreate = async (data: TransactionInput) => {
        await createMutation.mutateAsync(data)
        setIsCreateOpen(false)
    }

    const handleUpdate = async (data: TransactionInput) => {
        if (editingTransaction) {
            await updateMutation.mutateAsync({ id: editingTransaction.id, data })
            setEditingTransaction(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await deleteMutation.mutateAsync(id)
        }
    }

    const handleExport = () => {
        window.open('/api/export/csv', '_blank')
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your income and expenses</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport} size="sm" className="sm:size-default">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="sm:size-default">
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Add Transaction</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Transaction</DialogTitle>
                                <DialogDescription>Create a new income or expense transaction</DialogDescription>
                            </DialogHeader>
                            <TransactionForm
                                onSubmit={handleCreate}
                                isLoading={createMutation.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>View and manage your transaction history</CardDescription>
                        </div>
                        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="INCOME">Income Only</SelectItem>
                                <SelectItem value="EXPENSE">Expense Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : transactionsData?.transactions?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No transactions found. Add your first transaction to get started!
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactionsData?.transactions?.map((transaction: any) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                                            <TableCell>{transaction.category.name}</TableCell>
                                            <TableCell>{transaction.description || '-'}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${transaction.type === 'INCOME'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {transaction.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                    {transaction.type === 'INCOME' ? '+' : '-'}
                                                    {formatCurrency(Number(transaction.amount), currency)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Dialog
                                                        open={editingTransaction?.id === transaction.id}
                                                        onOpenChange={(open) => !open && setEditingTransaction(null)}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setEditingTransaction(transaction)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Transaction</DialogTitle>
                                                                <DialogDescription>Update transaction details</DialogDescription>
                                                            </DialogHeader>
                                                            <TransactionForm
                                                                onSubmit={handleUpdate}
                                                                defaultValues={{
                                                                    type: transaction.type,
                                                                    amount: Number(transaction.amount),
                                                                    categoryId: transaction.categoryId,
                                                                    description: transaction.description || '',
                                                                    transactionDate: new Date(transaction.transactionDate),
                                                                }}
                                                                isLoading={updateMutation.isPending}
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(transaction.id)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {transactionsData?.pagination && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, transactionsData.pagination.total)} of{' '}
                                        {transactionsData.pagination.total} transactions
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page >= transactionsData.pagination.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
