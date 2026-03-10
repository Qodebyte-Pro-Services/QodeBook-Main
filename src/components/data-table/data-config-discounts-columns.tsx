import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ConfigDiscountsTask } from "@/store/data/config-discounts-data";
import { ConfigCouponsTask } from "@/store/data/config-coupons-data";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { ConfigUnitTask } from "@/store/data/config-unit-data";
import { ConfigCategoryTask } from "@/store/data/config-category-data";
import { AttributeActionsCell } from "./attribute-actions-cell";
import { BadgeTwo } from "../ui/badge-two";

type TableData = ConfigUnitTask | ConfigCategoryTask | ConfigTaxesTask | ConfigDiscountsTask | ConfigCouponsTask;

export const createConfigDiscountsColumns = (business_id: number): ColumnDef<TableData>[] => {
    return [
        {
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <div>{row.index + 1}</div>
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="font-medium text-nowrap">{row.getValue("name")}</div>
        },
        {
            accessorKey: "percentage",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Percentage" />,
            cell: ({ row }) => {
                const percentage = row.getValue("percentage") as string;
                return (
                    <BadgeTwo variant="secondary" className="font-mono">
                        {percentage}%
                    </BadgeTwo>
                );
            }
        },
        {
            accessorKey: "amount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Fixed Amount" />,
            cell: ({ row }) => {
                const amount = row.getValue("amount") as string;
                return <div className="font-mono">${amount}</div>;
            }
        },
        {
            accessorKey: "start_date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
            cell: ({ row }) => {
                const date = row.getValue("start_date") as string;
                return <div className="text-nowrap">{new Date(date).toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric"})}</div>
            }
        },
        {
            accessorKey: "end_date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
            cell: ({ row }) => {
                const date = row.getValue("end_date") as string;
                const endDate = new Date(date);
                const today = new Date();
                const isExpired = endDate < today;
                
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-nowrap">{endDate.toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric"})}</span>
                        {isExpired && (
                            <BadgeTwo variant="destructive" className="text-xs">
                                Expired
                            </BadgeTwo>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => {
                const description = row.getValue("description") as string;
                return (
                    <div className="max-w-[200px] truncate" title={description}>
                        {description || "-"}
                    </div>
                );
            }
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
                    row={row as { original: ConfigDiscountsTask }} 
                    business_id={business_id}
                    label="discounts"
                />
            )
        }
    ]
}
