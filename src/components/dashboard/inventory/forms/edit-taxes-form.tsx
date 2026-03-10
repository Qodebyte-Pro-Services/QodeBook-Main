"use client";
import { useAttributeUpdateHandler, useUpdateTaxesHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, Edit3, AlertCircle, Plus, Minus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
    name: string;
    rate: number | string;
    type: "inclusive" | "exclusive";
    description?: string;
}

interface FormErrors {
    name?: string;
    rate?: string;
    type?: string;
    description?: string;
}

interface EditTaxesFormProps {
    handleFormClose: () => void;
    business_id: number;
    attributeData: ConfigTaxesTask;
}

const EditTaxesForm = ({ handleFormClose, business_id, attributeData }: EditTaxesFormProps) => {
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        rate: "",
        type: "",
        description: ""
    });
    const [formData, setFormData] = useState<FormData>({
        name: attributeData?.name || "",
        rate: attributeData?.rate || 0,
        type: attributeData?.type || "inclusive",
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const taxesUpdateHandler = useUpdateTaxesHandler();

    useEffect(() => {
        if (attributeData) {
            setFormData({
                name: attributeData.name || "",
                rate: attributeData.rate || 0,
                type: attributeData?.type || "inclusive"
            });
        }
    }, [attributeData]);

    const validateInputs = (name: string, value: string | number): string => {
        switch(name) {
            case "name":
                return !value || (typeof value === 'string' && !value.trim()) ? "Attribute name is required" : "";
            case "rate":
                return !value ? "Tax rate is required" : "";
            case "type":
                return (value as string).toLowerCase() !== "inclusive" && (value as string).toLowerCase() !== "exclusive" ? "Invalid tax type" : "";
            default:
                return "";
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof Omit<FormErrors, "description">]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    }

    const handleValueChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof Pick<FormErrors, "type">]) {
            setErrors(prev => ({
                ...prev,
                type: undefined
            }))
        }
    }
    
    const validatedForm = (): boolean => {
        const errorTree: FormErrors = {};
        let isValid = true;

        Object.entries(formData)?.forEach(([key, value]) => {
            const error = validateInputs(key, value);
            if (error) {
                errorTree[key as keyof FormErrors] = error;
                isValid = false;
            }
        })

        setErrors(errorTree);
        return isValid;
    }

    const queryClient = useQueryClient();

    const handleUpdateTaxes = async () => {
        if (!validatedForm()) return;
        
        const updateData = {
            id: parseInt(`${attributeData?.id}`),
            name: formData.name,
            rate: formData.rate,
            type: formData.type,
            business_id: +business_id
        };
        
        setIsSubmitting(true);
        try {
            await taxesUpdateHandler?.mutateAsync(updateData, {
                onSuccess: (data) => {
                    toast.success(data?.message ?? "Tax updated successfully");
                    handleFormClose();
                    queryClient.invalidateQueries({
                        queryKey: ["get-taxes", updateData.business_id]
                    });
                },
                onError: (err) => {
                    toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while updating taxes");
                }
            })
        } catch(err) {
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while updating taxes");
        } finally {
            setIsSubmitting(false);
        }
    }

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
                    <div className="bg-gradient-to-r from-template-primary to-template-chart-store p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Edit3 size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Edit Attribute</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Update attribute information and values
                        </p>
                    </div>

                    <div className="p-6">
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
                                        onChange={handleInputChange}
                                        placeholder="Enter attribute name"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.name 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
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
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Tax Rate *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="rate"
                                        name="rate"
                                        value={formData.rate} 
                                        onChange={handleInputChange}
                                        placeholder="Enter tax rate"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.rate 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
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
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Tax Type *
                                </label>
                                <div className="relative">
                                    <Select
                                        value={formData?.type || "inclusive"}
                                        onValueChange={(val) => handleValueChange("type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Value" />
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
                                onClick={handleUpdateTaxes}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit3 size={16} />
                                        <span>Update Tax</span>
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

export default EditTaxesForm;
