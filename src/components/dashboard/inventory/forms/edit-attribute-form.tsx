"use client";
import { useAttributeUpdateHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect, useMemo } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, Edit3, AlertCircle, Plus, Minus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfigUnitTask } from "@/store/data/config-unit-data";

interface AttributeValueItem {
    id: number;
    value: string;
}

interface FormData {
    name: string;
    values: AttributeValueItem[];
}

interface FormErrors {
    name?: string;
    values?: string;
}

interface EditAttributeFormProps {
    handleFormClose: () => void;
    business_id: number;
    attributeData: ConfigUnitTask;
}

const EditAttributeForm = ({ handleFormClose, business_id, attributeData }: EditAttributeFormProps) => {
    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        values: ""
    });
    const [formData, setFormData] = useState<FormData>({
        name: attributeData?.name || "",
        values: attributeData?.values?.map(v => ({ id: Number(v?.id), value: v?.value ?? "" })).filter(v => typeof v.value === "string") || []
    });

    const [valuesToRemove, setValuesToRemove] = useState<number[]>([]);

    const [updatedAttributes, setUpdatedAttributes] = useState<Array<{id: number; value: string}>>([]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const attributeUpdateHandler = useAttributeUpdateHandler();

    useEffect(() => {
        if (attributeData) {
            setFormData({
                name: attributeData.name || "",
                values: (attributeData.values || [])
                    .map(v => ({ id: Number(v?.id), value: v?.value ?? "" }))
            });
            setValuesToRemove([]);
        }
    }, [attributeData]);

    const originalValueById = useMemo<Record<number, string>>(() => {
        const map: Record<number, string> = {};
        (attributeData?.values || []).forEach(v => {
            if (v?.id != null) map[Number(v.id)] = v?.value ?? "";
        });
        return map;
    }, [attributeData]);

    const validateInputs = (name: string, value: string | string[]): string => {
        switch(name) {
            case "name":
                return !value || (typeof value === 'string' && !value.trim()) ? "Attribute name is required" : "";
            case "values":
                if (Array.isArray(value)) {
                    if (value.length === 0) return "At least one value is required";
                    if (value.some(v => !v.trim())) return "All values must be non-empty";
                }
                return "";
            default:
                return "";
        }
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            name: value
        }));
        if (errors.name) {
            setErrors(prev => ({
                ...prev,
                name: undefined
            }));
        }
    }

    const handleValueChange = (index: number, value: string, dataId: number) => {
        const newValues = [...formData.values];
        newValues[index] = { ...newValues[index], value };
        if (attributeData?.values?.some(v => +v?.id === dataId)) {
            setUpdatedAttributes(prev => {
                if (prev?.some(item => item?.id === dataId)) {
                    return prev?.map(item => item?.id === dataId ? { ...item, value } : item);
                }else {
                    return [...prev, { id: dataId, value }];
                }
            })
        }
        setFormData(prev => ({
            ...prev,
            values: newValues
        }));
        if (errors.values) {
            setErrors(prev => ({
                ...prev,
                values: undefined
            }));
        }
    }

    const addValue = () => {
        setFormData(prev => ({
            ...prev,
            values: [...prev?.values, {id: prev?.values?.[prev?.values?.length - 1]?.id + 1, value: ""}]
        }));
    }

    const removeValue = (index: number) => {
        if (formData.values.length > 1) {
            const target = formData.values[index];
            if (target?.id != null) {
                setValuesToRemove(prev => Array.from(new Set([...prev, Number(target.id)])));
            }
            const newValues = formData.values.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                values: newValues
            }));
        }
    }

    const validatedForm = (): boolean => {
        const errorTree: FormErrors = {};
        let isValid = true;

        const nameError = validateInputs("name", formData.name);
        if (nameError) {
            errorTree.name = nameError;
            isValid = false;
        }

        const valueStrings = formData.values.map(v => v.value);
        const valuesError = validateInputs("values", valueStrings);
        if (valuesError) {
            errorTree.values = valuesError;
            isValid = false;
        }

        setErrors(errorTree);
        return isValid;
    }

    const queryClient = useQueryClient();

    const handleUpdateAttribute = async () => {
        if (!validatedForm()) return;
        
        // Build payload parts
        const values_to_add = formData.values
            .filter(v => v.id != null)
            .filter(v => (originalValueById[Number(v.id)] ?? "") !== (v.value ?? ""))
            .map(v => v?.value);

        const values_to_update = updatedAttributes;

        const values_to_remove = valuesToRemove;

        const updateData = {
            id: parseInt(attributeData?.id),
            business_id,
            name: formData.name,
            values_to_add,
            values_to_update,
            values_to_remove
        };
        
        setIsSubmitting(true);
        try {
            await attributeUpdateHandler.mutateAsync(updateData, {
                onSuccess: (data) => {
                    queryClient.invalidateQueries({
                        queryKey: ["get-attributes", business_id],
                        refetchType: 'active'
                    });
                    toast.success(data?.message ?? "Attribute updated successfully");
                    handleFormClose();
                },
                onError: (err) => {
                    console.log(err);
                    toast.error(err?.message ?? "An unexpected error occurred while updating attribute");
                }
            });
        } catch(err) {
            console.log(err);
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while updating attribute");
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
                                    Attribute Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        id="name"
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleNameChange}
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
                                <label className="text-sm font-semibold text-gray-700">
                                    Values *
                                </label>
                                <div className="space-y-3">
                                    {formData.values.map((value, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input 
                                                type="text"
                                                data-id={value?.id}
                                                value={value.value}
                                                onChange={(e) => handleValueChange(index, e.target.value, e.target?.dataset?.id ? +e.target?.dataset?.id : 0)}
                                                placeholder={`Value ${index + 1}`}
                                                className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                    errors.values 
                                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                        : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
                                                }`}
                                            />
                                            {formData.values.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeValue(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addValue}
                                        className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-xl hover:bg-green-50 transition-colors"
                                    >
                                        <Plus size={16} />
                                        <span>Add Value</span>
                                    </button>
                                </div>
                                {errors.values && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle size={14} />
                                        <span>{errors.values}</span>
                                    </div>
                                )}
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
                                onClick={handleUpdateAttribute}
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
                                        <span>Update Attribute</span>
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

export default EditAttributeForm;
