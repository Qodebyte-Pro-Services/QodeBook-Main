"use client";
import { useCategoryHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, FolderPlus, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductCategories } from "@/api/controllers/get/handler";

interface FormData {
    name: string;
    description: string;
}

interface FormErrors {
    name?: string;
    description?: string;
}

const CreateCategoryForm = ({handleFormClose, businessId}: {handleFormClose: () => void, businessId: number}) => {
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        description: ""
    });
    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: ""
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const categoryHandler = useCategoryHandler();

    const {data: categories, isLoading: isCategorLoading, isSuccess: isCategorySuccess, isError: isCategoryError} = useQuery({
        queryKey: ["get-categories", businessId],
        queryFn: () => getProductCategories(businessId),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: businessId !== 0
    });

    const product_categories = useMemo(() => {
        if (!isCategoryError && isCategorySuccess) {
            return categories;
        }
    }, [categories, isCategorySuccess, isCategoryError]);

    const validateInputs = (name: string, value: string): string => {
        switch(name) {
            case "name":
                return !value.trim() ? "Category name is required" : "";
            case "description":
                let text = "";
                if (!value.trim()) {
                    text = "Description is required";
                } else if (value.trim().length < 10) {
                    text = "Description should be at least 10 characters";
                }
                return text;
            default:
                return "";
        }
    }

    const handleInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
        let isValid = false;

        Object.keys(formData)?.forEach(item => {
            errorTree[item as keyof FormErrors] = validateInputs(item, formData[item as keyof FormData]) ?? `${item} Is Required`;
            if (!errorTree[item as keyof FormErrors]) {
                isValid = true;
            }
        })

        setErrors(errorTree);
        return isValid;
    }

    const queryClient = useQueryClient();

    const handleCategory = async () => {
        if (!validatedForm()) return;
        const formdata = {...formData, business_id: +businessId};
        setIsSubmitting(true);
        try {
            await categoryHandler.mutateAsync(formdata, {
                onSuccess: (data) => {
                    queryClient.invalidateQueries({
                        queryKey: ["get-categories", businessId],
                        refetchType: "all",
                    });
                    toast.success(data?.message ?? "Category created successfully");
                    setFormData({
                        name: "",
                        description: ""
                    });
                    handleFormClose();
                },
                onError: (err) => {
                    console.log(err);
                    toast.error(err?.message ?? "An unexpected error occurred while creating category");
                }
            });
        }catch(err) {
            console.log(err);
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating category");
        }finally {
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
        <AnimatePresence>
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
                                <h2 className="text-xl font-bold">Create New Budgets</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new budget to organize your finance effectively
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Category Name */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Category Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="name"
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputs}
                                        placeholder="Enter category name"
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

                            {/* Description */}
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

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-1 lg:gap-3">
                            <button 
                                onClick={handleFormClose}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCategory}
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
                                        <span>Create Category</span>
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

export default CreateCategoryForm;