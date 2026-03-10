import z from "zod";

const customerOrderSchema = z.object({
    id: z.string(),
    date: z.string(),
    details: z.string(),
    payment: z.string(),
    amount: z.float32(),
    status: z.int()
});


export type CustomerOrderType = z.infer<typeof customerOrderSchema>;
