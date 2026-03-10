import {z} from "zod";

const productVariantsSchema = z.object({
    id: z.string().or(z.number()),
    sku: z.string(),
    expiry_date: z.string().optional(),
    attributes: z.array(z.object({
        name: z.string(),
        value: z.string().optional(),
        value_id: z.number().optional(),
        attribute_id: z.number().optional()
    })),
    quantity: z.number(),
    threshold: z.number(),
    cost_price: z.string(),
    selling_price: z.string(),
    status: z.number().optional(),
    barcode: z.string().optional(),
});

export type ProductVariantsType = z.infer<typeof productVariantsSchema>;