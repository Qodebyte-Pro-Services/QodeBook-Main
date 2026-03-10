import {z} from "zod";

export const configTaskSchema = z.object({
    id: z.int(),
    business_id: z.int(),
    name: z.string(),
    description: z.string(),
    created_at: z.string(),
    updated_at: z.string()
});

export type ConfigCategoryTask = z.infer<typeof configTaskSchema>;