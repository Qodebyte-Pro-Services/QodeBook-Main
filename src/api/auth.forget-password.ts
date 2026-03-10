import axiosInstance from "@/lib/axios";
import { AuthForgotPasswordResponse, AuthForgotPasswordTypes, AxiosErrorResponse } from "@/models/types/shared/auth-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
}

const userForgetPasswordHandler = async (data: AuthForgotPasswordTypes): Promise<AuthForgotPasswordResponse> => {
    try {
        const response = await axiosInstance.post("/api/auth/forgot-password", {
            email: data.email,
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred while forgot password");
    }
}

export {userForgetPasswordHandler}