import { ExpenseCategoryLogic } from "@/components/dashboard/finances/forms/add-expense-category-form";
import { BudgetPayloadLogic } from "@/components/dashboard/finances/forms/edit-budget-form";
import { EditOrderLogic } from "@/components/dashboard/inventory/forms/edit-order-form";
import { FormValuesPayload } from "@/components/dashboard/staffs/forms/create-staff-business";
import axiosInstance from "@/lib/axios";
import { AxiosErrorResponse } from "@/models/types/shared/auth-type";
import { UpdateAttributeType, UpdateCategoryType, UpdateDiscountsType, UpdateTaxesType, UpdateCouponType, StaffShiftResponse, StaffBusinessSettings } from "@/models/types/shared/handlers-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
};

const updateCategory = async (request_data: UpdateCategoryType) => {
    try {
        const response = await axiosInstance.put(`/api/categories/${request_data.id}`, request_data, {
            headers: {
                "x-business-id": request_data.business_id,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while updating category");
    }
}

const updateAttribute = async (request_data: UpdateAttributeType) => {
    const {business_id, id, ...rest} = request_data;
    try {
        const response = await axiosInstance.patch(`/api/attributes/${id}`, rest, {
            headers: {
                "x-business-id": business_id,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while updating attribute");
    }
}

const updateTaxes = async (request_data: UpdateTaxesType) => {
    const {id, business_id, ...rest} = request_data;
    try {
        const response = await axiosInstance.patch(`/api/taxes/${id}`, rest, {
            headers: {
                "x-business-id": business_id,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while updating taxes");
    }
}

const updateDiscounts = async (req_data: UpdateDiscountsType) => {
    const {id, ...rest} = req_data;
    try {
        const response = await axiosInstance.patch(`/api/discounts/${id}`, rest, {
            headers: {
                "x-business-id": `${rest.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while updating discounts");
    }
}

const updateCoupons = async (req_data: UpdateCouponType) => {
    const {id, ...rest} = req_data;
    try {
        const response = await axiosInstance.patch(`/api/coupons/${id}`, rest, {
            headers: {
                "x-business-id": `${rest.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while updating coupons");
    }
}

const updateProductVariants = async ({variantId, businessId, formdata}: {variantId: string, businessId: string, formdata: FormData}) => {
    try {
        const response = await axiosInstance.put(`/api/variants/${variantId}`, formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            console.log(err.response?.data);
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Update Variant");
        }
        throw new Error("Unexpected error occurred while trying to update variant table");
    }
}

const updateProductByIdHandler = async ({data, productId, businessId}: {data: FormData; productId: number; businessId: number;}) => {
    try {
        const response = await axiosInstance.put(`/api/products/${productId}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Update Product By Id");
        }
        throw new Error("Unexpected Error Occurred While Trying To Update Product By Id");
    }
}

const updateStockSupplyOrder = async (req_data: EditOrderLogic) => {
    try {
        const response = await axiosInstance.put(`/api/stock/supply-order/edit`, req_data, {
            headers: {
                "x-business-id": `${req_data?.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Update Stock Supply Order");
        }
        throw new Error("Unexpected Error Occurred While Trying To Update Stock Supply Order");
    }
}

const updateStaffCreds = async (req_data: {id: string; businessId: number; data: FormData}) => {
    try {
        const response = await axiosInstance.put(`/api/staff/${req_data?.id}`, req_data?.data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": req_data?.businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Update Staff Creds");
        }
        throw new Error("Unexpected error occurred while trying to update staff creds");
    }
}

const updateStaffShiftById = async (reqdata: Omit<StaffShiftResponse, "created_at">) => {
    const {shift_id, business_id: businessId, ...rest} = reqdata;
    try {
        const response = await axiosInstance.put(`/api/staff/shifts/${shift_id}`, rest, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update staff shift");
        }
        throw new Error("Unexpected Error Occurred While Trying To Update Staff Shift");
    }
}

const updateStaffSubcharge = async (reqdata: {staff_id: string; business_id: number; sub_charge_amt: string | number; reason: string}) => {
    const {staff_id, ...rest} = reqdata;
    try{
        const response = await axiosInstance.put(`/api/staff/subcharge/${staff_id}`, rest, {
            headers: {
                "x-business-id": rest?.business_id, 
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update staff subcharge");
        }
        throw new Error("Unexpected error occurred while trying to update staff subcharge");
    }
}

const updateExpenseStatus = async (reqdata: {expense_id: string; business_id: number; status: string}) => {
    try {
        const {expense_id, business_id, status} = reqdata;
        const response = await axiosInstance.patch(`/api/expenses/expense-status/${expense_id}`, {status}, {
            headers: {
                "x-business-id": business_id,
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update expense status");
        }
        throw new Error("Unexpected error occurred while trying to update expense status");
    }
}

const updateExpensePaymentStatus = async (reqdata: {expense_id: string; business_id: number; payment_status: string}) => {
    try {
        const {expense_id, business_id, payment_status} = reqdata;
        const response = await axiosInstance.patch(`/api/expenses/payment_status/${expense_id}`, {payment_status}, {
            headers: {
                "x-business-id": business_id,
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update expense status");
        }
        throw new Error("Unexpected error occurred while trying to update expense status");
    }
}

const updateBudgetHandler = async (data: (BudgetPayloadLogic & {id: number})) => {
    try {
        const response = await axiosInstance.put(`/api/budgets/${data?.id}`, data, {
            headers: {
                "x-business-id": data?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update budget");
        }
        throw new Error("Unexpected error occurred while trying to update budget");
    }
}

const updateExpenseCategory = async (reqdata: ExpenseCategoryLogic & {id: number}) => {
    try {
        const response = await axiosInstance.put(`/api/expense-categories/${reqdata?.id}`, reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update expense category");
        }
        throw new Error("Unexpected error occurred while trying to update expense category");
    }
}

const updateStaffBusinessSettings = async (reqdata: FormValuesPayload) => {
    const { business_id, ...rest } = reqdata;
    try {
        const response = await axiosInstance.patch(`/api/staff/business_settings/${business_id}`, rest, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update business settings");
        }
        throw new Error("Unexpected error occurred while trying to update business settings");
    }
}

const updateBudgetStatus = async (reqdata: {budgetId: number; businessId: number; action: string; approverId: string; role: string; rejection_reason: string}) => {
    const {budgetId, businessId, ...data} = reqdata;
    try {
        const response = await axiosInstance.patch(`/api/budgets/manage/${budgetId}`, data, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update budget status");
        }
        throw new Error("Unexpected error occurred while trying to update budget status");
    }
}

const updateAuthUserProfile = async ({data, businessId}: {data: FormData; businessId: number}) => {
    try {
        const response = await axiosInstance.put("/api/auth/me", data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to update auth user profile");
        }
        throw new Error("Unexpected error occurred while trying to update auth user profile");
    }
}

const markNotificationAsRead = async ({notificationId, businessId}: {notificationId: number; businessId: number}) => {
    try {
        const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`, {}, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to mark notification as read");
        }
        throw new Error("Unexpected error occurred while trying to mark notification as read");
    }
}

const markAllNotificationsAsRead = async (businessId: number) => {
    try {
        const response = await axiosInstance.patch("/api/notifications/mark-all-read", {}, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to mark all notifications as read");
        }
        throw new Error("Unexpected error occurred while trying to mark all notifications as read");
    }
}

export {updateProductVariants, updateCategory, updateAttribute, updateProductByIdHandler, updateTaxes, updateDiscounts, updateCoupons, updateStockSupplyOrder, updateStaffCreds, updateStaffShiftById, updateStaffSubcharge, updateExpenseStatus, updateExpensePaymentStatus, updateBudgetHandler, updateExpenseCategory, updateStaffBusinessSettings, updateBudgetStatus, updateAuthUserProfile, markNotificationAsRead, markAllNotificationsAsRead};