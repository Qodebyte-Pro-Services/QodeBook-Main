"use client";

import { ProductVariantsType } from "@/store/data/product-variants";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useMemo, useState } from "react";
import { EditVariantForm, EditVariantFormData, EditVariantFormErrors } from "../dashboard/inventory/forms/edit-variant-form";
import { useVariantProductEditHandler } from "@/hooks/useHandlers";
import { toast } from "sonner";
import { ProductVariantResponseObject } from "@/models/types/shared/handlers-type";

const VariantFooter = ({row}: {row: {original: ProductVariantsType}}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<EditVariantFormData>({
        sku: "",
        threshold: 0,
        cost_price: "",
        selling_price: "",
        expiry_date: "",
        barcode: "",
        attributes: [],
        image_url: [],
        image_url_files: [],
        deleteImages: []
    });
    const [formErrors, setFormErrors] = useState<EditVariantFormErrors>({});
    
    const {mutateAsync: updateProductVariants} = useVariantProductEditHandler();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const id = sessionStorage.getItem("selectedBusinessId");
            return id ? JSON.parse(id) : 0;
        }
        return 0;
    }, []);

    const handleEditClick = () => {
        const variant = row.original;
        setFormData({
            sku: variant.sku,
            threshold: variant.threshold,
            cost_price: variant.cost_price,
            selling_price: variant.selling_price,
            barcode: variant.barcode ?? "",
            expiry_date: variant.expiry_date ?? new Date().toLocaleDateString(),
            attributes: variant.attributes,
            image_url: (variant as ProductVariantResponseObject).image_url || [], // Cast to handle extended type
            image_url_files: [],
            deleteImages: []
        });
        setFormErrors({});
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'threshold' ? parseInt(value) || 0 : value
        }));
        
        // Clear error when user starts typing
        if (formErrors[name as keyof EditVariantFormErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleThresholdChange = (increment: boolean) => {
        setFormData(prev => ({
            ...prev,
            threshold: Math.max(0, increment ? prev.threshold + 1 : prev.threshold - 1)
        }));
    };

    const handleImageUpload = (files: FileList) => {
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                return false;
            }
            return true;
        });

        if (validFiles.length !== files.length) {
            setFormErrors(prev => ({
                ...prev,
                images: "Some files were rejected. Please ensure all files are images under 10MB."
            }));
        } else {
            setFormErrors(prev => ({
                ...prev,
                images: undefined
            }));
        }

        setFormData(prev => ({
            ...prev,
            image_url_files: [...prev.image_url_files, ...validFiles]
        }));
    };

    const handleImageRemove = (identifier: string, isExisting: boolean) => {
        if (isExisting) {
            setFormData(prev => ({
                ...prev,
                image_url: prev.image_url.filter(img => img.public_id !== identifier),
                deleteImages: [...prev.deleteImages, identifier]
            }));
        } else {
            const index = parseInt(identifier);
            setFormData(prev => ({
                ...prev,
                image_url_files: prev.image_url_files.filter((_, i) => i !== index)
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: EditVariantFormErrors = {};

        if (!formData.sku.trim()) {
            errors.sku = "SKU is required";
        }

        if (formData.threshold < 0) {
            errors.threshold = "Threshold cannot be negative";
        }

        if (!formData.cost_price.trim()) {
            errors.cost_price = "Cost price is required";
        } else if (isNaN(parseFloat(formData.cost_price))) {
            errors.cost_price = "Cost price must be a valid number";
        }

        if (!formData.selling_price.trim()) {
            errors.selling_price = "Selling price is required";
        } else if (isNaN(parseFloat(formData.selling_price))) {
            errors.selling_price = "Selling price must be a valid number";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('sku', formData.sku);
            formDataPayload.append('threshold', formData.threshold.toString());
            formDataPayload.append('cost_price', formData.cost_price);
            formDataPayload.append('selling_price', formData.selling_price);
            formDataPayload.append('barcode', formData?.barcode ?? "");
            formDataPayload.append('expiry_date', formData?.expiry_date ?? "");
            formDataPayload.append('attributes', JSON.stringify(formData.attributes));
            formDataPayload.append('deleteImages', JSON.stringify(formData.deleteImages));
            // formDataPayload?.append('image_url', JSON.stringify(formData.image_url));
            formDataPayload?.append("replace_images", JSON.stringify(false));
            if (formData?.image_url_files?.length <= 1) {
                formDataPayload?.append('image_url', formData?.image_url_files?.[0]);
            }else {
                formData.image_url_files.forEach(async (file, index) => {
                    formDataPayload.append(`image_url[${index}]`, file);
                });
            }
            
            // console.log(formData?.image_url_files);
            // console.log(Object.fromEntries(formDataPayload));
            // return;

            const payload = {
                variantId: `${row.original.id}`,
                businessId: `${businessId}`,
                formdata: formDataPayload
            }

            await updateProductVariants(payload, {
                onSuccess: (data) => {
                    toast.success(data?.message ?? "Product Variant Updated Successfully", {description: "Kindly Refresh To Update The Variant Table"});
                    console.log(data)
                },
                onError: (err) => {
                    toast.error(err?.message ?? "Error updating product variant");
                    console.log(err)
                }
            });

            console.log('Variant update payload:', formDataPayload);
            console.log('Images to remove:', formData.deleteImages);
            console.log('New images count:', formData.image_url_files.length);

            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsEditModalOpen(false);
            
        } catch (error) {
            console.error('Error updating variant:', error);
            toast.error("Error occurred while trying to update variant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setFormErrors({});

        formData.image_url_files.forEach(file => {
            if (file instanceof File) {
                URL.revokeObjectURL(URL.createObjectURL(file));
            }
        });
    };

    return(
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem className="cursor-pointer" onClick={handleEditClick}>
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>

            <EditVariantForm
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                formData={formData}
                formErrors={formErrors}
                onFormChange={handleFormChange}
                onThresholdChange={handleThresholdChange}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                isSubmitting={isSubmitting}
                variant={row.original}
            />
        </>
    )
}

const productVariantsColumn: ColumnDef<ProductVariantsType>[] = [
    {
        accessorKey: "sku",
        header: ({column}) => <DataTableColumnHeader column={column} title="SKU" />,
        cell: ({row}) => <div>{row.getValue("sku")}</div>
    },
    {
        accessorKey: "attributes",
        header: ({column}) => <DataTableColumnHeader column={column} title="Attributes" />,
        cell: ({row}) => <div>{row.original.attributes[0]?.name || "N/A"}</div>
    },
    {
        accessorKey: "quantity",
        header: ({column}) => <DataTableColumnHeader column={column} title="Quantity" />,
        cell: ({row}) => <div>{row.getValue("quantity")}</div>
    },
    {
        accessorKey: "threshold",
        header: ({column}) => <DataTableColumnHeader column={column} title="Threshold" />,
        cell: ({row}) => <div>{row.getValue("threshold")}</div>
    },
    {
        accessorKey: "cost_price",
        header: ({column}) => <DataTableColumnHeader column={column} title="Cost Price" />,
        cell: ({row}) => <div>{new Intl.NumberFormat("en-NG", {currency: "NGN", currencySign: "standard", style: "currency", unitDisplay: "short"}).format(+row.original.cost_price)}</div>
    },
    {
        accessorKey: "selling_price",
        header: ({column}) => <DataTableColumnHeader column={column} title="Selling Price" />,
        cell: ({row}) => <div>{new Intl.NumberFormat("en-NG", {currency: "NGN", currencySign: "standard", style: "currency", unitDisplay: "short"}).format(+row.original.selling_price)}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => {
            const variantQuantity = row.original.quantity;
            const variantThreshold = row.original.threshold;
            const variant = variantQuantity === 0 ? "destructive" : variantQuantity <= variantThreshold ? "processing" : "default";
            return (
                <BadgeTwo variant={variant} className="uppercase">
                    {variantQuantity === 0 ? "Out of Stock" : (variantQuantity <= variantThreshold ? "Low Stock" : "In Stock")}
                </BadgeTwo>
            );
        }
    },
    {
        id: "actions",
        cell: ({row}) => <VariantFooter row={row} />
    }
];

export default productVariantsColumn;