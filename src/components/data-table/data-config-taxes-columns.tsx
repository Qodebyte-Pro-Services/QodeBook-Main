import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
// import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
// import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { ConfigUnitTask } from "@/store/data/config-unit-data";
import { ConfigCategoryTask } from "@/store/data/config-category-data";
import { AttributeActionsCell } from "./attribute-actions-cell";
import { BadgeTwo } from "../ui/badge-two";

type TableData = ConfigUnitTask | ConfigCategoryTask | ConfigTaxesTask;

export const createConfigTaxesColumns = (business_id: number): ColumnDef<TableData>[] => {
    return [
        {
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tax ID" />,
            cell: ({ row }) => <div>{row.index + 1}</div>
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tax Name" />,
            cell: ({ row }) => <div>{row.getValue("name")}</div>
        },
        {
            accessorKey: "rate",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tax Rate" />,
            cell: ({ row }) => <div>{row.getValue("rate")}</div>
        },
        {
            accessorKey: "type",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tax Type" />,
            cell: ({ row }) => (
                <BadgeTwo variant={"default"} className="uppercase">
                    {row.getValue("type")}
                </BadgeTwo>
            )
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
            cell: ({ row }) => <div>{new Date(row.getValue("created_at")).toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric"})}</div>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <AttributeActionsCell
                    row={row as { original: ConfigTaxesTask }} 
                    business_id={business_id}
                    label="taxes"
                />
            )
        }
    ]
}