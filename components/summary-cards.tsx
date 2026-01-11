'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SummaryCardsProps {
    income: number
    expenses: number
    balance: number
    currency?: string
}

export function SummaryCards({ income, expenses, balance, currency = 'INR' }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(income, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Money received
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(expenses, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Money spent
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(balance, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Net amount
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
