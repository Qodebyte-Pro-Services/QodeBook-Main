import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator} from "../ui/dropdown-menu";
import { CustomerResponse } from "@/models/types/shared/handlers-type";
import { toast } from "sonner";


const handleDeleteUser = async (data: CustomerResponse) => {
    toast.info("Delete User Account?",{
        description: "Are you sure you want to delete this user account?",
        action: (
            <div className="block">
                <button className="px-3 py-1.5 rounded-sm bg-red-500 text-white">Yes</button>
                <button className="px-3 py-1.5 rounded-sm bg-template-whitesmoke text-black">No</button>
            </div>
        )
    })
}

const customerColumns: ColumnDef<CustomerResponse>[] = [
    {
        accessorKey: "id",
        header: ({column}) => <DataTableColumnHeader column={column} title="ID"/>,
        cell: ({row}) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Name"/>,
        cell: ({row}) => <div>{row.getValue("name")}</div>
    },
    {
        accessorKey: "email",
        header: ({column}) => <DataTableColumnHeader column={column} title="Email"/>,
        cell: ({row}) => <div>{row.getValue("email")}</div>
    },
    {
        accessorKey: "phone",
        header: ({column}) => <DataTableColumnHeader column={column} title="Phone"/>,
        cell: ({row}) => <div>{row.getValue("phone")}</div>
    },
    {
        accessorKey: "is_verified",
        header: ({column}) => <DataTableColumnHeader column={column} title="Type"/>,
        cell: ({row}) => {
            const type = row.getValue("is_verified") as boolean;
            const typeData = type ? "Verified" : "Not-Verified";
            return(
                <BadgeTwo variant={type ? "default": "destructive"}>
                    {typeData}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({row}) => {
            const isWalkIn = (row.original as Record<string, unknown>)?.is_walk_in === true;
            return (
                <FlexibleDataTableRowActions>
                    {!isWalkIn && (
                        <>
                            <DropdownMenuItem onClick={() => location.href = `/customer/${row.original.id}`}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log(row)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(row.original)}>Delete</DropdownMenuItem>
                        </>
                    )}
                </FlexibleDataTableRowActions>
            );
        }
    }
];

export default customerColumns;