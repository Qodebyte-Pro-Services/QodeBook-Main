import axiosInstance from "@/lib/axios";
import { AxiosErrorResponse } from "@/models/types/shared/auth-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
}

const getUserproofile = async ()=> {
    try {
        const response = await axiosInstance.get("/api/user/profile");
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            console.log(err);
            throw new Error(err.response?.data?.message);
        }
    }
}

export {getUserproofile};
