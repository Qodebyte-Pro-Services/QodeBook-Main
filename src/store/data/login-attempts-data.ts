import {z} from "zod";

export const taskSchema = z.object({
    id: z.string(),
    deviceType: z.string(),
    ipAddress: z.string(),
    time: z.string(),
    location: z.string(),
    status: z.int().max(1),
});

export type Task = z.infer<typeof taskSchema>;

const login_attempts_data: Task[] = [
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 1,
    },
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 1,
    },
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 1,
    },
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 0,
    },
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 1,
    },
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 0,
    },
    {
        id: "658685",
        deviceType: "Laptop",
        ipAddress: "454.5089.4959",
        time: "09:00am",
        location: "Enugu, Nigeria",
        status: 1,
    }
];

export default login_attempts_data;