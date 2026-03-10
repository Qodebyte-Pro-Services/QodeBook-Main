import axiosInstance from "@/lib/axios";
import { ResetPasswordResponse, ResetPasswordTypes } from "@/models/types/shared/auth-type";
import { isAxiosError } from "axios";

const userResetPasswordHandler = async (data: ResetPasswordTypes): Promise<ResetPasswordResponse> => {
    try {
        const response = await axiosInstance.post("/api/auth/reset-password", {
            newPassword: data.newPassword,
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred while reset password");
    }
}

export {userResetPasswordHandler};