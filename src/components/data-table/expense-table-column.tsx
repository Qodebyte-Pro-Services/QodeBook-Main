import { ExpenseTask } from "@/store/data/expenses-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useMemo, useState } from "react";
import { ExpenseTableLogic } from "../dashboard/tables/expenses-table";
import { ExpenseCategoriesResponse } from "../dashboard/finances/forms/add-expense";
import { UpdateExpenseStatusForm } from "../dashboard/finances/forms/update-expense-status-form";
import { UpdatePaymentStatusForm } from "../dashboard/finances/forms/update-expense-payment-status";
import { useQueryClient } from "@tanstack/react-query";
import UpdateExpenseCategory from "../dashboard/finances/forms/update-expense-category";

const ExpenseRowActions = ({data}: {data: ExpenseTableLogic}) => {
    const [isViewOpen, setViewOpen] = useState<boolean>(false);
    const [isStatusUpdateOpen, setStatusUpdateOpen] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return;
        const id = sessionStorage.getItem("selectedBusinessId");
        return id ? JSON.parse(id) : 0;
    }, []);

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => setViewOpen(true)}>View</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="text-nowrap" 
                    onClick={() => setStatusUpdateOpen(true)}
                >
                    Update Expense Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPaymentOpen(true)} className="text-nowrap">Update Payment Status</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 font-[550]">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>

            <UpdateExpenseStatusForm
                isOpen={isStatusUpdateOpen}
                onClose={() => setStatusUpdateOpen(false)}
                expenseId={`${data?.id}`}
                businessId={businessId}
                currentStatus={data?.status}
                onSuccess={() => {
                    queryClient.invalidateQueries({
                        queryKey: ["get-expenses", businessId],
                        refetchType: "active"
                    });
                }}
            />

            <UpdatePaymentStatusForm
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                businessId={businessId}
                expenseId={`${data?.id}`}
                currentStatus={data?.payment_status}
                onSuccess={() => {
                    queryClient.invalidateQueries({
                        queryKey: ["get-expenses", businessId],
                        refetchType: "active"
                    });
                }}
            />

            <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-2xl rounded-lg">
                    <DialogHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                                </svg>
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Expense Details</DialogTitle>
                                <p className="text-sm text-muted-foreground">Transaction ID: {data?.id || '—'}</p>
                            </div>
                        </div>
                    </DialogHeader> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                        {/* Transaction Details */}
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Transaction Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Amount</p>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                        {new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", maximumFractionDigits: 2}).format(+data?.amount || 0)}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Category</p>
                                        <p className="text-sm font-medium">{data?.category_name || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Payment Method</p>
                                        <p className="text-sm font-medium">
                                            {data?.payment_method ? data.payment_method.replace(/\_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "—"}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                                    <p className="text-sm text-muted-foreground mt-1">{data?.description || "No description provided"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Business & Staff */}
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Business & Staff
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Business</p>
                                    <p className="text-sm font-medium">{data?.business_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Staff</p>
                                    <p className="text-sm font-medium">{data?.staff_name || "—"}</p>
                                </div>
                                {data?.receipt_url && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Receipt</p>
                                        <a 
                                            href={data.receipt_url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="inline-flex items-center text-sm text-primary hover:underline"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            View Receipt
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status & Activity */}
                        <div className="bg-muted/30 p-4 rounded-lg border md:col-span-2">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Status & Activity
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            data?.status === 'approved' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : data?.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}>
                                            {data?.status?.replace(/\b\w/g, c => c.toUpperCase()) || '—'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Payment Status</p>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            data?.payment_status === 'paid' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {data?.payment_status?.replace(/\b\w/g, c => c.toUpperCase()) || '—'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Expense Date</p>
                                    <p className="text-sm font-medium">
                                        {data?.expense_date ? (
                                            <span className="flex items-center">
                                                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                                {new Date(data.expense_date).toLocaleDateString("en-US", {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        ) : "—"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Created</p>
                                        <p className="text-sm">
                                            {data?.created_at ? (
                                                <span className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                                    {new Date(data.created_at).toLocaleDateString("en-US", {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            ) : "—"}
                                        </p>
                                    </div>
                                    {data?.approved_at && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Approved At</p>
                                            <p className="text-sm">
                                                <span className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                                                    {new Date(data.approved_at).toLocaleDateString("en-US", {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {(data?.approved_by_user_name || data?.approved_by_staff_name) && (
                                    <div className="mt-3">
                                        <p className="text-xs font-medium text-muted-foreground">Approved By</p>
                                        <p className="text-sm font-medium">{data.approved_by_user_name || data.approved_by_staff_name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

const ExpenseCategoryRowActions = ({data}: {data: ExpenseCategoriesResponse & {business_name: string}}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => setOpen(true)}>View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEdit(true)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 font-[550]">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-2xl rounded-lg">
                    <DialogHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Expense Category Details</DialogTitle>
                                <p className="text-sm text-muted-foreground">Detailed information about the expense category</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Basic Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Category Name</p>
                                    <p className="text-sm font-medium mt-1">{data?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                                    <p className="text-sm mt-1 text-muted-foreground">{data?.description || "No description provided"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Business Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Business Name</p>
                                    <p className="text-sm font-medium mt-1">{data?.business_name || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg border md:col-span-2">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Activity
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Created Date</p>
                                    <p className="text-sm mt-1">
                                        {data?.created_at ? (
                                            <span className="flex items-center">
                                                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                                {new Date(data.created_at).toLocaleDateString("en-US", {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        ) : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                                    <p className="text-sm mt-1">
                                        N/A
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {isEdit ? (
                <UpdateExpenseCategory
                    businessId={data?.business_id}
                    handleFormClose={() => setIsEdit(false)}
                    data={data}
                />
            ) : null}
        </>
    )
}

const columns: ColumnDef<ExpenseTableLogic>[] = [
    {
        accessorKey: "category_name",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({row}) => <div className="text-nowrap">{row.getValue("category_name")}</div>
    },
    {
        accessorKey: "amount",
        header: ({column}) => (
           <DataTableColumnHeader column={column} title="Amount" /> 
        ),
        cell: ({row}) => <div>{new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", compactDisplay:"short", maximumFractionDigits: 0}).format(+row.original?.amount || 0)}</div>
    },
    {
        accessorKey: "expense_date",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Expense Date" />
        ),
        cell: ({row}) => <div className="text-nowrap">{new Date(row.getValue("expense_date"))?.toLocaleDateString("default", {month: "short", day: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true})}</div>
    },
    {
        accessorKey: "staff_name",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Staff Name" />
        ),
        cell: ({row}) => <div className="text-nowrap">{row.getValue("staff_name") || "N/A"}</div>
    },
    {
        accessorKey: "payment_method",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Payment Method" />
        ),
        cell: ({row}) => (
            <BadgeTwo variant={"default"}>
                {row?.original?.payment_method?.replace(/\_/g, " ")?.replace(/\b\w/g, char => char?.toUpperCase()) || "N/A"}
            </BadgeTwo>
        )
    },
    {
        accessorKey: "business_name",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Business Name" />
        ),
        cell: ({row}) => <div className="text-nowrap">{row.getValue("business_name")}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({row}) => {
            const badgeStatus = row?.original?.status === "approved" ? "default" : (row?.original?.status === "pending" ? "secondary" : (row?.original?.status === "in_review" ? "processing" : "destructive"));
            return(
                <BadgeTwo variant={badgeStatus}>
                    {row.original?.status?.replace(/\b\w/g, char => char?.toUpperCase())}
                </BadgeTwo>
            );
        }
    },
    {
        accessorKey: "payment_status",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Payment Status" />
        ),
        cell: ({row}) => {
            const badgeStatus = row?.original?.payment_status === "completed" ? "default" : (row?.original?.status === "pending" ? "secondary" : "destructive");
            return(
                <BadgeTwo variant={badgeStatus}>
                    {row.original?.payment_status?.replace(/\b\w/g, char => char?.toUpperCase())}
                </BadgeTwo>
            );
        }
    },
    {
        id: "actions",
        cell: ({row}) => (
            <ExpenseRowActions data={row?.original} />
        )
    }
];

const expenseCategoryColumns: ColumnDef<ExpenseCategoriesResponse & {business_name: string}>[] = [
    {
        accessorKey: "id",
        header: ({column}) => <DataTableColumnHeader column={column} title="Category Id" />,
        cell: ({row}) => <div>{row?.index + 1}</div>
    },
    {
        accessorKey: "name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Category Name" />,
        cell: ({row}) => <div className="text-nowrap">{row?.original?.name || 'N/A'}</div>
    },
    {
        accessorKey: "description",
        header: ({column}) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({row}) => <div>{row?.original?.description || 'N/A'}</div>
    },
    {
        accessorKey: "business_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Business name" />,
        cell: ({row}) => (
            <BadgeTwo variant={"default"}>
                {row?.original?.business_name || "N/A"}
            </BadgeTwo>
        )
    },
    {
        accessorKey: "created_at",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({row}) => (
            <BadgeTwo variant={"processing"}>
                {new Date(row?.original?.created_at)?.toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true})}
            </BadgeTwo>
        )
    },
    {
        id: "actions",
        cell: ({row}) => (
            <ExpenseCategoryRowActions data={row?.original} />
        )
    }
] 

export {columns, expenseCategoryColumns};