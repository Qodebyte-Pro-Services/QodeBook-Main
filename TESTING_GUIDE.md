# Quick Testing Guide - Installment & Credit Features

## Test Scenario 1: Installment Payment

### Setup
1. Open POS at `/pos` page
2. Add products to cart
3. Select a **registered customer** (not Walk-In)
4. Click "Checkout"

### Expected UI Changes
- ✅ Order Confirmation modal opens
- ✅ Payment Method dropdown includes "Installment Plan" option
- ✅ "Installment Plan" option is NOT grayed out for registered customer

### Steps
1. Select "Installment Plan" from payment methods
2. **Blue panel appears** with:
   - Number of Payments buttons (2, 3, 4, 6, 12)
   - Payment Frequency dropdown (Daily, Weekly, Monthly)
   - Down Payment input field
   - Start Date picker
   - Notes textarea

### Test Cases

#### Test 1.1: Basic 4-Month Plan
```
Order Total: ₦50,000
Steps:
1. Click "4" button
2. Select "Monthly"
3. Enter down payment: ₦5,000
4. Pick start date: 2026-05-15
5. Click "Confirm Order"

Expected Result:
- Down Payment: ₦5,000
- Monthly Payment: ₦15,000 (45,000 ÷ 3)
- Order sent with sale_type: 'installment'
```

#### Test 1.2: Zero Down Payment
```
Order Total: ₦50,000
Steps:
1. Click "4" button
2. Select "Monthly"
3. Leave down payment: 0
4. Click "Confirm Order"

Expected Result:
- Down Payment: ₦0
- Monthly Payment: ₦12,500 (50,000 ÷ 4)
- All 4 payments equal
```

#### Test 1.3: Validation - Down Payment Too High
```
Steps:
1. Order Total: ₦50,000
2. Select 4 payments
3. Try to enter down payment: ₦20,000
4. Click "Confirm Order"

Expected Result:
- ❌ Confirm button disabled or error shown
- Red validation message appears
- Explanation: Down payment can't exceed first month amount (₦12,500)
```

---

## Test Scenario 2: Credit Sale

### Setup
1. Open POS at `/pos` page
2. Add products to cart
3. Select a **registered customer**
4. Click "Checkout"

### Expected UI Changes
- ✅ "Credit Sale" option appears in Payment Method dropdown
- ✅ "Credit Sale" is NOT grayed out

### Steps
1. Select "Credit Sale" from payment methods
2. **Purple panel appears** with:
   - Credit Type dropdown (Full, Partial, Installment Credit)
   - Amount to Pay input (if not Full Credit)
   - Payment Schedule dropdown
   - Balance display

### Test Cases

#### Test 2.1: Full Credit (₦0 Payment Now)
```
Order Total: ₦50,000
Steps:
1. Select Credit Type: "Full Credit"
2. Click "Confirm Order"

Expected UI:
- Amount Paid field disabled/hidden
- Payment Schedule still visible
- Balance on Credit: ₦50,000

Expected Data Sent:
- sale_type: 'credit'
- credit_details.credit_type: 'full_credit'
- credit_details.amount_paid: 0
- credit_details.balance: 50000
```

#### Test 2.2: Partial Credit (₦15,000 Payment Now)
```
Order Total: ₦50,000
Steps:
1. Select Credit Type: "Partial Credit"
2. Enter Amount: ₦15,000
3. Select Schedule: "Monthly"
4. Click "Confirm Order"

Expected UI:
- Shows "Amount to Pay Now" field
- Balance updates to ₦35,000

Expected Data Sent:
- sale_type: 'credit'
- credit_details.credit_type: 'partial_credit'
- credit_details.amount_paid: 15000
- credit_details.balance: 35000
- credit_details.payment_schedule: 'monthly'
```

#### Test 2.3: Installment Credit
```
Order Total: ₦50,000
Steps:
1. Select Credit Type: "Installment Credit"
2. Enter Amount: ₦10,000
3. Select Schedule: "Weekly"
4. Click "Confirm Order"

Expected Data Sent:
- sale_type: 'credit'
- credit_details.credit_type: 'installment_credit'
- credit_details.amount_paid: 10000
- credit_details.balance: 40000
- credit_details.payment_schedule: 'weekly'
```

---

## Test Scenario 3: Walk-In Customer (Negative Test)

### Setup
1. Open POS
2. Add products
3. Select "Walk-In Customer" (usually pre-selected)
4. Click "Checkout"

### Expected Behavior
- ✅ Payment Method dropdown shows ONLY:
  - Cash Payment
  - Card Payment
  - Bank Transfer
  - Multiple Payment
- ✅ "Installment Plan" option is NOT visible
- ✅ "Credit Sale" option is NOT visible

### Test Result
✓ Walk-in customers cannot access installment or credit features

---

## Test Scenario 4: Regular Payments Still Work

### Setup
1. Open POS
2. Add products
3. Select any customer
4. Click "Checkout"

### Test Cases

#### Test 4.1: Cash Payment
```
Steps:
1. Select "Cash Payment"
2. Click "Confirm Order"

Expected:
- Order processes normally
- No new fields appear
- sale_type: 'regular' (default)
```

#### Test 4.2: Multiple Payment Methods
```
Steps:
1. Select "Multiple Payment"
2. Toggle Cash: ₦15,000
3. Toggle Card: ₦35,000
4. Click "Confirm Order"

Expected:
- Both payments processed
- No sale_type specified (regular)
```

---

## API Response Inspection

### Check Network Tab in Browser DevTools

#### Installment Order Request:
```json
{
  "business_id": 1,
  "branch_id": 1,
  "customer_id": 5,
  "items": [...],
  "sale_type": "installment",
  "installment_plan": {
    "number_of_payments": 4,
    "payment_frequency": "monthly",
    "down_payment": 5000,
    "remaining_balance": 45000,
    "start_date": "2026-05-15",
    "notes": ""
  },
  "payments": [
    {
      "method": "installment",
      "amount": 5000,
      "reference": "installment-2026-ABC123"
    }
  ]
}
```

#### Credit Order Request:
```json
{
  "business_id": 1,
  "branch_id": 1,
  "customer_id": 5,
  "items": [...],
  "sale_type": "credit",
  "credit_details": {
    "credit_type": "partial_credit",
    "amount_paid": 15000,
    "balance": 35000,
    "payment_schedule": "monthly"
  },
  "payments": [
    {
      "method": "credit",
      "amount": 15000,
      "reference": "credit-2026-XYZ789"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue 1: Installment/Credit Options Not Showing
**Cause**: Likely selecting Walk-In customer
**Solution**: Make sure to select a registered customer (name shown, not "Walk-In")

### Issue 2: "Confirm Order" Button Disabled
**Cause**: Invalid down payment or credit amount
**Solution**: 
- For installment: Down payment must be ≤ first month payment
- For credit: Amount paid must be ≤ total order amount

### Issue 3: Down Payment Calculation Wrong
**Cause**: Formula misunderstanding
**Solution**: 
- Remaining = Total - Down Payment
- Per Payment = Remaining ÷ (Number of Payments)

### Issue 4: Network Error When Confirming
**Cause**: Backend doesn't support new fields yet
**Solution**: Check backend `createSale` endpoint is updated

---

## Success Criteria Checklist

- [ ] Installment options appear for registered customers only
- [ ] Credit options appear for registered customers only
- [ ] Walk-in customers don't see these options
- [ ] Down payment validation works
- [ ] Credit balance calculates correctly
- [ ] Order data structure matches expected format
- [ ] Payment reference generated correctly
- [ ] Regular payments still work
- [ ] Multiple payments still work
- [ ] Backend successfully receives orders with new fields

---

## Browser Console Checks

Open DevTools Console (F12) and verify:

1. **No TypeScript errors** related to new types
2. **No import errors** for new interfaces
3. **Check orderData** in network requests contains `sale_type` field
4. **Check response** from backend includes order confirmation

```javascript
// In console, after order:
// Should see success message, not error
```

---

## Done! ✅

If all tests pass, the feature is working correctly and ready for deployment.

For issues or questions, refer to `INSTALLMENT_CREDIT_FEATURE.md` for detailed documentation.
