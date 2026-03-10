import axiosInstance from "@/lib/axios";
import { AuthSiginTypes, AuthSignInResponse, AxiosErrorResponse } from "@/models/types/shared/auth-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
}

const userSigninHandler = async (data: AuthSiginTypes): Promise<AuthSignInResponse> => {
    try {
        const response = await axiosInstance.post('/api/auth/login', data);
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error("Error Occurred While Trying To Login User: " + err.response?.data?.message);
        }
        throw new Error(`Unexpected error occured while trying to login user: ${err}`);
    }
};

export {userSigninHandler};