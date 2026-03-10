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
import { useExpenseStatusHandler } from '@/hooks/useControllers';
import { toast } from 'sonner';

interface UpdateExpenseStatusFormProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  businessId: number;
  currentStatus: string;
  onSuccess?: () => void;
}

export function UpdateExpenseStatusForm({
  isOpen,
  onClose,
  expenseId,
  businessId,
  currentStatus,
  onSuccess,
}: UpdateExpenseStatusFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      status: currentStatus as string,
    },
  });

  const expenseStatusHandler = useExpenseStatusHandler();

  const statuses = useMemo(() => {
    switch(currentStatus) {
      case "pending":
        return ["in_review", "approved", "rejected", "cancelled"];
      case "in_review":
        return ["approved", "rejected", "cancelled"];
      default:
        return [];
    }
  }, [currentStatus]);

  async function onSubmit(data: {status: string}) {
    const {status} = data;
    setIsLoading(true);
    try {
      const payload = {
        business_id: businessId,
        expense_id: expenseId,
        status
      };
      await expenseStatusHandler.mutateAsync(payload, {
        onSuccess(data) {
          toast.success(data?.message || "Expense Status Updated Successfully");
          onSuccess?.();
          setTimeout(onClose, 2000);
          setIsLoading(false);
        },
        onError(err) {
          toast.error(err?.message);
        }
      });
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
          <DialogTitle>Update Expense Status</DialogTitle>
          <DialogDescription>
            Update the status of this expense. This will be reflected in your expense history.
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
                          {status?.replace(/\_/g, " ")?.replace(/\b\w/g, char => char?.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <button className='bg-template-primary text-white py-2 px-4 rounded-sm text-sm cursor-pointer' type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span>{isLoading ? "Updating..." :  "Update Status"}</span>
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
