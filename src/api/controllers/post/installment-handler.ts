import axiosInstance from "@/lib/axios";
import { AxiosErrorResponse } from "@/models/types/shared/auth-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
};

export const advanceInstallment = async (data: { installment_payment_id: number; business_id: number; method: string; amount: number; reference?: string }) => {
    try {
        const response = await axiosInstance.post('/api/sales/advance-installment', data, {
            headers: {
                "x-business-id": data.business_id
            }
        });
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to advance installment");
        }
        throw new Error("Unexpected Error Occurred While Trying To Advance Installment");
    }
}

export const completeInstallment = async (data: { plan_id: number; business_id: number; staff_id?: string; created_by_user_id?: number }) => {
    try {
        const response = await axiosInstance.post('/api/sales/complete-installment', data, {
            headers: {
                "x-business-id": data.business_id
            }
        });
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to complete installment");
        }
        throw new Error("Unexpected Error Occurred While Trying To Complete Installment");
    }
}
