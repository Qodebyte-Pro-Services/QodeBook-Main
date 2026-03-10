import {z} from "zod";

const expenseSchema = z.object({
    category_name: z.string(),
    amount: z.string(),
    payment_method: z.string(),
    staff_name: z.string(),
    business_name: z.string(),
    expense_date: z.string(),
    status: z.string(),
    description: z.string().optional()
});

export type ExpenseTask = z.infer<typeof expenseSchema>;