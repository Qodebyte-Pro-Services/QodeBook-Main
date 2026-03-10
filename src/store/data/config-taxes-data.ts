import {z} from "zod";

export const configTaxesSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    rate: z.string(),
    type: z.enum(["inclusive", "exclusive"]),
    created_at: z.string()
});

export type ConfigTaxesTask = z.infer<typeof configTaxesSchema>;