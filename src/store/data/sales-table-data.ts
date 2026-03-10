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