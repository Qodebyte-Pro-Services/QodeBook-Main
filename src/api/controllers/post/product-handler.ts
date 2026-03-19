import { ExpensePayloadLogic } from "@/components/dashboard/finances/forms/add-expense";
import { BudgetPayloadLogic } from "@/components/dashboard/finances/forms/create-budget";
import { ExpenseCategoryLogic } from "@/components/dashboard/finances/forms/add-expense-category-form";
import { FormValuesPayload } from "@/components/dashboard/staffs/forms/create-staff-business";
import { StaffShiftPayload } from "@/components/dashboard/staffs/forms/create-staff-shift";
import axiosInstance from "@/lib/axios";
import { AxiosErrorResponse } from "@/models/types/shared/auth-type";
import { AttributeBulk, AttributesType, CategoriesType, ProductsTypes, SupplierFormData, BulkOrderType, BranchTypes, ProductOrderTypeTwo, SingleProductAdjustment, StaffRoleTypes, TaxPayloadType, DiscountPayloadType, CouponPayloadType } from "@/models/types/shared/handlers-type";

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
};

const createCategory = async (request_data: CategoriesType) => {
    try {
        const response = await axiosInstance.post("/api/categories", request_data,{
            headers: {
                "x-business-id": request_data.business_id,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while creating category");
    }
}

const createAttribute = async (request_data: AttributesType) => {
    try {
        const response = await axiosInstance.post("/api/attributes", request_data);
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while creating attributes");
    }
}

const createAttributeBulk = async (request_data: AttributeBulk) => {
    try {
        const response = await axiosInstance.post("/api/attributes/bulk", request_data,{
            headers: {
                "x-business-id": `${request_data.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while creating attributes");
    }
}

const createProductHandler = async (request_data: ProductsTypes | FormData) => {
    try {
        if (typeof FormData !== "undefined" && request_data instanceof FormData) {
            const businessId = (request_data.get("business_id") ?? "") as string;
            const response = await axiosInstance.post("/api/products/full", request_data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "x-business-id": businessId,
                }
            });
            return response.data;
        }

        // Fallback: raw object (server must accept JSON or convert server-side)
        if (typeof request_data === 'object' && request_data !== null && 'business_id' in request_data) {
            const bizId = String((request_data as ProductsTypes).business_id);
            const response = await axiosInstance.post("/api/products/full", request_data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "x-business-id": bizId,
                }
            });
            return response.data;
        }
        throw new Error("Invalid request payload for createProductHandler");
    }catch(err) {
        if (isAxiosError(err)) {
            if (process.env.NEXT_PUBLIC_NODE_ENV === "dev") {
                console.log(err);
            }
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Add Product");
        }
        if (process.env.NEXT_PUBLIC_NODE_ENV === "dev") {
            console.log(err);
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Product");
    }
}

const createSupplier = async (request_data: SupplierFormData) => {
    try {
        const response = await axiosInstance.post("/api/suppliers", request_data, {
            headers: {
                "x-business-id": `${request_data.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Add Supplier");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Supplier");
    }
}

const createTaxForm = async (request_data: TaxPayloadType) => {
    try {
        const response = await axiosInstance.post("/api/taxes", request_data, {
            headers: {
                "x-business-id": `${request_data.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Add Tax");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Tax");
    }
}

const createDiscountForm = async (request_data: DiscountPayloadType) => {
    try {
        const response = await axiosInstance.post("/api/discounts", request_data, {
            headers: {
                "x-business-id": `${request_data.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Add Discount");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Discount");
    }
}

const createSalesCoupon = async (request_data: CouponPayloadType) => {
    try {
        const response = await axiosInstance.post("/api/coupons", request_data, {
            headers: {
                "x-business-id": `${request_data.business_id}`,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Add Coupon");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Coupon");
    }
}

const createOrderFormHandler = async (request_data: BulkOrderType) => {
    const {business_id, ...rest} = request_data;
    try {
        const response = await axiosInstance.post("/api/orders", rest, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "Error Occurred While Trying To Create Order");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Order");
    }
}

const createProductOrder = async (req_data: ProductOrderTypeTwo) => {
    try {
        const response = await axiosInstance.post("/api/stock/create-supply-order", req_data, {
            headers: {
                "x-business-id": req_data.business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "Error Occurred While Trying To Create Order");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Order");
    }
}

const updateStockSupplyOrderStatus = async (req_data: {supply_order_id: number; supply_status: string; business_id: number}) => {
    try {
        const response = await axiosInstance.post("/api/stock/supply-status", req_data, {
            headers: {
                "x-business-id": req_data?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to update supply-order status");
        }
        throw new Error("Unexpected Error Occurred While Trying Update Supply-Stock Status");
    }
}

const createBusinessBranch = async (req_data: BranchTypes) => {
    try {
        const response = await axiosInstance.post("/api/branches/create", req_data, {
            headers: {
                "x-business-id": req_data.business_id,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "Error Occurred While Trying To Create Branch");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Branch");
    }
}

const createProductVariantAdjustment = async (req_data: SingleProductAdjustment & {business_id: number; branch_id: number;}) => {
    const {business_id, branch_id, ...rest} = req_data;
    try {
        const response = await axiosInstance.post("/api/stock/adjust", rest, {
            headers: {
                "x-business-id": business_id,
                "x-branch-id": branch_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to update product variants");
        }
        throw new Error("Unexpected error occurred while trying to update product variant");
    }
}

const createStaffRole = async (request_data: StaffRoleTypes) => {
    try {
        const response = await axiosInstance.post("/api/staff/roles", request_data, {
            headers: {
                "x-business-id": request_data.business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Create Staff Role");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Staff Role");
    }
}

const updateStaffRole = async (request_data: Omit<StaffRoleTypes, 'description'> & {role_id: string}) => {
    const {role_id, business_id, role_name, permissions} = request_data;
    try {
        const updatePayload: Partial<{role_name: string; permissions: string | Array<string>}> = {};
        
        if (role_name) {
            updatePayload.role_name = role_name;
        }
        
        if (permissions) {
            updatePayload.permissions = permissions;
        }

        const response = await axiosInstance.put(`/api/staff/roles/${role_id}`, updatePayload, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Update Staff Role");
        }
        throw new Error("Unexpected Error Occurred While Trying To Update Staff Role");
    }
}

const deleteStaffRole = async (request_data: {role_id: string; business_id: number}) => {
    const {role_id, business_id} = request_data;
    try {
        const response = await axiosInstance.delete(`/api/staff/roles/${role_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Delete Staff Role");
        }
        throw new Error("Unexpected Error Occurred While Trying To Delete Staff Role");
    }
}

const createStaffCreation = async(request_data: {business_id: number; branch_id: number; data: FormData}) => {
    const {business_id, branch_id, data} = request_data;
    try {
        const response = await axiosInstance.post("/api/staff/create", data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": business_id,
                "x-branch-id": branch_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to create staff");
        }
        throw new Error("Unexpected error occurred while trying to create staff");
    }
}

const createStaffBusinessSettings = async (req_data: FormValuesPayload) => {
    const {business_id, ...rest} = req_data;
    try {
        const response = await axiosInstance.post(`/api/staff/business_settings/${business_id}`, rest, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to create staff business");
        }
        throw new Error("Unexpected error occurred while trying to create staff business");
    }
}

const staffDocsUploading = async ({business_id, data}: {business_id: number; data: FormData}) => {
    try {
        const response = await axiosInstance.post(`/api/staff/docs`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to upload staff document");
        }
        throw new Error("Unexpected error occurred while trying to upload staff document");
    }
}

const createStaffShift = async (reqdata: StaffShiftPayload) => {
    try {
        const response = await axiosInstance.post("/api/staff/shifts", reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to creat staff shift");
        }
        throw new Error("Unexpected error occurred while trying to create staff shift");
    }
}

const createStaffSubcharge = async (reqdata : {staff_id: string; business_id: number; sub_charge_amt: number; reason: string}) => {
    try {
        const response = await axiosInstance.post(`/api/staff/subcharges`, reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Create Staff Subcharges");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Staff Subcharges");
    }
}

const createExpenseCategory = async (reqdata: ExpenseCategoryLogic) => {
    try {
        const response = await axiosInstance.post(`/api/expense-categories`, reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to create expense category");
        }
        throw new Error("Unexpected error occurred while trying to create expense category");
    }
}

const createExpense = async (reqdata: ExpensePayloadLogic) => {
    try {
        const response = await axiosInstance.post(`/api/expenses`, reqdata, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to create expense");
        }
        throw new Error("Unexpected error occurred while trying to create expense");
    }
}

const createBudget = async (reqdata: BudgetPayloadLogic) => {
    try {
        const response = await axiosInstance.post(`/api/budgets`, reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to create budget");
        }
        throw new Error("Unexpected error occurred while trying to create budget");
    }
}

const createStaffSalary = async (reqdata: {business_id: number; data: FormData}) => {
    try {
        const response = await axiosInstance.post(`/api/expenses/staff-salary`, reqdata?.data, {
            headers: {
                "Content-Type": "multipart-form-data",
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to create staff salary");
        }
        throw new Error("Unexpected error occurred while trying to create staff salary");
    }
}

const transferAllBudgetHandler = async (reqdata: {business_id: number; default_amount: number; period_start: string; period_end: string; budget_month: string; budget_year: string}) => {
    try {
        await axiosInstance.post("/api/budgets/all", reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to transfer all budget");
        }
        throw new Error("Unexpected error occurred while trying to transfer all budget");
    }
}

const transferABudgetHandler = async (reqdata: {business_id: number; from_category_id: string; to_category_id: string; amount: number; reason?: string}) => {
    try {
        const response = await axiosInstance.post("/api/budget/transfer", reqdata, {
            headers: {
                "x-business-id": reqdata?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to transfer all budget");
        }
        throw new Error("Unexpected error occurred while trying to transfer all budget");
    }
}

const createBusinessHandler = async (data: FormData) => {
    try {
        const response = await axiosInstance.post('/api/business/create', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to create business");
        }
        throw new Error("Unexpected error occurred while trying to create business");
    }
}

export {createCategory, createAttribute, createAttributeBulk, createProductHandler, createSupplier, createOrderFormHandler, createProductOrder, createBusinessBranch, createProductVariantAdjustment, createStaffRole, updateStaffRole, deleteStaffRole, createStaffCreation, createStaffBusinessSettings, createTaxForm, createDiscountForm, createSalesCoupon, updateStockSupplyOrderStatus, staffDocsUploading, createStaffShift, createStaffSubcharge, createExpenseCategory, createExpense, createBudget, createStaffSalary, transferAllBudgetHandler, transferABudgetHandler, createBusinessHandler};