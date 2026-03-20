import { getStaffBusinessSettings } from "@/api/controllers/get/handler";

type CreateProductTypes = {
    business_id: string;
    category_id: string;
    name: string;
    brand: string;
    description: string;
    base_sku?: string;
    image_url: string;
    taxable?: boolean;
    threshold?: number;
};

type AttributesType = {
    business_id: number;
    name: string;
}

type CategoriesType = AttributesType & {
    description: string;
}

type UpdateCategoryType = CategoriesType & {
    id: number;
}

type UpdateAttributeType = {
    id: number;
    business_id: number;
    name: string;
    values_to_add: Array<string>;
    values_to_update: Array<{id: number; value: string}>;
    values_to_remove: Array<number>;
};

type AttributeBulk = {
    business_id: string;
    attributes: Array<{
        name: string;
        values: Array<string>
    }>
};

type CategoryPayload = {
    id: string;
    name: string;
    description: string;
    business_id: string;
    created_at: string;
    updated_at: string;
}

type CategoriesResponseType = {
    categories: Array<CategoryPayload>;
}

type Variants = {
    attributes: Record<string, string>;
    sku: string;
    cost_price: number;
    selling_price: number;
    quantity: number;
    threshold: number;
    barcode: string;
    image_url: (File | string)[];
}[];

type NewVariantObject = {
    id: number;
    product_id: number;
    attributes: Array<
        {
            name: string;
            value: string;
            value_id: number;
            attribute_id: number;
        }
    >
    cost_price: string;
    selling_price: string;
    quantity: number;
    threshold: number;
    sku: string;
    image_url: Array<
        {
            public_id: string;
            secure_url: string;
        }
    >,
    expiry_date: string;
    created_at: string;
    updated_at: string;
    barcode: string;
    barcode_image_url: string;
}

type NewVariantTypes = {
    variants: Array<NewVariantObject>;
}

type ProductsTypes = {
    business_id: string;
    category_id: string;
    name: string;
    brand: string;
    description: string;
    base_sku?: string;
    image_url: (File | string)[];
    taxable?: boolean;
    threshold?: number;
    unit: string;
    hasVariation: boolean;
    attributes?: Array<{
        name?: string;
        values?: Array<string>
    }>;
    variants?: Variants;
}

type SingleProductType = {
    id: number;
    business_id: number;
    category_id: number;
    name: string;
    brand: string;
    description: string;
    base_sku: string;
    image_url: Array<{secure_url: string; public_id: string;}>;
    taxable: boolean;
    threshold: number;
    created_at: string;
    updated_at: string;
    unit: string;
    hasVariation: boolean;
    category_name?: string;
}

type SupplierFormData = {
    business_id: number;
    name: string;
    contact: string;
}

type SupplierDataResponse = {
    id: number;
    business_id: number;
    name: string;
    contact: string;
    created_at: string;
};

type ProductOrderType = {
    variant_id: number;
    quantity: number;
    cost_price: number;
    order_date: string;
    expected_delivery_date: string;
    note: string;
    supplier_id: number;
    business_id: string;
}

type ProductOrderTypeTwo = {
    variants: Array<{
            variant_id: number;
            quantity: number;
            cost_price: number;
        }>,
    note?: string,
    supplier_id: number,
    expected_delivery_date: string,
    supply_order_date: string,
    supply_status: string;
    business_id: number;
}

type ProductResponseObj = {
    id: number;
    business_id: number;
    category_id: number;
    name: string;
    brand: string;
    description: string;
    base_sku: string;
    image_url: Array<{secure_url: string; public_id: string}>;
    taxable: boolean;
    threshold: number;
    created_at: string;
    updated_at: string;
    unit: string;
    hasVariation: boolean;
    category_name: string;
}

type ProductVariantResponse = {
    variants: Array<{
            id: number,
            product_id: number,
            attributes: Array<{
                    name: string,
                    value: string,
                    value_id: number,
                    attribute_id: number
                }>,
            cost_price: string,
            selling_price: string,
            quantity: number,
            threshold: number,
            sku: string,
            image_url: string[],
            expiry_date: string | null,
            created_at: string,
            updated_at: string,
            barcode: string,
            barcode_image_url: string | null
        }>
}

type ProductVariantResponseObject = {
    id: number,
    product_id: number,
    attributes: Array<{
            name: string,
            value: string,
            value_id: number,
            attribute_id: number
        }>,
    cost_price: string,
    selling_price: string,
    quantity: number,
    threshold: number,
    sku: string,
    image_url: Array<{secure_url: string; public_id: string;}>,
    expiry_date: string | null,
    created_at: string,
    updated_at: string,
    barcode: string,
    barcode_image_url: string | null
}

type BulkOrderType = {
    business_id: string;
    supplier_id: number;
    order_date: string;
    expected_delivery_date: string;
    total_value: number;
    items: Array<{
        variant_id: number;
        quantity: number;
        cost_price: number;
        note?: string;
    }>;
}

type BranchTypes = {
    business_id: number | string;
    branch_name: string;
    location: string;
    phone?: string;
    branch_manager?: string;
}

type BranchResponseData = BranchTypes & {created_at?: string; branch_manager?: string | null; id?: number};

type BranchesResponse = {
    branches: Array<BranchResponseData>
}

type VariantAdjustmentType = {
    variant_id: number;
    new_quantity: number;
    type: "adjustment" | "";
    reason: string;
    notes: string;
    business_id: number;
}

type StockOrderObject = {
    id: number;
    supplier_id: number;
    business_id?: number;
    expected_delivery_date: string;
    supply_order_date: string;
    supply_status: string;
    created_at: string;
    supplier_name: string;
}

type SupplyOrderItemTypes = {
    id: number;
    supply_order_id: number;
    variant_id: number;
    quantity: number;
    cost_price: string;
    sku: string;
}

type StockOrderTypes = {
    supply_orders: Array<StockOrderObject>;
    items: Array<SupplyOrderItemTypes>;
}

type StockAdjustmentTypes = {
    supply_order_id: number;
    supply_status: string;
}

type SingleProductAdjustment = {
    variant_id: number;
    new_quantity: number;
    reason: string;
    notes: string;
  }

type ProductVariantAdjustment = { 
  adjustments: Array<SingleProductAdjustment>
}

type StockMovementLogs = {
    id: number;
    variant_id: null;
    type: string;
    quantity: number;
    note: string;
    created_at: string;
    business_id: number;
    recorded_by: string;
    recorded_by_type: string;
    branch_id: number;
    related_transfer_id: number;
    reason: string;
    recorded_by_name: string;
}

type StockProductMovement = {
    logs: Array<StockMovementLogs>;
}

type EditProductTypes = {
    name: string;
    brand: string;
    description: string;
    base_sku?: string;
    image_url: string;
    taxable: boolean;
    threshold: number;
    category_id: string;
}

type ProductVariantStockMovement = {
    product_id: number;
    variants: Array<{
            variant_id: number;
            sku: string;
            flow: Array<{
                    period: string;
                    movement: number;
                    reason: string | null
                }>
        }>
}

type StockMovementTypes = {
    movements: Array<
        {
            period: string;
            total_increased: string;
            total_decreased: string;
            net_moved: string;
            movement_count: string;
            first_movement: string;
            last_movement: string;
            movements: Array<{created_at: string; reason: string; quantity: number; note: string;}>
        }
    >;
}

type StockMovementAnalytics = StockMovementTypes['movements'];

type LowStocks = {
    id: number;
    product_id: number;
    attributes: Array<{
            name: string;
            value: string;
            value_id: number;
            attribute_id: number
        }>;
    cost_price: string;
    selling_price: string;
    quantity: number;
    threshold: number;
    sku: string;
    image_url: Array<{public_id: string; secure_url: string}>;
    expiry_date?: string | null;
    created_at: string;
    updated_at: string;
    barcode: string;
    barcode_image_url?: string | null;
}

type CustomerTypes = {
    business_id: number;
    name: string;
    phone: string;
    email: string;
}

type CustomerResponse =  CustomerTypes & {
    id: number;
    created_at: string;
    password: string | null;
    is_verified: boolean;
    social_id: string | null;
    provider: string | null;
}

type StaffRoleTypes = {
    business_id: number;
    role_name: string;
    permissions: Array<string>;
    description: string;
    created_by?: string;
}

type StaffRoleCreationTypes = {
  staff_id: number;
  business_id: number;
  branch_id: number;
  full_name: string;
  contact_no: string;
  email: string;
  address: string;
  document?: string | File | null;
  position_name: string;
  assigned_position?: string;
  gender: 'Male' | 'Female' | 'Other';
  staff_status: 'Active' | 'Inactive' | 'Suspended' | string;
  date_of_birth: string;
  state_of_origin?: string;
  emergency_contact?: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | string;
  start_date: string;
  salary: number;
  bank_account_number: string;
  bank_name: string;
  national_id?: string | File | null;
  guarantor_name?: string;
  guarantor_contact?: string;
  guarantor_relationship?: string;
  guarantor_address?: string;
  photo?: string | File | null;
  payment_status?: 'Paid' | 'Pending' | 'Overdue' | string;
  last_payment_date?: string;
  staff_status_change_reason?: string;
}


type AuthMeResponseTypes = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile_image: Record<string, string>;
    is_verified: boolean;
    is_social_media: boolean;
    created_at: string;
    updated_at: string;
}

type StaffRoleObj = {
    role_id: string;
    business_id: number;
    role_name: string;
    permissions: string[];
    created_by: string;
    created_at: string;
}

type StaffRoleResponseTypes = {
    roles: Array<StaffRoleObj>
}

type SalesPayload = {
    business_id: number;
    branch_id: number;
    staff_id?: string;
    created_by_user_id?: number;
    customer_id: number;
    customer?: {
        name: string;
        phone: string;
        email: string;
    };
    order_type: "walk_in" | "online_order";
    items: Array<{
        variant_id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        taxes?: Array<string>;
        discounts?: Array<string>;
        coupons?: Array<string>;
    }>;
    total_amount: number;
    payment_mode: "cash" | "bank_transfer" | "pos";
    discount: number;
    coupon: string;
    taxes: number;
    note: string;
}

type DiscountPayloadType = {
    business_id: number;
    name: string;
    discount_type: string;
    percentage: number;
    amount: number;
    start_date: string;
    end_date: string;
    description: string;
}

type TaxPayloadType = {
    business_id: number;
    name: string;
    rate: number;
    type: "exclusive" | "inclusive";
    description: string;
}

type CouponPayloadType = {
    business_id: number;
    coupons_type?: string;
    code: string;
    description: string;
    discount_percentage: number;
    discount_amount: number;
    start_date: string;
    end_date: string;
    usage_limit: number;
}

type DiscountResponseObj = {
    id: number;
    business_id: number;
    name: string;
    percentage: string;
    amount: string;
    start_date: string;
    end_date: string;
    discount_type: string;
    description: string;
    created_at: string;
}

type DiscountReponse = {
    discounts: Array<DiscountResponseObj>;
}

type TaxesResponseObj = {
    id: number;
    business_id: number;
    name: string;
    rate: string;
    type: string;
    description: string;
    created_at: string;
}

type TaxesResponse = {
    taxes: Array<TaxesResponseObj>;
}

type CouponResponseObj = {
    id: number;
    business_id: number;
    code: string;
    description: string;
    discount_percentage: string;
    discount_amount: string;
    start_date: string;
    end_date: string;
    coupons_type: string;
    usage_limit: number;
    created_at: string;
}

type CouponResponse = {
    coupons: Array<CouponResponseObj>;
}

type UpdateTaxesType = {
    id: number;
    business_id: number;
    name: string;
    rate: string | number;
    type: "inclusive" | "exclusive";
    description?: string;
}

type UpdateDiscountsType = {
    id: number;
    business_id: number;
    name: string;
    percentage: number;
    amount: number;
    end_date: string;
    description?: string;
}

type UpdateCouponType = {
    id: number;
    business_id: number;
    code: string;
    description?: string;
    discount_percentage: number;
    discount_amount: number;
    end_date: string;
    usage_limit: number;
}

type SalesResponse = {
    id: number;
    business_id: number;
    branch_id: number;
    customer_id: number;
    total_amount: string;
    status: string;
    created_at: string;
    shipping_address: string;
    payment_method: string;
    source: string;
    order_type: string;
    staff_id: number;
    created_by_user_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    branch_name: string;
    recorded_by_name: string;
}

type SalesItemsResponse = {
    id: number;
    order_id: number;
    variant_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    variant_name: string;
    attributes: [
        {
            name: string;
            value: string;
            value_id: number;
            attribute_id: number;
        }
    ],
    selling_price: number;
}

type CreatedSalesResponse = {
    sale: SalesResponse,
    items: Array<SalesItemsResponse>
}

type UpdatedSalesPayload = {
    business_id: number;
    branch_id: number;
    staff_id?: number;
    created_by_user_id?: number;
    customer_id?: number;
    customer?: {
      name: string;
      phone: string;
      email: string;
    };
    items: Array<
      {
        variant_id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        taxes?: Array<{ id: number; amount: number }>;
        discounts?: Array<{ id: number; amount: number }>;
        coupons?: Array<{ id: number; amount: number }>;
      }>;
    discount?: number;
    coupon?: number;        
    taxes?: number;
    note?: string;
    order_type: string;
    payments: Array<{
        method: string;
        amount: number;
        reference: string;
      }>
}

type FallbackSalesResponse = {
    sale: {
        id: number;
        business_id: number;
        branch_id: number;
        customer_id: number;
        total_amount: string;
        status: string;
        created_at: string;
        shipping_address: string;
        payment_method: string;
        source: string;
        order_type: string;
        staff_id: number;
        created_by_user_id: number;
        subtotal: string;
        tax_total: string;
        discount_total: string;
        coupon_total: string;
        note: string;
        customer_name: string;
        customer_phone: string;
        customer_email: string;
        branch_name: string;
        recorded_by_name: string
    },
    items: Array<
        {
            id: number;
            order_id: number;
            variant_id: number;
            quantity: number;
            unit_price: string;
            total_price: string;
            variant_name: string;
            attributes: Array<
                {
                    name: string,
                    value: string,
                    value_id: number,
                    attribute_id: number
                }
            >;
            selling_price: string
        }
    >;
    payments: Array<
        {
            id: number;
            order_id: number;
            method: string;
            amount: string;
            reference: string;
            paid_at: string;
        }
    >;
}

type FastMovingPayload = {
    variant_id: number;
    total_sold: string;
    cost_price: string;
    selling_price: string;
    quantity: number;
    threshold: number;
    sku: string;
    image_url: Array<{
        public_id: string;
        secure_url: string;
    }>
}

type FastMovingResponse = Array<FastMovingPayload>;

type OrderResponseLogic = {
    order: {
        id: number;
        business_id: number;
        branch_id: number;
        customer_id: number;
        total_amount: string;
        status: string;
        created_at: string;
        shipping_address: string;
        payment_method: string;
        source: string;
        order_type: string;
        staff_id: number;
        created_by_user_id: number;
        subtotal: string;
        tax_total: string;
        discount_total: string;
        coupon_total: string;
        note: string;
    };
    items: Array<{
            id: number;
            order_id: number;
            variant_id: number;
            quantity: number;
            unit_price: string;
            total_price: string;
        }>;
}

type StockSupplyOrderLogic = {
    supply_order: {
        id: number;
        supplier_id: number;
        business_id: number;
        expected_delivery_date: string;
        supply_order_date: string;
        supply_status: "awaiting_payment" | "delivered" | "paid" | "cancelled";
        created_at: string;
        supplier_name: string;
    };
    items: Array<{
            id: number;
            supply_order_id: number;
            variant_id: number;
            quantity: number;
            cost_price: string;
            sku: string;
        }>
}

type FinanceOverviewResponse = {
    salesByCategory: Array<
        {
            category: string;
            total_sales: string;
        }>;
    expenseByCategory: Array<Record<string, string | number>>;
    budgetByCategory: Array<Record<string, string | number>>;
    grossIncome: number;
    cogs: number;
    totalExpense: number;
    netIncome: number;
    topProducts: Array<{name: string; units_sold: string; total_sales: string}>;
    discounts: number;
    taxes: number;
    totalStaffSalaryPaid: number;
    productsCount: number;
    variantsCount: number;
    variantsInStock: number;
    staffCount: number;
    customersCount: number;
    servicesCount: number;
    staffWithShiftToday: number;
    stockMovement: {movememt_count: number; total_qty: number;};
    topStockMovement: {
        variant_id: number;
        total_moved: string;
    };
    serviceTracking: Array<Record<string, string | number>>;
}

type ProductWithTaxLogic = {
    product_id: number;
    product_name: string;
    tax_id: number;
    tax_name: string;
    rate: string;
    type: string;
}

type ProductWithCouponLogic = {
    product_id: number;
    product_name: string;
    coupon_id: number;
    coupon_code: string;
    description: string;
    discount_percentage: string;
    discount_amount: string;
    start_date: string;
    end_date: string;
}

type ProductWithDiscountLogic = {
    product_id: number;
    product_name: string;
    discount_id: number;
    discount_name: string;
    percentage: string;
    amount: string;
    start_date: string;
    end_date: string;
    description: string;
}

type SalesResponseLogic = {
    id: number;
    business_id: number;
    branch_id: number;
    customer_id: number;
    total_amount: string;
    status: string;
    created_at: string;
    shipping_address: string;
    payment_method: string;
    source: string;
    order_type: string;
    staff_id: number;
    subtotal: string;
    tax_total: string;
    discount_total: string;
    coupon_total: string;
    note: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    branch_name: string;
    recorded_by_name: string;
    payments: Array<{ id: number; method: string; amount: string; reference: string; paid_at: string; }>;
}

type SalesItemsLogic = {
    id: number;
    order_id: number;
    variant_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    variant_name: string;
    attributes: Array<{ name: string; value: string; value_id: number; attribute_id: number; }>;
    stock_quantity: number;
    selling_price: string;
};

type SalesReportLogic = {
    period: string;
    summary: {
        total_orders: number;
        subtotal: string;
        total_tax: string;
        total_discount: string;
        total_sales: string;
        total_cogs: number;
        gross_profit: number;
    };
    order_details: Array<
        {
            id: number;
            business_id: number;
            branch_id: number;
            customer_id: number;
            total_amount: string;
            status: string;
            created_at: string;
            shipping_address: string;
            payment_method: string;
            source: string;
            order_type: string;
            staff_id: number;
            created_by_user_id: number;
            subtotal: string;
            tax_total: string;
            discount_total: string;
            coupon_total: string;
            note: string;
            items: Array<
                {
                    id: number;
                    order_id: number;
                    variant_id: number;
                    quantity: number;
                    unit_price: string;
                    total_price: string;
                    variant_sku: string;
                    attributes: Array<
                        {
                            name: string;
                            value: string;
                            value_id: number;
                            attribute_id: number;
                        }
                    >;
                    variant_selling_price: string;
                }>;
        }>;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    payment_methods: Array<
        {
            method: string;
            orders_count: number;
            total_amount: string;
        }>;
    product_breakdown: Array<
        {
            variant_id: number;
            variant_sku: string;
            total_qty: number;
            total_sales: string;
        }>;
}

type StaffResponseLogic = {
    staff_id: string;
    business_id: number;
    branch_id: number;
    full_name: string;
    contact_no: string;
    email: string;
    address: string;
    document: Array<{type: string; url: string; public_id: string;}>;
    position_name: string;
    assigned_position: string;
    gender: string;
    staff_status: string;
    created_at: string;
    updated_at: string;
    date_of_birth: string;
    state_of_origin: string;
    emergency_contact: string;
    employment_type: string;
    start_date: string;
    salary: string;
    bank_account_number: string;
    bank_name: string;
    national_id: string;
    guarantor_name: string;
    guarantor_contact: string;
    guarantor_relationship: string;
    guarantor_address: string;
    photo: string;
    payment_status: "paid" | "unpaid" | "pending" | string;
    last_payment_date: string;
    staff_status_change_reason: string;
    password_changed_at: string;
}

type StaffDays = "monday"
                | "tuesday"
                | "wednesday"
                | "thursday"
                | "friday"
                | "saturday"
                | "sunday";

type StaffShiftResponse = {
    shift_id: string;
    staff_id: string;
    business_id: number;
    fullname: string;
    created_at: string;
    working_hours: Partial<Record<StaffDays, {start: string; end: string}>>;
    work_days: Array<string>;
};

type StaffBusinessSettings = Record<"settings", {
        id: number;
        business_id: number;
        branch_id: number;
        password_delivery_method: string;
        password_change_policy: string;
        require_otp_for_login: false,
        otp_delivery_method: string;
        session_timeout_minutes: number;
        max_login_attempts: number;
        lockout_duration_minutes: number;
        created_at: string;
        updated_at: string;
    }>;

type StaffLogsResponse = {
    id: number;
    staff_id: string;
    business_id: number;
    login_time: string;
    logout_time: string;
    ip_address: string;
    user_agent: string;
    success: boolean;
    failure_reason: string;
    session_id: string;
    country: string;
    city: string;
    full_name: string;
    email: string;
    position_name: string;
    assigned_position: string;
}

export {
    type CreateProductTypes,
    type CategoriesType,
    type UpdateCategoryType,
    type UpdateAttributeType,
    type AttributesType,
    type AttributeBulk, 
    type CategoriesResponseType, 
    type CategoryPayload, 
    type ProductsTypes, 
    type SingleProductType, 
    type SupplierFormData, 
    type ProductOrderType, 
    type BulkOrderType, 
    type BranchTypes, 
    type BranchesResponse, 
    type BranchResponseData, 
    type ProductOrderTypeTwo,
    type ProductResponseObj,
    type ProductVariantResponse,
    type ProductVariantResponseObject,
    type SupplierDataResponse,
    type VariantAdjustmentType,
    type StockOrderTypes,
    type StockMovementAnalytics,
    type StockOrderObject,
    type SupplyOrderItemTypes,
    type StockAdjustmentTypes,
    type ProductVariantAdjustment,
    type StockMovementLogs,
    type StockProductMovement,
    type SingleProductAdjustment,
    type EditProductTypes,
    type ProductVariantStockMovement,
    type StockMovementTypes,
    type NewVariantObject,
    type NewVariantTypes,
    type LowStocks,
    type CustomerTypes,
    type CustomerResponse,
    type StaffRoleTypes,
    type AuthMeResponseTypes,
    type StaffRoleCreationTypes,
    type StaffRoleObj,
    type StaffRoleResponseTypes,
    type SalesPayload,
    type DiscountPayloadType,
    type TaxPayloadType,
    type CouponPayloadType,
    type DiscountResponseObj,
    type DiscountReponse,
    type CouponResponseObj,
    type CouponResponse,
    type TaxesResponseObj,
    type TaxesResponse,
    type UpdateTaxesType,
    type UpdateDiscountsType,
    type UpdateCouponType,
    type SalesItemsResponse,
    type SalesResponse,
    type SalesResponseLogic,
    type SalesItemsLogic,
    type CreatedSalesResponse,
    type UpdatedSalesPayload,
    type FallbackSalesResponse,
    type FastMovingPayload,
    type FastMovingResponse,
    type OrderResponseLogic,
    type StockSupplyOrderLogic,
    type FinanceOverviewResponse,
    type ProductWithDiscountLogic,
    type ProductWithCouponLogic,
    type ProductWithTaxLogic,
    type SalesReportLogic,
    type StaffResponseLogic,
    type StaffShiftResponse,
    type StaffBusinessSettings,
    type StaffLogsResponse
};