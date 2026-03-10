import axiosInstance from "@/lib/axios";
import { CustomerTypes } from "@/models/types/shared/handlers-type";
import { isAxiosError } from "axios";

const createCustomerHandler = async (request_data: CustomerTypes) => {
    try {
        const response = await axiosInstance.post(
            "/api/customers",
            request_data,
            {
                headers: {
                    "x-business-id": `${request_data.business_id}`,
                },
            }
        );
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            throw new Error(
                err?.response?.data?.message ??
                    err?.message ??
                    "Error Occurred While Trying To Create Customer"
            );
        }
        throw new Error(
            "Unexpected Error Occurred While Trying To Create Customer"
        );
    }
};

export { createCustomerHandler };
