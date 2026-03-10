import axiosInstance from "@/lib/axios";
import { isAxiosError } from "axios"

const deleteUserData = async (req_data: {userId: string; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/customers/${req_data?.userId}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to delete user's data");
        }
        throw new Error("Unexpected Error Occurred While Delete User's Data");
    }
}

const deleteCategoryById = async (req_data: {id: number; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/categories/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to delete category's data");
        }
        throw new Error("Unexpected Error Occurred While Delete Category's Data");
    }
}

const deleteAttributeById = async (req_data: {id: number; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/attributes/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to delete units's data");
        }
        throw new Error("Unexpected Error Occurred While Delete Units's Data");
    }
}

const deleteTaxesById = async (req_data: {id: number; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/taxes/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to delete taxes's data");
        }
        throw new Error("Unexpected Error Occurred While Delete Taxes's Data");
    }
}

const deleteDiscountsById = async (req_data: {id: number; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/discounts/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to delete discounts's data");
        }
        throw new Error("Unexpected Error Occurred While Delete Discounts's Data");
    }
}

const deleteCouponsById = async (req_data: {id: number; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/coupons/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to delete coupons's data");
        }
        throw new Error("Unexpected Error Occurred While Delete Coupons's Data");
    }
}

const deleteStaffCreds = async (req_data: {id: string; businessId: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/staff/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Delete Staff Creds");
        }
        throw new Error("Unexpected Error Occurred while Trying to delete staff creds");
    }
}

const deleteStaffDoc = async (req_data: {id: string; business_id: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/staff/docs/${req_data?.id}`, {
            headers: {
                "x-business-id": req_data?.business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Delete Staff Document");
        }
        throw new Error("Unexpected Error Occurred while Trying to delete staff document");
    }
}

const deleteStaffShift = async (reqdata: {shift_id: string; business_id: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/staff/shifts/${reqdata?.shift_id}`, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Delete Staff Shift");
        }
        throw new Error("Unexpected Error Occurred while Trying to delete staff shift");
    }
}

const deleteStaffBusinessSettings = async (business_id: number) => {
    try {
        const response = await axiosInstance.delete(`/api/staff/business_settings/${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to delete the business settings");
        }
        throw new Error("Unexpected error occurred while trying to delete staff business settings");
    }
}

const deleteExpenseHandler = async ({expense_id, business_id}: {expense_id: string; business_id: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/expense/${expense_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to delete expense");
        }
        throw new Error("Unexpected error occurred while trying to delete expense");
    }
}

const deleteBudgetHandler = async ({budget_id, business_id}: {budget_id: string; business_id: number}) => {
    try {
        const response = await axiosInstance.delete(`/api/budget/${budget_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to delete budget");
        }
        throw new Error("Unexpected error occurred while trying to delete budget");
    }
}

export {deleteUserData, deleteCategoryById, deleteAttributeById, deleteTaxesById, deleteDiscountsById, deleteCouponsById, deleteStaffCreds, deleteStaffDoc, deleteStaffShift, deleteStaffBusinessSettings, deleteExpenseHandler, deleteBudgetHandler};