import {z} from "zod";

export const configUnitSchema = z.object({
    id: z.string(),
    business_id: z.string(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    values: z.array(z.object({
        id: z.string(),
        attribute_id: z.string(),
        value: z.string(),
        created_at: z.string(),
        updated_at: z.string()
    }))
});

export type ConfigUnitTask = z.infer<typeof configUnitSchema>;

const data: ConfigUnitTask[] = [
    {
        id: "1",
        business_id: "1",
        name: "Kilogram",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        values: []
    },
    {
        id: "2",
        business_id: "1",
        name: "Liter",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        values: []
    },
    {
        id: "3",
        business_id: "1",
        name: "Piece",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        values: []
    }
];

export default data;