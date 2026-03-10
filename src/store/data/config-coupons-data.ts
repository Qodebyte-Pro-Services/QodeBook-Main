import {z} from "zod";

export const configCouponsSchema = z.object({
    id: z.string().or(z.number()),
    code: z.string(),
    description: z.string(),
    discount_percentage: z.string(),
    discount_amount: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    usage_limit: z.number(),
    created_at: z.string()
});

export type ConfigCouponsTask = z.infer<typeof configCouponsSchema>;
