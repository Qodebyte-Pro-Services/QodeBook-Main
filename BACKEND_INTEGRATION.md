# Backend Integration Guide - Installment & Credit Payments

## Overview
This guide explains how the frontend sends installment and credit payment data to the backend, and what the backend needs to do to process these new order types.

## Frontend Data Structure

### Order Submission Payload

All orders are sent to `/api/sales/create` endpoint with the following structure:

```typescript
interface OrderSubmission {
  business_id: number;
  branch_id: number;
  staff_id?: string;
  created_by_user_id?: number;
  customer_id: number;  // Required: customer ID (>0 for registered, 0 for walk-in)
  
  items: Array<{
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
  
  // NEW FIELDS - present only for specific sale types
  sale_type?: 'regular' | 'installment' | 'credit';
  installment_plan?: InstallmentPlan;
  credit_details?: CreditDetails;
  
  payments: Array<{
    method: string;
    amount: number;
    reference: string;
  }>;
}

interface InstallmentPlan {
  number_of_payments: number;        // 2, 3, 4, 6, or 12
  payment_frequency: 'daily' | 'weekly' | 'monthly';
  down_payment: number;               // Can be 0
  remaining_balance: number;          // Total - Down Payment
  start_date: string;                // ISO date string (YYYY-MM-DD)
  notes?: string;                    // Optional notes
}

interface CreditDetails {
  credit_type: 'full_credit' | 'partial_credit' | 'installment_credit';
  amount_paid: number;               // Amount customer pays immediately
  balance: number;                   // Amount on credit (Total - Amount Paid)
  payment_schedule: 'immediate' | 'weekly' | 'monthly' | 'custom';
}
```

## Processing Rules

### Rule 1: Validate sale_type
```javascript
if (sale_type === 'installment') {
  // Require installment_plan to be present
  if (!installment_plan) {
    return 400: "Installment plan required for installment sales"
  }
  // Validate installment details
  validateInstallmentPlan(installment_plan, total_amount);
}

if (sale_type === 'credit') {
  // Require credit_details to be present
  if (!credit_details) {
    return 400: "Credit details required for credit sales"
  }
  // Validate credit details
  validateCreditDetails(credit_details, total_amount);
}
```

### Rule 2: Payment Validation

**For Installment Sales:**
- `payments[0].amount` must equal `installment_plan.down_payment`
- If down_payment = 0, then `payments[0].amount` = 0
- Payment reference format: `installment-YYYY-{random}`

```javascript
// Example: 50,000 order with 4-month plan and 5,000 down
if (sale_type === 'installment') {
  const downPayment = installment_plan.down_payment; // 5000
  const paymentAmount = payments[0].amount;          // Should be 5000
  
  if (paymentAmount !== downPayment) {
    return 400: "Payment amount must equal down payment for installments"
  }
}
```

**For Credit Sales:**
- `payments[0].amount` must equal `credit_details.amount_paid`
- Amount paid must be < total_amount (unless full_credit, then = 0)
- Payment reference format: `credit-YYYY-{random}`

```javascript
// Example: 50,000 order with 15,000 partial credit
if (sale_type === 'credit') {
  const amountPaid = credit_details.amount_paid;    // 15000
  const paymentAmount = payments[0].amount;         // Should be 15000
  
  if (paymentAmount !== amountPaid) {
    return 400: "Payment amount must equal amount paid for credit sales"
  }
}
```

## Database Operations

### 1. Create Order (Same as Regular)
```sql
INSERT INTO orders (
  business_id, branch_id, customer_id, subtotal, tax_total,
  discount_total, coupon_total, total_amount, status, order_type,
  staff_id, created_by_user_id, note
) VALUES (...)

-- Order Status Logic:
-- regular or multiple payment: status = 'completed'
-- installment: status = 'pending' (awaiting first installment)
-- credit: status = 'completed' (goods delivered, tracking payment separately)
```

### 2. Create Payment Record (Same for All)
```sql
INSERT INTO order_payments (order_id, method, amount, reference)
VALUES (order_id, 'installment'|'credit', amount, reference)
```

### 3. Create Installment Plan (Only for sale_type='installment')
```sql
INSERT INTO installment_plans (
  order_id, business_id, customer_id, 
  total_amount, down_payment, remaining_balance,
  number_of_payments, payment_frequency,
  start_date, notes
) VALUES (...)
RETURNING id as plan_id;
```

### 4. Create Installment Payments (Only for sale_type='installment')
Generate payment schedule and insert records:

```sql
-- For each payment in the schedule:
INSERT INTO installment_payments (
  installment_plan_id, payment_number, amount,
  due_date, status, method, type
) VALUES (
  plan_id,
  0,                    -- Down payment
  down_payment_amount,
  CURRENT_DATE,        -- Due today
  'paid',              -- Already paid
  'installment',
  'down_payment'
);

-- Then for remaining payments:
INSERT INTO installment_payments (
  installment_plan_id, payment_number, amount,
  due_date, status, method, type
) VALUES (
  plan_id,
  1,                    -- First installment
  installment_amount,
  calculate_due_date(1, frequency),  -- Calculate based on frequency
  'pending',
  NULL,                 -- Method filled when paid
  'installment'
);
-- ... repeat for each remaining payment
```

### 5. Create Credit Account (Only for sale_type='credit')
```sql
INSERT INTO credit_accounts (
  order_id, business_id, customer_id,
  total_amount, amount_paid, balance,
  credit_type, payment_schedule, issued_at
) VALUES (...)
RETURNING id as credit_account_id;
```

## Data Transformation Example

### Frontend Sends:
```json
{
  "business_id": 1,
  "branch_id": 2,
  "customer_id": 15,
  "items": [{ "variant_id": 45, "quantity": 2, "unit_price": 25000, "total_price": 50000 }],
  "total_amount": 50000,
  "sale_type": "installment",
  "installment_plan": {
    "number_of_payments": 4,
    "payment_frequency": "monthly",
    "down_payment": 5000,
    "remaining_balance": 45000,
    "start_date": "2026-05-15",
    "notes": "Special customer, extended terms"
  },
  "payments": [{
    "method": "installment",
    "amount": 5000,
    "reference": "installment-2026-A1B2C3"
  }]
}
```

### Backend Processing:
1. ✓ Validate order data (existing logic)
2. ✓ Create order → returns order_id = 1001
3. ✓ Create order_payments entry
4. ✓ **NEW**: Create installment_plans entry → returns plan_id = 501
5. ✓ **NEW**: Create 4 installment_payment entries:
   - Payment #0: 5,000 due 2026-05-15 (paid) - down payment
   - Payment #1: 11,250 due 2026-06-15 (pending)
   - Payment #2: 11,250 due 2026-07-15 (pending)
   - Payment #3: 11,250 due 2026-08-15 (pending)
6. ✓ Create order_items entries
7. ✓ Reduce inventory (only if not installment, OR after down payment verification)

## Inventory Management

### For Regular Orders
- Inventory reduced immediately when order created

### For Installment Orders
- **Option 1**: Reduce inventory when full down payment confirmed
- **Option 2**: Reduce inventory when entire balance paid
- **Recommended**: Option 1 (down payment confirms commitment)

```javascript
if (sale_type === 'installment') {
  // Verify down payment received
  if (installment_plan.down_payment > 0) {
    // Reduce inventory
    updateInventory();
  } else {
    // 0 down payment - decide policy:
    // - Conservative: wait for first installment payment
    // - Aggressive: reduce immediately upon order creation
  }
}
```

### For Credit Orders
- Inventory reduced immediately (customer has taken goods)
- Payment tracked separately

## Response Format

### Success Response (same for all types):
```json
{
  "success": true,
  "message": "Order created successfully",
  "sale": {
    "id": 1001,
    "business_id": 1,
    "customer_id": 15,
    "total_amount": 50000,
    "status": "pending",  // or "completed" based on sale_type
    "sale_type": "installment",
    "created_at": "2026-05-14T10:30:00Z"
  },
  "items": [...],
  "payments": [...],
  "installment_plan": {...},  // Only if sale_type='installment'
  "credit_details": {...}     // Only if sale_type='credit'
}
```

### Error Response Examples:

**Invalid Installment:**
```json
{
  "success": false,
  "message": "Payment total must equal down payment for installments",
  "errors": {
    "installment_plan": "Down payment amount mismatch"
  }
}
```

**Invalid Credit:**
```json
{
  "success": false,
  "message": "For credit sales, initial payment must equal amount paid",
  "errors": {
    "credit_details": "Payment amount mismatch"
  }
}
```

## Reporting Queries

### Get All Pending Installments
```sql
SELECT 
  ip.id, ip.installment_plan_id, ip.payment_number,
  ip.amount, ip.due_date, ip.status,
  c.name as customer_name, o.id as order_id
FROM installment_payments ip
JOIN installment_plans plan ON ip.installment_plan_id = plan.id
JOIN orders o ON plan.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE ip.status = 'pending'
  AND ip.due_date <= CURRENT_DATE
ORDER BY ip.due_date DESC;
```

### Get Credit Account Status
```sql
SELECT 
  ca.id, ca.credit_type, ca.amount_paid, ca.balance,
  ca.payment_schedule, ca.issued_at,
  c.name as customer_name, o.id as order_id
FROM credit_accounts ca
JOIN orders o ON ca.order_id = o.id
JOIN customers c ON o.customer_id = c.id
WHERE ca.balance > 0  -- Outstanding credit
ORDER BY ca.issued_at DESC;
```

## Webhook/Event Triggers

Consider these events:

1. **installment.payment_due** - When payment due date approaches
2. **installment.payment_overdue** - When payment becomes overdue
3. **credit.issued** - When credit account created
4. **credit.payment_received** - When payment received on credit account
5. **order.completed** - When all payments received

## Testing Checklist

- [ ] Installment order creates `installment_plans` record
- [ ] Installment payments created with correct due dates
- [ ] Credit order creates `credit_accounts` record
- [ ] Down payment validation works
- [ ] Credit balance validation works
- [ ] Inventory reduced correctly based on payment type
- [ ] Order status set appropriately
- [ ] Payment references generated correctly
- [ ] Response includes installment_plan/credit_details when applicable
- [ ] Errors handled and reported correctly

## Migration Notes

If existing database needs updates:
1. Ensure `orders` table can store `sale_type` (default: 'regular')
2. Ensure `installment_plans` table exists
3. Ensure `installment_payments` table exists
4. Ensure `credit_accounts` table exists

---

**Backend Development Complete When:**
✅ Accepts new fields in `/api/sales/create`  
✅ Validates installment_plan and credit_details  
✅ Creates appropriate database records  
✅ Returns correct response format  
✅ Handles errors gracefully  
✅ Tests pass for all scenarios
