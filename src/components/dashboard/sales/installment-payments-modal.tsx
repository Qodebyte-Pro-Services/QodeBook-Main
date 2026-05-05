"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstallmentPlan, getInstallmentPayments } from "@/api/controllers/get/handler";
import { advanceInstallment, completeInstallment } from "@/api/controllers/post/installment-handler";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BadgeTwo } from "@/components/ui/badge-two";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstallmentPaymentType, InstallmentPlanType } from "@/store/data/sales-table-data";

interface InstallmentPaymentsModalProps {
    planId: number;
    isOpen: boolean;
    onClose: () => void;
}

const InstallmentPaymentsModal = ({ planId, isOpen, onClose }: InstallmentPaymentsModalProps) => {
    const queryClient = useQueryClient();
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [reference, setReference] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const generateReference = () => {
        const year = new Date().getFullYear();
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 9; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `Ref: installment-${year}-${randomPart}`;
    };

    useEffect(() => {
        if (selectedPaymentId && !reference) {
            setReference(generateReference());
        }
    }, [selectedPaymentId, reference]);

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? JSON.parse(storedId) : 0;
        }
        return 0;
    }, []);

    const { data: planData, isLoading: planLoading } = useQuery({
        queryKey: ["get-installment-plan", planId],
        queryFn: () => getInstallmentPlan({ planId: `${planId}`, businessId }),
        enabled: !!planId && businessId !== 0,
    });

    const handleAdvancePayment = async (payment: InstallmentPaymentType) => {
        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setIsLoading(true);
        try {
            await advanceInstallment({
                installment_payment_id: payment.id,
                business_id: businessId,
                method: paymentMethod,
                amount: Number(payment.amount),
                reference
            });
            toast.success("Installment advanced successfully.");
            queryClient.invalidateQueries({ queryKey: ["get-installment-plan", planId] });
            queryClient.invalidateQueries({ queryKey: ["get-business-installment-plans"] });
            setSelectedPaymentId(null);
            setReference("");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to advance installment";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const plan = planData?.plan;
    const payments = plan?.payments || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Installment Plan Details - #{planId}</DialogTitle>
                    <DialogDescription>
                        Customer: <span className="font-semibold">{plan?.customer_name}</span> | 
                        Balance: <span className="font-semibold text-red-500">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(plan?.remaining_balance || 0))}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment: InstallmentPaymentType) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.payment_number}</TableCell>
                                    <TableCell>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(payment.amount))}</TableCell>
                                    <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <BadgeTwo variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                                            {payment.status.toUpperCase()}
                                        </BadgeTwo>
                                    </TableCell>
                                    <TableCell>
                                        {payment.status === 'pending' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => setSelectedPaymentId(selectedPaymentId === payment.id ? null : payment.id)}
                                            >
                                                Pay
                                            </Button>
                                        )}
                                        {payment.status === 'paid' && (
                                            <span className="text-xs text-muted-foreground">{new Date(payment.paid_at as string).toLocaleDateString()} via {payment.method}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {selectedPaymentId && (
                    <div className="mt-6 p-4 border rounded-md bg-muted/20">
                        <h4 className="font-semibold mb-4 text-sm">Record Payment</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Reference (Optional)</Label>
                                <Input 
                                    className="h-9"
                                    placeholder="Ref No." 
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedPaymentId(null)}>Cancel</Button>
                            <Button 
                                size="sm" 
                                disabled={isLoading}
                                onClick={() => {
                                    const p = payments.find((pay: InstallmentPaymentType) => pay.id === selectedPaymentId);
                                    if(p) handleAdvancePayment(p);
                                }}
                            >
                                {isLoading ? "Processing..." : "Confirm Payment"}
                            </Button>
                        </div>
                    </div>
                )}

                {plan && plan.status.toLowerCase() !== 'completed' && Number(plan.remaining_balance) <= 0 && (
                    <div className="mt-8 p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-md flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-green-700 dark:text-green-400">Balance Fully Paid!</h4>
                            <p className="text-xs text-green-600 dark:text-green-500">You can now complete this installment plan to finalize the sale.</p>
                        </div>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading}
                            onClick={() => {
                                toast.info("Finalize Installment Plan?", {
                                    description: "This will complete the sale and update inventory. This action is irreversible.",
                                    action: {
                                        label: "Complete Plan",
                                        onClick: async () => {
                                            setIsLoading(true);
                                            const toastId = toast.loading("Finalizing installment plan...");
                                            try {
                                                await completeInstallment({
                                                    plan_id: planId,
                                                    business_id: businessId
                                                });
                                                toast.success("Installment plan completed successfully!", { id: toastId });
                                                queryClient.invalidateQueries({ queryKey: ["get-installment-plan", planId] });
                                                queryClient.invalidateQueries({ queryKey: ["get-business-installment-plans"] });
                                            } catch (err: unknown) {
                                                const msg = err instanceof Error ? err.message : "Failed to complete plan";
                                                toast.error(msg, { id: toastId });
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }
                                    },
                                    cancel: {
                                        label: "Cancel",
                                        onClick: () => {}
                                    }
                                });
                            }}
                        >
                            {isLoading ? "Completing..." : "Complete Plan"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default InstallmentPaymentsModal;
