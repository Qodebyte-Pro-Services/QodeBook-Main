import {z} from "zod";

export const storeTaskSchema = z.object({
    id: z.string(),
    base_sku: z.string(),
    name: z.string(),
    category_id: z.int(),
    brand: z.string(),
    threshold: z.int(),
    total_variant_qty: z.string().default("0"),
    hasVariation: z.boolean(),
    category_name: z.string(),
});

export type StoreProductTask = z.infer<typeof storeTaskSchema>;