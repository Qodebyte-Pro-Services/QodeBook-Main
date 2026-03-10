"use client";

import React from "react";
import {
    PiUserBold,
    PiStorefrontBold,
    PiUserPlusBold,
    PiXBold,
    PiCaretRightBold
} from "react-icons/pi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { CustomerResponse } from "@/models/types/shared/handlers-type";
import { motion } from "framer-motion";

interface OrderSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: CustomerResponse[];
    selectedCustomer: string;
    storeType: string;
    onSetCustomer: (id: string) => void;
    onSetStoreType: (type: string) => void;
    onAddCustomer: () => void;
}

const OrderSettingsModal: React.FC<OrderSettingsModalProps> = ({
    isOpen,
    onClose,
    customers,
    selectedCustomer,
    storeType,
    onSetCustomer,
    onSetStoreType,
    onAddCustomer
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h2>
                        <p className="text-sm text-gray-500 font-medium">Configure customer and sale type</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <PiXBold size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Customer Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-[0.1em] text-gray-400 flex items-center gap-2 px-1">
                            <PiUserBold size={14} className="text-template-primary" />
                            Customer Information
                        </label>
                        <div className="flex gap-3">
                            <Select value={selectedCustomer || "0"} onValueChange={onSetCustomer}>
                                <SelectTrigger className="h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-template-primary text-base font-semibold">
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                    <SelectItem value="0" className="font-medium">Walk-In Customer</SelectItem>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()} className="font-medium">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                onClick={onAddCustomer}
                                className="h-14 w-14 bg-template-primary text-white rounded-2xl hover:bg-template-primary/90 transition-all shadow-lg shadow-template-primary/20 flex-shrink-0 flex items-center justify-center"
                                title="Add New Customer"
                            >
                                <PiUserPlusBold size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Sale Type Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-[0.1em] text-gray-400 flex items-center gap-2 px-1">
                            <PiStorefrontBold size={14} className="text-template-primary" />
                            Sale Channel
                        </label>
                        <Select value={storeType || "walk_in"} onValueChange={onSetStoreType}>
                            <SelectTrigger className="h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-template-primary text-base font-semibold">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                <SelectItem value="walk_in" className="font-medium">In-Store Sale</SelectItem>
                                <SelectItem value="online_order" className="font-medium">Online / Remote Order</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full h-16 bg-gray-900 text-white rounded-[1.25rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98]"
                    >
                        Save & Continue
                        <PiCaretRightBold size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSettingsModal;
