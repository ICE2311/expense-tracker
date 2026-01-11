import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function getCurrentUser() {
    const session = await getServerSession(authOptions)
    return session?.user
}

export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status })
}

export function successResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status })
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}
