"use client";

import React from "react";
import {
    PiTrashBold,
    PiMinusBold,
    PiPlusBold,
    PiUserBold,
    PiStorefrontBold,
    PiTrashSimpleBold,
    PiCreditCardBold,
    PiIdentificationCardBold,
    PiUserPlusBold,
    PiFloppyDiskBold,
    PiFolderOpenBold,
} from "react-icons/pi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ProductVariantResponseObject, CustomerResponse } from "@/models/types/shared/handlers-type";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Settings2, CalculatorIcon } from "lucide-react";

interface SettingsControllerProps {
    selectedCustomer: string;
    storeType: string;
    customers: CustomerResponse[];
    onSetCustomer: (id: string) => void;
    onSetStoreType: (type: string) => void;
    onAddCustomer: () => void;
    isSettingsOpen: boolean;
    setIsSettingsOpen: () => void;
}

const SettingsController = ({
    selectedCustomer,
    storeType,
    customers,
    onSetCustomer,
    onSetStoreType,
    onAddCustomer,
    isSettingsOpen,
    setIsSettingsOpen,
}: SettingsControllerProps) => {
    return (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent>
                <div className="p-4 space-y-4 bg-gray-50/50 border-b border-gray-100">
                    <div className="space-y-2">
                        <DialogTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 flex items-center gap-1.5 px-1">
                            <PiUserBold size={12} className="text-template-primary/50" />
                            Customer
                        </DialogTitle>
                        <div className="flex gap-2">
                            <Select value={selectedCustomer || "0"} onValueChange={onSetCustomer}>
                                <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-template-primary h-11 rounded-xl shadow-sm">
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0" className="cursor-pointer">Walk-In Customer</SelectItem>
                                    {customers.filter(c => c.id !== 0).map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()} className="cursor-pointer">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                onClick={onAddCustomer}
                                className="w-11 h-11 bg-template-primary text-white rounded-xl hover:bg-template-primary/90 transition-all flex-shrink-0 flex items-center justify-center shadow-lg shadow-template-primary/20"
                                title="Add New Customer"
                            >
                                <PiUserPlusBold size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 flex items-center gap-1.5 px-1">
                            <PiStorefrontBold size={12} className="text-template-primary/50" />
                            Sale Type
                        </DialogTitle>
                        <Select value={storeType || "walk_in"} onValueChange={onSetStoreType}>
                            <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-template-primary h-11 rounded-xl shadow-sm">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="walk_in" className="cursor-pointer">In-Store Sale</SelectItem>
                                <SelectItem value="online_order" className="cursor-pointer">Online / Remote</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface CartSidebarProps {
    items: (ProductVariantResponseObject & { quantity: number; maxQuantity: number })[];
    customers: CustomerResponse[];
    selectedCustomer: string;
    storeType: string;
    subtotal: number;
    tax: number;
    discount: number;
    couponAmount: number;
    total: number;
    isSettingsOpen: boolean;
    setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onUpdateQuantity: (id: number, qty: number, max: number) => void;
    onCalculatorUpdate: (id: number, val: number, max: number) => void;
    onRemoveItem: (id: number) => void;
    onSetCustomer: (id: string) => void;
    onSetStoreType: (type: string) => void;
    onCheckout: () => void;
    onClearCart: () => void;
    onAddCustomer: () => void;
    onSaveDraft: () => void;
    onShowDrafts: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
    items,
    customers,
    selectedCustomer,
    storeType,
    subtotal,
    tax,
    discount,
    couponAmount,
    total,
    isSettingsOpen,
    setIsSettingsOpen,
    onUpdateQuantity,
    onCalculatorUpdate,
    onRemoveItem,
    onSetCustomer,
    onSetStoreType,
    onCheckout,
    onClearCart,
    onAddCustomer,
    onSaveDraft,
    onShowDrafts,
}) => {
    return (
        <div className="flex flex-col h-full bg-white relative z-10 w-full lg:w-96 lg:border-l lg:border-gray-100 shadow-2xl lg:shadow-none">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
                    <p className="text-xs text-gray-500 font-medium">{items.length} items selected</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onSaveDraft}
                        disabled={items.length === 0}
                        className="p-2 text-gray-400 hover:text-template-primary hover:bg-template-primary/5 rounded-xl transition-all disabled:opacity-30"
                        title="Save Draft"
                    >
                        <PiFloppyDiskBold size={20} />
                    </button>
                    <button
                        onClick={onShowDrafts}
                        className="p-2 text-gray-400 hover:text-template-primary hover:bg-template-primary/5 rounded-xl transition-all"
                        title="View Drafts"
                    >
                        <PiFolderOpenBold size={20} />
                    </button>
                    <button
                        onClick={onClearCart}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Clear Cart"
                    >
                        <PiTrashSimpleBold size={20} />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-gray-400 hover:text-template-primary hover:bg-template-primary/5 rounded-xl transition-all"
                        title="Settings"
                    >
                        <Settings2 size={20} />
                    </button>
                </div>
            </div>

            {/* Settings (Customer & Store) */}
            {isSettingsOpen ? (
                <SettingsController
                    selectedCustomer={selectedCustomer}
                    storeType={storeType}
                    customers={customers}
                    onSetCustomer={onSetCustomer}
                    onSetStoreType={onSetStoreType}
                    onAddCustomer={onAddCustomer}
                    isSettingsOpen={isSettingsOpen}
                    setIsSettingsOpen={() => setIsSettingsOpen(false)}
                />
            ) : null}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar scroll-smooth">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 p-4 hover:border-template-primary/30 hover:shadow-md transition-all duration-200">
                            <div className="flex gap-4">
                                {/* Image Container */}
                                <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden border border-gray-50 group-hover:border-template-primary/10 transition-colors">
                                    <Image
                                        src={item.image_url?.[0]?.secure_url || "/placeholder-product.png"}
                                        alt={item.sku}
                                        fill
                                        className="object-cover object-center aspect-video p-2"
                                    />
                                    {item.quantity > 1 && (
                                        <div className="absolute top-0 right-0 bg-template-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                                            x{item.quantity}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="overflow-hidden">
                                            <h4 className="text-sm font-bold text-gray-900 leading-tight truncate-2-lines group-hover:text-template-primary transition-colors">
                                                {item.sku}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase tracking-tight">
                                                {item.attributes?.map(a => a.value).join(' / ') || "Standard Unit"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove Item"
                                        >
                                            <PiTrashBold size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.maxQuantity)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-template-primary hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <PiMinusBold size={14} />
                                                </button>
                                                <span className="w-10 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.maxQuantity)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-template-primary hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                                                    disabled={item.quantity >= item.maxQuantity}
                                                >
                                                    <PiPlusBold size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => onCalculatorUpdate(item.id, item.quantity, item.maxQuantity)}
                                                className="w-8 h-8 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                                title="Quantity Calculator"
                                            >
                                                <CalculatorIcon size={16} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900 tracking-tight">
                                                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(+item.selling_price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 px-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <PiIdentificationCardBold size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Empty Cart</h3>
                        <p className="text-sm text-gray-400">Add some products to start an order</p>
                    </div>
                )}
            </div>

            {/* Footer / Summary */}
            <div className="p-6 bg-white border-t border-gray-100 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="font-bold text-gray-900">
                            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(subtotal)}
                        </span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">Discounts</span>
                            <span className="font-bold text-green-600">
                                -{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(discount)}
                            </span>
                        </div>
                    )}
                    {/* {couponAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-medium">Coupon</span>
                            <span className="font-bold text-blue-600">
                                -{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(couponAmount)}
                            </span>
                        </div>
                    )} */}
                    {/* {tax > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Tax</span>
                            <span className="font-bold text-gray-900">
                                +{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(tax)}
                            </span>
                        </div>
                    )} */}
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total Payable</span>
                        <span className="text-2xl font-black text-template-primary tracking-tight">
                            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(total)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    className={cn(
                        "w-full h-14 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-wider",
                        items.length > 0
                            ? "bg-template-primary text-white shadow-xl shadow-template-primary/20 hover:scale-[1.02] active:scale-95 hover:shadow-2xl hover:shadow-template-primary/30"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    <PiCreditCardBold size={24} />
                    Complete Order
                </button>
            </div>
        </div>
    );
};

export default CartSidebar;
