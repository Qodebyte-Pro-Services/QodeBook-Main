"use client";
import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiLoader4Line } from "react-icons/ri";
import { X, AlertCircle, Save, Plus, Minus, Package, Edit3 } from "lucide-react";
import { ProductVariantResponseObject } from "@/models/types/shared/handlers-type";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useProductVariantsHandler } from "@/hooks/useHandlers";
import { useQueryClient } from "@tanstack/react-query";

interface EditProductVariationsFormProps {
    handleFormClose: () => void;
    productName?: string;
    variants: ProductVariantResponseObject[];
    businessId: string;
}

interface FormData {
    variant_id: number;
    new_quantity: number;
    reason: string;
    notes: string;
}

interface FormErrors {
    variant_id?: string;
    new_quantity?: string;
    reason?: string;
    notes?: string;
}

const EditProductVariationsForm = ({ 
    handleFormClose, 
    productName, 
    variants, 
    businessId 
}: EditProductVariationsFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        variant_id: 0,
        new_quantity: 0,
        reason: "",
        notes: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponseObject | null>(null);

    useEffect(() => {
        if (formData.variant_id > 0) {
            const variant = variants.find(v => v.id === formData.variant_id);
            setSelectedVariant(variant || null);
            if (variant) {
                setFormData(prev => ({ ...prev, new_quantity: variant.quantity }));
            }
        }
    }, [formData.variant_id, variants]);

    const productVariantHandler = useProductVariantsHandler();

    const queryClient = useQueryClient();

    const branchId = useMemo(() => {
        if (typeof window !== "undefined") {
            const selectedBranchid = sessionStorage.getItem("selectedBranchId");
            return selectedBranchid ? JSON.parse(selectedBranchid) : 0;
        }
        return 0;
    }, []);

    const validateInputs = (name: string, value: string | number): string => {
        switch(name) {
            case "variant_id":
                return !value || value === 0 ? "Please select a product variant" : "";
            case "new_quantity":
                if (typeof value === 'number') {
                    return value < 0 ? "Quantity cannot be negative" : "";
                }
                return "Invalid quantity";
            case "notes":
                return value.toString().trim().length > 0 && value.toString().trim().length < 3 ? 
                       "Notes should be at least 3 characters if provided" : "";
            default:
                return "";
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'variant_id' || name === 'new_quantity' ? Number(value) : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleVariantChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            variant_id: Number(value)
        }));

        if (errors.variant_id) {
            setErrors(prev => ({
                ...prev,
                variant_id: undefined
            }));
        }
    };

    const handleQuantityChange = (increment: boolean) => {
        const newQuantity = increment ? formData.new_quantity + 1 : Math.max(0, formData.new_quantity - 1);
        setFormData(prev => ({ ...prev, new_quantity: newQuantity }));
        
        if (errors.new_quantity) {
            setErrors(prev => ({ ...prev, new_quantity: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errorTree: FormErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            const error = validateInputs(key, formData[key as keyof FormData]);
            if (error) {
                errorTree[key as keyof FormErrors] = error;
                isValid = false;
            }
        });

        setErrors(errorTree);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        const formdata_structure = {...formData} as FormData;
        const {new_quantity} = formdata_structure;
        const variant_data = variants?.find(item => item.id === formdata_structure?.variant_id)?.quantity;
        if (!variant_data) {
            toast.info("Invalid Variant Id Detected", {description: "Please kindly refresh your page and try again"});
            return;
        }

        const reason = variant_data < new_quantity ? "increase" : "decrease";

        const _formdata = {
            ...formdata_structure,
            reason
        };

        setIsSubmitting(true);
        try {
            const new_formdata = Object.assign(_formdata, {business_id: +businessId, branch_id: +branchId});
            await productVariantHandler?.mutateAsync(new_formdata, {
                onSuccess: async (data) => {
                    console.log(data);
                    toast.success("Product variation updated successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["getProductsById", new_formdata?.business_id],
                        refetchType: "active"
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["get-products", new_formdata?.business_id],
                        refetchType: "active"
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["productVariants", new_formdata?.business_id],
                        refetchType: "active"
                    });
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    handleFormClose();
                },
                onError: (err) => {
                    toast.error(err?.message ?? "Error updating product variation");
                }
            });
        } catch (error) {
            console.error("Error updating product variation:", error);
            toast.error("Failed to update product variation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariant = {
        from: {
            scale: 0.95,
            opacity: 0,
            y: 20
        },
        to: {
            scale: 1,
            opacity: 1,
            y: 0
        },
        go: {
            scale: 0.95,
            opacity: 0,
            y: 20
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                variants={containerVariant} 
                initial="from" 
                animate="to" 
                exit="go"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Edit3 size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Edit Product Variations</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Adjust product variant quantities and provide adjustment details
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Product Name Display */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Product Name
                                </label>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                                    <Package size={20} className="text-template-chart-store" />
                                    <span className="text-base font-medium text-gray-800">{productName}</span>
                                </div>
                            </div>

                            {/* Product Variant Selection */}
                            <div className="space-y-2">
                                <label htmlFor="variant_id" className="text-sm font-semibold text-gray-700">
                                    Product Variant *
                                </label>
                                <Select value={formData.variant_id.toString()} onValueChange={handleVariantChange}>
                                    <SelectTrigger className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.variant_id 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                    }`}>
                                        <SelectValue placeholder="Select a variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Select a variant</SelectItem>
                                        {variants.map((variant) => (
                                            <SelectItem key={variant.id} value={variant.id.toString()}>
                                                {variant.sku} - {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')} 
                                                (Current: {variant.quantity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.variant_id && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.variant_id}</span>
                                    </div>
                                )}
                            </div>

                            {/* Current Variant Info */}
                            {selectedVariant && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <h4 className="text-sm font-semibold text-green-800 mb-2">Current Variant Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-green-600 font-medium">SKU:</span>
                                            <span className="ml-2 text-green-800">{selectedVariant.sku}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-600 font-medium">Current Quantity:</span>
                                            <span className="ml-2 text-green-800">{selectedVariant.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-600 font-medium">Cost Price:</span>
                                            <span className="ml-2 text-green-800">₦{Number(selectedVariant.cost_price).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-green-600 font-medium">Selling Price:</span>
                                            <span className="ml-2 text-green-800">₦{Number(selectedVariant.selling_price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quantity Adjustment */}
                            <div className="space-y-2">
                                <label htmlFor="new_quantity" className="text-sm font-semibold text-gray-700">
                                    New Quantity *
                                </label>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(false)}
                                        className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-template-chart-store/20"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input 
                                        type="number" 
                                        id="new_quantity"
                                        name="new_quantity"
                                        value={formData.new_quantity}
                                        onChange={handleInputChange}
                                        className={`w-full flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-center font-medium ${
                                            errors.new_quantity 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(true)}
                                        className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-template-chart-store/20"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {errors.new_quantity && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.new_quantity}</span>
                                    </div>
                                )}
                                {selectedVariant && (
                                    <p className="text-xs text-gray-500">
                                        Change: {formData.new_quantity - selectedVariant.quantity > 0 ? '+' : ''}{formData.new_quantity - selectedVariant.quantity}
                                    </p>
                                )}
                                {selectedVariant && (
                                    <p className="text-xs text-gray-500">
                                        Status: <span className={`${formData?.new_quantity - selectedVariant?.quantity > 0 ? "text-green-500" : "text-red-500"}`}>{formData.new_quantity - selectedVariant.quantity > 0 ? 'Increased' : 'Decrease'}</span>
                                    </p>
                                )}
                            </div>

                            {/* Reason */}
                            {/* <div className="space-y-2">
                                <label htmlFor="reason" className="text-sm font-semibold text-gray-700">
                                    Status for Adjustment *
                                </label>
                                <Select name="reason" value={formData.reason} onValueChange={(e) => handleInputChange({target: {name: "reason", value: e}} as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)}>
                                    <SelectTrigger className="w-full rounded-md">
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="increase">Increase</SelectItem>
                                        <SelectItem value="decrease">Decrease</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.reason && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.reason}</span>
                                    </div>
                                )}
                            </div> */}

                            {/* Notes */}
                            <div className="space-y-2">
                                <label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                                    Reason for Adjustment*
                                </label>
                                <textarea 
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    value={formData.notes} 
                                    onChange={handleInputChange}
                                    placeholder="Any additional information or comments (optional)"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                                        errors.notes 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                    }`}
                                />
                                {errors.notes && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.notes}</span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">
                                    Optional field for additional context
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <button 
                                onClick={handleFormClose}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Update Variation</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditProductVariationsForm;


// ! PRODUCT VARIATIONS INVOICE - RECEIPT