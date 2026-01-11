'use client'

import { useQuery } from '@tanstack/react-query'

export function useAnalyticsSummary(params: { month?: number; year: number }) {
    const queryParams = new URLSearchParams()
    if (params.month) queryParams.set('month', params.month.toString())
    queryParams.set('year', params.year.toString())

    return useQuery({
        queryKey: ['analytics', 'summary', params],
        queryFn: async () => {
            const response = await fetch(`/api/analytics/summary?${queryParams}`)
            if (!response.ok) throw new Error('Failed to fetch analytics summary')
            return response.json()
        },
    })
}

export function useMonthlyTrend(year: number) {
    return useQuery({
        queryKey: ['analytics', 'monthly-trend', year],
        queryFn: async () => {
            const response = await fetch(`/api/analytics/monthly-trend?year=${year}`)
            if (!response.ok) throw new Error('Failed to fetch monthly trend')
            return response.json()
        },
    })
}
