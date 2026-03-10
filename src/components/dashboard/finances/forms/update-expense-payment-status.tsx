'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useExpensePaymentStatusHandler } from '@/hooks/useControllers';
import { toast } from 'sonner';

interface UpdatePaymentStatusFormProps {
    isOpen: boolean;
    onClose: () => void;
    expenseId: string;
    businessId: number;
    currentStatus: string;
    onSuccess?: () => void;
}

export function UpdatePaymentStatusForm({
    isOpen,
    onClose,
    expenseId,
    businessId,
    currentStatus,
    onSuccess,
}: UpdatePaymentStatusFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            status: currentStatus,
        },
    });
    const statuses = useMemo(() => {
        switch(currentStatus?.toLowerCase()) {
            case "pending":
                return ["completed", "failed"];
            default:
                return []
        };
    }, [currentStatus]);

    const paymentStatusHandler = useExpensePaymentStatusHandler();

    async function onSubmit(data: {status: string}) {
        const { status } = data;
        try {
            setIsLoading(true);
            const payload = {
                expense_id: expenseId,
                business_id: businessId,
                payment_status: status
            };
            await paymentStatusHandler?.mutateAsync(payload, {
                onSuccess(data) {
                    toast.success(data?.message || "Expense Payment Status Updated");
                    onSuccess?.();
                    setTimeout(onClose, 2000);
                },
                onError(err) {
                    toast.error(err?.message);
                }
            })
        } catch (error) {
            console.error('Error updating expense status:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Payment Status</DialogTitle>
                    <DialogDescription>
                        Update the payment status of this expense. This will be reflected in your expense history.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    {statuses?.length ? (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || statuses?.[0]}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <FormLabel className={`text-sm font-[500] ${currentStatus?.toLowerCase() === 'completed' ? 'text-green-500' : 'text-red-500'}`}>Status Already {currentStatus?.replace(/\b\w/g, char => char?.toUpperCase())}</FormLabel>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button className='bg-template-primary text-white hover:text-template-primary' type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Status
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}