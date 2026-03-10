import {z} from "zod";

export const configDiscountsSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    percentage: z.string(),
    amount: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    description: z.string(),
    created_at: z.string()
});

export type ConfigDiscountsTask = z.infer<typeof configDiscountsSchema>;
