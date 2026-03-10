"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { BudgetReponseLogic } from "../dashboard/tables/budget-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { DataTableRowActions } from "./data-table-row-actions";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Edit, Eye, RefreshCcw, Trash, DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { CgSpinner } from "react-icons/cg";
import EditBudgetForm from "../dashboard/finances/forms/edit-budget-form";
import { useUpdateBudgetStatusHandler, useUserData } from "@/hooks/useControllers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserDetails } from "@/api/controllers/get/handler";
import { AnimatePresence, motion } from "framer-motion";
import { GiPayMoney } from "react-icons/gi";
import { LiaTimesSolid } from "react-icons/lia";
import { FiSave } from "react-icons/fi";
import { useCustomStyles } from "@/hooks";
import Cookies from "js-cookie";

interface BudgetRowActionsProps {
    data: BudgetReponseLogic;
}

const BudgetRowActions = ({ 
    data, 
}: BudgetRowActionsProps) => {
    const [isViewOpen, setViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showEditStatus, setShowEditStatus] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const {hiddenScrollbar} = useCustomStyles();

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return;
        const id = sessionStorage.getItem("selectedBusinessId");
        return id ? JSON.parse(id) : 0;
    }, []);

    const [status, setStatus] = useState<string>("");
    const [rejectionReason, setRejectionReason] = useState<string>("");

    const budgetStatusHandler = useUpdateBudgetStatusHandler();

    const userId = useMemo(() => {
        if (typeof window === "undefined") return;
        const id = Cookies.get("authUserId");
        return id ? +id : 0;
    }, []);

    const handleView = () => {
        setViewOpen(true);
    };

    const handleEdit = () => {
        
    };

    const handleStatusUpdate = useCallback(async () => {
        if (!status) {
            toast.info("Please select a status");
            return;
        };
        setIsUpdating(true);
        const {id: budgetId} = data;
        const payload = {
            budgetId,
            businessId,
            action: status,
            approverId: `${userId}`,
            role: "user",
            rejection_reason: rejectionReason
        }
        try {
            await budgetStatusHandler.mutateAsync(payload, {
                onSuccess(data) {
                    console.log(data);
                    toast.success("Budget status updated successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["get-budgets", businessId]
                    });
                    setTimeout(() => setShowEditStatus(false), 2000);
                },
                onError(err) {
                    toast.error("Failed to update budget status. Please try again.");
                    if (process.env.NEXT_PUBLIC_NODE_MODE === "DEV") {
                        console.error("Error updating budget status:", err);
                    }
                }
            });  
        } catch (error) {
            console.error("Error updating budget status:", error);
            toast.error("Failed to update budget status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    }, [status, rejectionReason, businessId, data.id, queryClient]);

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            toast.success("Budget deleted successfully");
        } catch (error) {
            console.error("Error deleting budget:", error);
            toast.error("Failed to delete budget. Please try again.");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem
                    onClick={handleView}
                    className="cursor-pointer hover:bg-accent/50"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={() => setShowEditStatus(true)}
                    className="cursor-pointer hover:bg-accent/50 text-nowrap"
                >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Update Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </FlexibleDataTableRowActions>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the budget for {data.category_name}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <CgSpinner className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash className="mr-2 h-4 w-4" />
                            )}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Budget Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-2xl rounded-lg">
                    <DialogHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Budget Details</DialogTitle>
                                <p className="text-sm text-muted-foreground">Budget ID: {data?.id || '—'}</p>
                            </div>
                        </div>
                    </DialogHeader> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                        {/* Budget Details */}
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <DollarSign className="h-4 text-green-500 w-4 mr-2" />
                                Budget Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Category</p>
                                    <p className="text-sm font-medium">{data?.category_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Amount</p>
                                    <p className="text-sm font-medium">
                                        {new Intl.NumberFormat("en-NG", {
                                            style: 'currency',
                                            currency: 'NGN',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(Number(data?.amount) || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Budget Spent</p>
                                    <p className="text-sm font-medium">
                                        {new Intl.NumberFormat("en-NG", {
                                            style: 'currency',
                                            currency: 'NGN',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(Number(data?.budget_spent) || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Budget Remaining</p>
                                    <p className="text-sm font-medium">
                                        {new Intl.NumberFormat("en-NG", {
                                            style: 'currency',
                                            currency: 'NGN',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(Number(data?.budget_remaining) || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Period Details */}
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Period Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Period Start</p>
                                    <p className="text-sm font-medium">
                                        {data?.period_start ? new Date(data.period_start).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Period End</p>
                                    <p className="text-sm font-medium">
                                        {data?.period_end ? new Date(data.period_end).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Budget Month</p>
                                    <p className="text-sm font-medium">{data?.budget_month || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Budget Year</p>
                                    <p className="text-sm font-medium">{data?.budget_year || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2 bg-muted/30 p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                                    <BadgeTwo variant={data?.status === 'approved' ? 'default' : 'destructive'}>
                                        {data?.status?.charAt(0).toUpperCase() + data?.status?.slice(1) || '—'}
                                    </BadgeTwo>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Budget Utilization</p>
                                    <div className="flex items-center justify-end">
                                        {Number(data?.budget_spent) > Number(data?.amount) ? (
                                            <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {((Number(data?.budget_spent) / Number(data?.amount)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {isEditOpen ? (
                <EditBudgetForm
                    handleFormClose={() => setIsEditOpen(false)}
                    data={data}
                    businessId={businessId}
                />
            ) : null}

            {showEditStatus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                        onClick={() => setShowEditStatus(false)}
                    />
                    <AnimatePresence>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                            className="relative z-20 w-[92%] mx-auto md:max-w-lg shadow-2xl rounded-xl overflow-hidden bg-white"
                        >
                            <div className="py-5 px-5 md:px-6 bg-gradient-to-r from-template-primary via-template-primary/90 to-template-primary/80">
                                <div className="flex items-center gap-x-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/15 backdrop-blur-md shadow-inner">
                                        <GiPayMoney size={22} className="text-white" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-base md:text-lg font-semibold text-white tracking-tight">Update Budget Status</h2>
                                        <p className="text-[11px] md:text-xs font-medium text-white/80">Manage approval or rejection for this budget</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowEditStatus(false)} 
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 cursor-pointer transition-colors duration-200 flex items-center justify-center text-white/80 hover:text-white"
                                >
                                    <LiaTimesSolid size={18} />
                                </button>
                            </div>
                
                            <div className="max-h-[65vh] px-5 md:px-6 py-6 overflow-y-auto" style={{ ...hiddenScrollbar }}>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-200 focus:ring-template-primary/20">
                                                <SelectValue placeholder="Select an action..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="approve" className="cursor-pointer">
                                                    <span className="flex items-center gap-2 text-emerald-600">
                                                        Approve Budget
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="reject" className="cursor-pointer">
                                                    <span className="flex items-center gap-2 text-red-600">
                                                        Reject Budget
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {status === "reject" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason for Rejection</Label>
                                                <Textarea 
                                                    value={rejectionReason} 
                                                    onChange={(e) => setRejectionReason(e.target.value)} 
                                                    rows={4} 
                                                    className="w-full resize-none bg-gray-50/50 border-gray-200 focus:ring-template-primary/20 min-h-[100px]" 
                                                    placeholder="Please provide a reason for rejecting this budget..."
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                
                            <div className="flex items-center justify-end gap-3 p-5 bg-gray-50/50 border-t border-gray-100">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowEditStatus(false)}
                                    className="h-10 px-6 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleStatusUpdate}
                                    disabled={isUpdating || !status || (status === 'reject' && !rejectionReason.trim())}
                                    className="h-10 px-6 bg-template-primary hover:bg-template-primary/90 text-white shadow-sm min-w-[120px]"
                                >
                                    {isUpdating ? (
                                        <>
                                            <CgSpinner size={16} className="animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={16} className="mr-2" />
                                            Update
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </>
    );
};

export const budgetColumn: ColumnDef<BudgetReponseLogic>[] = [
    {
        accessorKey: "category_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({row}) => <div className="text-nowrap">{row?.original?.category_name || "N/A"}</div>
    },
    {
        accessorKey: "amount",
        header: ({column}) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({row}) => <div>{new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", compactDisplay:"short", maximumFractionDigits: 0}).format(+row.original?.amount || 0)}</div>
    },
    {
        accessorKey: "period_start",
        header: ({column}) => <DataTableColumnHeader column={column} title="Period Start" />,
        cell: ({row}) => <div className="text-nowrap">{new Date(row?.original?.period_start)?.toLocaleDateString("default", {month: "short", year: "numeric", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true})}</div>
    },
    {
        accessorKey: "period_end",
        header: ({column}) => <DataTableColumnHeader column={column} title="Period End" />,
        cell: ({row}) => <div className="text-nowrap">{new Date(row?.original?.period_end)?.toLocaleDateString("default", {month: "short", year: "numeric", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true})}</div>
    },
    {
        accessorKey: "budget_month",
        header: ({column}) => <DataTableColumnHeader column={column} title="Budget Month" />,
        cell: ({row}) => <div className="text-nowrap">{row.original?.budget_month || "N/A"}</div>
    },
    {
        accessorKey: "budget_year",
        header: ({column}) => <DataTableColumnHeader column={column} title="Budget Remaining" />,
        cell: ({row}) => <div className="text-nowrap">{new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", compactDisplay:"short", maximumFractionDigits: 0}).format(+row.original?.budget_remaining || 0)}</div>
    },
    {
        accessorKey: "budget_spent",
        header: ({column}) => <DataTableColumnHeader column={column} title="Budget Spent" />,
        cell: ({row}) => <div className="text-nowrap">{new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", compactDisplay:"short", maximumFractionDigits: 0}).format(+row.original?.budget_spent || 0)}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => {
            const badgeStatus = row?.original?.status === "approved" ? "default" : (row?.original?.status === "pending" ? "secondary" : "destructive");
            return(
                <BadgeTwo variant={badgeStatus}>
                    {row.original?.status?.replace(/\b\w/g, char => char?.toUpperCase())}
                </BadgeTwo>
            );
        }
    },
    {
        id: "actions",
        cell: ({row}) => (
            <BudgetRowActions data={row?.original} />
        )
    }
];