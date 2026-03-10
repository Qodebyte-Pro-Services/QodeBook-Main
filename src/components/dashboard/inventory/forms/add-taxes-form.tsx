"use client";

import { useCategoryHandler, useTaxesHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, FolderPlus, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { TaxPayloadType } from "@/models/types/shared/handlers-type";
import { SelectTrigger } from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useCustomStyles } from "@/hooks";

interface FormErrors {
    name: string;
    rate: string;
    description: string;
    type: string;
}

const CreateTaxesForm = ({handleFormClose, business_id}: {handleFormClose: () => void, business_id: string}) => {
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        rate: "",
        description: "",
        type: ""
    });
    const [formData, setFormData] = useState<Omit<TaxPayloadType, "business_id">>({
        name: "",
        rate: 0,
        type: "inclusive",
        description: ""
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    const {hiddenScrollbar} = useCustomStyles();

    const taxHandler = useTaxesHandler();

    const validInputs = (name: keyof Omit<TaxPayloadType, "business_id">, value: string | Pick<TaxPayloadType, "type">[keyof Pick<TaxPayloadType, "type">]) => {
        switch(name) {
            case "name":
                return !value?.trim() ? "Tax name is required" : "";
            case "rate":
                return !value ? "Tax rate is required" : "";
            case "type":
                return value.toLowerCase() !== "inclusive" && value.toLowerCase() !== "exclusive" ? "Invalid tax type" : "";
            case "description":
                return !value?.trim() ? "Tax description is required" : "";
            default:
                return "";
        }
    };
    
    const handleInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name as keyof Omit<TaxPayloadType, "business_id" | "type">]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name as keyof FormErrors]: undefined
            }));
        }
    };

    const handleSelect = (name: keyof Pick<TaxPayloadType, "type">, value: Pick<TaxPayloadType, "type">[keyof Pick<TaxPayloadType, "type">]) => {
        if (name === "type") {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            if (errors[name as keyof Pick<FormErrors, "type">]) {
                setErrors(prev => ({
                    ...prev,
                    [name as keyof FormErrors]: undefined
                }))
            }
        }
    };

    const validateForm = () => {
        let isValid = true;
        const errors_info = {} as FormErrors;
        Object.entries(formData)?.forEach(([key, value]) => {
            const error = validInputs(key as keyof Omit<TaxPayloadType, "business_id">, value as string | Pick<TaxPayloadType, "type">[keyof Pick<TaxPayloadType, "type">]);
            if (error) {
                isValid = false;
                errors_info[key as keyof FormErrors] = error;
            }
        });
        setErrors(errors_info);
        return isValid;
    };

    const queryClient = useQueryClient();

    const handleTaxSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload: TaxPayloadType = {
            name: formData.name,
            rate: +formData.rate,
            type: formData.type,
            description: formData.description,
            business_id: +business_id
        };
        try {
            await taxHandler.mutateAsync(payload, {
                onSuccess: (data) => {
                    toast.success("Tax created successfully");
                    handleFormClose();
                    setFormData(prev => ({
                        ...prev,
                        name: "",
                        rate: 0,
                        type: "inclusive",
                        description: ""
                    }));
                    queryClient.invalidateQueries({
                        queryKey: ["get-taxes", payload?.business_id]
                    });
                },
                onError: (err) => {
                    console.log(err);
                    toast.error(err?.message ?? "An unexpected error occurred while creating tax");
                }
            })
        }catch(err) {
            if (err instanceof Error) {
                toast.error(err.message ?? "An error occurred while creating tax");
                return;
            }
            toast.error("An Unexpected error occurred while creating tax");
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
                                <h2 className="text-xl font-bold">Create New Tax</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new tax to organize your products effectively
                        </p>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto" style={hiddenScrollbar}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Tax Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="name"
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputs}
                                        placeholder="Enter tax name"
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
                                <label htmlFor="rate" className="text-sm font-semibold text-gray-700">
                                    Tax Rate *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="rate"
                                        name="rate"
                                        value={formData.rate} 
                                        onChange={handleInputs}
                                        placeholder="Enter tax rate"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.rate 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.rate && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.rate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="type" className="text-sm font-semibold text-gray-700">
                                    Tax Type *
                                </label>
                                <div className="relative w-full">
                                    <Select onValueChange={(value: Pick<TaxPayloadType, "type">[keyof Pick<TaxPayloadType, "type">]) => handleSelect("type", value)}>
                                        <SelectTrigger className="w-full border border-template-whitesmoke-dim text-sm text-left px-2 rounded-md py-2.5">
                                            <SelectValue placeholder="Select Tax Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="inclusive">Inclusive</SelectItem>
                                            <SelectItem value="exclusive">Exclusive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.type}</span>
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
                                        placeholder="Describe this tax (minimum 10 characters)"
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
                                        <span>Create Tax</span>
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

export default CreateTaxesForm;