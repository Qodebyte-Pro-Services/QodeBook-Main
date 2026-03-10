"use client";

import { StaffResponseLogic } from "@/models/types/shared/handlers-type";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useDeleteStaffHandler } from "@/hooks/useControllers";
import {toast as reactToast} from "react-toastify";
import CustomDeleteHandler from "../dashboard/ui/custom-delete-handler";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import EditStaffForm from "../dashboard/staffs/forms/edit-staff-form";

const StaffActionsComp = ({original}: {original: StaffResponseLogic}) => {
    const router = useRouter();

    const [showStaffEdit, setShowStaffEdit] = useState<boolean>(false);

    const deleteStaffHandler = useDeleteStaffHandler();
    const queryClient = useQueryClient();
    
    const handleDeleteStaff = (id: string, business_id: number) => {
        reactToast(({closeToast}) => (
            <CustomDeleteHandler 
                closeToast={closeToast}
                onConfirm={async () => {
                    try {
                        await deleteStaffHandler.mutateAsync({id, businessId: +business_id}, {
                            onSuccess(data) {
                                toast.success(data?.message || "Staff List Deleted Successfully");
                                queryClient.invalidateQueries({
                                    queryKey: ["get-staff-list", business_id],
                                    refetchType: "active"
                                });
                            },
                            onError(err) {
                                toast.error("Error Occurred While deleting Staff: " + err?.message);
                            }
                        })
                    }catch(err) {
                        if (err instanceof Error) {
                            toast.error(err?.message || "Error Occurred while trying to delete staff creds");
                            return;
                        }
                        toast.error("Unexpected Error occurred while trying to delete staff creds")
                    }
                }}
                onCancel={() => toast?.info("Staff Credentials Stil Intact", {description: "No changes applied"})}
            />
        ));
    }
    
    return(
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => router.push(`/staff/${original?.staff_id}/${original?.full_name}`)}>
                    View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    setShowStaffEdit(true)
                }}>
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteStaff(original?.staff_id, original?.business_id)}>Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
            {showStaffEdit ? (
                <EditStaffForm
                    branchId={original?.branch_id}
                    businessId={original?.business_id}
                    onClose={() => setShowStaffEdit(false)}
                    staffList={original}
                />
            ) : null}
        </>
    )
}

const staffListColumn: ColumnDef<StaffResponseLogic>[] = [
    {
        accessorKey: "full_name",
        header: ({column}) => <DataTableColumnHeader title="Name" column={column} />,
        cell: ({row}) => <div>{row.getValue("full_name") || "N/A"}</div>
    },
    {
        accessorKey: "position_name",
        header: ({column}) => <DataTableColumnHeader title="Postion" column={column} />,
        cell: ({row}) => <div>{row.getValue("position_name") || "N/A"}</div>
    },
    {
        accessorKey: "staff_status",
        header: ({column}) => <DataTableColumnHeader title="Staff Status" column={column} />,
        cell: ({row}) => <div>{(row.getValue("staff_status") as string)?.replace(/\_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "N/A"}</div>
    },
    {
        accessorKey: "email",
        header: ({column}) => <DataTableColumnHeader title="Email" column={column} />,
        cell: ({row}) => <div>{row.getValue("email") || "N/A"}</div>
    },
    {
        accessorKey: "contact_no",
        header: ({column}) => <DataTableColumnHeader title="Phone" column={column} />,
        cell: ({row}) => <div>{row.getValue("contact_no") || "N/A"}</div>
    },
    {
        id: "actions",
        cell: ({row}) => <StaffActionsComp original={row?.original} />
    }
];

export default staffListColumn;