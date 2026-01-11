'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryInput } from '@/lib/validations'

export default function CategoriesPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)

    const { data: categories, isLoading } = useCategories()
    const createMutation = useCreateCategory()
    const updateMutation = useUpdateCategory()
    const deleteMutation = useDeleteCategory()

    const expenseCategories = categories?.filter((cat) => cat.type === 'EXPENSE') || []
    const incomeCategories = categories?.filter((cat) => cat.type === 'INCOME') || []

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone if the category has transactions.')) {
            await deleteMutation.mutateAsync(id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage your transaction categories</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                            <DialogDescription>Create a new category for your transactions</DialogDescription>
                        </DialogHeader>
                        <CategoryForm
                            onSubmit={async (data) => {
                                await createMutation.mutateAsync(data)
                                setIsCreateOpen(false)
                            }}
                            isLoading={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Categories</CardTitle>
                        <CardDescription>Categories for tracking expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : expenseCategories.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No expense categories</p>
                        ) : (
                            <div className="space-y-2">
                                {expenseCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        <div className="flex gap-2">
                                            <Dialog
                                                open={editingCategory?.id === category.id}
                                                onOpenChange={(open) => !open && setEditingCategory(null)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingCategory(category)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Category</DialogTitle>
                                                        <DialogDescription>Update category details</DialogDescription>
                                                    </DialogHeader>
                                                    <CategoryForm
                                                        onSubmit={async (data) => {
                                                            await updateMutation.mutateAsync({ id: category.id, data })
                                                            setEditingCategory(null)
                                                        }}
                                                        defaultValues={category}
                                                        isLoading={updateMutation.isPending}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(category.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Income Categories</CardTitle>
                        <CardDescription>Categories for tracking income</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : incomeCategories.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No income categories</p>
                        ) : (
                            <div className="space-y-2">
                                {incomeCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        <div className="flex gap-2">
                                            <Dialog
                                                open={editingCategory?.id === category.id}
                                                onOpenChange={(open) => !open && setEditingCategory(null)}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingCategory(category)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Category</DialogTitle>
                                                        <DialogDescription>Update category details</DialogDescription>
                                                    </DialogHeader>
                                                    <CategoryForm
                                                        onSubmit={async (data) => {
                                                            await updateMutation.mutateAsync({ id: category.id, data })
                                                            setEditingCategory(null)
                                                        }}
                                                        defaultValues={category}
                                                        isLoading={updateMutation.isPending}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(category.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function CategoryForm({
    onSubmit,
    defaultValues,
    isLoading,
}: {
    onSubmit: (data: CategoryInput) => void
    defaultValues?: Partial<CategoryInput>
    isLoading?: boolean
}) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: defaultValues || { type: 'EXPENSE' },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., Groceries, Rent, Salary"
                    {...register('name')}
                    disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                    value={watch('type')}
                    onValueChange={(value) => setValue('type', value as 'EXPENSE' | 'INCOME')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>

            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Category'}
                </Button>
            </DialogFooter>
        </form>
    )
}
