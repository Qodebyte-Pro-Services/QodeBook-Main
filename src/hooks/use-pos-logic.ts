/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useCartStorage, useOfflineCustomers, useOfflineOrders } from "@/hooks/use-localforage";
import {
    cartUtils,
    discountCache,
    taxCache,
    couponCache,
    isOnline,
    networkUtils,
    productCache
} from "@/lib/storage-utils";
import {
    prepareOrderData,
    addPaymentToOrder,
    submitOfflineOrder,
    SelectedDiscount,
    SelectedTax,
    SelectedCoupon,
    OrderSubmissionData
} from "@/api/controllers/post/orders";
import {
    CustomerResponse,
    ProductVariantResponseObject,
    FallbackSalesResponse,
    DiscountResponseObj,
    TaxesResponseObj,
    CouponResponseObj
} from "@/models/types/shared/handlers-type";
import {
    getCustomers,
    getProductCoupons,
    getProductDiscounts,
    getProductTaxes,
    getDiscountsByBusinessId,
    getTaxesByBusinessId,
    getCouponsByBusinessId
} from "@/api/controllers/get/handler";
import { useUserBusinesses } from "@/hooks/useControllers";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";

export const usePOSLogic = () => {
    const queryClient = useQueryClient();

    const [businessId, setBusinessId] = useState(0);
    const [branchId, setBranchId] = useState(0);
    const [userId, setUserId] = useState(0);
    const [staffId, setStaffId] = useState<string>();
    const [isClient, setIsClient] = useState(false);
    const [isOnlineState, setIsOnlineState] = useState(true);

    useEffect(() => {
        setIsOnlineState(isOnline());
        const cleanup = networkUtils.setupNetworkListeners(
            () => setIsOnlineState(true),
            () => setIsOnlineState(false)
        );
        return cleanup;
    }, []);

    const { data: businessesData, isSuccess: businessesSuccess } = useUserBusinesses();

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsClient(true);
            const storedId = sessionStorage.getItem("selectedBusinessId");
            if (storedId) {
                setBusinessId(JSON.parse(storedId));
            } else if (businessesSuccess && businessesData?.businesses?.length > 0) {
                // Fallback to first business if no ID in sessionStorage
                const firstBusinessId = businessesData.businesses[0].id;
                setBusinessId(firstBusinessId);
                sessionStorage.setItem("selectedBusinessId", JSON.stringify(firstBusinessId));
            }

            const storedBranchId = sessionStorage.getItem("selectedBranchId");
            if (storedBranchId) {
                setBranchId(JSON.parse(storedBranchId));
            } else if (businessesSuccess && businessesData?.businesses?.length > 0) {
                // Fallback branch if available (assuming first business first branch)
                const firstBranchId = businessesData.businesses[0].branches?.[0]?.id || 0;
                if (firstBranchId) {
                    setBranchId(firstBranchId);
                    sessionStorage.setItem("selectedBranchId", JSON.stringify(firstBranchId));
                }
            }

            const activeUser = Cookies.get("authActiveUser") || "user";

            switch (activeUser.toLowerCase()) {
                case "staff": {
                    const authId = Cookies.get("authStaffId") || "";
                    setStaffId(authId)
                }
                    break;
                case "user": {
                    const userId = Cookies.get("authUserId");
                    setUserId(userId)
                }
                    break;
                default:
                    setStaffId("");
                    setUserId(0);
            }

        }
    }, [businessesSuccess, businessesData]);

    const {
        cart: selectedVariants,
        customer: selectedCustomer,
        storeType,
        matchedDiscounts,
        matchedTaxes,
        matchedCoupons,
        updateCart: setSelectedVariants,
        updateCustomer: setSelectedCustomer,
        updateStoreType: setStoreType,
        updateMatchedDiscounts,
        updateMatchedTaxes,
        updateMatchedCoupons,
        clearAll: clearCart
    } = useCartStorage();

    const { createOrder, pendingOrders, loadPendingOrders } = useOfflineOrders();
    const { getOfflineCustomers, setOfflineCustomers } = useOfflineCustomers();

    const [selectedDiscount, setSelectedDiscount] = useState<SelectedDiscount | null>(null);
    const [selectedTax, setSelectedTax] = useState<SelectedTax | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<SelectedCoupon | null>(null);

    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState<OrderSubmissionData | null>(null);
    const [invoiceData, setInvoiceData] = useState<FallbackSalesResponse | null>(null);
    const [offlineInvoiceData, setOfflineInvoiceData] = useState<any | null>(null);
    const [drafts, setDrafts] = useState<any[]>([]);

    const fetchDrafts = useCallback(async () => {
        const data = await cartUtils.getCartDrafts();
        setDrafts(data);
    }, []);

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    // Queries for data
    const { data: customers } = useQuery({
        queryKey: ["get-customers", businessId],
        queryFn: () => getCustomers({ businessId: Number(businessId) }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
    });

    const { data: couponsData } = useQuery({
        queryKey: ["get-coupons", businessId],
        queryFn: () => getProductCoupons({ businessId: Number(businessId) }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
    });

    const { data: taxesData } = useQuery({
        queryKey: ["get-taxes", businessId],
        queryFn: () => getProductTaxes({ businessId }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
    });

    const { data: discountsData } = useQuery({
        queryKey: ["get-discounts", businessId],
        queryFn: () => getProductDiscounts({ businessId }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
    });

    // Caching logic parity with original SalesContent
    const { data: productsWithDiscounts } = useQuery({
        queryKey: ["get-products-discounts", businessId],
        queryFn: async () => {
            const data = await getDiscountsByBusinessId({ business_id: Number(businessId) });
            if (data && businessId) await discountCache.cacheDiscounts(data, businessId.toString());
            return data;
        },
        enabled: businessId > 0,
    });

    const { data: productsWithTaxes } = useQuery({
        queryKey: ["get-products-taxes", businessId],
        queryFn: async () => {
            const data = await getTaxesByBusinessId({ business_id: Number(businessId) });
            if (data && businessId) await taxCache.cacheTaxes(data, businessId.toString());
            return data;
        },
        enabled: businessId > 0,
    });

    const { data: productsWithCoupons } = useQuery({
        queryKey: ["get-products-coupons", businessId],
        queryFn: async () => {
            const data = await getCouponsByBusinessId({ business_id: Number(businessId) });
            if (data && businessId) await couponCache.cacheCoupons(data, businessId.toString());
            return data;
        },
        enabled: businessId > 0,
    });

    const productswithdiscounts = useMemo(() => productsWithDiscounts?.products_with_discounts || [], [productsWithDiscounts]);
    const productwithtaxes = useMemo(() => productsWithTaxes?.products_with_taxes || [], [productsWithTaxes]);
    const productwithcoupons = useMemo(() => productsWithCoupons?.products_with_coupons || [], [productsWithCoupons]);

    const calculateOrderTotals = useCallback(() => {
        const subtotal = selectedVariants.reduce((sum, variant) => {
            return sum + (variant.quantity * Number(variant.selling_price));
        }, 0);

        let totalDiscountAmount = 0;
        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const discounts = matchedDiscounts.get(productId);
            if (discounts?.length) {
                discounts.forEach((discount: any) => {
                    const variantTotal = variant.quantity * Number(variant.selling_price);
                    if (discount?.percentage) {
                        totalDiscountAmount += (variantTotal * Number(discount.percentage)) / 100;
                    } else if (discount?.amount) {
                        totalDiscountAmount += Number(discount.amount) * variant.quantity;
                    }
                });
            }
        });

        let totalCouponAmount = 0;
        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const coupons = matchedCoupons.get(productId);
            if (coupons?.length) {
                coupons.forEach((coupon: any) => {
                    const variantTotal = variant.quantity * Number(variant.selling_price);
                    if (coupon?.discount_percentage) {
                        totalCouponAmount += (variantTotal * Number(coupon.discount_percentage)) / 100;
                    } else if (coupon?.discount_amount) {
                        totalCouponAmount += Number(coupon.discount_amount) * variant.quantity;
                    }
                });
            }
        });

        let totalTaxAmount = 0;
        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const taxes = matchedTaxes.get(productId);
            if (taxes?.length) {
                taxes.forEach((tax: any) => {
                    totalTaxAmount += (Number(tax.rate) / 100) * subtotal;
                });
            }
        });

        const tax = totalTaxAmount;
        const discountAmount = totalDiscountAmount;
        const couponAmount = totalCouponAmount;
        const finalSubtotal = subtotal - discountAmount - couponAmount;
        const total = finalSubtotal + tax;

        return { subtotal, tax, total, discountAmount, couponAmount, finalSubtotal };
    }, [selectedVariants, matchedDiscounts, matchedCoupons, matchedTaxes]);

    const { subtotal, tax, total, discountAmount, couponAmount } = calculateOrderTotals();

    const handleSelectedVariant = async (variant: ProductVariantResponseObject) => {
        const productId = variant.product_id;

        if (productId) {
            // Match Discounts
            if (productswithdiscounts.length > 0) {
                const matchingDiscounts = productswithdiscounts.filter((discount: any) =>
                    discount.product_id && discount.product_id === productId
                );
                if (matchingDiscounts.length > 0) {
                    const newMap = new Map(matchedDiscounts);
                    newMap.set(productId, matchingDiscounts);
                    await updateMatchedDiscounts(newMap);
                    toast.success(`Applied ${matchingDiscounts.length} discount(s) to this product`, {
                        description: matchingDiscounts.map((d: any) => d.name).join(', '),
                    });
                }
            }

            // Match Taxes
            if (productwithtaxes.length > 0) {
                const matchingTaxes = productwithtaxes.filter((tax: any) =>
                    tax.product_id && tax.product_id === productId
                );
                if (matchingTaxes.length > 0) {
                    const newMap = new Map(matchedTaxes);
                    newMap.set(productId, matchingTaxes);
                    await updateMatchedTaxes(newMap);
                    toast.info(`Applied ${matchingTaxes.length} tax(es) to this product`, {
                        description: matchingTaxes.map((t: any) => t.name).join(', '),
                    });
                }
            }

            // Match Coupons
            if (productwithcoupons.length > 0) {
                const matchingCoupons = productwithcoupons.filter((coupon: any) =>
                    coupon.product_id && coupon.product_id === productId
                );
                if (matchingCoupons.length > 0) {
                    const newMap = new Map(matchedCoupons);
                    newMap.set(productId, matchingCoupons);
                    await updateMatchedCoupons(newMap);
                    toast.success(`${matchingCoupons.length} coupon(s) available for this product`, {
                        description: matchingCoupons.map((c: any) => c.code).join(', '),
                    });
                }
            }
        }

        const existing = selectedVariants.find((item) => item.id === variant.id);
        if (existing) {
            if (existing.quantity >= variant.quantity) {
                toast.error(`Only ${variant.quantity} items available in stock`);
                return;
            }
            const newCart = selectedVariants.map((item) =>
                item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            await setSelectedVariants(newCart);
        } else {
            if (variant.quantity <= 0) {
                toast.error("This product is out of stock");
                return;
            }
            const newCart = [...selectedVariants, { ...variant, quantity: 1, maxQuantity: variant.quantity }];
            await setSelectedVariants(newCart);
        }
    };

    const handleQuantityChange = async (variantId: number, newQuantity: number, maxQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveVariant(variantId);
            return;
        }
        if (newQuantity > maxQuantity) {
            toast.error(`Only ${maxQuantity} items available in stock`);
            return;
        }
        const newCart = selectedVariants.map((item) =>
            item.id === variantId ? { ...item, quantity: newQuantity } : item
        );
        await setSelectedVariants(newCart);
    };

    const handleRemoveVariant = async (variantId: number) => {
        const variantToRemove = selectedVariants.find(item => item.id === variantId);
        if (variantToRemove?.product_id) {
            const productId = variantToRemove.product_id;
            const otherVariantsWithSameProduct = selectedVariants.filter(
                item => item.id !== variantId && item.product_id === productId
            );

            if (otherVariantsWithSameProduct.length === 0) {
                const newDiscountsMap = new Map(matchedDiscounts);
                newDiscountsMap.delete(productId);
                await updateMatchedDiscounts(newDiscountsMap);

                const newTaxesMap = new Map(matchedTaxes);
                newTaxesMap.delete(productId);
                await updateMatchedTaxes(newTaxesMap);

                const newCouponsMap = new Map(matchedCoupons);
                newCouponsMap.delete(productId);
                await updateMatchedCoupons(newCouponsMap);
            }
        }

        const newCart = selectedVariants.filter((item) => item.id !== variantId);
        await setSelectedVariants(newCart);
    };

    const handlePayNow = async () => {
        if (selectedVariants.length === 0) {
            toast.error("Please add items to your order before proceeding");
            return;
        }
        if (!selectedCustomer) {
            toast.error("Please select a customer");
            return;
        }
        if (!storeType) {
            toast.error("Please select store type");
            return;
        }

        const needed_items_data = selectedVariants.map((item) => ({
            variant_id: item.id,
            quantity: item.quantity,
            unit_price: +item.selling_price,
            total_price: +item.selling_price * item.quantity,
        }));

        const orderData = prepareOrderData(
            needed_items_data,
            selectedCustomer,
            storeType,
            +userId,
            +businessId,
            +branchId,
            undefined,
            undefined,
            selectedCoupon || undefined,
            staffId,
            "Order Created"
        );

        orderData.discount = discountAmount;
        orderData.coupon = couponAmount;
        orderData.taxes = tax;

        setPendingOrderData(orderData);
        setShowOrderConfirmation(true);
    };

    const handleConfirmOrder = async (paymentMethod: string | string[] | Array<[string, number]>) => {
        if (!pendingOrderData) return;

        const orderDataWithPayment = addPaymentToOrder(pendingOrderData, paymentMethod, total);

        if (isOnlineState) {
            try {
                const result = await submitOfflineOrder(orderDataWithPayment) as { success: boolean; _data: FallbackSalesResponse };
                if (result?.success) {
                    toast.success("Order created successfully!");
                    
                    for (const item of selectedVariants) {
                        await productCache.decrementVariantStock(businessId.toString(), item.id, item.quantity);
                    }
                    
                    queryClient.invalidateQueries({ queryKey: ["get-business-variants", businessId] });
                    setInvoiceData(result._data);
                    await clearCart();
                    setShowOrderConfirmation(false);
                    setPendingOrderData(null);
                } else {
                    toast.error("Failed to create order");
                }
            } catch (error) {
                toast.error("Failed to create order");
            }
        } else {
            const result = await createOrder(orderDataWithPayment);
            if (result.success) {
                toast.info("Order saved offline");
                
                for (const item of selectedVariants) {
                    await productCache.decrementVariantStock(businessId.toString(), item.id, item.quantity);
                }
                
                const customer = (customers?.customers as any[])?.find((c: any) => c.id == selectedCustomer);
                setOfflineInvoiceData({
                    ...result.data,
                    customer_name: customer?.name || "Walk-In",
                    customer_email: customer?.email || "N/A",
                    customer_phone: customer?.phone || "N/A"
                });
                
                await clearCart();
                setShowOrderConfirmation(false);
                setPendingOrderData(null);
            }
        }
    };

    const handleSaveDraft = async () => {
        if (selectedVariants.length === 0) return;
        setIsSavingDraft(true);
        try {
            const draft = {
                id: `draft_${Date.now()}`,
                cart: selectedVariants,
                customer: selectedCustomer,
                storeType,
                matchedDiscounts,
                matchedTaxes,
                matchedCoupons,
                timestamp: new Date().toISOString()
            };
            await cartUtils.saveCartDraft(draft);
            toast.success("Draft saved successfully");
            await fetchDrafts();
        } catch (error) {
            toast.error("Failed to save draft");
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleLoadLatestDraft = async () => {
        setIsLoadingDraft(true);
        try {
            const drafts = await cartUtils.getCartDrafts();
            if (drafts.length > 0) {
                const latest = drafts[drafts.length - 1];
                await handleDraftSelected(latest);
                toast.success("Latest draft loaded");
            } else {
                toast.error("No drafts found");
            }
        } catch (error) {
            toast.error("Failed to load draft");
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const handleDraftSelected = async (draft: any) => {
        const fullDraft = await cartUtils.loadCartDraft(draft.id);
        if (fullDraft) {
            await setSelectedVariants(fullDraft.cart || []);
            await setSelectedCustomer(fullDraft.customer || 'walk-in');
            await setStoreType(fullDraft.storeType || '');
            await updateMatchedDiscounts(fullDraft.matchedDiscounts);
            await updateMatchedTaxes(fullDraft.matchedTaxes);
            await updateMatchedCoupons(fullDraft.matchedCoupons);
        }
    };

    const handleDeleteDraft = async (draftId: string) => {
        try {
            const success = await cartUtils.deleteCartDraft(draftId);
            if (success) {
                toast.success("Draft deleted successfully");
                await fetchDrafts();
            } else {
                toast.error("Failed to delete draft");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the draft");
        }
    };

    return {
        businessId,
        branchId,
        userId,
        staffId,
        selectedVariants,
        selectedCustomer,
        storeType,
        subtotal,
        tax,
        total,
        discountAmount,
        couponAmount,
        isSavingDraft,
        isLoadingDraft,
        showOrderConfirmation,
        setShowOrderConfirmation,
        pendingOrderData,
        setPendingOrderData,
        invoiceData,
        setInvoiceData,
        offlineInvoiceData,
        setOfflineInvoiceData,
        drafts,
        pendingOrders,
        isOnline: isOnlineState,
        fetchDrafts,
        customers: customers?.customers || [],
        coupons: couponsData?.coupons || [],
        taxes: taxesData?.taxes || [],
        discounts: discountsData?.discounts || [],
        handlers: {
            handleSelectedVariant,
            handleQuantityChange,
            handleRemoveVariant,
            handlePayNow,
            handleConfirmOrder,
            handleSaveDraft,
            handleLoadLatestDraft,
            handleDraftSelected,
            handleDeleteDraft,
            setSelectedCustomer,
            setStoreType,
            setSelectedDiscount,
            setSelectedTax,
            setSelectedCoupon,
            clearCart,
        }
    };
};
