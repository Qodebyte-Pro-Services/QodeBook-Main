import { CustomerOrderType } from "@/store/data/customer-order-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const customerOrderColumn: ColumnDef<CustomerOrderType>[] = [
    {
        accessorKey: "id",
        header: ({column}) => <DataTableColumnHeader column={column} title="ID"/>,
        cell: ({row}) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "date",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date"/>,
        cell: ({row}) => <div>{row.getValue("date")}</div>
    },
    {
        accessorKey: "details",
        header: ({column}) => <DataTableColumnHeader column={column} title="Details"/>,
        cell: ({row}) => <div>{row.getValue("details")}</div>
    },
    {
        accessorKey: "payment",
        header: ({column}) => <DataTableColumnHeader column={column} title="Payment"/>,
        cell: ({row}) => <div>{row.getValue("payment")}</div>
    },
    {
        accessorKey: "amount",
        header: ({column}) => <DataTableColumnHeader column={column} title="Amount"/>,
        cell: ({row}) => <div>{row.getValue("amount")}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status"/>,
        cell: ({row}) => {
            const statusCode = row.getValue("status") as number;
            const status = statusCode === 0 ? "Pending" : (statusCode === 1 ? "Completed" : "Cancelled");
            const statusBadge = statusCode === 0 ? "processing" : (statusCode === 1 ? "default" : "destructive");
            return <BadgeTwo variant={statusBadge}>{status}</BadgeTwo>
        }
    },
    {
        id: "actions",
        cell: ({row}) => (
            <FlexibleDataTableRowActions>
                <DropdownMenuItem className="text-red-500" onClick={() => console.log(row)}>Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
        )
    }
];

export default customerOrderColumn;