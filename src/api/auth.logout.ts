import axiosInstance from "@/lib/axios";
import { AxiosErrorResponse } from "@/models/types/shared/auth-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "response" in err && "message" in err;
};

export const userLogoutAuth = async (businessId: number) => {
    try {
        const response = await axiosInstance.post("/api/auth/logout", {
            headers: {
                businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message ?? err.message);
        }
        throw new Error("An unexpected error occurred while logging out");
    }
}