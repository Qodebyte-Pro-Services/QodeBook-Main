"use client";
import { useBranchHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, Building2, MapPin, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface FormData {
    business_id: number | string;
    branch_name: string;
    location: string;
}

interface FormErrors {
    branch_name?: string;
    location?: string;
}

const BusinessBranchForm = ({handleFormClose, business_id}: {handleFormClose: () => void, business_id: string}) => {
    const [errors, setErrors] = useState<FormErrors>({
        branch_name: "",
        location: ""
    });
    const [formData, setFormData] = useState<FormData>({
        business_id: business_id,
        branch_name: "",
        location: ""
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const branchHandler = useBranchHandler();

    const validateInputs = (name: string, value: string): string => {
        switch(name) {
            case "branch_name":
                return !value.trim() ? "Branch name is required" : "";
            case "location":
                return !value.trim() ? "Location is required" : "";
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
        let isValid = true;

        Object.keys(formData)?.forEach(item => {
            if (item !== 'business_id') {
                const error = validateInputs(item, formData[item as keyof Omit<FormData, 'business_id'>]);
                if (error) {
                    errorTree[item as keyof FormErrors] = error;
                    isValid = false;
                }
            }
        });

        setErrors(errorTree);
        return isValid;
    }

    const queryClient = useQueryClient();

    const handleBranch = async () => {
        if (!validatedForm()) return;
        setIsSubmitting(true);
        try {
            await branchHandler.mutateAsync(formData, {
                onSuccess: (data) => {
                    queryClient.invalidateQueries({
                        queryKey: ["businessBranches", business_id],
                        refetchType: 'active'
                    });
                    toast.success(data?.message ?? "Branch created successfully");
                    setFormData({
                        business_id: business_id,
                        branch_name: "",
                        location: ""
                    });
                    handleFormClose();
                },
                onError: (err) => {
                    console.log(err);
                    toast.error(err?.message ?? "An unexpected error occurred while creating branch");
                }
            });
        }catch(err) {
            console.log(err);
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating branch");
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
                                    <Building2 size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Create New Branch</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new branch location for your business
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Branch Name */}
                            <div className="space-y-2">
                                <label htmlFor="branch_name" className="text-sm font-semibold text-gray-700">
                                    Branch Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="branch_name"
                                        name="branch_name"
                                        value={formData.branch_name} 
                                        onChange={handleInputs}
                                        placeholder="Enter branch name"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.branch_name 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.branch_name && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.branch_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-semibold text-gray-700">
                                    Address *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <MapPin size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputs}
                                        placeholder="Enter branch address"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.location
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {errors.location && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{errors.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            {/* <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Phone size={16} />
                                    </div>
                                    <input 
                                        type="tel" 
                                        id="phone"
                                        name="phone"
                                        value={formData.phone} 
                                        onChange={handleInputs}
                                        placeholder="Enter phone number"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
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
                            </div> */}
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
                                onClick={handleBranch}
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
                                        <Building2 size={16} />
                                        <span>Create Branch</span>
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

export default BusinessBranchForm;