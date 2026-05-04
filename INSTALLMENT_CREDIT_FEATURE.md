# Installment & Credit Payment Methods - Implementation Guide

## Overview
This guide explains the new installment and credit payment methods available for registered customers in the QodeBook POS system. These features are ONLY available for non-walk-in customers to enable proper tracking for payment plans and credit accounts.

## Feature Details

### 1. Installment Payment Plan

**When to Use:** When a customer wants to pay for their order in multiple installments over time.

**Key Parameters:**
- **Number of Payments**: 2, 3, 4, 6, or 12 installments
- **Payment Frequency**: Daily, Weekly, or Monthly
- **Down Payment**: Initial payment (can be 0 to first month amount)
- **Remaining Balance**: Automatically divided equally among remaining payments
- **Start Date**: When the installment plan begins

**Example Calculation:**
```
Order Total: ₦50,000.00
Number of Payments: 4 (monthly)
Down Payment: ₦5,000.00

Calculation:
- Down Payment (paid now): ₦5,000.00
- Remaining Balance: ₦45,000.00
- Per Monthly Payment: ₦45,000 ÷ 3 = ₦15,000.00
- Payment Schedule: 1 down payment + 3 monthly payments of ₦15,000

If Down Payment = 0:
- Per Monthly Payment: ₦50,000 ÷ 4 = ₦12,500.00
- Payment Schedule: 4 monthly payments of ₦12,500.00
```

**Data Structure Sent to Backend:**
```javascript
{
  sale_type: 'installment',
  installment_plan: {
    number_of_payments: 4,
    payment_frequency: 'monthly',
    down_payment: 5000,
    remaining_balance: 45000,
    start_date: '2024-05-15',
    notes: 'Optional payment plan notes'
  },
  payments: [
    {
      method: 'installment',
      amount: 5000,  // Down payment amount
      reference: 'installment-2024-ABC123'
    }
  ]
}
```

### 2. Credit Sales

**When to Use:** When a customer buys on credit and won't pay the full amount immediately.

**Three Types of Credit:**

#### a. Full Credit
- **Description**: Customer receives goods with zero payment immediately
- **Use Case**: Established business relationships, trust-based transactions
- **Amount Paid**: ₦0.00
- **Balance on Credit**: Full order amount

#### b. Partial Credit
- **Description**: Customer pays a minimum amount, rest goes on credit
- **Use Case**: Customer has budget constraints but can pay something
- **Amount Paid**: Any amount between 0 and order total
- **Balance on Credit**: Order total - Amount paid

#### c. Installment Credit
- **Description**: Customer can pay part or full amount via installment plan, with flexibility
- **Use Case**: Customer needs to make installments or flexible payment terms
- **Amount Paid**: Initial payment (can be full or partial)
- **Balance on Credit**: Flexible - can be completed in installments

**Payment Schedule Options:**
- **Immediate**: Payment due immediately (unrealistic, for documentation purposes)
- **Weekly**: Payment due weekly
- **Monthly**: Payment due monthly
- **Custom**: Custom payment schedule (needs separate tracking)

**Example: Partial Credit**
```
Order Total: ₦50,000.00
Credit Type: Partial Credit
Amount Paid Now: ₦15,000.00
Payment Schedule: Monthly

Result:
- Amount Paid: ₦15,000.00
- Balance on Credit: ₦35,000.00 (to be collected on monthly basis)
```

**Data Structure Sent to Backend:**
```javascript
{
  sale_type: 'credit',
  credit_details: {
    credit_type: 'partial_credit',
    amount_paid: 15000,
    balance: 35000,
    payment_schedule: 'monthly'
  },
  payments: [
    {
      method: 'credit',
      amount: 15000,  // Amount paid immediately
      reference: 'credit-2024-XYZ789'
    }
  ]
}
```

## UI Flow for Order Confirmation

1. **Select Payment Method**
   - Regular: Cash, Card, Bank Transfer, Multiple Payment
   - For Registered Customers Only: Installment, Credit

2. **If Installment Selected:**
   - Choose number of payments (buttons: 2, 3, 4, 6, 12)
   - Select payment frequency
   - Set down payment amount
   - Pick start date
   - Add optional notes

3. **If Credit Selected:**
   - Choose credit type (Full, Partial, Installment Credit)
   - Enter amount to pay (if not Full Credit)
   - Select payment schedule
   - Review credit balance

## Customer Eligibility

**Regular Customers Can Access:**
- Cash payment
- Card payment
- Bank transfer
- Multiple payment methods
- **Installment payment** ✓
- **Credit sales** ✓

**Walk-In Customers (ID = 0) Can Only Access:**
- Cash payment
- Card payment
- Bank transfer
- Multiple payment methods

## Backend API Integration

### Endpoint: `/api/sales/create`

The backend `createSale` function now supports:

```javascript
{
  // ... existing order fields ...
  
  // New fields for installment/credit
  sale_type: 'regular' | 'installment' | 'credit',
  installment_plan: InstallmentPlan (if sale_type='installment'),
  credit_details: CreditDetails (if sale_type='credit'),
  
  // Regular payment info - for down payment or initial credit amount
  payments: [{
    method: string,
    amount: number,
    reference: string
  }]
}
```

### Expected Backend Database Tables:
- `installment_plans`: Stores installment plan details
- `installment_payments`: Tracks individual installment payments
- `credit_accounts`: Stores credit sale information

## Implementation Details

### Modified Files

#### 1. `/src/api/controllers/post/orders.ts`
**New Interfaces:**
- `InstallmentPlan`: Configuration for installment payments
- `CreditDetails`: Configuration for credit sales
- `PaymentMethodOption`: Extended payment method options

**Updated Functions:**
- `addPaymentToOrder()`: Now handles installment and credit payment types
  - Detects `PaymentMethodOption` objects
  - Sets appropriate `sale_type` based on payment method
  - Populates `installment_plan` or `credit_details` in order data

#### 2. `/src/components/dashboard/sales/ui/order-confirmation.tsx`
**Enhanced Sections:**
- Payment method selector: Added Installment and Credit options
- Installment configuration panel:
  - Dynamic payment calculation
  - Down payment validation
  - Schedule generation
- Credit configuration panel:
  - Credit type selector
  - Amount paid input with validation
  - Balance calculator
  - Payment schedule selector

**Customer Check:**
```typescript
const isWalkIn = orderData.customer?.id === 0;
// Installment/Credit options only shown if !isWalkIn
```

#### 3. `/src/hooks/use-pos-logic.ts`
**Updated Function:**
- `handleConfirmOrder()`: Now accepts `PaymentMethodOption` in addition to string/array

## Validation Rules

### Installment Validation
- Down payment must be: `0 <= downPayment <= firstMonthPaymentAmount`
- Number of payments must be greater than 0
- Start date must be set

### Credit Validation
- Amount paid must be: `0 <= amountPaid <= totalOrderAmount`
- For partial/installment credit: `0 < amountPaid < totalOrderAmount`
- For full credit: `amountPaid = 0`

## Order Status Handling

- **Regular/Multiple Payment**: Order status = 'completed' (inventory reduced immediately)
- **Installment**: Order status = 'pending' (inventory not reduced until down payment verified)
- **Credit**: Order status = 'completed' (inventory reduced immediately, but credit tracked)

## Usage Example - Staff/Admin POS

```typescript
// In use-pos-logic.ts
const handleConfirmOrder = async (paymentOption) => {
  // paymentOption could be:
  // 1. Simple string: "cash", "card", "bank_transfer"
  // 2. Multiple methods: [["cash", 5000], ["card", 10000]]
  // 3. Installment: { method: 'installment', installmentPlan: {...}, downPayment: 5000 }
  // 4. Credit: { method: 'credit', creditDetails: {...} }
  
  const orderDataWithPayment = addPaymentToOrder(
    pendingOrderData,
    paymentOption,
    total
  );
  
  // Submit to backend
  const result = await submitOfflineOrder(orderDataWithPayment);
};
```

## Testing Checklist

- [ ] Installment option only shows for registered customers
- [ ] Down payment validation works correctly
- [ ] Payment calculation is accurate
- [ ] Credit types display correctly
- [ ] Balance calculation updates in real-time
- [ ] Order data sent to backend includes proper `sale_type` field
- [ ] Backend accepts and processes new order format
- [ ] Walk-in customers don't see installment/credit options
- [ ] Regular payment methods still work normally

## Notes & Considerations

1. **Inventory Management**: 
   - For installments: Inventory reduced on down payment confirmation
   - For credit: Inventory reduced immediately
   - For regular: Inventory reduced immediately

2. **Customer Tracking**:
   - Only registered customers (customer_id > 0) can use these methods
   - Enables proper tracking for follow-up payments

3. **Backend Processing**:
   - Ensure backend validates `sale_type` and related payment details
   - Database tables must handle the new payment type records

4. **UI/UX**:
   - Color coding: Blue for installment, Purple for credit
   - Clear visual distinction from regular payments
   - Real-time calculation updates for better UX

## Future Enhancements

- Automated payment reminders for installment due dates
- Credit aging reports
- Payment schedule modification capabilities
- Automatic payment status updates
- Integration with payment gateways for installment tracking
