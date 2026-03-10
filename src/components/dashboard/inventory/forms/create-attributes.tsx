"use client";

import { useCustomStyles } from "@/hooks";
import { useAttributeBulkHandler } from "@/hooks/useHandlers";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { X, FolderPlus, AlertCircle, Plus, Minus } from "lucide-react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";

const CreateCategoryForm = ({businessId, handleFormClose}: {businessId: string, handleFormClose: () => void}) => {
    const {hiddenScrollbar} = useCustomStyles();
    const [inputGenerated, setInputGenerated] = useState<number>(1);
    const [attributeName, setAttributeName] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const valueInputRef = useRef<(HTMLInputElement | null)[]>([]);
    const {mutateAsync} = useAttributeBulkHandler();

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

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const inputtag = e.currentTarget;
        const value = inputtag.value;
        if (/\W/.test(value)) {
            inputtag.classList.add("border-red-500");
            (inputtag.nextElementSibling as HTMLDivElement).innerHTML = "Invalid Input, Symbols and Spaces Are Not Allowed";
        }else {
            inputtag.classList.remove("border-red-500");
            (inputtag.nextElementSibling as HTMLDivElement).innerHTML = "";
        }
    }

    interface AttributePayload {
        business_id: string;
        attributes: Array<{
            name: string;
            values: string[];
        }>;
    }

    const resetForm = () => {
        setInputGenerated(1);
        setAttributeName("");
        valueInputRef.current = [];
    };

    const showError = (message: string, error?: unknown) => {
        toast.error(message);
        if (error instanceof Error) {
            console.error("Error details:", error);
        } else if (error) {
            console.error("Unexpected error:", error);
        }
    };

    const validateInputs = (): { isValid: boolean; values: string[] } => {
        const attributeValues = valueInputRef.current
            .filter((input): input is HTMLInputElement => input !== null && Boolean(input.value))
            .map(input => input.value.trim())
            .filter(Boolean);
        console.log(attributeValues);
        return {
            isValid: Boolean(attributeName.trim()) && attributeValues.length > 0,
            values: attributeValues
        };
    };

    const handleAttributeBulk = async () => {
        const { isValid, values: attributeValues } = validateInputs();
        
        if (!isValid) {
            toast.error("Please provide both an attribute name and at least one value");
            return;
        }

        const payload: AttributePayload = {
            business_id: businessId,
            attributes: [
                {
                    name: attributeName.trim(),
                    values: attributeValues
                }
            ]
        };

        try {
            setIsSubmitting(true);
            await mutateAsync(payload, {
                onSuccess: (data) => {
                    toast.success(data.message || "Attribute created successfully");
                    resetForm();
                },
                onError: (error) => {
                    const errorMessage = error instanceof Error 
                        ? `Error creating attribute: ${error.message}`
                        : "An unexpected error occurred while creating the attribute";
                    showError(errorMessage, error);
                }
            });
        } catch (error) {
            showError("Failed to process attribute creation. Please try again.", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[85vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-template-primary to-template-chart-store p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <FolderPlus size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Create New Attribute</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Add a new attribute with values to organize your products effectively
                        </p>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto" style={hiddenScrollbar}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="attributeName" className="text-sm font-semibold text-gray-700">
                                    Attribute Name *
                                </label>
                                <div className="relative">
                                    <input 
                                        id="attributeName"
                                        type="text" 
                                        value={attributeName}
                                        onChange={(e) => setAttributeName(e.currentTarget.value)}
                                        placeholder="Eg. Color"
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 border-gray-300 focus:ring-green-200 focus:border-green-500`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Values *
                                </label>
                                <div className="space-y-3">
                                    {Array.from({length: inputGenerated}).map((_, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input 
                                                ref={(el) => {
                                                    if (el) {
                                                        const refs = [...(valueInputRef.current || [])];
                                                        refs[index] = el;
                                                        valueInputRef.current = refs;
                                                    }
                                                }} 
                                                type="text"
                                                placeholder={`Value ${index + 1}`}
                                                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 border-gray-300 focus:ring-green-200 focus:border-green-500"
                                                onInput={(e) => handleInput(e)}
                                            />
                                            {inputGenerated > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setInputGenerated(prev => prev - 1)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setInputGenerated(prev => prev + 1)}
                                        className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-xl hover:bg-green-50 transition-colors"
                                    >
                                        <Plus size={16} />
                                        <span>Add Value</span>
                                    </button>
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
                                onClick={handleAttributeBulk}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FolderPlus size={16} />
                                        <span>Create Attribute</span>
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