"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LiaTimesSolid } from "react-icons/lia";
import { IoIosCash } from "react-icons/io";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { FaMoneyBillTransfer, FaClock } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Receipt, CreditCard, CheckCircle2, X, Tag, Percent, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CustomerResponse } from "@/models/types/shared/handlers-type";
import { InstallmentPlan, CreditDetails, PaymentMethodOption } from "@/api/controllers/post/orders";

interface OrderItem {
    product_id: number;
    variant_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    sku?: string;
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
    onConfirm: (paymentOption: string | string[] | Array<[string, number]> | PaymentMethodOption) => void;
}

const OrderConfirmation = ({ orderData, onClose, onConfirm }: OrderConfirmationProps) => {
    const subtotal = orderData.subtotal || orderData.items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = orderData.taxes || orderData.tax || 0;
    const discount = orderData.discount || 0;
    const coupon_amount = orderData?.coupon_amount || 0;
    const total = orderData.total_amount || orderData.total || (subtotal + tax - discount - coupon_amount);
    
    const isWalkIn = orderData.customer?.id === 0;
    
    const [paymentMethod, setPaymentMethod] = useState(orderData.payment_mode || "cash");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showMultiplePaymentModal, setShowMultiplePaymentModal] = useState(false);
    const [multiplePaymentMethods, setMultiplePaymentMethods] = useState<string[]>([]);
    const [paymentAmounts, setPaymentAmounts] = useState<{ [key: string]: number }>({
        cash: 0,
        card: 0,
        bank_transfer: 0
    });

    // Installment state
    const [numPayments, setNumPayments] = useState(4);
    const [paymentFrequency, setPaymentFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [downPayment, setDownPayment] = useState(0);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [installmentNotes, setInstallmentNotes] = useState("");

    // Credit state
    const [creditType, setCreditType] = useState<'full_credit' | 'partial_credit' | 'installment_credit'>('partial_credit');
    const [creditAmountPaid, setCreditAmountPaid] = useState(0);
    const [creditPaymentSchedule, setCreditPaymentSchedule] = useState<'immediate' | 'weekly' | 'monthly' | 'custom'>('monthly');

    useEffect(() => {
        console.log(orderData);
    }, [orderData]);

    // Calculate installment details
    const remainingBalanceInstallment = total - downPayment;
    const installmentPerPayment = remainingBalanceInstallment / numPayments;
    
    // Calculate payment duration based on frequency
    const getPaymentDuration = () => {
        const baseUnit = numPayments - 1; // Time between first and last payment
        if (paymentFrequency === 'daily') return `${baseUnit} days`;
        if (paymentFrequency === 'weekly') return `${baseUnit} weeks`;
        return `${baseUnit} months`;
    };
    
    const getFrequencyLabel = () => {
        if (paymentFrequency === 'daily') return 'day';
        if (paymentFrequency === 'weekly') return 'week';
        return 'month';
    };

    // Validate installment inputs
    const isInstallmentValid = downPayment >= 0 && downPayment <= total && numPayments > 0;
    const isCreditValid = creditAmountPaid >= 0 && creditAmountPaid <= total;

    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            let finalPaymentOption: string | string[] | Array<[string, number]> | PaymentMethodOption;

            if (paymentMethod === "installment") {
                const installmentPlan: InstallmentPlan = {
                    number_of_payments: numPayments,
                    payment_frequency: paymentFrequency,
                    down_payment: downPayment,
                    remaining_balance: remainingBalanceInstallment,
                    start_date: startDate,
                    notes: installmentNotes
                };
                finalPaymentOption = {
                    method: 'installment',
                    downPayment,
                    installmentPlan
                } as PaymentMethodOption;
            } else if (paymentMethod === "credit") {
                const creditDetails: CreditDetails = {
                    credit_type: creditType,
                    amount_paid: creditAmountPaid,
                    balance: total - creditAmountPaid,
                    payment_schedule: creditPaymentSchedule
                };
                finalPaymentOption = {
                    method: 'credit',
                    creditDetails
                } as PaymentMethodOption;
            } else if (paymentMethod === "multiple") {
                finalPaymentOption = Object.entries(paymentAmounts).filter(([key, amount]) => amount !== 0);
            } else {
                finalPaymentOption = paymentMethod;
            }

            onConfirm(finalPaymentOption);
            setIsProcessing(false);
        }, 1000);
    };

    const handlePaymentMethodChange = useCallback((value: string) => {
        setPaymentMethod(value);
        if (value === "multiple") {
            setShowMultiplePaymentModal(true);
        }
    }, []);

    const handleMultiplePaymentToggle = (method: string, enabled: boolean) => {
        setMultiplePaymentMethods(prev => {
            if (enabled) {
                if (method && !prev.includes(method)) {
                    return [...prev, method];
                }
                return prev;
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
                    {/* Order Items */}
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
                                            <img className="w-15 h-15 rounded-md object-contain object-center" src={item.image_url?.[0]?.secure_url || "/placeholder-product.png"} alt={item.sku || "Product"} />
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

                    {/* Order Summary */}
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

                            {discount > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Percent className="w-3 h-3 text-green-600" />
                                        <span className="text-gray-600">Product Discounts</span>
                                    </div>
                                    <span className="font-medium text-green-600">
                                        -{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(discount)}
                                    </span>
                                </div>
                            )}

                            {coupon_amount > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Percent className="w-3 h-3 text-green-600" />
                                        <span className="text-gray-600">Coupon Amount</span>
                                    </div>
                                    <span className="font-medium text-green-600">
                                        -{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(coupon_amount)}
                                    </span>
                                </div>
                            )}

                            {tax > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="w-3 h-3 text-amber-600" />
                                        <span className="text-gray-600">Taxes</span>
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

                    {/* Payment Method Section */}
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
                                        <Zap className="text-template-primary" size={20} />
                                        <div>
                                            <div className="font-medium">Multiple Payment</div>
                                            <div className="text-sm text-gray-500">Combine multiple methods</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                
                                {/* Installment and Credit Options - Only for registered customers */}
                                {!isWalkIn && (
                                    <>
                                        <SelectItem value="installment" className="py-3">
                                            <div className="flex items-center gap-3">
                                                <FaClock className="text-template-primary" size={20} />
                                                <div>
                                                    <div className="font-medium">Installment Plan</div>
                                                    <div className="text-sm text-gray-500">Pay in multiple installments</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="credit" className="py-3">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="text-template-primary" size={20} />
                                                <div>
                                                    <div className="font-medium">Credit Sale</div>
                                                    <div className="text-sm text-gray-500">Full, partial, or installment credit</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>

                        {/* Show selected multiple payment methods badge */}
                        {paymentMethod === "multiple" && multiplePaymentMethods.length > 0 && (
                            <div className="mt-3 p-3 bg-template-primary/5 rounded-lg border border-template-primary/20">
                                <div className="text-sm font-medium text-template-primary mb-2">
                                    Selected Methods ({multiplePaymentMethods.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {multiplePaymentMethods.map((method) => (
                                        <Badge key={method} variant="secondary" className="bg-template-primary/10 text-template-primary text-xs">
                                            {method === "cash" ? "Cash" : method === "card" ? "Card" : method === "bank_transfer" ? "Bank Transfer" : method}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Installment Plan Configuration */}
                        {paymentMethod === "installment" && !isWalkIn && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                            >
                                <h4 className="font-semibold text-blue-900 mb-4">Installment Plan Details</h4>
                                
                                <div className="space-y-4">
                                    {/* Number of Payments */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Number of Payments</label>
                                        <div className="flex gap-2">
                                            {[2, 3, 4, 6, 12].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setNumPayments(num)}
                                                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                                        numPayments === num
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                                                    }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Frequency */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Frequency</label>
                                        <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as 'daily' | 'weekly' | 'monthly')}>
                                            <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-blue-500">
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[1000]">
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Down Payment */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Down Payment (Optional)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max={total}
                                                step="100"
                                                value={downPayment || ''}
                                                onChange={(e) => {
                                                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                  if (!isNaN(val)) setDownPayment(val);
                                                }}
                                                onBlur={(e) => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  if (val > total) setDownPayment(total);
                                                  if (val < 0) setDownPayment(0);
                                                }}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="mt-2 p-3 bg-white rounded-lg border border-blue-100">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Standard Payment (no down payment):</span>
                                                <span className="font-semibold text-blue-600">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total / numPayments)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2 pt-2 border-t border-blue-100">
                                                <span className="text-gray-600">Down Payment (today):</span>
                                                <span className="font-semibold">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(downPayment)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Remaining Balance:</span>
                                                <span className="font-semibold text-blue-600">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(remainingBalanceInstallment)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-2 border-t border-blue-100">
                                                <span className="text-gray-600">Remaining per Payment ({numPayments} payments):</span>
                                                <span className="font-semibold text-blue-700">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(installmentPerPayment)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-blue-100 text-blue-700">
                                                <span className="font-medium">Payment Timeline:</span>
                                                <span className="font-medium">{getPaymentDuration()} ({paymentFrequency})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (Optional)</label>
                                        <textarea
                                            value={installmentNotes}
                                            onChange={(e) => setInstallmentNotes(e.target.value)}
                                            placeholder="Any special instructions for this installment plan..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {!isInstallmentValid && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        Please ensure down payment is between 0 and {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total)}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Credit Sale Configuration */}
                        {paymentMethod === "credit" && !isWalkIn && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl"
                            >
                                <h4 className="font-semibold text-purple-900 mb-4">Credit Sale Details</h4>

                                <div className="space-y-4">
                                    {/* Credit Type */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Credit Type</label>
                                        <Select value={creditType} onValueChange={(value) => setCreditType(value as 'full_credit' | 'partial_credit' | 'installment_credit')}>
                                            <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-purple-500">
                                                <SelectValue placeholder="Select credit type" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[1000]">
                                                <SelectItem value="full_credit">
                                                    Full Credit - No payment required now
                                                </SelectItem>
                                                <SelectItem value="partial_credit">
                                                    Partial Credit - Pay partial amount
                                                </SelectItem>
                                                <SelectItem value="installment_credit">
                                                    Installment Credit - Pay part or full via installments
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Amount Paid */}
                                    {creditType !== 'full_credit' && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Amount to Pay Now: 0 - {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total)}
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={total}
                                                    step="100"
                                                    value={creditAmountPaid || ''}
                                                    onChange={(e) => {
                                                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                      if (!isNaN(val)) setCreditAmountPaid(val);
                                                    }}
                                                    onBlur={(e) => {
                                                      const val = parseFloat(e.target.value) || 0;
                                                      if (val > total) setCreditAmountPaid(total);
                                                      if (val < 0) setCreditAmountPaid(0);
                                                    }}
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Schedule */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Schedule</label>
                                        <Select value={creditPaymentSchedule} onValueChange={(value) => setCreditPaymentSchedule(value as 'immediate' | 'weekly' | 'monthly' | 'custom')}>
                                            <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-purple-500">
                                                <SelectValue placeholder="Select payment schedule" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[1000]">
                                                <SelectItem value="immediate">Immediate</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Credit Summary */}
                                    <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Order Total:</span>
                                                <span className="font-semibold">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Amount Paid Now:</span>
                                                <span className="font-semibold">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(creditAmountPaid)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t border-purple-200 pt-2">
                                                <span className="text-purple-700 font-medium">Balance on Credit:</span>
                                                <span className="font-bold text-purple-700">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total - creditAmountPaid)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!isCreditValid && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        Please ensure amount paid is between 0 and {new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency" }).format(total)}
                                    </div>
                                )}
                            </motion.div>
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
                        disabled={isProcessing || (paymentMethod === 'installment' && !isInstallmentValid) || (paymentMethod === 'credit' && !isCreditValid)}
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

                {/* Multiple Payment Modal */}
                <AnimatePresence>
                    {showMultiplePaymentModal && (
                        <motion.div
                            key="multiple-payment-modal-overlay"
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
                                                    {method === "cash" ? "Cash" : method === "card" ? "Card" : method === "bank_transfer" ? "Bank Transfer" : method}
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
            </div>
        </motion.div>
    );
};

export default OrderConfirmation;
