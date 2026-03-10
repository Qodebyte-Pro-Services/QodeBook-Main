import { SalesSchema } from "@/store/data/sales-table-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useState } from "react";
import SalesInvoice from "@/components/dashboard/sales/invoice/SalesInvoice";

const ActionsCellHandler = ({row}: {row: {original: SalesSchema}}) => {
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState<boolean>(false);
    
    return (
        <>  
            <FlexibleDataTableRowActions>
                <DropdownMenuItem 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsViewDetailsOpen(true);
                    }}
                >
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                    className="text-red-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete logic here
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </FlexibleDataTableRowActions>
            
            {isViewDetailsOpen && (
                <>
                    <SalesInvoice 
                        onClose={() => setIsViewDetailsOpen(false)}
                        sale={row.original}
                    />
                    <div className="fixed inset-0 backdrop-blur-[4px] w-full h-full z-10" />
                </>
            )}
        </>
    )
};

const salesColumn: ColumnDef<SalesSchema>[] = [
    {
        accessorKey: "id",
        header: ({column}) => <DataTableColumnHeader column={column} title="Invoice No" />,
        cell: ({row}) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "created_at",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date & Time" />,
        cell: ({row}) => <div className="text-nowrap">{new Date(row.getValue('created_at')).toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true})}</div>
    },
    {
        accessorKey: "customer_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({row}) => <div className="text-nowrap">{row.getValue("customer_name") ?? "Walk In"}</div>
    },
    {
        accessorKey: "payments",
        header: ({column}) => <DataTableColumnHeader column={column} title="Payment" />,
        cell: ({row}) => {
            return <div className="text-nowrap">{row?.original?.payments?.length > 1 ? row?.original?.payments?.map(payment => payment?.method)?.join(", ")?.replace(/\b\w/g, char => char.toUpperCase())?.replace(/\_/g, "-") : row?.original?.payments?.[0]?.method?.replace(/\b\w/g, char => char?.toUpperCase())?.replace(/\_/g, "-")}</div>
        }
    },
    {
        accessorKey: "recorded_by_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Recorded By" />,
        cell: ({row}) => <div className="text-nowrap">{row.getValue("recorded_by_name") ?? "N/A"}</div>
    },
    {
        accessorKey: "discount_total",
        header: ({column}) => <DataTableColumnHeader column={column} title="Discount" />,
        cell: ({row}) => (
            <BadgeTwo variant={"default"}>{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", currencySign: "standard", maximumFractionDigits: 0}).format(row.getValue("discount_total"))}</BadgeTwo>
        )
    },
    {
        accessorKey: "total_amount",
        header: ({column}) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({row}) => <div>{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", currencySign: "standard", maximumFractionDigits: 0}).format(row.getValue("total_amount"))}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => {
            const variantColorId = row.getValue("status") === "completed" ? "default" : row.getValue("status") === "pending" ? "processing" : "destructive";
            return(
                <BadgeTwo variant={variantColorId}>
                    {(row.getValue("status")as string).charAt(0).toUpperCase() + (row.getValue("status") as string).slice(1)}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({row}) => <ActionsCellHandler row={row} />
    }
];

export default salesColumn;