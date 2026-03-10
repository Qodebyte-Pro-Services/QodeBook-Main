import axiosInstance from "@/lib/axios";
import { AxiosErrorResponse } from "@/models/types/shared/auth-type";
import { toast } from "sonner";

export type ProductAttributeValuesType = {
    id: string;
    attribute_id: string;
    value: string;
    created_at: string;
    updated_at: string;
}

export type ProductAttributesType = {
    id: string;
    business_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    values: ProductAttributeValuesType[]
}

const isAxiosError = (err: unknown): err is AxiosErrorResponse => {
    return typeof err === "object" && err !== null && "message" in err;
}

const userBusinessesHandler = async () => {
    try {
        const response = await axiosInstance.get("/api/business");
        if (response.status !== 200) {
            throw new Error("Error Occurred While Trying To Fetch User Businesses: " + response.status);
        }
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            toast.error(err.message);
            throw new Error("Error Occurred While Trying To Fetch User Businesses: " + err.message);
        }
        throw new Error("An unexpected error occurred while fetching user businesses");
    }
}

const userBusinessHandler = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/api/business/${id}`, {
            headers: {
                "x-business-id": id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            console.log(err);
            toast.error(err.message);
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while fetching user business");
    }
}

const financeOverview = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/api/finance/overview?business_id=${id}`, {
            headers: {
                "x-business-id": id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            console.log(err);
            toast.error(err.message);
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while fetching finance overview");
    }
}

const financeOverviewAnalytics = async (req_data: {url: string; business_id: number;}) => {
    try {
        const response = await axiosInstance.get(`${req_data?.url}`, {
            headers: {
                "x-business-id": req_data?.business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            console.log(err);
            toast.error(err.message);
            throw new Error(err.response?.data?.message);
        }
        throw new Error("An unexpected error occurred while fetching finance overview");
    }
}

const incomeExpenseOvertimeAnalytics = async (req_data: {url: string; business_id: number}) => {
    try {
        const response = await axiosInstance.get(`${req_data?.url}`, {
            headers: {
                "x-business-id": req_data?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Income Expense Overview");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch income expense overtime analytics");
    }
}

const getsalesOverview = async (req_data: {query: string; business_id: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/sales-overview?${req_data?.query}`, {
            headers: {
                "x-business-id": req_data?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Fetch Sales Overview Data");
        }
        throw new Error("Unexpected Errror Occurred while trying to fetch sales overview analytics");
    }
}

const getProductAttributes = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/api/attributes?business_id=${id}`, {
            headers: {
                "x-business-id": id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message);
        }
        throw new Error("An unexpected error occurred while fetching product attributes");
    }
}

const getProductCategories = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/api/categories?business_id=${id}`, {
            headers: {
                "x-business-id": id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message);
        }
        throw new Error("An unexpected error occurred while fetching product categories");
    }
}

const getUserProducts = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/api/products?business_id=${id}`, {
            headers: {
                "x-business-id": id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "An unexpected error occurred while fetching user products");
        }
        throw new Error("An unexpected error occurred while fetching user products");
    }
}

const getTopSellingProducts = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/product-analytics?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch products analytics");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch top selling products");
    }
}

const getCategoriesId = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/api/categories/${id}`);
        return response.data?.categories?.name;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message);
        }
        throw new Error("An unexpected error occurred while fetching product categories");
    }
}

const getProductsById = async (req_data: {productId: string, businessId: string}) => {
    try {
        const response = await axiosInstance.get(`/api/products/${req_data.productId}`, {
            headers: {
                "x-business-id": req_data.businessId || ""
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message);
        }
        throw new Error("An unexpected error occurred while fetching product by id");
    }
}

const getVariantsByProductId = async (req_data: {productId: string, businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/variants/products/${req_data.productId}/variants`, {
            headers: {
                "x-business-id": req_data.businessId || 0
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "An unexpected error occurred while fetching product variants by product id");
        }
        throw new Error("An unexpected error occurred while fetching product variants by product id");
    }
}

const getVariantsByBusiness = async (businessId: string) => {
    try {
        const response = await axiosInstance.get(`/api/variants/business/variants?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "An unexpected error occurred while fetching variants by business");
        }
        throw new Error("An unexpected error occurred while fetching variants by business");
    }
}

const getSuppliersByBusinessId = async (businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/suppliers?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "An unexpected error occurred while fetching suppliers by business id");
        }
        throw new Error("An unexpected error occurred while fetching suppliers by business id");
    }
}

const getBusinessBranches = async (businessId: string) => {
    try {
        const response = await axiosInstance.get("/api/branches", {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "An unexpected error occurred while fetching business branches");
        }
        throw new Error("An unexpected error occurred while fetching business branches");
    }
}

const getOrderStocks = async (id: string) => {
    try{
        const response = await axiosInstance.get(`/api/stock/get-supply-orders?business_id=${id}`, {
            headers: {
                "x-business-id": id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.message ?? err?.response?.data?.message ?? "An unexpected error occurred while fetching order stocks");
        }
        throw new Error("An unexpected error occurred while fetching order stocks");
    }
}

const getOrderStockById = async ({id, businessId}: {id: string; businessId: string}) => {
    try {
        const response = await axiosInstance.get(`/api/stock/get-supply-order/${id}?business_id=${businessId}`, {
            headers: {
                "x-business-id": +businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Order Stocks");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch orer stocks");
    }
}

const getStocksMovement = async ({business_id} : {business_id: number;}) => {
    try {
        const response = await axiosInstance?.get(`/api/stock/movement?business_id=${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch stocks movement");
        }
        throw new Error("An unexpected error occurred while fetching stocks movement");
    }
}
export const getProductStocksMovement = async ({business_id, product_id} : {business_id: number; product_id: number}) => {
    try {
        const response = await axiosInstance?.get(`/api/stock/movement?business_id=${business_id}&product_id=${product_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch stocks movement");
        }
        throw new Error("An unexpected error occurred while fetching stocks movement");
    }
}

const getStockAnalytics = async (req_data: {business_id: number; branch_id: number; url: string}) => {
    try {
        const response = await axiosInstance.get(`${req_data?.url}`, {
            headers: {
                "x-business-id": req_data?.business_id,
                "x-branch-id": req_data?.branch_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch stocks analytics");
        }
        throw new Error("An unexpected error occurred while fetching stocks analytics");
    }
}

const getVariationAnalytics = async (req_data: {business_id: number; branch_id: number}) => {
    try {
        const response = await axiosInstance?.get(`/api/finance/variation-analytics?business_id=${req_data?.business_id}`, {
            headers: {
                "x-business-id": req_data?.business_id,
                "x-branch-id": req_data?.branch_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch stocks analytics");
        }
        throw new Error("An unexpected error occurred while fetching stocks analytics");
    }
}

const getProductVariantStocks = async ({businessId, productId}: {businessId: number; productId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/product-variant-stock-movement?business_id=${businessId}&product_id=${productId}`, {
            headers: {
                "x-business-id": businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch product variant stocks");
        }
        throw new Error("An unexpected error occurred while fetching product variant stocks");
    }
}

const getStocksMovementAnalytics = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/stock-movement-analytics?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch stocks movement analytics");
        }
        throw new Error("An unexpected error occurred while fetching stocks movement analytics");
    }
}

const getLowStocksStatus = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get("/api/stock/status/low", {
            headers: {
                "x-business-id": businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch low stocks status");
        }
        throw new Error("An unexpected error occurred while fetching low stocks status");
    }
}

const getOutOfStocksStatus = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get("/api/stock/status/out-of-stock", {
            headers: {
                "x-business-id": businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch out of stocks status");
        }
        throw new Error("An unexpected error occurred while fetching out of stocks status");
    }
}

const getCustomers = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/customers?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch customers");
        }
        throw new Error("An unexpected error occurred while fetching customers");
    }
}

const getCustomerById = async (req_data: {businessId: number; customerId: string;}) => {
    try {
        const response = await axiosInstance.get(`/api/customers/${req_data.customerId}`, {
            headers: {
                "x-business-id": req_data.businessId,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error occurred while trying to fetch customer details");
        }
        throw new Error("Unexpected error occurred while trying to fetch customer details");
    }
}

const getUserDetails = async () => {
    try {
        const response = await axiosInstance.get("/api/auth/me");
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error occurred while trying to fetch user details");
        }
        console.log(err);
        throw new Error("Unexpected error occurred while trying to fetch user details");
    }
}

const getProductDiscounts = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/discounts?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Product Discounts");
        }
        throw new Error("An unexpected error occurred while trying to fetch product discounts");
    }
}

const getProductTaxes = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/taxes?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Product Discounts");
        }
        throw new Error("An unexpected error occurred while trying to fetch product discounts");
    }
}

const getProductCoupons = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/coupons?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Product Coupons");   
        }
        throw new Error("An Error Occurred While Trying To Fetch Product Coupons");
    }
}

const getDiscountsByBusinessId = async ({business_id}: {business_id: number}) => {
    try {
        const response = await axiosInstance.get(`/api/discounts/products-with-discounts?business_id=${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch discounts");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Discounts");
    }
}

const getTaxesByBusinessId = async ({business_id}: {business_id: number}) => {
    try {
        const response = await axiosInstance.get(`/api/taxes/products-with-taxes?business_id=${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch taxes");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Taxes");
    }
}

const getCouponsByBusinessId = async ({business_id}: {business_id: number}) => {
    try {
        const response = await axiosInstance.get(`/api/coupons/products-with-coupons?business_id=${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch coupons");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Coupons");
    }
}

// For sales endpoints

const getSales = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/sales?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch sales");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Sales");
    }
}

const getSalesReport = async ({url, businessId, branchId}: {url: string; businessId: number; branchId: number}) => {
    try {
        const response = await axiosInstance.get(url, {
            headers: {
                "x-business-id": businessId,
                "x-branch-id": branchId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error occurred while trying to fetch sales report");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch sales report");
    }
}

const getSalesAnalytics = async (req_data: {businessId: number;}) => {
    try {
        const response = await axiosInstance.get("/api/finance/sales-analytics?business_id="+req_data?.businessId, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error occurred while trying to fetch sales analytics");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch sales analytics");
    }
}

const getSalesAnalyticsData = async (req_data: {url: string; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`${req_data?.url}`, {
            headers: {
                "x-business-id": req_data?.businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying to fetch sales analytics report");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch sales analytics report");
    }
}

const getInventoryTotalVariants = async (req_data: {url: string; business_id: number;}) => {
    try {
        const response = await axiosInstance.get(`${req_data.url}`, {
            headers: {
                "x-business-id": req_data?.business_id,
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error occurred while trying to fetch inventory total variants");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Inventory Total Variants");
    }
}

const getCategoryStockDistribution = async (reqData: {businessId: number; branchId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/category-stock-distribution?business_id=${reqData?.businessId}`, {
            headers: {
                "x-business-id": reqData?.businessId,
                "x-branch-id": reqData?.branchId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Category Stock By Distribution");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Category Stock By Distribution");
    }
}

const getFastMovingStocks = async (req_data: {businessId: number}) => {
    try {
        const response = await axiosInstance.get("/api/stock/status/fast-moving", {
            headers: {
                "x-business-id": req_data?.businessId,
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Fetch Fast Moving Stocks");
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Fast Moving Stocks");
    }
}

const getSupplyOrdersById = async ({orderId, businessId}: {orderId: string; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/stock/get-supply-order/${orderId}?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred while trying to fetch order by Id");
        }
        throw new Error("Unexpected Error Occurred while trying to fetch order by Id");
    }
}

const getProductWithTaxes = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/taxes/products-with-taxes?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch product with taxes");
        }
        throw new Error("Unexpected error ocurred while trying to fetch product with taxes");
    }
}
const getProductWithCoupons = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/coupons/products-with-coupons?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch product with Coupons");
        }
        throw new Error("Unexpected error ocurred while trying to fetch product with Coupons");
    }
}
const getProductWithDiscounts = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/discounts/products-with-discounts?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch product with Discounts");
        }
        throw new Error("Unexpected error ocurred while trying to fetch product with Discounts");
    }
}

export const getTotalProductsRevenue = async (reqData: {url: string; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`${reqData?.url}`, {
            headers: {
                "x-business-id": reqData?.businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Trying To Fetch Product Total Revenue");
        }
        throw new Error(`Unexpected Error Ocurred while fetching total revenue ${typeof err !== "object" ? err : err?.toString()}`)
    }
}

const getSalesById = async ({orderId, businessId}: {orderId: number; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/sales/${orderId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch sales by Id");
        }
        throw new Error("Unexpected error ocurred while trying to fetch sales by Id");
    }
}

const getCustomerTransactions = async ({customerId, businessId}: {customerId: number; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/customers/orders/${customerId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch customer transactions");
        }
        throw new Error("Unexpected error occurred while trying to fetch customer transactions");
    }
}

// --- Expense - Budget Endpoints starts here ----

const getExpenseCategories = async (businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/expense-categories?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch expense categories");
        }
        throw new Error("Unexpected error occurred while truing to fetch expense categories");
    }
}

const getExpenses = async (businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/expenses?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch expenses");
        }
        throw new Error("Unexpected Error occurred while trying to fetch expenses");
    }
}

const getBudgets = async (businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/budgets?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch budgets");
        }
        throw new Error("Unexpected error occurred while trying to fetch budgets");
    }
}

const getExpenseIncomeOvertime = async ({url, businessId}: {url: string; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`${url}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch expense-income overtime");
        }
        throw new Error("Unexpected error occurred while trying to fetch income-expense overtime");
    }
}

const getExpenseAnalytics = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/expense-analytics?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch expense categories");
        }
        throw new Error("Unexpected error occurred whil trying to fetch expense categories");
    }
}

const getBudgetAllocation = async ({businessId}: {businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/finance/budget-allocation-category?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch budget allocations");
        }
        throw new Error("Unexpected error occurred while trying to fetch budget allocations");
    }
}

const getBudgetAnalytics = async(businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/finance/budget-analytics?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch expense analytics");
        }
        throw new Error("Unexpected Error occurred while trying to fetch expense analytics");
    }
}



// --- Staff Endpoints starts here ----

const getStaffByBusinessId = async (businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/staff?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Ocurred while trying to fetch staff data")
        }
        throw new Error("Unexpected Error Occurred While Trying To Fetch Staff Data");
    } 
}

const getStaffById = async (id: string, businessId: number) => {
    try {
        const response = await axiosInstance.get(`/api/staff/${id}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch staff");
        };
        throw new Error("Unexpected Error Occurred whil trying to fetch staff record");
    }
}

const getStaffDocs = async (reqData: {business_id: number; queryData: string}) => {
    try {
        const response = await axiosInstance.get(`/api/staff/docs?${reqData?.queryData}`, {
            headers: {
                "x-business-id": reqData?.business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch staff documents");
        }
        throw new Error("Unexpected error occurred while trying to fetch staff documents");
    }
}

const getStaffShifts = async(businessId: number, staff_id: string) => {
    try {
        const response = await axiosInstance.get(`/api/staff/shifts/${staff_id}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to get staff shifts");
        }
        throw new Error("Unexpected error occurred while trying to fetch staff shifts");
    }
}

const getStaffSubcharges = async ({staff_id, businessId}: {staff_id: string; businessId: number}) => {
    try {
        const response = await axiosInstance.get(`/api/staff/subcharges/${staff_id}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred While Fetching Staff Subcharges");
        }
        throw new Error("Unexpected Occurred While Fetching Staff Subcharges");
    }
}

const getStaffBusinessSettings = async (business_id: number) => {
    try {
        const response = await axiosInstance.get(`/api/staff/business_settings/${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error Occurred while trying to fetch staff business settings");
        }
        throw new Error("Unexpected error occurred while trying to fetch business settings");
    }
}

const getStaffSalariesHistory = async ({businessId, staff_id}: {businessId: number; staff_id: string;}) => {
    try {
        const response = await axiosInstance.get(`/api/expenses/staff-salary/${staff_id}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch staff salaries history");
        }
        throw new Error("Unexpected error occurred while trying to fetch staff salaries history");
    }
}

const getStaffLogs = async (business_id: number) => {
    try {
        const response = await axiosInstance.get(`/api/staff/logs/${business_id}`, {
            headers: {
                "x-business-id": business_id
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to get staff logs");
        }
        throw new Error("Unexpected error occurred while trying to fetch staff logs");
    }
}

const getStaffActions = async (businessId: number, staffId: string) => {
    try {
        const response = await axiosInstance.get(`/api/staff/actions/${staffId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch staff actions");
        }
        throw new Error("Unexpected error occurred while trying to fetch staff actions");
    }
}

const getStaffRoles = async ({businessId}: {businessId: number;}) => {
    try {
        const response = await axiosInstance.get(`/api/staff/roles?business_id=${businessId}`, {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "Error Occurred While Trying To Create Staff");
        }
        throw new Error("Unexpected Error Occurred While Trying To Create Staff");
    }
}

const getStaffActiveLogs = async (businessId: number) => {
    try {
        const response = await axiosInstance.get("/api/staff/sessions/active", {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message ?? err?.message ?? "An unexpected error occurred while fetching staff active logs");
        }
        throw new Error("An unexpected error occurred while fetching staff active logs");
    }
};



// --- Notifications Endpoints starts here ----

const getNotificationsCount = async (businessId: number) => {
    try {
        const response = await axiosInstance.get("/api/notifications/unread-count", {
            headers: {
                "x-business-id": businessId
            }
        });
        return response.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch unread notification count");
        }
        throw new Error("Unexpected error occurred while trying to fetch unread notification count");
    }
}

const getNotifications = async (businessId: number) => {
    try {
        const response = await axiosInstance.get("/api/notifications", {
            headers: {
                "x-business-id": businessId
            }
        });
        return response?.data;
    }catch(err) {
        if (isAxiosError(err)) {
            throw new Error(err?.response?.data?.message || err?.message || "Error occurred while trying to fetch notifications");
        }
        throw new Error("Unexpected error occurred while trying to fetch notifications");
    }
}

export {
    userBusinessesHandler,
    userBusinessHandler,
    financeOverview,
    getProductAttributes,
    getProductCategories,
    getUserProducts,
    getTopSellingProducts,
    getCategoriesId,
    getProductsById,
    getCategoryStockDistribution,
    getVariantsByProductId,
    getSuppliersByBusinessId,
    getBusinessBranches,
    getOrderStocks,
    getStocksMovement,
    getStockAnalytics,
    getVariationAnalytics,
    getProductVariantStocks,
    getLowStocksStatus,
    getOutOfStocksStatus,
    getStocksMovementAnalytics, 
    getCustomers,
    getCustomerById,
    getUserDetails,
    getStaffRoles,
    getVariantsByBusiness,
    getProductTaxes,
    getProductDiscounts,
    getProductCoupons,
    getDiscountsByBusinessId,
    getTaxesByBusinessId,
    getCouponsByBusinessId,
    getSales,
    getSalesById,
    getSalesReport,
    getSalesAnalytics,
    getSalesAnalyticsData,
    getInventoryTotalVariants,
    getFastMovingStocks,
    getSupplyOrdersById,
    getOrderStockById,
    incomeExpenseOvertimeAnalytics,
    financeOverviewAnalytics,
    getsalesOverview,
    getProductWithTaxes,
    getProductWithCoupons,
    getProductWithDiscounts,
    getStaffByBusinessId,
    getStaffById,
    getStaffDocs,
    getStaffShifts,
    getStaffSubcharges,
    getStaffBusinessSettings,
    getExpenseCategories,
    getExpenses,
    getBudgets,
    getCustomerTransactions,
    getExpenseIncomeOvertime,
    getExpenseAnalytics,
    getBudgetAllocation,
    getStaffActions,
    getBudgetAnalytics,
    getStaffLogs,
    getStaffSalariesHistory,
    getNotifications,
    getNotificationsCount,
    getStaffActiveLogs
};