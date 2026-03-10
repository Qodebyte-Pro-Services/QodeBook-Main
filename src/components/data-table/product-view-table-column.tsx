import { ProductTableViewTask } from "@/store/data/product-view-table-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

const productViewTableColumn: ColumnDef<ProductTableViewTask>[] = [
    {
        accessorKey: "date",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({row}) => <div>{row.getValue("date")}</div>
    },
    {
        accessorKey: "type",
        header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({row}) => <div>{row.getValue("type")}</div>
    },
    {
        accessorKey: "quantity",
        header: ({column}) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({row}) => <div>{row.getValue("quantity")}</div>
    },
    {
        accessorKey: "reference",
        header: ({column}) => <DataTableColumnHeader column={column} title="Reference" />,
        cell: ({row}) => <div>{row.getValue("reference")}</div>
    },
    {
        accessorKey: "staff",
        header: ({column}) => <DataTableColumnHeader column={column} title="Staff" />,
        cell: ({row}) => <div>{row.getValue("staff")}</div>
    },
    {
        accessorKey: "note",
        header: ({column}) => <DataTableColumnHeader column={column} title="Note" />,
        cell: ({row}) => <div>{row.getValue("note")}</div>
    },
    {
        id: "actions",
        cell: ({row}) => (
            <FlexibleDataTableRowActions row={row}>
                <DropdownMenuItem onClick={() => console.log(row)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log(row)}>Cancel</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Invoice</DropdownMenuItem>           
            </FlexibleDataTableRowActions>
        )
    }
];

export default productViewTableColumn;