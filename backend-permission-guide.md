# Backend Permission Implementation Guide

This guide provides a comprehensive permission system derived directly from your application's logic, API endpoints, and business workflows (Approvals, Management, viewing analytics, etc.).

## 1. The Master Permission Object

Use this object in your backend. It is structured by resource for readability but uses unique string keys for the database/tokens.

```javascript
// constants/permissions.js

const PERMISSIONS = {
  // =================================================================
  // AUTHENTICATION & USER
  // =================================================================
  AUTH: {
    UPDATE_PROFILE: 'auth:update_profile',
    VIEW_OWN_LOGS: 'auth:view_own_logs',
  },

  // =================================================================
  // PRODUCT MANAGEMENT
  // =================================================================
  PRODUCT: {
    CREATE: 'product:create',
    VIEW_LIST: 'product:view_list',
    VIEW_DETAILS: 'product:view_details',
    UPDATE: 'product:update',       // Full update logic
    DELETE: 'product:delete',
    
    // Variants
    MANAGE_VARIANTS: 'product:manage_variants', // Add/Edit/Delete variants
    ADJUST_VARIANT_STOCK: 'product:adjust_variant_stock', // Single adjustment
    
    // Categories
    CREATE_CATEGORY: 'category:create',
    VIEW_CATEGORY: 'category:view',
    UPDATE_CATEGORY: 'category:update',
    DELETE_CATEGORY: 'category:delete',

    // Attributes/Units
    CREATE_ATTRIBUTE: 'attribute:create',
    VIEW_ATTRIBUTE: 'attribute:view',
    UPDATE_ATTRIBUTE: 'attribute:update',
    DELETE_ATTRIBUTE: 'attribute:delete',
  },

  // =================================================================
  // INVENTORY & STOCK
  // =================================================================
  INVENTORY: {
    // Suppliers
    CREATE_SUPPLIER: 'supplier:create',
    VIEW_SUPPLIERS: 'supplier:view',
    UPDATE_SUPPLIER: 'supplier:update',
    DELETE_SUPPLIER: 'supplier:delete',

    // Supply Orders
    CREATE_SUPPLY_ORDER: 'stock:create_supply_order',
    VIEW_SUPPLY_ORDERS: 'stock:view_supply_orders', // View list and details
    UPDATE_SUPPLY_ORDER: 'stock:update_supply_order', // Edit order details
    UPDATE_SUPPLY_STATUS: 'stock:update_supply_status', // Mark as received/pending etc.

    // Analytics/Alerts
    VIEW_STOCK_MOVEMENT: 'stock:view_movement',
    VIEW_LOW_STOCK_ALERTS: 'stock:view_alerts', // Low stock, Out of stock, Fast moving
  },

  // =================================================================
  // SALES & ORDERS
  // =================================================================
  SALES: {
    CREATE_ORDER: 'sales:create_order', // Checkout/POS
    VIEW_SALES_HISTORY: 'sales:view_history', // List of past sales
    VIEW_SALE_DETAILS: 'sales:view_details',
    UPDATE_ORDER_STATUS: 'sales:update_status', // If you allow post-sale edits
    REFUND_SALE: 'sales:refund', // Derived logic from general sales systems
    VIEW_SALES_ANALYTICS: 'sales:view_analytics', // Dashboard/Charts
  },

  // =================================================================
  // FINANCE & ACCOUNTING
  // =================================================================
  FINANCE: {
    // Expenses
    CREATE_EXPENSE_CATEGORY: 'finance:create_expense_category',
    UPDATE_EXPENSE_CATEGORY: 'finance:update_expense_category',
    CREATE_EXPENSE: 'finance:create_expense',
    VIEW_EXPENSES: 'finance:view_expenses',
    UPDATE_EXPENSE: 'finance:update_expense',
    DELETE_EXPENSE: 'finance:delete_expense',
    
    // Expense Approvals (Critical Logic Found)
    APPROVE_EXPENSE: 'finance:approve_expense', // Update status to Approved
    REJECT_EXPENSE: 'finance:reject_expense',   // Update status to Rejected
    SET_PAYMENT_STATUS: 'finance:set_payment_status', // Paid/Unpaid

    // Budgets
    CREATE_BUDGET: 'finance:create_budget',
    VIEW_BUDGETS: 'finance:view_budgets',
    UPDATE_BUDGET: 'finance:update_budget',
    DELETE_BUDGET: 'finance:delete_budget',
    TRANSFER_BUDGET: 'finance:transfer_budget', // Transfer funds between budgets
    
    // Budget Approvals
    APPROVE_BUDGET: 'finance:approve_budget',
    REJECT_BUDGET: 'finance:reject_budget',

    // Staff Salaries
    MANAGE_SALARIES: 'finance:manage_salaries', // Create salary expenses

    // Taxes, Discounts, Coupons
    MANAGE_TAXES: 'finance:manage_taxes', // Create/Edit/Delete Taxes
    MANAGE_DISCOUNTS: 'finance:manage_discounts',
    MANAGE_COUPONS: 'finance:manage_coupons',

    // Overview
    VIEW_FINANCE_OVERVIEW: 'finance:view_overview',
  },

  // =================================================================
  // STAFF MANAGEMENT
  // =================================================================
  STAFF: {
    CREATE_STAFF: 'staff:create',
    VIEW_STAFF_LIST: 'staff:view_list',
    VIEW_STAFF_DETAILS: 'staff:view_details', // Includes subcharges, shifts, etc.
    UPDATE_STAFF: 'staff:update', // Update creds, profile
    DELETE_STAFF: 'staff:delete',
    
    // Roles
    CREATE_ROLE: 'staff:create_role',
    VIEW_ROLES: 'staff:view_roles',
    MANAGE_ROLES: 'staff:manage_roles', // Assign roles

    // Specific Actions
    MANAGE_DOCUMENTS: 'staff:manage_documents', // Upload/Delete Docs
    MANAGE_SHIFTS: 'staff:manage_shifts', // Create/Delete Shifts
    MANAGE_SUBCHARGES: 'staff:manage_subcharges',
    
    // Password Control
    CHANGE_STAFF_PASSWORD: 'staff:change_password', // Admin changing another's password
    APPROVE_PASSWORD_CHANGE: 'staff:approve_password_change',
    REJECT_PASSWORD_CHANGE: 'staff:reject_password_change',
  },

  // =================================================================
  // BUSINESS & BRANCHES
  // =================================================================
  BUSINESS: {
    CREATE_BRANCH: 'business:create_branch',
    VIEW_BRANCHES: 'business:view_branches',
    UPDATE_BRANCH: 'business:update_branch',
    VIEW_BUSINESS_DETAILS: 'business:view_profile',
    MANAGE_SETTINGS: 'business:manage_settings', // /api/staff/business_settings
  },

  // =================================================================
  // CUSTOMERS
  // =================================================================
  CUSTOMER: {
    VIEW_LIST: 'customer:view_list',
    VIEW_DETAILS: 'customer:view_details', // History, etc.
    DELETE_CUSTOMER: 'customer:delete',
  }
};

const FLATTENED_PERMISSIONS = Object.values(PERMISSIONS).reduce((acc, group) => {
    return { ...acc, ...group };
}, {});

module.exports = { PERMISSIONS, FLATTENED_PERMISSIONS };
```

## 2. Explanation of Logic & Categories

### Why "Resource:Action"?
Using a naming convention like `product:create` instead of just `CREATE_PRODUCT` helps in scalability. If you add a new service later, you just start a new namespace.

### Critical Workflows Identified
1.  **Approvals**: Your finance logic (`updateBudgetStatus`, `updateExpenseStatus`) explicitly asks for rejection reasons and roles. This means `APPROVE` and `REJECT` are distinct high-level permissions.
2.  **Transfers**: Budget Transfer (`TRANSFER_BUDGET`) is a sensitive action separate from just "updating" a budget.
3.  **Password Control**: The `APPROVE_PASSWORD_CHANGE` logic suggests a security workflow where a manager must approve staff password resets.
4.  **Stock Adjustments vs. Supply Orders**: Adjusting a variant manually (`ADJUST_VARIANT_STOCK`) is different from ordering from a supplier (`CREATE_SUPPLY_ORDER`).

## 3. Implementation in Express (Middleware)

```javascript
// middleware/requirePermission.js
const { FLATTENED_PERMISSIONS } = require('../constants/permissions');

const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user; // Assumed set by previous auth middleware

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Role Bypass (Optional but recommended)
    if (user.role === 'owner' || user.role === 'super_admin') {
      return next();
    }

    // Check strict permission
    // Assuming staff permissions are stored as an array of strings in the DB
    if (!user.permissions || !user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: 'Access Denied: Insufficient Permissions',
        required: permission 
      });
    }

    next();
  };
};

module.exports = requirePermission;
```

## 4. Usage in Route Files

```javascript
// routes/financeRoutes.js
const router = require('express').Router();
const controller = require('../controllers/finance');
const { PERMISSIONS } = require('../constants/permissions');
const requirePermission = require('../middleware/requirePermission');

// Approve Budget - Sensitive Action
router.patch(
  '/budgets/manage/:id',
  requirePermission(PERMISSIONS.FINANCE.APPROVE_BUDGET),
  controller.updateBudgetStatus
);

// Create Expense
router.post(
  '/expenses',
  requirePermission(PERMISSIONS.FINANCE.CREATE_EXPENSE),
  controller.createExpense
);

module.exports = router;
```

## 5. Frontend Integration: Sidebar (React/Next.js)

To make your sidebar links dynamic based on permissions, follow these steps in your frontend code (specifically `src/store/data/side-menu.ts` and `src/components/dashboard/sidebar.tsx`).

### Step A: Update Menu Structure
Add a `requiredPermission` field to your menu data.

```typescript
// src/store/data/side-menu.ts
// ... imports

// Helper to access permission constants (ensure these match backend!)
const PERMISSIONS = {
    VIEW_INVENTORY: 'product:view_list',
    VIEW_SALES: 'sales:view_history',
    VIEW_CUSTOMERS: 'customer:view_list',
    VIEW_FINANCE: 'finance:view_overview',
    VIEW_STAFF: 'staff:view_list',
    VIEW_REPORTS: 'business:view_profile', // or specific report permission
    VIEW_SETTINGS: 'business:manage_settings',
};

const sideMenuData = useMemo<Array<MenuTypes>>(() => {
    return [
       // ... Dashboard (usually public or basic auth)
        {
            id: 2,
            _name: "Inventory",
            _path: "/inventory",
             // Add this field to your Type definition if strict
            requiredPermissions: [PERMISSIONS.VIEW_INVENTORY], 
            // ... icons
        },
        {
            id: 3,
            _name: "Sales & Orders",
            _path: "/sales",
            requiredPermissions: [PERMISSIONS.VIEW_SALES],
            // ... icons
        },
        // ... map others
    ]
}, [isDarkMode]);
```

### Step B: Filter in Sidebar Component

In `src/components/dashboard/sidebar.tsx`, user the user's permissions to filter the list.

```typescript
// src/components/dashboard/sidebar.tsx

// ... existing imports
import { useUserPermissions } from "@/hooks/useUserPermissions"; // You need to create this hook to get permissions from Cookie/Context

const DashboardSidebar = () => {
    // ... existing hooks
    const { userPermissions, userRole } = useUserPermissions(); // Custom hook to get ['product:view', ...]

    // Filter Logic
    const filteredMenu = useMemo(() => {
        if (userRole === 'owner' || userRole === 'super_admin') return sideMenus;

        return sideMenus.filter(menu => {
            if (!menu.requiredPermissions) return true; // Show if no specific permission needed
            
            // Check if user has AT LEAST ONE of the required permissions (or ALL, depending on need)
            return menu.requiredPermissions.some(permission => 
                userPermissions.includes(permission)
            );
        });
    }, [sideMenus, userPermissions, userRole]);

    // Use filteredMenu in your render loop instead of sideMenus
    // ...
    {filteredMenu?.map(({ ... }) => ( ... ))}
```

### Step C: Create the Permission Hook (Example)

```typescript
// src/hooks/useUserPermissions.ts
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // You might need to install this

export const useUserPermissions = () => {
    const token = Cookies.get("authToken");
    
    if (!token) return { userPermissions: [], userRole: '' };

    try {
        const decoded: any = jwtDecode(token);
        return {
            userPermissions: decoded.permissions || [], // Ensure backend sends this in JWT
            userRole: decoded.role || ''
        };
    } catch (e) {
        return { userPermissions: [], userRole: '' };
    }
};
```
