import localforage from 'localforage';

export const cartStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'cart_data',
    description: 'Shopping cart and order data'
});

export const productStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'product_cache',
    description: 'Cached product and variant data',
});

export const orderStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'offline_orders',
    description: 'Orders created while offline'
});

export const userStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'user_data',
    description: 'User preferences and settings'
});

export const discountStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'discount_data',
    description: 'Cached discount data with product associations'
});

export const taxStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'tax_data',
    description: 'Cached tax data with product associations'
});

export const couponStorage = localforage.createInstance({
    name: 'QodeBookSass',
    storeName: 'coupon_data',
    description: 'Cached coupon data with product associations'
});

export const salesReportStorage = localforage.createInstance({
    name: "QodeBookSass",
    storeName: "sales_reports",
    description: "Cached Sales Report with product associations"
});

export const offlineCustomers = localforage.createInstance({
    name: "QodeBookSass",
    storeName: "customers",
    description: "Cached customer data with product associations"
});

export const initializeStorage = async () => {
    try {
        await Promise.all([
            cartStorage.ready(),
            productStorage.ready(),
            orderStorage.ready(),
            userStorage.ready(),
            discountStorage.ready(),
            taxStorage.ready(),
            couponStorage.ready(),
            salesReportStorage?.ready(),
            offlineCustomers?.ready()
        ]);
        return true;
    } catch (error) {
        console.error('Failed to initialize LocalForge:', error);
        return false;
    }
}


export const isOnline = () => {
    return typeof navigator !== 'undefined' && navigator.onLine;
};

export const STORAGE_KEYS = {
    CART: 'selected_variants',
    CUSTOMER: 'selected_customer',
    STORE_TYPE: 'store_type',
    PRODUCTS: 'cached_products',
    VARIANTS: 'cached_variants',
    OFFLINE_ORDERS: 'pending_orders',
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync_timestamp',
    DISCOUNTS: 'cached_discounts',
    TAXES: 'cached_taxes',
    COUPONS: 'cached_coupons',
    CART_DRAFTS: 'cart_drafts',
    SALE_REPORTS: 'sale_reports',
    OFFLINE_CUSTOMERS: 'offline_customers'
} as const;
