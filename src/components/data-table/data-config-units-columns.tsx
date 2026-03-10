import { ConfigUnitTask } from "@/store/data/config-unit-data";
import { ConfigCategoryTask } from "@/store/data/config-category-data";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ProductAttributeValuesType } from "@/api/controllers/get/handler";
import { AttributeActionsCell } from "./attribute-actions-cell";

type TableData = ConfigUnitTask | ConfigCategoryTask | ConfigTaxesTask;

const createConfigUnitColumns = (business_id: number): ColumnDef<TableData>[] => [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Attribute ID" />,
        cell: ({ row }) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
        accessorKey: "values",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Values" />,
        cell: ({ row }) => {
            const values = row.getValue("values") as ProductAttributeValuesType[];
            return <div>{values?.length ? values.map((value: ProductAttributeValuesType) => value.value).join(", ") : "No values"}</div>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <AttributeActionsCell 
                row={row as { original: ConfigUnitTask }} 
                business_id={business_id} 
                label="unit"
            />
        )
    }
];

const configUnitColumn: ColumnDef<TableData>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Attribute ID" />,
        cell: ({ row }) => <div>{row.getValue("id")}</div>
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <div>{row.getValue("name")}</div>
    },
    {
        accessorKey: "values",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Values" />,
        cell: ({ row }) => {
            const values = row.getValue("values") as ProductAttributeValuesType[];
            return <div>{values?.length ? values.map((value: ProductAttributeValuesType) => value.value).join(", ") : "No values"}</div>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div>Actions</div>
        )
    }
];

export { configUnitColumn, createConfigUnitColumns };