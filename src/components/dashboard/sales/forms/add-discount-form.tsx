"use client";

import { useCategoryHandler, useDiscountHandler, useTaxesHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, FolderPlus, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DiscountPayloadType, TaxPayloadType } from "@/models/types/shared/handlers-type";
import { SelectTrigger } from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useCustomStyles } from "@/hooks";

interface FormErrors {
    name: string;
    discount_type: string;
    percentage?: string;
    amount?: string;
    start_date: string;
    end_date: string;
    description: string;
}

const CreateDiscountForm = ({handleFormClose, business_id}: {handleFormClose: () => void, business_id: string}) => {
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        percentage: undefined,
        discount_type: "",
        amount: undefined,
        start_date: "",
        end_date: "",
        description: ""
    });
    const [formData, setFormData] = useState<Omit<DiscountPayloadType, "business_id">>({
        name: "",
        discount_type: "",
        percentage: 0,
        amount: 0,
        start_date: "",
        end_date: "",
        description: ""
    });

    const [isActiveInput, setIsActiveInput] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    const {hiddenScrollbar} = useCustomStyles();

    const discountHandler = useDiscountHandler();

    const validInputs = (name: keyof Omit<DiscountPayloadType, "business_id">, value: string) => {
        switch(name) {
            case "name":
                return !value?.trim() ? "Discount name is required" : "";
            case "discount_type":
                return !value?.trim() ? "Discount Type is required" : "";
            case "percentage":
                return !value ? "Discount percentage is required" : "";
            case "amount":
                return !value ? "Discount amount is required" : "";
            case "start_date":
                return !value.trim() ? "Discount start date is required" : "";
            case "end_date":
                return !value.trim() ? "Discount end date is required" : "";
            case "description":
                return !value?.trim() ? "Discount description is required" : "";
            default:
                return "";
        }
    };
    
    const handleInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name as keyof Omit<DiscountPayloadType, "business_id">]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name as keyof FormErrors]: undefined
            }));
        }
    };

    const handleSelect = (name: keyof Pick<DiscountPayloadType, "discount_type">, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name as keyof FormErrors]: undefined
            }));
        }
    }

    const validateForm = () => {
        let isValid = true;
        const errors_info = {} as FormErrors;
        const {percentage, amount, ...rest} = formData;
        switch(isActiveInput) {
            case "percentage":
                Object.entries({...rest, percentage})?.forEach(([key, value]) => {
                    const error = validInputs(key as keyof Omit<DiscountPayloadType, "business_id" | "amount">, value as string);
                    if (error) {
                        isValid = false;
                        errors_info[key as keyof FormErrors] = error;
                    }
                });
                break;
            case "fixed-amount":
                Object.entries({...rest, amount})?.forEach(([key, value]) => {
                    const error = validInputs(key as keyof Omit<DiscountPayloadType, "business_id" | "percentage">, value as string);
                    if (error) {
                        isValid = false;
                        errors_info[key as keyof FormErrors] = error;
                    }
                });
                break;
            default:
                Object.entries(formData)?.forEach(([key, value]) => {
                    const error = validInputs(key as keyof Omit<DiscountPayloadType, "business_id">, value as string);
                    if (error) {
                        isValid = false;
                        errors_info[key as keyof FormErrors] = error;
                    }
                });
            break;
        }
        setErrors(errors_info);
        return isValid;
    };

    const queryClient = useQueryClient();

    const handleTaxSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload: DiscountPayloadType = {
            name: formData.name,
            discount_type: formData.discount_type,
            percentage: +formData.percentage,
            amount: +formData.amount,
            start_date: formData.start_date,
            end_date: formData.end_date,
            description: formData.description,
            business_id: +business_id
        };
        try {
            await discountHandler?.mutateAsync(payload, {
                onSuccess: (data) => {
                    toast.success(data?.message ?? "Discount created successfully");
                    handleFormClose();
                    setFormData(prev => ({
                        ...prev,
                        name: "",
                        discount_type: "",
                        percentage: 0,
                        amount: 0,
                        start_date: "",
                        end_date: "",
                        description: ""
                    }));
                    queryClient.invalidateQueries({
                        queryKey: ["get-discounts", payload?.business_id]
                    });
                },
                onError: (err) => {
                    console.log(err);
                    toast.error(err?.message ?? "An unexpected error occurred while creating discount");
                }
            })
        }catch(err) {
            if (err instanceof Error) {
                toast.error(err.message ?? "An error occurred while creating discount");
                return;
            }
            toast.error("An Unexpected error occurred while creating discount");
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
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <FolderPlus size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Create New Discount</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new discount to organize your products effectively
                        </p>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto" style={hiddenScrollbar}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Discount Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="name"
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputs}
                                        placeholder="Enter Discount name"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.name 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.name && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Select value={isActiveInput} onValueChange={(value: string) => {
                                    setIsActiveInput(value);
                                    handleSelect("discount_type", value);
                                }}>
                                    <SelectTrigger className="w-full text-left py-2 px-4 border border-gray-500/30 rounded-md">
                                        <SelectValue placeholder="Select Format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed-amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.discount_type && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.percentage}</span>
                                    </div>
                                )}
                            </div>
                            {isActiveInput?.toLowerCase() === "percentage" && (
                                <div className="space-y-2">
                                    <label htmlFor="percentage" className="text-sm font-semibold text-gray-700">
                                        Discount Percentage *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            id="percentage"
                                            name="percentage"
                                            value={formData.percentage} 
                                            onChange={handleInputs}
                                            placeholder="Enter tax rate"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                errors.percentage 
                                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                    : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                            }`}
                                        />
                                        {errors.percentage && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{errors.percentage}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {isActiveInput?.toLowerCase() === "fixed-amount" && (
                                <div className="space-y-2">
                                    <label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                                        Discount Amount *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            id="amount"
                                            name="amount"
                                            value={formData.amount} 
                                            onChange={handleInputs}
                                            placeholder="Enter tax rate"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                errors.amount 
                                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                    : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                            }`}
                                        />
                                        {errors.amount && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{errors.percentage}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label htmlFor="start_date" className="text-sm font-semibold text-gray-700">
                                    Start Date *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date} 
                                        onChange={handleInputs}
                                        placeholder="Enter tax rate"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.start_date 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.start_date && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.start_date}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="end_date" className="text-sm font-semibold text-gray-700">
                                    End Date *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date} 
                                        onChange={handleInputs}
                                        placeholder="Enter tax rate"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.end_date 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
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
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-semibold text-gray-700">
                                    Description *
                                </label>
                                <div className="relative">
                                    <textarea 
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={formData.description} 
                                        onChange={handleInputs}
                                        placeholder="Describe this category (minimum 10 characters)"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                                            errors.description 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.description && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.description}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Minimum 10 characters required
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-1 lg:gap-3">
                            <button 
                                onClick={handleFormClose}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleTaxSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FolderPlus size={16} />
                                        <span>Create Discount</span>
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

export default CreateDiscountForm;