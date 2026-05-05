import {z} from "zod";

export const saleTableData = z.object({
    id: z.number(),
    business_id: z.number(),
    branch_id: z.number(),
    customer_id: z.number(),
    total_amount: z.string(),
    status: z.string(),
    created_at: z.string(),
    shipping_address: z.string(),
    payment_method: z.string(),
    source: z.string(),
    order_type: z.string(),
    staff_id: z.number(),
    created_by_user_id: z.number(),
    subtotal: z.string(),
    tax_total: z.string(),
    discount_total: z.string(),
    coupon_total: z.string(),
    note: z.string(),
    customer_name: z.string().default("Walk In"),
    customer_phone: z.string(),
    customer_email: z.string(),
    branch_name: z.string(),
    recorded_by_name: z.string(),
    payments: z.array(z.object({
        id: z.number(),
        method: z.string(),
        amount: z.string(),
        reference: z.string(),
        paid_at: z.string()
    }))
});

export type SalesSchema = z.infer<typeof saleTableData>;

export const creditAccountSchema = z.object({
    id: z.number(),
    business_id: z.number(),
    order_id: z.number(),
    customer_id: z.any(),
    amount_paid: z.string(),
    balance: z.string(),
    total_amount: z.string(),
    status: z.string(),
    credit_type: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    order_type: z.string(),
    customer_name: z.string().nullable(),
});

export type CreditAccountType = z.infer<typeof creditAccountSchema>;

export const installmentPaymentSchema = z.object({
    id: z.number(),
    installment_plan_id: z.number(),
    payment_number: z.number(),
    amount: z.string(),
    due_date: z.string(),
    status: z.string(),
    paid_at: z.string().nullable(),
    method: z.string().nullable(),
});

export type InstallmentPaymentType = z.infer<typeof installmentPaymentSchema>;

export const installmentPlanSchema = z.object({
    id: z.number(),
    business_id: z.number(),
    order_id: z.number(),
    customer_id: z.any(),
    total_amount: z.string(),
    down_payment: z.string(),
    remaining_balance: z.string(),
    number_of_payments: z.number(),
    payment_frequency: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    order_type: z.string(),
    customer_name: z.string().nullable(),
    customer_phone: z.string().optional(),
    customer_email: z.string().optional(),
    branch_name: z.string().optional(),
    order_total: z.string().optional(),
    order_status: z.string().optional(),
    payments: z.array(installmentPaymentSchema).optional(),
});

export type InstallmentPlanType = z.infer<typeof installmentPlanSchema>;