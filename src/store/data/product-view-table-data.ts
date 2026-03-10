import {z} from "zod";

export const productViewDataTable = z.object({
    id: z.number(),
    date: z.string(),
    type: z.string(),
    quantity: z.string(),
    reference: z.string(),
    staff: z.string(),
    note: z.string(),
});


export type ProductTableViewTask = z.infer<typeof productViewDataTable>;

const productTableView: ProductTableViewTask[] = [
    {
        id: 1,
        date: "May 17, 2025",
        type: "Dispensed",
        quantity: "-20KG",
        reference: "Receipt #RX1048",
        staff: "Qodebyte Egun",
        note: "Customer Refill",
    },
    {
        id: 2,
        date: "May 17, 2025",
        type: "Received",
        quantity: "+100KG",
        reference: "PO #RX1048",
        staff: "Qodebyte Egun",
        note: "From Elite Gas",
    },
    {
        id: 3,
        date: "May 17, 2025",
        type: "Adjustment",
        quantity: "+10KG",
        reference: "CTO #RX1048",
        staff: "Qodebyte Egun",
        note: "Correction From System Error",
    },
    {
        id: 4,
        date: "May 17, 2025",
        type: "Damaged",
        quantity: "-3KG",
        reference: "Receipt #RX1048",
        staff: "Qodebyte Egun",
        note: "Leaked During Delivery",
    },
    
];

export default productTableView;