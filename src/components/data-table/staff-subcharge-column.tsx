import { ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuSeparator, DropdownMenuItem } from "../ui/dropdown-menu";
import { StaffResponseLogic } from "@/models/types/shared/handlers-type";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileSearch, X } from "lucide-react";
import EditStaffSubcharges from "../dashboard/staffs/forms/edit-staff-subcharge";

const subchargeSchema = z.object({
    id: z.string(),
    business_id: z.number(),
    staff_id: z.string(),
    sub_charge_amt: z.string(),
    reason: z.string(),
    created_at: z.string()
});

type StaffSubchargeLogic = z.infer<typeof subchargeSchema>;

const StaffSubchargeActionsComp = ({ original }: { original: StaffSubchargeLogic & Partial<StaffResponseLogic> }) => {
    const [showView, setShowView] = useState<boolean>(false);
    const [showUpdateSubcharge, setShowUpdateSubcharge] = useState<boolean>(false);

    const amount = Number(original?.sub_charge_amt ?? 0);
    const formattedAmount = isNaN(amount) ? original?.sub_charge_amt ?? "0" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "narrowSymbol" }).format(amount);
    const formattedDate = original?.created_at ? new Date(original.created_at).toLocaleString() : "N/A";

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => setShowView(true)}>View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowUpdateSubcharge(true)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 font-[550]">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>

            <AnimatePresence>
                {showView ? (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowView(false)} />
                        <motion.div 
                            className="relative z-10 w-[94%] sm:w-[90%] max-w-md rounded-xl bg-white shadow-2xl"
                            initial={{ y: 16, scale: 0.98, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 16, scale: 0.98, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        >
                            <div className="px-5 py-4 border-b bg-gradient-to-r from-template-primary/15 to-transparent flex items-center gap-3">
                                <div className="h-9 w-9 rounded-md bg-template-primary/10 flex items-center justify-center text-template-primary">
                                    <FileSearch className="h-4 w-4" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-800">Subcharge</h3>
                                <button 
                                    onClick={() => setShowView(false)}
                                    className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-5 space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Staff</span>
                                    <span className="font-medium text-gray-900">{original?.full_name ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Contact</span>
                                    <span className="text-gray-900">{original?.contact_no ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs font-semibold">{formattedAmount}</span>
                                </div>
                                <div className="flex items-start justify-between gap-6">
                                    <span className="text-gray-500 mt-0.5">Reason</span>
                                    <span className="text-gray-900 text-right max-w-[65%] leading-relaxed">{original?.reason ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">{formattedDate}</span>
                                </div>
                            </div>
                            <div className="px-5 pb-5 pt-2 flex justify-end">
                                <button 
                                    className="px-4 py-2 text-sm font-semibold bg-template-primary text-white rounded-md hover:opacity-95 active:scale-[0.99] transition"
                                    onClick={() => setShowView(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
                {showUpdateSubcharge ? (
                    <EditStaffSubcharges
                        staff_subcharges={original}
                        handleFormClose={() => setShowUpdateSubcharge(false)}
                    />
                ) : null}
            </AnimatePresence>
        </>
    );
}

const staffSubchargeColumn: ColumnDef<StaffSubchargeLogic & Partial<StaffResponseLogic>>[] = [
    {
        accessorKey: "id",
        header: ({column}) => <DataTableColumnHeader column={column} title="Subcharge No." />,
        cell: ({row}) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "Staff Name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Staff Name" />,
        cell: ({row}) => <div>{row.original.full_name}</div>
    },
    {
        accessorKey: "contact_no",
        header: ({column}) => <DataTableColumnHeader column={column} title="Staff Name" />,
        cell: ({row}) => <div>{row.original.contact_no}</div>
    },
    {
        accessorKey: "sub_charge_amt",
        header: ({column}) => <DataTableColumnHeader column={column} title="Subcharge Amount" />,
        cell: ({row}) => <div>{row.original.sub_charge_amt || 0}</div>
    },
    {
        accessorKey: "reason",
        header: ({column}) => <DataTableColumnHeader column={column} title="Reason" />,
        cell: ({row}) => <div className="w-[240px]">{row.original.reason}</div>
    },
    {
        id: "actions",
        cell: ({row}) => (
            <StaffSubchargeActionsComp original={row.original} />
        )
    }
];

export default staffSubchargeColumn;