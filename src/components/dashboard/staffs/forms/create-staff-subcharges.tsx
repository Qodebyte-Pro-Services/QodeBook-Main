"use client";
import { useCategoryHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, FolderPlus, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { StaffResponseLogic, StaffShiftResponse } from "@/models/types/shared/handlers-type";
import { useStaffSubchargesHandler } from "@/hooks/useControllers";

type SubchargesPayloadLogic = {
    business_id: number;
    staff_id: string;
    sub_charge_amt: number;
    reason: string;
}

type SubchargesErrorLogic = {
    sub_charge_amt: string;
    reason: string;
}

type SubchargeFormLogic = {
    handleFormClose: () => void;
    staff_details: StaffResponseLogic;
}

const CreateStaffSubcharges = ({handleFormClose, staff_details}: SubchargeFormLogic) => {
    const [subcharges, setSubcharges] = useState<SubchargesPayloadLogic>(() => ({
        business_id: staff_details?.business_id,
        staff_id: staff_details?.staff_id,
        sub_charge_amt: 0,
        reason: ""
    }));

    const [subchargeError, setSubchargeError] = useState<SubchargesErrorLogic>({
        reason: "",
        sub_charge_amt: ""
    });
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const staffSubchargeHandler = useStaffSubchargesHandler();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        if (name && value) {
            setSubcharges(prev => ({
                ...prev,
                [name as keyof SubchargesPayloadLogic]: value
            }));
            setSubchargeError(prev => ({
                ...prev,
                [name as keyof SubchargesErrorLogic]: undefined
            }));
            return;
        }
        setSubcharges(prev => ({
            ...prev,
            [name as keyof SubchargesPayloadLogic]: value
        }));
    };

    const validateInputs = (name: string, value: string | number) => {
        let text;
        switch(name) {
            case "sub_charge_amt":
                if (Number(value) === 0) {
                    text = "Subcharge Required";
                }else if (/\D/g.test(`${value}`)) {
                    text = "Only Number Is Required";
                }
                break;
            case "reason":
                if (!(value as string)?.trim()) {
                    text = "Reason is required";
                }
                break;
            default:
                break;
        }
        return text;
    }

    const validatedForm = () => {
        const newErrors = {} as Record<string, string>;
        let isValid = true;
        Object.entries(subcharges).forEach(([key, value]) => {
            const invalid_error = validateInputs(key, value);
            if (invalid_error) {
                Object.assign(newErrors, {[key as keyof SubchargesErrorLogic]: invalid_error});
            }
        });
        if (Object.keys(newErrors)?.length) {
            setSubchargeError(prev => ({
                ...prev,
                ...newErrors
            }));
            isValid = false;
        }
        return isValid;
    }

    const handleSubchargeSubmit = async () => {
        if (!validatedForm()) return;
        setIsSubmitting(true);
        try {
            const payload = {
                ...subcharges
            };
            await staffSubchargeHandler.mutateAsync(payload, {
                onSuccess(data) {
                    toast.success(data?.message || "Staff Subcharge Added Successfully");
                    setIsSubmitting(false);
                    setTimeout(() => {
                        handleFormClose?.();
                    }, 2000);
                },
                onError(err) {
                    toast.error(err?.message || "Error Occurred While Trying To Create Staff Subcharges");
                    setIsSubmitting(false);
                    setTimeout(() => {
                        handleFormClose?.();
                    }, 2000);
                }
            })
        }catch(err) {
            console.log(err);
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
                                <h2 className="text-xl font-bold">Create New Staff Subcharge</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new staff subcharge
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Category Name */}
                            <div className="space-y-2">
                                <label htmlFor="sub_charge_amt" className="text-sm font-semibold text-gray-700">
                                    Subcharge Amount *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        min={0} 
                                        id="sub_charge_amt"
                                        name="sub_charge_amt"
                                        value={subcharges?.sub_charge_amt} 
                                        onChange={handleInput}
                                        placeholder="Enter category name"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            subchargeError?.sub_charge_amt 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {subchargeError?.sub_charge_amt && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{subchargeError?.sub_charge_amt}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label htmlFor="reason" className="text-sm font-semibold text-gray-700">
                                    Reason *
                                </label>
                                <div className="relative">
                                    <textarea 
                                        id="reason"
                                        name="reason"
                                        rows={4}
                                        value={subcharges?.reason} 
                                        onChange={handleInput}
                                        placeholder="Describe this category (minimum 10 characters)"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                                            subchargeError?.reason 
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                        }`}
                                    />
                                    {subchargeError?.reason && (
                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                            <AlertCircle size={14} />
                                            <span>{subchargeError?.reason}</span>
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
                                onClick={handleSubchargeSubmit}
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
                                        <span>Create Subcharge</span>
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

export default CreateStaffSubcharges;