/* eslint-disable @typescript-eslint/no-explicit-any */

import axiosInstance from "@/lib/axios";
import { FallbackSalesResponse } from "@/models/types/shared/handlers-type";

export interface InstallmentPlan {
    number_of_payments: number;
    payment_frequency: 'daily' | 'weekly' | 'monthly';
    down_payment: number;
    remaining_balance: number;
    start_date: string;
    notes?: string;
}

export interface CreditDetails {
    credit_type: 'full_credit' | 'partial_credit' | 'installment_credit';
    amount_paid: number;
    balance: number;
    payment_schedule?: 'immediate' | 'weekly' | 'monthly' | 'custom';
}

export interface OrderSubmissionData {
    business_id: number;
    branch_id: number;
    staff_id?: string;
    created_by_user_id?: number;
    customer_id?: number;
    customer?: {
        name: string;
        phone: string;
        email: string;
    };
    items: Array<{
        variant_id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        taxes?: Array<{ id: number; amount: number }>;
        discounts?: Array<{ id: number; amount: number }>;
        coupons?: Array<{ id: number; amount: number }>;
    }>;
    discount?: number;
    coupon?: number;        
    taxes?: number;
    note?: string;
    order_type: string;
    sale_type?: 'regular' | 'installment' | 'credit';
    installment_plan?: InstallmentPlan;
    credit_details?: CreditDetails;
    payments: Array<{
        method: string;
        amount: number;
        reference: string;
    }>;
}

export interface SelectedDiscount {
    id: number;
    name: string;
    amount?: number;
    discount_type?: string;
    percentage?: string;
    description?: string;
    end_date?: string;
}

export interface SelectedTax {
    id: number;
    name: string;
    rate: number;
    type: 'inclusive' | 'exclusive';
    description?: string;
    created_at: string;
}

export interface SelectedCoupon {
    id: number;
    code: string;
    discount_percentage?: string;
    discount_amount?: number;
    coupons_type?: string;
    description?: string;
    usage_limit?: number;
    end_date?: string;
}

export const calculateDiscountAmount = (discount: SelectedDiscount, subtotal: number): number => {
    // Use amount if available, otherwise calculate from percentage
    if ("percentage" in discount && discount?.percentage) {
        return (subtotal * Number(discount.percentage || 0)) / 100;
    }else {
        return discount.amount || 0;
    }
};

export const calculateTaxAmount = (tax: SelectedTax, subtotal: number): number => {
        return (subtotal * tax.rate) / 100;
};

export const calculateCouponDiscount = (coupon: SelectedCoupon, subtotal: number): number => {
    if ("discount_percentage" in coupon && coupon?.discount_percentage) {
        return (subtotal * Number(coupon.discount_percentage || 0)) / 100;
    }else {
        return coupon.discount_amount || 0;
    }
};

export const prepareOrderData = (
    items: OrderSubmissionData['items'],
    customer_id: string,
    orderType: string,
    createdByUserId: number,
    businessId: number,
    branchId: number,
    selectedDiscount?: SelectedDiscount,
    selectedTax?: SelectedTax,
    selectedCoupon?: SelectedCoupon,
    staffId?: string,
    note?: string
): OrderSubmissionData => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    
    const discountAmount = selectedDiscount ? calculateDiscountAmount(selectedDiscount, subtotal) : 0;
    const taxAmount = selectedTax ? calculateTaxAmount(selectedTax, subtotal) : 0;
    const couponDiscount = selectedCoupon ? calculateCouponDiscount(selectedCoupon, subtotal) : 0;
    
    const totalDiscount = discountAmount + couponDiscount;
    const totalAmount = subtotal - totalDiscount + taxAmount;
    
    // Prepare items with tax/discount/coupon details
    const itemsWithDetails = items.map(item => {
        const result: any = { ...item };
        
        // Add taxes if selected
        if (selectedTax) {
            const itemTaxAmount = (item.total_price * selectedTax.rate) / 100;
            result.taxes = [{ id: selectedTax.id, amount: itemTaxAmount }];
        }
        
        // Add discounts if selected - use amount or calculate from percentage
        if (selectedDiscount) {
            const itemDiscountAmount = selectedDiscount.amount 
                ? (selectedDiscount.amount * item.total_price) / subtotal
                : (item.total_price * Number(selectedDiscount.percentage || 0)) / 100;
            result.discounts = [{ id: selectedDiscount.id, amount: itemDiscountAmount }];
        }
        
        // Add coupons if selected - use discount_amount or calculate from discount_percentage
        if (selectedCoupon) {
            const itemCouponAmount = selectedCoupon.discount_amount 
                ? (selectedCoupon.discount_amount * item.total_price) / subtotal // Proportional to item value
                : (item.total_price * Number(selectedCoupon.discount_percentage || 0)) / 100;
            result.coupons = [{ id: selectedCoupon.id, amount: itemCouponAmount }];
        }
        
        return result;
    });
    
    return {
        business_id: businessId,
        branch_id: branchId,
        staff_id: staffId,
        created_by_user_id: createdByUserId,
        customer_id: customer_id ? Number(customer_id) : undefined,
        items: itemsWithDetails,
        discount: totalDiscount,
        coupon: selectedCoupon?.id,
        taxes: taxAmount,
        note: note || '',
        order_type: orderType,
        payments: [] // Will be populated when payment method is selected
    };
};

export const submitOrder = async (orderData: OrderSubmissionData): Promise<boolean> => {
    try {
        const response = await axiosInstance.post('/api/sales/create', orderData, {
            headers: {
                "x-business-id": orderData.business_id
            }
        });
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Failed to submit order:', error);
        return false;
    }
};

export interface PaymentMethodOption {
    method: string;
    amount?: number;
    downPayment?: number;
    installmentPlan?: InstallmentPlan;
    creditDetails?: CreditDetails;
}

export const addPaymentToOrder = (
    orderData: OrderSubmissionData, 
    paymentOption: string | string[] | Array<[string, number]> | PaymentMethodOption,
    totalAmount: number
): OrderSubmissionData => {
    let payments: Array<{ method: string; amount: number; reference: string }> = [];
    let saleType: 'regular' | 'installment' | 'credit' = 'regular';
    let installmentPlan: InstallmentPlan | undefined;
    let creditDetails: CreditDetails | undefined;

    // Handle PaymentMethodOption object
    if (typeof paymentOption === 'object' && !Array.isArray(paymentOption) && 'method' in paymentOption) {
        const option = paymentOption as PaymentMethodOption;
        
        if (option.method === 'installment' && option.installmentPlan) {
            saleType = 'installment';
            installmentPlan = option.installmentPlan;
            payments = [{
                method: 'installment',
                amount: option.downPayment || 0,
                reference: `installment-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            }];
        } else if (option.method === 'credit' && option.creditDetails) {
            saleType = 'credit';
            creditDetails = option.creditDetails;
            payments = [{
                method: 'credit',
                amount: creditDetails.amount_paid,
                reference: `credit-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            }];
        } else {
            // Regular payment with a specific method
            payments = [{
                method: option.method,
                amount: option.amount || totalAmount,
                reference: `${option.method}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            }];
        }
    } else if (Array.isArray(paymentOption)) {
        // Handle multiple payment methods
        payments = (paymentOption as Array<[string, number]>).map(method => ({
            method: method[0],
            amount: method[1],
            reference: `${method[0]}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }));
    } else {
        // Handle simple string payment method
        payments = [{
            method: paymentOption as string,
            amount: totalAmount,
            reference: `${paymentOption}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }];
    }

    const result: OrderSubmissionData = {
        ...orderData,
        sale_type: saleType,
        payments
    };

    if (installmentPlan) {
        result.installment_plan = installmentPlan;
    }

    if (creditDetails) {
        result.credit_details = creditDetails;
    }

    return result;
};

export const submitOfflineOrder = async (orderData: any): Promise<({success: boolean; _data: FallbackSalesResponse} | boolean)> => {
    try {
        const { id, createdAt, status, ...serverData } = orderData;
        
        const response = await axiosInstance.post('/api/sales/create', serverData, {
            headers: {
                "x-business-id": orderData.business_id
            }
        });
        return {
            success: response.status >= 200 && response.status < 300,
            _data: response?.data
        };
    } catch (error) {
        console.error('Failed to sync offline order:', error);
        return false;
    }
};
