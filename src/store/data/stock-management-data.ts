import {z} from "zod";

export const stockTaskSchema = z.object({
    id: z.number(),
    variant_id: z.number(),
    type: z.string(),
    quantity: z.number(),
    note: z.string(),
    created_at: z.string(),
    business_id: z.number(),
    recorded_by: z.string(),
    recorded_by_type: z.string(),
    branch_id: z.number(),
    related_transfer_id: z.number(),
    sku: z.string().optional(),
    reason: z.string(),
    recorded_by_name: z.string()
});

export type StockTask = z.infer<typeof stockTaskSchema>;