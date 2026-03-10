import {z} from "zod";

export const productViewSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    price: z.string(),
    quantity: z.string(),
    status: z.string(),
    addedBy: z.string(),
    rate: z.number().optional(),
    lowStock: z.boolean().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type ProductTask = z.infer<typeof productViewSchema>;


const productViewData: ProductTask[] = [
    {
        id: "1",
        name: "Inventory Value",
        category: "Category 1",
        price: "100000",
        quantity: "10",
        status: "Active",
        addedBy: "User 1",
        rate: 20,
        lowStock: false,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
    },
    {
        id: "2",
        name: "Total In Stock",
        category: "Category 2",
        price: "120",
        quantity: "20",
        status: "Active",
        addedBy: "User 2",
        rate: 20,
        lowStock: false,
        createdAt: "2023-01-02",
        updatedAt: "2023-01-02",
    },
    {
        id: "3",
        name: "Threshold Level",
        category: "Category 3",
        price: "30",
        quantity: "30",
        status: "Active",
        addedBy: "User 3",
        rate: 20,
        createdAt: "2023-01-03",
        updatedAt: "2023-01-03",
    },
    {
        id: "4",
        name: "Low Level Stock",
        category: "Category 4",
        price: "400000",
        quantity: "40",
        status: "Active",
        addedBy: "User 4",
        rate: 20,
        lowStock: true,
        createdAt: "2023-01-04",
        updatedAt: "2023-01-04",
    }
];

export default productViewData;