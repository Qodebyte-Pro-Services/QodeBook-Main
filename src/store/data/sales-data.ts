import {z} from "zod";

export const taskSchema = z.object({
    orderId: z.string(),
    customerName: z.string(),
    category: z.string(),
    amount: z.float32(),
    staff: z.string(),
    salesMethod: z.string(),
    status: z.int().max(3),
});

export type Task = z.infer<typeof taskSchema>;

const data: Array<Task> = [
    {
        orderId: "485425",
        customerName: "Qodebyte",
        category: "Gas",
        amount: 200000,
        staff: "Qodebyte",
        salesMethod: "Online",
        status: 0,
    },
    {
        orderId: "135403",
        customerName: "Qodebyte",
        category: "Gas",
        amount: 200000,
        staff: "Qodebyte",
        salesMethod: "Online",
        status: 1,
    },
    {
        orderId: "001424",
        customerName: "Qodebyte",
        category: "Gas",
        amount: 200000,
        staff: "Qodebyte",
        salesMethod: "Walk-In",
        status: 2,
    },
    {
        orderId: "485425",
        customerName: "Qodebyte",
        category: "Accessories",
        amount: 200000,
        staff: "Qodebyte",
        salesMethod: "Online",
        status: 4,
    }
];

export default data;