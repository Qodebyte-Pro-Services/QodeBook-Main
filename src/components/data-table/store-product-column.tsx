import { StoreProductTask } from "@/store/data/store-products-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

const convertToBinary = (num: number | string) => {
    return num.toString(2);
}

const columns: ColumnDef<StoreProductTask>[] = [
    {
        accessorKey: "base_sku",
        header: ({column}) => <DataTableColumnHeader column={column} title="Base SKU" />,
        cell: ({row}) => <div className="text-nowrap">{row.getValue("base_sku")}</div>
    },
    {
        accessorKey: "name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Product Name" />,
        cell: ({row}) => <div className="text-nowrap">{row.getValue("name")}</div>
    },
    {
        accessorKey: "category_name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Category" />,
        cell: ({row}) => <div>{row.getValue("category_name")}</div>
    },
    {
        accessorKey: "brand",
        header: ({column}) => <DataTableColumnHeader column={column} title="Brand" />,
        cell: ({row}) => <div>{row.getValue("brand")}</div>
    },
    {
        accessorKey: "total_variant_qty",
        header: ({column}) => <DataTableColumnHeader column={column} title="Quantity" />,
        cell: ({row}) => <div>{row.getValue("total_variant_qty") || "N/A"}</div>
    },
    {
        accessorKey: "hasVariation",
        header: ({column}) => <DataTableColumnHeader column={column} title="Has Variation" />,
        cell: ({row}) => {
            const hasVariation = row.getValue("hasVariation") as boolean;
            return(
                <BadgeTwo variant={hasVariation ? "default" : "destructive"} className="uppercase">
                    {hasVariation ? "Yes" : "No"}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({row}) => (
            <FlexibleDataTableRowActions>
                <DropdownMenuItem className="cursor-pointer" onClick={() => location.href = `/product-view/${convertToBinary(row.original.id)}/${row.original.base_sku}`}>View</DropdownMenuItem>
                {/* <DropdownMenuItem className="cursor-pointer" onClick={() => location.href = `/product-edit/${row.original.id}`}>Edit</DropdownMenuItem> */}
                {/* <DropdownMenuItem className="cursor-pointer" onClick={() => console.log(row)}>Restock</DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
        )
    }
];

export {columns};