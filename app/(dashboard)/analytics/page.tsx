'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAnalyticsSummary, useMonthlyTrend } from '@/hooks/use-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SummaryCards } from '@/components/summary-cards'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function AnalyticsPage() {
    const { data: session } = useSession()
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)

    const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary({
        month: selectedMonth,
        year: selectedYear,
    })

    const { data: trendData, isLoading: trendLoading } = useMonthlyTrend(selectedYear)

    const currency = (session?.user as any)?.currency || 'INR'

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ]

    const expenseBreakdown = summary?.categoryBreakdown?.filter((cat: any) => cat.type === 'EXPENSE') || []
    const pieChartData = expenseBreakdown.map((cat: any) => ({
        name: cat.categoryName,
        value: cat.amount,
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Visualize your spending patterns and trends</p>
            </div>

            <div className="flex gap-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {summaryLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <>
                    <SummaryCards
                        income={summary?.summary?.income || 0}
                        expenses={summary?.summary?.expenses || 0}
                        balance={summary?.summary?.balance || 0}
                        currency={currency}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Breakdown</CardTitle>
                                <CardDescription>Distribution by category for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pieChartData.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No expense data for this period
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieChartData.map((_entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trend</CardTitle>
                                <CardDescription>Income vs Expenses for {selectedYear}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {trendLoading ? (
                                    <div className="text-center py-8">Loading...</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={trendData?.monthlyTrend || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="monthName" />
                                            <YAxis />
                                            <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                            <Legend />
                                            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                                            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
