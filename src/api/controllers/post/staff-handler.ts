import axiosInstance from "@/lib/axios";
import { isAxiosError } from "axios";

export interface StaffPayload {
    email: string;
    password: string;
    business_id: number
}

export interface StaffResendOtpPayload {
    staff_id: string;
    business_id: number;
    purpose: string;
}

export interface StaffVerifyOtpPayload {
    staff_id: string;
    business_id: number;
    otp: string;
    purpose: string | "login";
}

export interface StaffChangePasswordPayload {
    staff_id: string;
    business_id: number;
    current_password: string;
    new_password: string;
}

const createStaffAuth = async (staffPayload: StaffPayload) => {
    try {
        const response = await axiosInstance.post('/api/staff/login', staffPayload, {
            headers: {
                'x-business-id': staffPayload?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to authenticate staff")
        }
        throw new Error("Unexpected error occurred while trying to authenticate staff");
    }
}

const resendOtpAuth = async (payload: StaffResendOtpPayload) => {
    try {
        const response = await axiosInstance.post('/api/staff/resend-otp', payload, {
            headers: {
                "x-business-id": payload?.business_id
            }
        })
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to resend OTP")
        }
        throw new Error("Unexpected error occurred while trying to resend OTP");
    }
}

const verifyCodeAuth = async (payload: StaffVerifyOtpPayload) => {
    try {
        const response = await axiosInstance.post("/api/staff/verify-otp", payload, {
            headers: {
                "x-business-id": payload?.business_id
            } 
        })
        return response?.data;
    }catch(err) {
       if (isAxiosError(err)) {
        throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to verify code")
       }
       throw new Error("Unexpected error occurred while trying to verify code");
    }
}

const changeStaffPasswordAuth = async (payload: StaffChangePasswordPayload) => {
    try {
        const response = await axiosInstance.post("/api/staff/password/change", payload, {
            headers: {
                "x-business-id": payload?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message || "Error occurred while trying to change staff password")
        }
        throw new Error("Unexpected error occurred while trying to change staff password");
    }
}

const changePasswordApproveRequest = async (payload: Pick<StaffChangePasswordPayload, "staff_id" | "new_password" | "business_id"> & {request_id: string}) => {
    try {
        const response = await axiosInstance.post(`/api/staff/password/approve/${payload?.request_id}`, payload, {
            headers: {
                "x-business-id": payload?.business_id
            }
        })
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message || "Error occurred while trying to approve password change request")
        }
        throw new Error("Unexpected error occurred while trying to approve password change request");
    }
}

const changePasswordRejectRequest = async (payload: Pick<StaffChangePasswordPayload, "staff_id" | "new_password" | "business_id"> & {request_id: string}) => {
    try {
        const response = await axiosInstance.post(`/api/staff/password/reject/${payload?.request_id}`, payload, {
            headers: {
                "x-business-id": payload?.business_id
            }
        })
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message || "Error occurred while trying to reject password change request")
        }
        throw new Error("Unexpected error occurred while trying to reject password change request");
    }
}

const staffLogoutAuth = async (payload: {session_id: string; business_id: number}) => {
    const { business_id, ...requestData } = payload;
    try {
        const response = await axiosInstance.post(`/api/staff/logout`, requestData, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to logout staff");
        }
        throw new Error("Unexpected error occurred while trying to logout staff");
    }
}

const logoutAllStaffHandler = async (payload: {reason: string; business_id: number}) => {
    const {business_id, ...requestData} = payload;
    try {
        const response = await axiosInstance.post(`/api/staff/logout/all`, requestData, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to logout all staff");
        }
        throw new Error("Unexpected error occurred while trying to logout all staff");
    }
}

const staffLogoutOthersHandler = async (payload: {business_id: number; current_session_id: string}) => {
    const {business_id, ...requestData} = payload;
    try {
        const response = await axiosInstance.post(`/api/staff/logout/others`, requestData, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to logout other staff");
        }
        throw new Error("Unexpected error occurred while trying to logout other staff");
    }
}

export {
    createStaffAuth,
    resendOtpAuth,
    verifyCodeAuth,
    changeStaffPasswordAuth,
    changePasswordRejectRequest,
    changePasswordApproveRequest,
    staffLogoutAuth,
    logoutAllStaffHandler,
    staffLogoutOthersHandler
};