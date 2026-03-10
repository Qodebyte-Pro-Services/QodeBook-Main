"use client";
import { useUpdateCouponsHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, Edit3, AlertCircle, Calendar, Percent, DollarSign, Hash, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfigCouponsTask } from "@/store/data/config-coupons-data";

interface FormData {
    code: string;
    description?: string;
    discount_percentage: number;
    discount_amount: number;
    end_date: string;
    usage_limit: number;
}

interface FormErrors {
    code?: string;
    description?: string;
    discount_percentage?: string;
    discount_amount?: string;
    end_date?: string;
    usage_limit?: string;
}

interface EditCouponsFormProps {
    handleFormClose: () => void;
    business_id: number;
    attributeData: ConfigCouponsTask;
}

const EditCouponsForm = ({ handleFormClose, business_id, attributeData }: EditCouponsFormProps) => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        code: "",
        description: "",
        discount_percentage: 0,
        discount_amount: 0,
        end_date: "",
        usage_limit: 0
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const couponsUpdateHandler = useUpdateCouponsHandler();

    useEffect(() => {
        if (attributeData) {
            setFormData({
                code: attributeData.code || "",
                description: attributeData.description || "",
                discount_percentage: Number(attributeData.discount_percentage) || 0,
                discount_amount: Number(attributeData.discount_amount) || 0,
                end_date: attributeData.end_date ? new Date(attributeData.end_date).toISOString().split('T')[0] : "",
                usage_limit: Number(attributeData.usage_limit) || 0
            });
        }
    }, [attributeData]);

    const validateInputs = (name: string, value: string | number): string => {
        switch(name) {
            case "code":
                if (!value || (typeof value === 'string' && !value.trim())) return "Coupon code is required";
                if (typeof value === 'string' && value.length < 3) return "Code must be at least 3 characters";
                if (typeof value === 'string' && value.length > 20) return "Code must be less than 20 characters";
                return "";
            case "end_date":
                return !value ? "End date is required" : "";
            case "discount_percentage":
                const percVal = Number(value);
                if (percVal < 0) return "Percentage cannot be negative";
                if (percVal > 100) return "Percentage cannot exceed 100";
                return "";
            case "discount_amount":
                const amtVal = Number(value);
                if (amtVal < 0) return "Amount cannot be negative";
                return "";
            case "usage_limit":
                const limitVal = Number(value);
                if (limitVal < 0) return "Usage limit cannot be negative";
                return "";
            default:
                return "";
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;
        
        if (name === 'discount_percentage' || name === 'discount_amount' || name === 'usage_limit') {
            processedValue = Number(value);
        } else if (name === 'code') {
            processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        } else {
            processedValue = value;
        }
        
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
    }
    
    const validatedForm = (): boolean => {
        const errorTree: FormErrors = {};
        
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'description') {
                const error = validateInputs(key, value);
                if (error) {
                    errorTree[key as keyof FormErrors] = error;
                }
            }
        });
        
        // At least one discount type should be set
        if (formData.discount_percentage === 0 && formData.discount_amount === 0) {
            errorTree.discount_percentage = "Set either percentage or fixed amount discount";
            errorTree.discount_amount = "Set either percentage or fixed amount discount";
        }
        
        setErrors(errorTree);
        return Object.keys(errorTree).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatedForm()) return;

        setIsSubmitting(true);
        
        try {
            await couponsUpdateHandler.mutateAsync({
                id: Number(attributeData.id),
                business_id: Number(business_id),
                code: formData.code,
                description: formData.description,
                discount_percentage: formData.discount_percentage,
                discount_amount: formData.discount_amount,
                end_date: formData.end_date,
                usage_limit: formData.usage_limit
            }, {
                onSuccess: (data) => {
                    toast.success(data?.message ?? "Coupon updated successfully");
                    queryClient.invalidateQueries({ queryKey: ["get-coupons", business_id] });
                    handleFormClose();
                },
                onError: (err) => {
                    toast.error(err?.message ?? "Error Occurred while trying to update coupon");
                    handleFormClose();
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error?.message || "Failed to update coupon");
                return;
            }
            toast.error("Unexpected Error Occurred While Trying To Update Coupon");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={handleFormClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative">
                        <button
                            onClick={handleFormClose}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                <Edit3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Coupon</h2>
                                <p className="text-sm text-gray-500">Update coupon information</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        Coupon Code
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono uppercase ${
                                        errors.code 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-green-500'
                                    }`}
                                    placeholder="e.g., SUMMER20"
                                />
                                {errors.code && (
                                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.code}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-1">
                                            <Percent className="w-3 h-3" />
                                            Percentage Off
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        name="discount_percentage"
                                        value={formData.discount_percentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.discount_percentage 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                        placeholder="0"
                                    />
                                    {errors.discount_percentage && (
                                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="line-clamp-1">{errors.discount_percentage}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Amount Off
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        name="discount_amount"
                                        value={formData.discount_amount}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.discount_amount 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                        placeholder="0"
                                    />
                                    {errors.discount_amount && (
                                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="line-clamp-1">{errors.discount_amount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            End Date
                                        </div>
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.end_date 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                    />
                                    {errors.end_date && (
                                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{errors.end_date}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            Usage Limit
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        name="usage_limit"
                                        value={formData.usage_limit}
                                        onChange={handleInputChange}
                                        min="0"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.usage_limit 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                        placeholder="0 for unlimited"
                                    />
                                    {errors.usage_limit && (
                                        <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{errors.usage_limit}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Add a description..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleFormClose}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RiLoader4Line className="animate-spin w-4 h-4" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Coupon'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditCouponsForm;
