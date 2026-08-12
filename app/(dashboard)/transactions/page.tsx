'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
    Plus,
    Pencil,
    Trash2,
    Download,
    Search,
    SlidersHorizontal,
    X,
    RotateCcw,
    Calendar,
    Filter,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-transactions'
import { useCategories } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

    // Filter states
    const [typeFilter, setTypeFilter] = useState<'EXPENSE' | 'INCOME' | 'ALL'>('ALL')
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [minAmount, setMinAmount] = useState<string>('')
    const [maxAmount, setMaxAmount] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false)

    // Fetch categories for category filter
    const { data: categories = [] } = useCategories()

    // Filter categories based on selected transaction type
    const availableCategories = useMemo(() => {
        if (typeFilter === 'ALL') return categories
        return categories.filter((cat) => cat.type === typeFilter)
    }, [categories, typeFilter])

    // Query transactions with active filters
    const { data: transactionsData, isLoading } = useTransactions({
        page,
        limit: 10,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount !== '' ? Number(minAmount) : undefined,
        maxAmount: maxAmount !== '' ? Number(maxAmount) : undefined,
        search: searchQuery.trim() || undefined,
    })

    const createMutation = useCreateTransaction()
    const updateMutation = useUpdateTransaction()
    const deleteMutation = useDeleteTransaction()

    const currency = (session?.user as any)?.currency || 'INR'

    // Check active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (typeFilter !== 'ALL') count++
        if (categoryFilter !== 'ALL') count++
        if (startDate) count++
        if (endDate) count++
        if (minAmount !== '') count++
        if (maxAmount !== '') count++
        if (searchQuery.trim()) count++
        return count
    }, [typeFilter, categoryFilter, startDate, endDate, minAmount, maxAmount, searchQuery])

    // Reset all filters
    const handleClearAllFilters = () => {
        setTypeFilter('ALL')
        setCategoryFilter('ALL')
        setStartDate('')
        setEndDate('')
        setMinAmount('')
        setMaxAmount('')
        setSearchQuery('')
        setPage(1)
    }

    // Quick date preset helpers
    const setDatePreset = (preset: 'today' | 'thisMonth' | 'last30Days') => {
        const now = new Date()
        const formatYMD = (d: Date) => {
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${y}-${m}-${day}`
        }

        if (preset === 'today') {
            const todayStr = formatYMD(now)
            setStartDate(todayStr)
            setEndDate(todayStr)
        } else if (preset === 'thisMonth') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            setStartDate(formatYMD(firstDay))
            setEndDate(formatYMD(now))
        } else if (preset === 'last30Days') {
            const past = new Date()
            past.setDate(past.getDate() - 30)
            setStartDate(formatYMD(past))
            setEndDate(formatYMD(now))
        }
        setPage(1)
    }

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

    // Export CSV with current active filters
    const handleExport = () => {
        const params = new URLSearchParams()
        if (typeFilter !== 'ALL') params.set('type', typeFilter)
        if (categoryFilter !== 'ALL') params.set('categoryId', categoryFilter)
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        if (minAmount !== '') params.set('minAmount', minAmount)
        if (maxAmount !== '') params.set('maxAmount', maxAmount)
        if (searchQuery.trim()) params.set('search', searchQuery.trim())

        const queryString = params.toString()
        window.open(`/api/export/csv${queryString ? `?${queryString}` : ''}`, '_blank')
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage and filter your income and expenses</p>
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

            {/* Filter Section Card */}
            <Card>
                <CardHeader className={isFiltersExpanded ? "px-4 pt-3 pb-2 space-y-0" : "px-4 py-2.5 space-y-0"}>
                    <div className={activeFiltersCount > 0 ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" : "flex items-center justify-between gap-2"}>
                        {/* Title and Active count */}
                        <div className={`flex items-center gap-2 ${activeFiltersCount > 0 ? 'justify-between sm:justify-start w-full sm:w-auto' : ''}`}>
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-semibold">Filter & Search</CardTitle>
                            </div>
                            {activeFiltersCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground">
                                    {activeFiltersCount} active
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className={`flex items-center gap-2 ${activeFiltersCount > 0 ? 'justify-between sm:justify-end w-full sm:w-auto' : 'justify-end'}`}>
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearAllFilters}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                                >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Clear all
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                className="h-7 text-xs px-2.5 gap-1.5"
                            >
                                {isFiltersExpanded ? (
                                    <>
                                        <span>Hide Filters</span>
                                        <ChevronUp className="h-3.5 w-3.5" />
                                    </>
                                ) : (
                                    <>
                                        <span>Show Filters</span>
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {isFiltersExpanded && (
                    <CardContent className="px-4 pb-3.5 pt-1 space-y-3">
                        {/* Primary Search & Selects */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search by keyword */}
                            <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                                <Label htmlFor="search" className="text-xs font-medium">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by description or category..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            setPage(1)
                                        }}
                                        className="pl-9 pr-8 h-9 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('')
                                                setPage(1)
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Transaction Type</Label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(value: any) => {
                                        setTypeFilter(value)
                                        setCategoryFilter('ALL')
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Types</SelectItem>
                                        <SelectItem value="INCOME">Income Only</SelectItem>
                                        <SelectItem value="EXPENSE">Expense Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Category</Label>
                                <Select
                                    value={categoryFilter}
                                    onValueChange={(value: string) => {
                                        setCategoryFilter(value)
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Categories</SelectItem>
                                        {availableCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name} {typeFilter === 'ALL' && `(${cat.type === 'INCOME' ? 'Income' : 'Expense'})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Date and Amount Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t">
                            {/* Start Date */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="startDate" className="text-xs font-medium">From Date</Label>
                                    {startDate && (
                                        <button
                                            type="button"
                                            onClick={() => { setStartDate(''); setPage(1); }}
                                            className="text-[10px] text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value)
                                        setPage(1)
                                    }}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="endDate" className="text-xs font-medium">To Date</Label>
                                    {endDate && (
                                        <button
                                            type="button"
                                            onClick={() => { setEndDate(''); setPage(1); }}
                                            className="text-[10px] text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value)
                                        setPage(1)
                                    }}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Min Amount */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="minAmount" className="text-xs font-medium">Min Amount ({currency})</Label>
                                    {minAmount !== '' && (
                                        <button
                                            type="button"
                                            onClick={() => { setMinAmount(''); setPage(1); }}
                                            className="text-[10px] text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="minAmount"
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    step="any"
                                    value={minAmount}
                                    onChange={(e) => {
                                        setMinAmount(e.target.value)
                                        setPage(1)
                                    }}
                                    className="h-9 text-sm"
                                />
                            </div>

                            {/* Max Amount */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="maxAmount" className="text-xs font-medium">Max Amount ({currency})</Label>
                                    {maxAmount !== '' && (
                                        <button
                                            type="button"
                                            onClick={() => { setMaxAmount(''); setPage(1); }}
                                            className="text-[10px] text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="maxAmount"
                                    type="number"
                                    placeholder="Any"
                                    min="0"
                                    step="any"
                                    value={maxAmount}
                                    onChange={(e) => {
                                        setMaxAmount(e.target.value)
                                        setPage(1)
                                    }}
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        {/* Quick Date Presets Bar */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                            <span className="font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Quick Presets:
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDatePreset('today')}
                                className="h-6 px-2 text-[11px] rounded-full"
                            >
                                Today
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDatePreset('thisMonth')}
                                className="h-6 px-2 text-[11px] rounded-full"
                            >
                                This Month
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDatePreset('last30Days')}
                                className="h-6 px-2 text-[11px] rounded-full"
                            >
                                Last 30 Days
                            </Button>
                            {(startDate || endDate) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setStartDate('')
                                        setEndDate('')
                                        setPage(1)
                                    }}
                                    className="h-6 px-2 text-[11px] text-destructive hover:text-destructive"
                                >
                                    Reset Dates
                                </Button>
                            )}
                        </div>

                        {/* Active Filter Chips */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t">
                                <span className="text-xs text-muted-foreground mr-1">Active:</span>

                                {searchQuery.trim() && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        Search: &quot;{searchQuery}&quot;
                                        <button onClick={() => setSearchQuery('')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {typeFilter !== 'ALL' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        Type: {typeFilter === 'INCOME' ? 'Income' : 'Expense'}
                                        <button onClick={() => setTypeFilter('ALL')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {categoryFilter !== 'ALL' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        Category: {categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                                        <button onClick={() => setCategoryFilter('ALL')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {startDate && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        From: {startDate}
                                        <button onClick={() => setStartDate('')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {endDate && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        To: {endDate}
                                        <button onClick={() => setEndDate('')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {minAmount !== '' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        Min: {currency} {minAmount}
                                        <button onClick={() => setMinAmount('')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {maxAmount !== '' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium">
                                        Max: {currency} {maxAmount}
                                        <button onClick={() => setMaxAmount('')} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Transactions Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                {transactionsData?.pagination
                                    ? `Showing ${transactionsData.transactions?.length || 0} of ${transactionsData.pagination.total} transaction${transactionsData.pagination.total === 1 ? '' : 's'}`
                                    : 'View and manage your transaction history'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : transactionsData?.transactions?.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <Filter className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground font-medium">
                                {activeFiltersCount > 0
                                    ? 'No transactions found matching your active filters.'
                                    : 'No transactions found. Add your first transaction to get started!'}
                            </p>
                            {activeFiltersCount > 0 && (
                                <Button variant="outline" size="sm" onClick={handleClearAllFilters}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-x-auto">
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
                                                <TableCell className="whitespace-nowrap">{formatDate(transaction.transactionDate)}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center font-medium">
                                                        {transaction.category?.name || 'Uncategorized'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">{transaction.description || '-'}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${transaction.type === 'INCOME'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {transaction.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold whitespace-nowrap">
                                                    <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                        {transaction.type === 'INCOME' ? '+' : '-'}
                                                        {formatCurrency(Number(transaction.amount), currency)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
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
                            </div>

                            {transactionsData?.pagination && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, transactionsData.pagination.total)} of{' '}
                                        {transactionsData.pagination.total} transactions
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-xs text-muted-foreground px-2">
                                            Page {page} of {Math.max(1, transactionsData.pagination.totalPages)}
                                        </span>
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
