import {z} from "zod";

export const orderTaskSchema = z.object({
    id: z.number(),
    supplier_name: z.string(),
    supply_order_date: z.string(),
    expected_delivery_date: z.string(),
    supply_status: z.string(),
    supplier_id: z.number().optional()
});

export type OrderTask = z.infer<typeof orderTaskSchema>;