'use client'

import { useAnalyticsSummary, useMonthlyTrend } from '@/hooks/use-analytics'
import { useTransactions } from '@/hooks/use-transactions'
import { SummaryCards } from '@/components/summary-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
    const { data: session } = useSession()
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary({
        month: currentMonth,
        year: currentYear,
    })

    const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
        page: 1,
        limit: 5,
    })

    const currency = (session?.user as any)?.currency || 'INR'

    if (summaryLoading || transactionsLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="animate-pulse space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Overview of your finances for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            <SummaryCards
                income={summary?.summary?.income || 0}
                expenses={summary?.summary?.expenses || 0}
                balance={summary?.summary?.balance || 0}
                currency={currency}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest 5 transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactionsData?.transactions?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No transactions yet. Start by adding your first transaction!
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
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
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
