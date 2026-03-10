"use client";

import { useSalesCouponHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, Tag, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CouponPayloadType } from "@/models/types/shared/handlers-type";
import { useCustomStyles } from "@/hooks";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";

interface FormErrors {
    coupons_type: string;
    code: string;
    description: string;
    discount_percentage: string;
    discount_amount: string;
    start_date: string;
    end_date: string;
    usage_limit: string;
}

const CreateCouponForm = ({handleFormClose, business_id}: {handleFormClose: () => void, business_id: string}) => {
    const [errors, setErrors] = useState<FormErrors>({
        coupons_type: "",
        code: "",
        description: "",
        discount_percentage: "",
        discount_amount: "",
        start_date: "",
        end_date: "",
        usage_limit: ""
    });
    const [formData, setFormData] = useState<Omit<CouponPayloadType, "business_id">>({
        coupons_type: "",
        code: "",
        description: "",
        discount_percentage: 0,
        discount_amount: 0,
        start_date: "",
        end_date: "",
        usage_limit: 1
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isActiveInput, setIsActiveInput] = useState<string>("");
    
    const {hiddenScrollbar} = useCustomStyles();

    const couponHandler = useSalesCouponHandler();

    const validInputs = (name: keyof Omit<CouponPayloadType, "business_id">, value: string | number) => {
        switch(name) {
            case "coupons_type":
                return !value?.toString().trim() ? "Coupon Type is required" : "";
            case "code":
                return !value?.toString().trim() ? "Coupon code is required" : "";
            case "description":
                return !value?.toString().trim() ? "Description is required" : "";
            case "discount_percentage":
                return Number(value) < 0 || Number(value) > 100 ? "Discount percentage must be between 0-100%" : "";
            case "discount_amount":
                return Number(value) < 0 ? "Discount amount must be positive" : "";
            case "start_date":
                return !value?.toString().trim() ? "Start date is required" : "";
            case "end_date":
                return !value?.toString().trim() ? "End date is required" : "";
            case "usage_limit":
                return Number(value) < 1 ? "Usage limit must be at least 1" : "";
            default:
                return "";
        }
    };
    
    const handleInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        const numericFields = ['discount_percentage', 'discount_amount', 'usage_limit'];
        
        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value
        }));
        
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name as keyof FormErrors]: ""
            }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const errors_info = {} as FormErrors;

        const {discount_percentage, discount_amount, ...rest} = formData;
        switch(isActiveInput) {
            case "percentage":
                Object.entries({...rest, discount_percentage})?.forEach(([key, value]) => {
                    const error = validInputs(key as keyof Omit<CouponPayloadType, "business_id">, value as string | number);
                    if (error) {
                        isValid = false;
                        errors_info[key as keyof FormErrors] = error as string;
                    }
                });
                break;
            case "fixed-amount":
                Object.entries({...rest, discount_amount})?.forEach(([key, value]) => {
                    const error = validInputs(key as keyof Omit<CouponPayloadType, "business_id">, value as string | number);
                    if (error) {
                        isValid = false;
                        errors_info[key as keyof FormErrors] = error as string;
                    }
                });
                break;
            default:
                Object.entries(formData)?.forEach(([key, value]) => {
                    const error = validInputs(key as keyof Omit<CouponPayloadType, "business_id">, value as string | number);
                    if (error) {
                        isValid = false;
                        errors_info[key as keyof FormErrors] = error as string;
                    }
                });
            break;
        }

        // Additional validation for date range
        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            if (endDate <= startDate) {
                isValid = false;
                errors_info.end_date = "End date must be after start date";
            }
        }

        setErrors(errors_info);
        return isValid;
    };

    const queryClient = useQueryClient();

    const handleCouponSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload: CouponPayloadType = {
            ...formData,
            business_id: +business_id
        };
        try {
            await couponHandler.mutateAsync(payload, {
                onSuccess: (data) => {
                    toast.success(data?.message ?? "Coupon created successfully");
                    handleFormClose();
                    setFormData({
                        coupons_type: "",
                        code: "",
                        description: "",
                        discount_percentage: 0,
                        discount_amount: 0,
                        start_date: "",
                        end_date: "",
                        usage_limit: 1
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["get-coupons", payload?.business_id]
                    });
                },
                onError: (err) => {
                    console.log(err);
                    toast.error(err?.message ?? "An unexpected error occurred while creating coupon");
                }
            })
        }catch(err) {
            if (err instanceof Error) {
                toast.error(err.message ?? "An error occurred while creating coupon");
                return;
            }
            toast.error("An Unexpected error occurred while creating coupon");
        }finally {
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
    }

    return(
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
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Tag size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Create New Coupon</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Create promotional coupons to boost sales
                        </p>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto" style={hiddenScrollbar}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coupon Type */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Coupon Type *
                                </label>
                                <Select value={isActiveInput} onValueChange={(value: string) => {
                                    setIsActiveInput(value);
                                    setFormData(prev => ({...prev, coupons_type: value}));
                                    if (errors.coupons_type) setErrors(prev => ({...prev, coupons_type: ""}));
                                }}>
                                    <SelectTrigger className="w-full text-left py-2 px-4 border border-gray-500/30 rounded-md">
                                        <SelectValue placeholder="Select Format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed-amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.coupons_type && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.coupons_type}</span>
                                    </div>
                                )}
                            </div>
                            {/* Coupon Code */}
                            <div className="space-y-2">
                                <label htmlFor="code" className="text-sm font-semibold text-gray-700">
                                    Coupon Code *
                                </label>
                                <input 
                                    type="text" 
                                    id="code"
                                    name="code"
                                    value={formData.code} 
                                    onChange={handleInputs}
                                    placeholder="e.g., SAVE20, WELCOME10"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.code 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                    }`}
                                />
                                {errors.code && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.code}</span>
                                    </div>
                                )}
                            </div>

                            {/* Usage Limit */}
                            <div className="space-y-2">
                                <label htmlFor="usage_limit" className="text-sm font-semibold text-gray-700">
                                    Usage Limit *
                                </label>
                                <input 
                                    type="number" 
                                    id="usage_limit"
                                    name="usage_limit"
                                    value={formData.usage_limit} 
                                    onChange={handleInputs}
                                    placeholder="Number of times coupon can be used"
                                    min="1"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.usage_limit 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                    }`}
                                />
                                {errors.usage_limit && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.usage_limit}</span>
                                    </div>
                                )}
                            </div>

                            {/* Discount Percentage */}
                            {isActiveInput?.toLowerCase() === "percentage" && (
                            <div className="space-y-2">
                                <label htmlFor="discount_percentage" className="text-sm font-semibold text-gray-700">
                                    Discount Percentage (%)
                                </label>
                                <input 
                                    type="number" 
                                    id="discount_percentage"
                                    name="discount_percentage"
                                    value={formData.discount_percentage} 
                                    onChange={handleInputs}
                                    placeholder="0-100"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.discount_percentage 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                    }`}
                                />
                                {errors.discount_percentage && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.discount_percentage}</span>
                                    </div>
                                )}
                            </div>
                            )}
                            
                            {/* Discount Amount */}
                            {isActiveInput?.toLowerCase() === "fixed-amount" && (
                            <div className="space-y-2">
                                <label htmlFor="discount_amount" className="text-sm font-semibold text-gray-700">
                                    Discount Amount (₦)
                                </label>
                                <input 
                                    type="number" 
                                    id="discount_amount"
                                    name="discount_amount"
                                    value={formData.discount_amount} 
                                    onChange={handleInputs}
                                    placeholder="Fixed amount discount"
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.discount_amount 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                    }`}
                                />
                                {errors.discount_amount && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.discount_amount}</span>
                                    </div>
                                )}
                            </div>
                            )}

                            {/* Start Date */}
                            <div className="space-y-2">
                                <label htmlFor="start_date" className="text-sm font-semibold text-gray-700">
                                    Start Date *
                                </label>
                                <input 
                                    type="datetime-local" 
                                    id="start_date"
                                    name="start_date"
                                    value={formData.start_date} 
                                    onChange={handleInputs}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.start_date 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                    }`}
                                />
                                {errors.start_date && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.start_date}</span>
                                    </div>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label htmlFor="end_date" className="text-sm font-semibold text-gray-700">
                                    End Date *
                                </label>
                                <input 
                                    type="datetime-local" 
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date} 
                                    onChange={handleInputs}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.end_date 
                                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                    }`}
                                />
                                {errors.end_date && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.end_date}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 mt-6">
                            <label htmlFor="description" className="text-sm font-semibold text-gray-700">
                                Description *
                            </label>
                            <textarea 
                                id="description"
                                name="description"
                                rows={3}
                                value={formData.description} 
                                onChange={handleInputs}
                                placeholder="Describe this coupon and its terms"
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                                    errors.description 
                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                        : 'border-gray-300 focus:ring-green-200 focus:border-green-600'
                                }`}
                            />
                            {errors.description && (
                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                    <AlertCircle size={14} />
                                    <span>{errors.description}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <button 
                                onClick={handleFormClose}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCouponSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Tag size={16} />
                                        <span>Create Coupon</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default CreateCouponForm;