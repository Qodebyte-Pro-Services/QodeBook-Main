import { 
    STAFF_PERMISSIONS, 
    SALES_PERMISSIONS, 
    PRODUCT_PERMISSIONS, 
    STOCK_PERMISSIONS, 
    FINANCIAL_PERMISSIONS, 
    REPORTS_ANALYTICS_PERMISSIONS,
    CUSTOMER_PERMISSIONS
} from "./staff-role-constants";

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    "/staff": [STAFF_PERMISSIONS.VIEW_STAFF],
    "/staff/roles": [STAFF_PERMISSIONS.VIEW_ROLES],
    "/sales": [SALES_PERMISSIONS.VIEW_SALES],
    "/sales/orders": [SALES_PERMISSIONS.VIEW_ORDERS],
    "/inventory": [PRODUCT_PERMISSIONS.VIEW_PRODUCTS],
    "/product-view": [PRODUCT_PERMISSIONS.VIEW_PRODUCT],
    "/finances": [FINANCIAL_PERMISSIONS.VIEW_EXPENSES, FINANCIAL_PERMISSIONS.VIEW_TAXES],
    "/reports": [REPORTS_ANALYTICS_PERMISSIONS.VIEW_ANALYTICS],
    "/customer": [CUSTOMER_PERMISSIONS.VIEW_CUSTOMER],
    "/account-settings": [], // Publicly accessible to all logged-in staff?
    "/pos": [SALES_PERMISSIONS.CREATE_SALE], // POS requires order creation permission
};

// Helper function to get required permissions for a pathname
export const getRequiredPermissions = (pathname: string): string[] => {
    // Check for exact matches first
    if (ROUTE_PERMISSIONS[pathname]) {
        return ROUTE_PERMISSIONS[pathname];
    }

    // Check for parent route matches (e.g., /staff/123 should match /staff)
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
        const baseRoute = `/${segments[0]}`;
        if (ROUTE_PERMISSIONS[baseRoute]) {
            return ROUTE_PERMISSIONS[baseRoute];
        }
    }

    return [];
};
