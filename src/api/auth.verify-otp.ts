import axiosInstance from "@/lib/axios";
import { AuthOtpResponse, AuthOtpTypes, AxiosErrorResponse, ResendOtpTypes } from "@/models/types/shared/auth-type"

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
}

const userOtpCodeHandler = async (data: AuthOtpTypes): Promise<AuthOtpResponse>  => {
    const otpCodeData: AuthOtpTypes = {
        otp: data.otp,
        user_id: data.user_id,
        purpose: data.purpose || "register"
    };
    try {
        const response = await axiosInstance.post("/api/auth/verify-otp", otpCodeData);
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred during user otp verification");
    }
}

const resendOtpCode = async (data: ResendOtpTypes): Promise<{ message: string }> => {
    try {
        const response = await axiosInstance.post("/api/auth/resend-otp", {
            email: data.email,
            purpose: data.purpose || "register"
        });
        
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred while resending OTP code");
    }
}

export { userOtpCodeHandler, resendOtpCode };