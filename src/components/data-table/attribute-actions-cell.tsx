"use client";
import { useEffect, useState } from "react";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import EditAttributeForm from "../dashboard/inventory/forms/edit-attribute-form";
import { ConfigUnitTask } from "@/store/data/config-unit-data";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { ConfigDiscountsTask } from "@/store/data/config-discounts-data";
import { ConfigCouponsTask } from "@/store/data/config-coupons-data";
import EditTaxesForm from "../dashboard/inventory/forms/edit-taxes-form";
import EditDiscountsForm from "../dashboard/inventory/forms/edit-discounts-form";
import EditCouponsForm from "../dashboard/inventory/forms/edit-coupons-form";
import { LinkToProductModal } from "../dashboard/inventory/link-to-product-modal";
import { LinkedProductsModal } from "../dashboard/inventory/linked-products-modal";
import { useDeleteCoupons, useDeleteDiscount, useDeleteTaxes } from "@/hooks/useControllers";
import { toast as reactToast } from "react-toastify";
import { toast } from "sonner";
import CustomDeleteHandler from "../dashboard/ui/custom-delete-handler";
import { useCustomDeleteHandler } from "@/store/state/lib/ui-state-manager";

interface AttributeActionsCellProps {
    row: {
        original: ConfigUnitTask | ConfigTaxesTask | ConfigDiscountsTask | ConfigCouponsTask;
    };
    business_id: number;
    label?: string;
}

export const AttributeActionsCell = ({ row, business_id, label}: AttributeActionsCellProps) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isLinkedProductsModalOpen, setIsLinkedProductsModalOpen] = useState(false);

    const {setTitle} = useCustomDeleteHandler();

    useEffect(() => {
        setTitle(`${label?.toLowerCase() === "taxes" ? label?.slice(0, label?.indexOf("es")) : label}`);
    }, [setTitle, label]);

    const handleEditClick = () => {
        setIsEditOpen(true);
    };

    const handleEditClose = () => {
        setIsEditOpen(false);
    };

    const handleLinkClick = () => {
        setIsLinkModalOpen(true);
    };

    const handleLinkModalClose = () => {
        setIsLinkModalOpen(false);
    };

    const handleLinkedProductsClick = () => {
        setIsLinkedProductsModalOpen(true);
    };

    const handleLinkedProductsModalClose = () => {
        setIsLinkedProductsModalOpen(false);
    };

    const deleteTaxesHandler = useDeleteTaxes();
    const deleteDiscountsHandler = useDeleteDiscount();
    const deleteCouponsHandler = useDeleteCoupons();

    const handleDeleteClick = async () => {
        switch(label) {
            case "taxes":
                reactToast(({closeToast}) => (
                    <CustomDeleteHandler
                        closeToast={closeToast}
                        onConfirm={async () => {
                            try {
                                await deleteTaxesHandler.mutateAsync({
                                    id: +row.original.id,
                                    businessId: business_id
                                }, {
                                    onSuccess(data) {
                                        toast.success(data?.message || "Tax Deleted Successfully");
                                    },
                                     onError: (err) => {
                                        if (err instanceof Error) {
                                            toast.error(err.message ?? "Error Occurred while Trying To Delete Product Category");
                                            return;
                                        }
                                        toast.error("Unexpected Error Occurred While Trying To Delete Product Category");
                                    },
                                })
                            }catch {
                                toast.error("Error Occurred While Trying To Delete Tax");
                            }
                        }}
                        onCancel={() => {
                            toast.info("Tax not deleted");
                        }}
                    />
                ));
                break;
            case "discounts":
                reactToast(({closeToast}) => (
                    <CustomDeleteHandler
                        closeToast={closeToast}
                        onConfirm={async () => {
                            try {
                                await deleteDiscountsHandler.mutateAsync({
                                    id: +row.original.id,
                                    businessId: business_id
                                }, {
                                    onSuccess(data) {
                                        toast.success(data?.message || "Discount Deleted Successfully");
                                    }
                                })
                            }catch {
                                toast.error("Error Occurred While Trying To Delete Discount");
                            }
                        }}
                        onCancel={() => {
                            toast.info("Discount not deleted");
                        }}
                    />
                ));
                break;
            case "coupons":
                reactToast(({closeToast}) => (
                    <CustomDeleteHandler
                        closeToast={closeToast}
                        onConfirm={async () => {
                            try {
                                await deleteCouponsHandler.mutateAsync({
                                    id: +row.original.id,
                                    businessId: business_id
                                }, {
                                    onSuccess(data) {
                                        toast.success(data?.message || "Coupon Deleted Successfully");
                                    }
                                })
                            }catch {
                                toast.error("Error Occurred While Trying To Delete Coupon");
                            }
                        }}
                        onCancel={() => {
                            toast.info("Coupon not deleted");
                        }}
                    />
                ));
                break;
            default:
                toast.info("Action Button Not Detected", {
                    description: "Kindly Check "
                })
        }
    };
    
    const handleShowLinked = () => {
        handleLinkedProductsClick();
    }

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
                {["taxes", "discounts", "coupons"].includes(label ? label : 'n/a') && (
                    <DropdownMenuItem onClick={handleLinkClick}>Link To Product</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleShowLinked}>Show Linked Products</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-uid={label} onClick={handleDeleteClick} className="text-red-500">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
            
            {(isEditOpen && label === "unit") ? (
                <EditAttributeForm
                    handleFormClose={handleEditClose}
                    business_id={business_id}
                    attributeData={row.original as ConfigUnitTask}
                />
            ) : (isEditOpen && label === "taxes") ?  (
                <EditTaxesForm handleFormClose={handleEditClose} business_id={business_id} attributeData={row.original as ConfigTaxesTask} />
            ) : (isEditOpen && label === "discounts") ? (
                <EditDiscountsForm handleFormClose={handleEditClose} business_id={business_id} attributeData={row.original as ConfigDiscountsTask} />
            ) : (isEditOpen && label === "coupons") ? (
                <EditCouponsForm handleFormClose={handleEditClose} business_id={business_id} attributeData={row.original as ConfigCouponsTask} />
            ) : (
                <></>
            )}

            {isLinkModalOpen && ["taxes", "discounts", "coupons"].includes(label || '') && (
                <LinkToProductModal
                    isOpen={isLinkModalOpen}
                    onClose={handleLinkModalClose}
                    itemId={row.original.id}
                    itemName={
                        label === "coupons" 
                            ? (row.original as ConfigCouponsTask).code
                            : (row.original as ConfigUnitTask | ConfigTaxesTask | ConfigDiscountsTask).name
                    }
                    itemType={label as "taxes" | "discounts" | "coupons"}
                    businessId={business_id}
                    onSuccess={() => {
                        console.log(`Successfully linked ${label} to product`);
                    }}
                />
            )}

            {isLinkedProductsModalOpen && ["taxes", "discounts", "coupons"].includes(label || '') && (
                <LinkedProductsModal
                    isOpen={isLinkedProductsModalOpen}
                    onClose={handleLinkedProductsModalClose}
                    itemId={row.original.id}
                    itemName={
                        label === "coupons" 
                            ? (row.original as ConfigCouponsTask).code
                            : (row.original as ConfigUnitTask | ConfigTaxesTask | ConfigDiscountsTask).name
                    }
                    itemType={label as "taxes" | "discounts" | "coupons"}
                    businessId={business_id}
                    onSuccess={() => {
                        console.log(`Successfully updated linked products for ${label}`);
                    }}
                />
            )}
        </>
    );
};
