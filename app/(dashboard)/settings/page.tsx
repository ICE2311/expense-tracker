'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
    const { data: session } = useSession()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={session?.user?.name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={session?.user?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency" value={(session?.user as any)?.currency || 'INR'} disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Profile settings are currently read-only. Contact support to update your information.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>About</CardTitle>
                    <CardDescription>Application information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <p><strong>Version:</strong> 1.0.0</p>
                        <p><strong>Built with:</strong> Next.js, TypeScript, Prisma, PostgreSQL</p>
                        <p><strong>Features:</strong> Transaction tracking, Analytics, CSV Export</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
