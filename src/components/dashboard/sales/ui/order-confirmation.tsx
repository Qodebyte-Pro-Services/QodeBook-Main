"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LiaTimesSolid } from "react-icons/lia";
import { IoIosCash } from "react-icons/io";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Receipt, CreditCard, CheckCircle2, X, Tag, Percent } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CustomerResponse } from "@/models/types/shared/handlers-type";

interface OrderItem {
    product_id: number;
    variant_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    sku?: string; // For display purposes only
    image_url: Array<{ public_id: string; secure_url: string }>;
}

interface OrderData {
    items: OrderItem[];
    customer: CustomerResponse;
    order_type: string;
    coupon?: string;
    subtotal?: number;
    coupon_amount?: number;
    tax?: number;
    taxes?: number;
    discount?: number;
    total?: number;
    total_amount?: number;
    payment_mode?: string | string[];
    // Additional fields for detailed display
    selectedDiscount?: {
        id: number;
        name: string;
        amount?: number;
        percentage?: string;
    };
    selectedTax?: {
        id: number;
        name: string;
        rate: number;
        type: 'inclusive' | 'exclusive';
    };
    selectedCoupon?: {
        id: number;
        code: string;
        discount_amount?: number;
        discount_percentage?: string;
    };
    [key: string]: any;
}

interface OrderConfirmationProps {
    orderData: OrderData;
    onClose: () => void;
    onConfirm: (paymentMethod: string | string[] | Array<[string, number]>) => void;
}

const OrderConfirmation = ({ orderData, onClose, onConfirm }: OrderConfirmationProps) => {
    const subtotal = orderData.subtotal || orderData.items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = orderData.taxes || orderData.tax || 0;
    const discount = orderData.discount || 0;
    const coupon_amount = orderData?.coupon_amount || 0;
    const total = orderData.total_amount || orderData.total || (subtotal + tax - discount - coupon_amount);
    const [paymentMethod, setPaymentMethod] = useState(orderData.payment_mode || "cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showMultiplePaymentModal, setShowMultiplePaymentModal] = useState(false);
    const [multiplePaymentMethods, setMultiplePaymentMethods] = useState<string[]>([]);
    const [paymentAmounts, setPaymentAmounts] = useState<{ [key: string]: number }>({
        cash: 0,
        card: 0,
        bank_transfer: 0
    });

    useEffect(() => {
        console.log(orderData);
        console.log(discount);
    }, [orderData, discount]);

    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            // If multiple payment is selected, pass the array of methods
            const finalPaymentMethod = paymentMethod === "multiple" ? Object.entries(paymentAmounts).filter(([key, amount]) => amount !== 0) : paymentMethod;
            onConfirm(finalPaymentMethod);
            setIsProcessing(false);
        }, 1000);
    };

    const handlePaymentMethodChange = useCallback((value: string) => {
        setPaymentMethod(value);
        if (value === "multiple") {
            setShowMultiplePaymentModal(true);
        }
    }, [paymentMethod]);

    const handleMultiplePaymentToggle = (method: string, enabled: boolean) => {
        setMultiplePaymentMethods(prev => {
            if (enabled) {
                return [...prev, method];
            } else {
                setPaymentAmounts(prev => ({
                    ...prev,
                    [method]: 0
                }));
                return prev.filter(m => m !== method);
            }
        });
    };

    const handlePaymentAmountChange = (method: string, value: string) => {
        const amount = parseFloat(value) || 0;
        setPaymentAmounts(prev => ({
            ...prev,
            [method]: amount
        }));
    };

    const totalPaid = Object.entries(paymentAmounts)
        .filter(([method]) => multiplePaymentMethods.includes(method))
        .reduce((sum, [_, amount]) => sum + amount, 0);

    const remainingAmount = total - totalPaid;

    const handleAutoFillRemaining = (method: string) => {
        setPaymentAmounts(prev => ({
            ...prev,
            [method]: remainingAmount
        }));
    };

    const closeMultiplePaymentModal = () => {
        setShowMultiplePaymentModal(false);
        if (multiplePaymentMethods.length === 0) {
            setPaymentMethod("cash");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[105] flex items-center justify-center p-4"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-template-primary to-template-primary/80 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Receipt className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Order Confirmation</h2>
                                <p className="text-white/80 text-sm">Review your order details</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </motion.button>
                    </div>
                </div>

                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingCart className="w-4 h-4 text-template-primary" />
                            <h3 className="font-semibold text-gray-800">Order Items ({orderData.items.length})</h3>
                        </div>

                        <div className="space-y-3">
                            {orderData.items.map((item, idx) => (
                                <motion.div
                                    key={`order-item-${idx}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                        <div className="flex items-center">
                                            <img className="w-15 h-15 rounded-md object-contain object-center" src={`${item.image_url[0].secure_url}`} alt="#" />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{item.sku || `Product #${item.product_id}`}</h4>
                                                <p className="text-sm text-gray-500">{item?.sku?.split("-")[0] || item?.variant_id}</p>
                                            </div>
                                        </div>
                                        <div className="text-center mx-4">
                                            <div className="bg-template-primary/10 text-template-primary px-3 py-1 rounded-full text-sm font-medium">
                                                Qty: {item.quantity}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(item.unit_price)} each
                                            </div>
                                            <div className="font-semibold text-gray-800">
                                                {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(item.total_price)}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Coupon Chip Display */}
                    {orderData.coupon && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-4 h-4 text-template-primary" />
                                <h4 className="font-medium text-gray-800">Applied Coupon</h4>
                            </div>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-sm font-medium">
                                <Tag className="w-3 h-3 mr-1" />
                                {orderData.coupon}
                            </Badge>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-template-primary" />
                            Order Summary
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-800">
                                    {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(subtotal)}
                                </span>
                            </div>

                            {/* Discount Display with Details */}
                            {discount > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Percent className="w-3 h-3 text-green-600" />
                                        <span className="text-gray-600">
                                            Product Discounts
                                            {orderData.selectedDiscount && (
                                                <span className="text-xs text-gray-500 ml-1">({orderData.selectedDiscount.name})</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="font-medium text-green-600">
                                        -{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(discount)}
                                    </span>
                                </div>
                            )}

                            {/* Coupon Amount Display with Details */}
                            {coupon_amount > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Percent className="w-3 h-3 text-green-600" />
                                        <span className="text-gray-600">
                                            Product Coupon Amount
                                            {orderData.coupon && (
                                                <span className="text-xs text-gray-500 ml-1">({orderData.coupon})</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="font-medium text-green-600">
                                        -{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(coupon_amount)}
                                    </span>
                                </div>
                            )}

                            {/* Tax Display with Details */}
                            {tax > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="w-3 h-3 text-amber-600" />
                                        <span className="text-gray-600">
                                            Product Taxes
                                            {orderData.selectedTax && (
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({orderData.selectedTax.name} - {orderData.selectedTax.type === 'inclusive' ? `${orderData.selectedTax.rate}%` : 'Fixed'})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800">
                                        +{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(tax)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-3 bg-template-primary/5 rounded-lg px-4 -mx-1">
                                <span className="text-lg font-semibold text-gray-800">Total</span>
                                <span className="text-xl font-bold text-template-primary">
                                    {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-4 h-4 text-template-primary" />
                            <h3 className="font-semibold text-gray-800">Payment Method</h3>
                        </div>

                        <Select value={`${paymentMethod}`} onValueChange={handlePaymentMethodChange}>
                            <SelectTrigger className="w-full py-2 border-2 border-gray-200 hover:border-template-primary/50 transition-colors">
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent className="z-[110]">
                                <SelectItem value="cash" className="py-3">
                                    <div className="flex items-center gap-3">
                                        <IoIosCash className="text-template-primary" size={20} />
                                        <div>
                                            <div className="font-medium">Cash Payment</div>
                                            <div className="text-sm text-gray-500">Pay with cash</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="card" className="py-3">
                                    <div className="flex items-center gap-3">
                                        <BsCreditCard2FrontFill className="text-template-primary" size={20} />
                                        <div>
                                            <div className="font-medium">Card Payment</div>
                                            <div className="text-sm text-gray-500">Pay with debit/credit card</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="bank_transfer" className="py-3">
                                    <div className="flex items-center gap-3">
                                        <FaMoneyBillTransfer className="text-template-primary" size={20} />
                                        <div>
                                            <div className="font-medium">Bank Transfer</div>
                                            <div className="text-sm text-gray-500">Pay via bank transfer</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="multiple" className="py-3">
                                    <div className="flex items-center gap-3">
                                        <FaMoneyBillTransfer className="text-template-primary" size={20} />
                                        <div>
                                            <div className="font-medium">Multiple Payment</div>
                                            <div className="text-sm text-gray-500">Pay via MP</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Show selected multiple payment methods */}
                        {paymentMethod === "multiple" && multiplePaymentMethods.length > 0 && (
                            <div className="mt-3 p-3 bg-template-primary/5 rounded-lg border border-template-primary/20">
                                <div className="text-sm font-medium text-template-primary mb-2">
                                    Selected Methods ({multiplePaymentMethods.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {multiplePaymentMethods.map((method) => (
                                        <Badge key={method} variant="secondary" className="bg-template-primary/10 text-template-primary text-xs">
                                            {method === "cash" && "Cash"}
                                            {method === "card" && "Card"}
                                            {method === "bank_transfer" && "Bank Transfer"}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Cancel Order
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="px-8 py-3 max-[450px]:justify-center bg-template-primary hover:bg-template-primary/90 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Confirm Order
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Multiple Payment Modal */}
            <AnimatePresence>
                {showMultiplePaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50"
                        onClick={closeMultiplePaymentModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-template-primary/10 rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-template-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Multiple Payment</h2>
                                        <p className="text-sm text-gray-500">Select payment methods</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeMultiplePaymentModal}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6" style={{ scrollbarWidth: "none" }}>
                                {/* Cash Payment */}
                                <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-template-primary/30 transition-colors">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <IoIosCash className="text-template-primary" size={24} />
                                            <div>
                                                <div className="font-medium text-gray-800">Cash Payment</div>
                                                <div className="text-sm text-gray-500">Pay with cash</div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={multiplePaymentMethods.includes("cash")}
                                            onCheckedChange={(checked) => handleMultiplePaymentToggle("cash", checked)}
                                        />
                                    </div>
                                    {multiplePaymentMethods.includes("cash") && (
                                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={paymentAmounts.cash || ''}
                                                        onChange={(e) => handlePaymentAmountChange("cash", e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-template-primary/50 focus:border-template-primary outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAutoFillRemaining("cash")}
                                                    className="px-3 py-2 text-sm font-medium text-template-primary hover:bg-template-primary/5 rounded-lg transition-colors"
                                                >
                                                    Full Amount
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card Payment */}
                                <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-template-primary/30 transition-colors">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <BsCreditCard2FrontFill className="text-template-primary" size={24} />
                                            <div>
                                                <div className="font-medium text-gray-800">Card Payment</div>
                                                <div className="text-sm text-gray-500">Pay with debit/credit card</div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={multiplePaymentMethods.includes("card")}
                                            onCheckedChange={(checked) => handleMultiplePaymentToggle("card", checked)}
                                        />
                                    </div>
                                    {multiplePaymentMethods.includes("card") && (
                                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={paymentAmounts.card || ''}
                                                        onChange={(e) => handlePaymentAmountChange("card", e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-template-primary/50 focus:border-template-primary outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAutoFillRemaining("card")}
                                                    className="px-3 py-2 text-sm font-medium text-template-primary hover:bg-template-primary/5 rounded-lg transition-colors"
                                                >
                                                    Full Amount
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bank Transfer */}
                                <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-template-primary/30 transition-colors">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <FaMoneyBillTransfer className="text-template-primary" size={24} />
                                            <div>
                                                <div className="font-medium text-gray-800">Bank Transfer</div>
                                                <div className="text-sm text-gray-500">Pay via bank transfer</div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={multiplePaymentMethods.includes("bank_transfer")}
                                            onCheckedChange={(checked) => handleMultiplePaymentToggle("bank_transfer", checked)}
                                        />
                                    </div>
                                    {multiplePaymentMethods.includes("bank_transfer") && (
                                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={paymentAmounts.bank_transfer || ''}
                                                        onChange={(e) => handlePaymentAmountChange("bank_transfer", e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-template-primary/50 focus:border-template-primary outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAutoFillRemaining("bank_transfer")}
                                                    className="px-3 py-2 text-sm font-medium text-template-primary hover:bg-template-primary/5 rounded-lg transition-colors"
                                                >
                                                    Full Amount
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Summary */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Order Total:</span>
                                            <span className="font-medium">₦{total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Amount Paid:</span>
                                            <span className="font-medium">₦{totalPaid.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                                            <span className={remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}>
                                                {remainingAmount > 0 ? 'Remaining:' : 'Customer Change:'}
                                            </span>
                                            <span className={remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}>
                                                ₦{Math.abs(remainingAmount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selected Methods Display */}
                            {multiplePaymentMethods.length > 0 && (
                                <div className="mb-6 p-4 bg-template-primary/5 rounded-xl border border-template-primary/20">
                                    <div className="text-sm font-medium text-template-primary mb-2">
                                        Selected Payment Methods ({multiplePaymentMethods.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {multiplePaymentMethods.map((method) => (
                                            <Badge key={method} variant="secondary" className="bg-template-primary/10 text-template-primary">
                                                {method === "cash" && "Cash"}
                                                {method === "card" && "Card"}
                                                {method === "bank_transfer" && "Bank Transfer"}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeMultiplePaymentModal}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={closeMultiplePaymentModal}
                                    disabled={multiplePaymentMethods.length === 0}
                                    className="flex-1 px-4 py-3 bg-template-primary hover:bg-template-primary/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm ({multiplePaymentMethods.length})
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default OrderConfirmation;