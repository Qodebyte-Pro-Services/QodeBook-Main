"use client";
import { useEffect, useState } from "react";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import EditCategoryForm from "../dashboard/inventory/forms/edit-category-form";
import { ConfigCategoryTask } from "@/store/data/config-category-data";
import CustomDeleteHandler from "../dashboard/ui/custom-delete-handler";
import { toast as reactToast } from "react-toastify";
import { toast } from "sonner";
import { useDeleteCategory } from "@/hooks/useControllers";
import { useRouter } from "next/navigation";
import { useCustomDeleteHandler } from "@/store/state/lib/ui-state-manager";
import { useQueryClient } from "@tanstack/react-query";

interface CategoryActionsCellProps {
    row: {
        original: ConfigCategoryTask;
    };
    business_id: number;
}

export const CategoryActionsCell = ({ row, business_id }: CategoryActionsCellProps) => {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const {setTitle} = useCustomDeleteHandler();
    const queryclient = useQueryClient();

    useEffect(() => {
        setTitle("Category");
    }, [setTitle]);

    const handleEditClick = () => {
        setIsEditOpen(true);
    };

    const handleEditClose = () => {
        setIsEditOpen(false);
    };

    const deleteCategoryHandler = useDeleteCategory();
    
    const handleDeleteCategory = async ({id}: {id: number}) => {
        const req_data: { id: number; businessId: number } = { id, businessId: +business_id };

        reactToast(({ closeToast }) => (
            <CustomDeleteHandler
                closeToast={closeToast}
                onConfirm={async () => {
                    try {
                        await deleteCategoryHandler.mutateAsync(req_data, {
                            onSuccess: async (data) => {
                                toast.success(data?.messsage ?? "Product Category Deleted Successfully");
                                queryclient?.invalidateQueries({
                                    queryKey: ["get-categories", business_id],
                                    refetchType: "active"
                                });
                            },
                            onError: (err) => {
                                if (err instanceof Error) {
                                    toast.error(err.message ?? "Error Occurred while Trying To Delete Product Category");
                                    return;
                                }
                                toast.error("Unexpected Error Occurred While Trying To Delete Product Category");
                            },
                        });
                    } catch (err) {
                        toast.error("Error Occurred While Trying To Delete Product Category");
                    }
                }}
                onCancel={() => {
                    toast.info("Operation was cancelled Successfully");
                }}
            />
        ));
    }

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteCategory({id: row.original.id})} className="text-red-500">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
            
            {isEditOpen && (
                <EditCategoryForm
                    handleFormClose={handleEditClose}
                    business_id={business_id}
                    categoryData={row.original}
                />
            )}
        </>
    );
};
