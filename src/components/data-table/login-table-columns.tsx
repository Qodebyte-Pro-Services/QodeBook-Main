import { Task } from "@/store/data/login-attempts-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { BadgeTwo } from "../ui/badge-two";

const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "deviceType",
        header: ({column}) => <DataTableColumnHeader column={column} title="Device Type" />,
        cell: ({row}) => <div>{row.getValue("deviceType")}</div>
    },
    {
        accessorKey: "ipAddress",
        header: ({column}) => <DataTableColumnHeader column={column} title="IP Address" />,
        cell: ({row}) => <div>{row.getValue("ipAddress")}</div>
    },
    {
        accessorKey: "time",
        header: ({column}) => <DataTableColumnHeader column={column} title="Time" />,
        cell: ({row}) => <div>{row.getValue("time")}</div>
    },
    {
        accessorKey: "location",
        header: ({column}) => <DataTableColumnHeader column={column} title="Location" />,
        cell: ({row}) => <div>{row.getValue("location")}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => {
            const status = row.getValue("status") as number;
            const variant =
                status === 1 ? "default" : "destructive";
            return (
                <BadgeTwo variant={variant} className="uppercase">
                    {status === 1 ? "Successful" : "Failed" }
                </BadgeTwo>
            );
            },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: "actions",
        cell: ({row}) => <DataTableRowActions row={row} />
    }
];

export {columns};