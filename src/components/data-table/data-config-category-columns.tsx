import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ConfigCategoryTask } from "@/store/data/config-category-data";
import { ConfigUnitTask } from "@/store/data/config-unit-data";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { CategoryActionsCell } from "./category-actions-cell";

type TableData = ConfigUnitTask | ConfigCategoryTask | ConfigTaxesTask;

const createConfigCategoryColumns = (business_id: number): ColumnDef<TableData>[] => [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category ID" />,
        cell: ({ row }) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <CategoryActionsCell 
                row={row as { original: ConfigCategoryTask }} 
                business_id={business_id} 
            />
        )
    }
];

const configCategory: ColumnDef<TableData>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category ID" />,
        cell: ({ row }) => <div>{row.getValue("id")}</div>
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div>Actions</div>
        )
    }
];

export { configCategory, createConfigCategoryColumns };