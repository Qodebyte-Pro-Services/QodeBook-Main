import {z} from "zod";

export const supplierSchema = z.object({
    id: z.number(),
    business_id: z.number(),
    name: z.string(),
    contact: z.string(),
    created_at: z.string()
});


export type SupplierLogicType = z.infer<typeof supplierSchema>;