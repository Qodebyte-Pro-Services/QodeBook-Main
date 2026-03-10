import axios from "@/lib/axios"
import { AuthRegisterTypes, AuthResponse, AxiosErrorResponse } from "@/models/types/shared/auth-type";


const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
    return typeof error === 'object' && error !== null && 'message' in error;
};

interface ApiRegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    is_social_media: boolean;
}

export const userRegistrationHandler = async (data: AuthRegisterTypes): Promise<AuthResponse> => {
    try {
        const apiData: ApiRegisterData = {
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            is_social_media: data.is_social_media || false
        };

        const response = await axios.post<AuthResponse>("/api/auth/signup", apiData);
        
        if (response.status !== 201) {
            throw new Error(`Registration failed with status: ${response.status}`);
        }
        
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message;
            throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred during registration");
    }
};