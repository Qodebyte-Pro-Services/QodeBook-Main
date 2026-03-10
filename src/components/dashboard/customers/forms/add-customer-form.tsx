"use client";
import { useCustomerHandler, useSuppliersHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, FolderPlus, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface FormData {
    business_id?: number;
    name: string;
    email: string;
    phone: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
}

const CustomerForm = ({handleFormClose, business_id}: {handleFormClose: () => void, business_id: string}) => {
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        email: "",
        phone: ""
    });
    const [formData, setFormData] = useState<FormData>({
        business_id: 0,
        name: "",
        email: "",
        phone: ""
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const validateInputs = (name: string, value: string): string => {
        switch(name) {
            case "name":
                return !value.trim() ? "Customer's name is required" : "";
            case "email":
                return !value.trim() ? "Email is required" : "";
            case "phone":
                return !value.trim() ? "Phone is required" : "";
            default:
                return "";
        }
    }

    const handleInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name as keyof FormData]: value
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
            if (typeof item !== "number") {
                errorTree[item as keyof FormErrors] = validateInputs(item, `${formData[item as keyof FormData]}`) ?? `${item} Is Required`;
                if (!errorTree[item as keyof FormErrors]) {
                    isValid = true;
                }
            }
        })

        setErrors(errorTree);
        return isValid;
    }

    const queryClient = useQueryClient();
    const customerHandler = useCustomerHandler();

    const handleSupplier = async () => {
        if (!validatedForm()) return;
        const formdata = {...formData, business_id: +business_id};
        setIsSubmitting(true);
        try {
            await customerHandler.mutateAsync(formdata, {
                onSuccess: async (data) => {
                    toast.success(data?.message ?? "Customer created successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["get-customers", formdata?.business_id],
                        refetchType: "active"
                    });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    handleFormClose();
                },
                onError: (err) => {
                    console.log(err);
                    toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating Supplier");
                }
            });
            setFormData({
                name: "",
                email: "",
                phone: ""
            });
        }catch(err) {
            console.log(err);
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating Supplier");
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
                                <h2 className="text-xl font-bold">Create New Customer</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new Customer to organize your products effectively
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Supplier Name */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Customer Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="name"
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleInputs}
                                        placeholder="Enter Customer name"
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
                                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Customer Email *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="email"
                                        name="email"
                                        value={formData.email} 
                                        onChange={handleInputs}
                                        placeholder="Enter Customer Email"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.email 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.email && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                    Customer Phone *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="phone"
                                        name="phone"
                                        value={formData.phone} 
                                        onChange={handleInputs}
                                        placeholder="Enter Customer Phone"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.phone 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.phone && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.phone}</span>
                                        </div>
                                    )}
                                </div>
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
                                onClick={handleSupplier}
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
                                        <span>Create Customer</span>
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

export default CustomerForm;