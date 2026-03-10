import { ColumnDef } from "@tanstack/react-table";
import { PaymentHistoryResponse } from "../dashboard/tables/staff-salary-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, User, CreditCard, FileText, CheckCircle, Receipt } from "lucide-react";
import { useCustomStyles } from "@/hooks";


const ActionButtons = ({ row }: { row: PaymentHistoryResponse }) => {
    const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
    const {hiddenScrollbar} = useCustomStyles();

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => setIsViewOpen(true)}>View Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-500" />
                            Payment Details
                        </DialogTitle>
                        <DialogDescription>
                            Transaction ID: #{row?.id}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4 max-h-[75vh] overflow-y-auto" style={hiddenScrollbar}>
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-2">
                            <span className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Total Amount</span>
                            <div className="flex items-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                                {parseFloat(row?.amount)?.toLocaleString("default", {currency: "NGN", style: "currency", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2})}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium mt-2">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approved
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 p-3 rounded-lg bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    <User className="w-3.5 h-3.5" />
                                    Staff Member
                                </div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100 pl-5.5">
                                    {row?.staff_name?.replace(/\b\w/g, char => char.toUpperCase())}
                                </div>
                            </div>

                            <div className="space-y-1 p-3 rounded-lg bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Payment Method
                                </div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100 pl-5.5">
                                    {row?.payment_method?.replace(/\_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}
                                </div>
                            </div>

                            <div className="space-y-1 p-3 rounded-lg bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Payment Date
                                </div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100 pl-5.5">
                                    {new Date(row?.payment_date).toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })}
                                </div>
                            </div>

                            <div className="space-y-1 p-3 rounded-lg bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approved By
                                </div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100 pl-5.5">
                                    {row?.approved_by_role}
                                </div>
                            </div>
                        </div>

                        {row?.receipt_url && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    <Receipt className="w-4 h-4 text-zinc-500" />
                                    Payment Receipt
                                </div>
                                <div 
                                    className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setIsReceiptOpen(true)}
                                >
                                    <Image
                                        src={row.receipt_url}
                                        alt="Payment Receipt"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={row?.receipt_url}
                            alt="Payment Receipt Full View"
                            fill
                            className="object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

const staffHistoryColumns: ColumnDef<PaymentHistoryResponse>[] = [
    {
        accessorKey: "staff_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Staff Name"/>,
        cell: ({row}) => <div className="text-nowrap">{row?.original?.staff_name?.replace(/\b\w/g, char => char.toUpperCase())}</div>
    },
    {
        accessorKey: "amount",
        header: ({column}) => <DataTableColumnHeader column={column} title="Amount"/>,
        cell: ({row}) => <div className="text-nowrap">{parseFloat(row?.original?.amount)?.toLocaleString("default", {currency: "NGN", style: "currency", currencyDisplay: "narrowSymbol"})}</div>
    },
    {
        accessorKey: "payment_method",
        header: ({column}) => <DataTableColumnHeader column={column} title="Payment Method"/>,
        cell: ({row}) => <div className="text-nowrap">{row?.original?.payment_method?.replace(/\_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}</div>
    },
    {
        accessorKey: "payment_date",
        header: ({column}) => <DataTableColumnHeader column={column} title="Payment Date"/>,
        cell: ({row}) => <div className="text-nowrap">{new Date(row?.original?.payment_date)?.toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric"})}</div>
    },
    {
        accessorKey: "approved_by_role",
        header: ({column}) => <DataTableColumnHeader column={column} title="Approved By Role"/>,
        cell: ({row}) => <div className="text-nowrap">{row?.original?.approved_by_role}</div>
    },
    {
        accessorKey: "approved_at",
        header: ({column}) => <DataTableColumnHeader column={column} title="Approved At"/>,
        cell: ({row}) => <div className="text-nowrap">{new Date(row?.original?.approved_at)?.toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric"})}</div>
    },
    {
        id: "actions",
        cell: ({row}) => <ActionButtons row={row?.original} />
    }
];

export default staffHistoryColumns;
