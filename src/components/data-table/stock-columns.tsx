import { StockTask } from "@/store/data/stock-management-data";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useState } from "react";
import { StockTaskInvoice } from "@/components/dashboard/invoices";

const StockColumnFooter = ({row}: {row: Row<StockTask>}) => {
    const [selectedTask, setSelectedTask] = useState<StockTask | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    
    const handleView = (task: StockTask) => {
        setSelectedTask(task);
        setIsOpen(true);
    };

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => handleView(row.original)}>
                    View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
            
            <StockTaskInvoice 
                stockTask={selectedTask}
                open={isOpen}
                onOpenChange={setIsOpen}
            />
        </>
    );
}

const stockColumn: ColumnDef<StockTask>[] = [
    {
        accessorKey: "sku",
        header: ({column}) => <DataTableColumnHeader column={column} title="Item" />,
        cell: ({row}) => <div>{row.getValue("sku") ?? "N/A"}</div>
    },
    {
        accessorKey: "created_at",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({row}) => <div>{new Date(row.getValue("created_at")).toLocaleDateString("default", {month: "long", day: "numeric", year: "numeric"})}</div>
    },
    {
        accessorKey: "type",
        header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({row}) => {
            const type = row.getValue("type") as string;
            return(
                <div className={`capitalize ${type.toLowerCase() === "adjustment" ? "text-template-chart-store" : (type.toLowerCase() === "restock" ? "text-template-blue" : "text-template-chart-gas")}`}>{type}</div>
            )
        }
    },
    {
        accessorKey: "quantity",
        header: ({column}) => <DataTableColumnHeader column={column} title="Quantity" />,
        cell: ({row}) => <div>{(row.getValue("quantity") as number) > 0 ? "+" + row.getValue("quantity") : row.getValue("quantity")}</div>
    },
    {
        accessorKey: "recorded_by_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Added By" />,
        cell: ({row}) => <div>{row.getValue("recorded_by_name") ?? "N/A"}</div>
    },
    {
        accessorKey: "reason",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => {
            const statusType = row.getValue("reason") as string;
            const statusLabel = statusType.toLowerCase() === "increase" ? "default" : "destructive";
            return(
                <BadgeTwo variant={statusLabel}>
                    {statusType.toUpperCase()}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({row}) => <StockColumnFooter row={row} />
    }
];

export {stockColumn};