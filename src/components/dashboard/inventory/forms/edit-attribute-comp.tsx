// Path: src/components/dashboard/inventory/forms/edit-attributes.tsx

"use client";

import { useCustomStyles } from "@/hooks";
import { useAttributeUpdateHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, Edit2, Plus, Minus } from "lucide-react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { ProductAttributeProp } from "@/models/types/shared/project-type";
import { useQueryClient } from "@tanstack/react-query";

interface BaseOption {
    name: string;
    type: 'text' | 'number' | 'color' | 'range' | 'dropdown';
    values?: string[];
    immutable?: boolean;
    id?: number;
    business_id?: number;
}

interface EditAttributesProps {
    businessId: number;
    attributes: (ProductAttributeProp | BaseOption)[];
    editingOptionName?: string | null;
    isOpen: boolean;
    handleClose: () => void;
    onAttributeUpdated?: () => void;
}

const EditAttributes = ({
    businessId,
    attributes,
    editingOptionName,
    isOpen,
    handleClose,
    onAttributeUpdated
}: EditAttributesProps) => {
    const { hiddenScrollbar } = useCustomStyles();
    const queryClient = useQueryClient();

    const [selectedAttributeIndex, setSelectedAttributeIndex] = useState<number | null>(null);
    const [newValues, setNewValues] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const newValueInputRef = useRef<(HTMLInputElement | null)[]>([]);
    const { mutateAsync } = useAttributeUpdateHandler();

    // Update selected index when editingOptionName or attributes change
    useEffect(() => {
        if (editingOptionName) {
            const foundIndex = attributes.findIndex(attr => attr.name === editingOptionName);
            setSelectedAttributeIndex(foundIndex >= 0 ? foundIndex : null);
            setNewValues([""]);
        } else {
            setSelectedAttributeIndex(null);
            setNewValues([""]);
        }
    }, [editingOptionName, attributes]);

    const selectedAttribute = selectedAttributeIndex !== null ? attributes[selectedAttributeIndex] : null;
    const isProductAttributeProp = (attr: ProductAttributeProp | BaseOption): attr is ProductAttributeProp => 'id' in attr && typeof attr.id === 'number';
    const hasId = (attr: ProductAttributeProp | BaseOption | null): attr is (ProductAttributeProp | (BaseOption & { id: number })) => attr !== null && 'id' in attr && typeof attr.id === 'number';

    const containerVariant = {
        from: { scale: 0.95, opacity: 0, y: 20 },
        to: { scale: 1, opacity: 1, y: 0 },
        go: { scale: 0.95, opacity: 0, y: 20 }
    };

    const handleAttributeSelect = (index: number) => {
        setSelectedAttributeIndex(index);
        setNewValues([""]); // Reset new values when switching attributes
    };

    const handleAddValueInput = () => {
        setNewValues([...newValues, ""]);
    };

    const handleRemoveValueInput = (index: number) => {
        setNewValues(newValues.filter((_, i) => i !== index));
    };

    const handleValueChange = (index: number, value: string) => {
        const updated = [...newValues];
        updated[index] = value;
        setNewValues(updated);
    };

    const validateInputs = (): boolean => {
        const validValues = newValues.filter(v => v.trim()).length;
        if (validValues === 0) {
            toast.error("Please add at least one new value");
            return false;
        }
        return true;
    };

    const handleUpdateAttribute = async () => {
        if (!selectedAttribute || !validateInputs() || !hasId(selectedAttribute)) return;

        const valuesToAdd = newValues.filter(v => v.trim());

        try {
            setIsSubmitting(true);
            await mutateAsync({
                id: selectedAttribute.id,
                business_id: selectedAttribute.business_id || businessId,
                name: selectedAttribute.name,
                values_to_add: valuesToAdd,
                values_to_update: [],
                values_to_remove: []
            }, {
                onSuccess: async (data) => {
                    toast.success(
                        data?.message ?? 
                        `Added ${valuesToAdd.length} new value(s) to "${selectedAttribute.name}" attribute`
                    );
                    setNewValues([""]);
                    
                    // Refetch the query to get updated data before closing modal
                    try {
                        await queryClient.refetchQueries({ 
                            queryKey: ['product_variants', businessId],
                            type: 'active'
                        });
                    } catch (err) {
                        console.error('Failed to refetch attributes:', err);
                    }
                    
                    onAttributeUpdated?.();
                    // Close modal after data is refetched
                    handleClose();
                },
                onError: (error) => {
                    const errorMessage = error instanceof Error 
                        ? error.message 
                        : "Failed to update attribute";
                    toast.error(errorMessage);
                }
            });
        } catch {
            toast.error("Failed to update attribute. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[85vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-template-primary to-template-chart-store p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Edit2 size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Edit Attributes</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add new values to your existing attributes
                        </p>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto" style={hiddenScrollbar}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Attributes List */}
                            <div className="space-y-2">
                                {!editingOptionName && (
                                    <label className="text-sm font-semibold text-gray-700">
                                        Select Attribute
                                    </label>
                                )}
                                <div className="space-y-2">
                                    {attributes.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No attributes created yet</p>
                                        </div>
                                    ) : (
                                        attributes
                                            .map((attr, index) => ({ attr, index }))
                                            .filter(({ attr }) => !editingOptionName || attr.name === editingOptionName)
                                            .map(({ attr, index }) => {
                                                const attrId = isProductAttributeProp(attr) ? attr.id : index;
                                                const attrValues = isProductAttributeProp(attr) ? attr.values : (attr.values || []);
                                                const valueCount = Array.isArray(attrValues) ? attrValues.length : 0;
                                                return (
                                                    <button
                                                        key={attrId}
                                                        onClick={() => handleAttributeSelect(index)}
                                                        className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                                            selectedAttributeIndex === index
                                                                ? "border-template-primary bg-template-primary/10"
                                                                : "border-gray-200 hover:border-gray-300 bg-white"
                                                        }`}
                                                    >
                                                        <div className="font-medium text-gray-900">{attr.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {valueCount} value{valueCount !== 1 ? 's' : ''}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                    )}
                                </div>
                            </div>

                            {/* Attribute Details & Add Values */}
                            <div className="space-y-4">
                                {selectedAttribute && (
                                    <>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                                Existing Values
                                            </label>
                                            <div className="space-y-2">
                                                {isProductAttributeProp(selectedAttribute) ? (
                                                    selectedAttribute.values.length === 0 ? (
                                                        <p className="text-sm text-gray-500">No values yet</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedAttribute.values.map((val) => (
                                                                <span
                                                                    key={`val-${val.id}`}
                                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                                >
                                                                    {val.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )
                                                ) : (
                                                    selectedAttribute.values && selectedAttribute.values.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedAttribute.values.map((val, idx) => (
                                                                <span
                                                                    key={`val-${selectedAttributeIndex}-${idx}-${val?.toString()?.replace(/\s+/g, '-')}`}
                                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                                >
                                                                    {val}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No values yet</p>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                                Add New Values
                                            </label>
                                            <div className="space-y-2">
                                                {newValues.map((value, index) => (
                                                    <div key={`new-val-${selectedAttributeIndex}-${index}`} className="flex items-center gap-2">
                                                        <input
                                                            ref={(el) => {
                                                                if (el) {
                                                                    const refs = [...(newValueInputRef.current || [])];
                                                                    refs[index] = el;
                                                                    newValueInputRef.current = refs;
                                                                }
                                                            }}
                                                            type="text"
                                                            value={value}
                                                            onChange={(e) => handleValueChange(index, e.target.value)}
                                                            placeholder={`New value ${index + 1}`}
                                                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-template-primary/30 focus:border-template-primary"
                                                        />
                                                        {newValues.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveValueInput(index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={handleAddValueInput}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-template-primary border border-template-primary rounded-lg hover:bg-template-primary/10 transition-colors"
                                                >
                                                    <Plus size={14} />
                                                    <span>Add More Values</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateAttribute}
                                disabled={!selectedAttribute || !hasId(selectedAttribute) || isSubmitting}
                                className="flex-1 py-3 px-4 bg-template-primary text-white rounded-lg font-medium hover:bg-template-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                title={selectedAttribute && !hasId(selectedAttribute) ? "Attribute data loading, please wait..." : ""}
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit2 size={16} />
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
};

export default EditAttributes;