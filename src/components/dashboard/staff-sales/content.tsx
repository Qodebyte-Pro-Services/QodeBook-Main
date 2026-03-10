// "use client";
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { cn } from "@/lib/utils";
// import React, { useRef, useState, useEffect, useMemo } from "react";
// import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
// import { AnimatePresence, motion, Variants } from "framer-motion";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { toast } from "sonner";
// import { PiCaretLeft, PiMinusBold, PiPlusBold, PiShoppingCart, PiShoppingCartSimpleBold } from "react-icons/pi";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { getCustomers, getProductCoupons, getProductDiscounts, getProductTaxes, getUserProducts, getVariantsByBusiness, getVariantsByProductId, getDiscountsByBusinessId, getTaxesByBusinessId, getCouponsByBusinessId, getProductCategories } from "@/api/controllers/get/handler";
// import Image from "next/image";
// import { Trash, ShoppingCart, Calculator, Tag, ChevronDown, Settings, CalculatorIcon, Sparkles } from "lucide-react";
// import CreateDiscountForm from "../sales/forms/add-discount-form";
// import CreateTaxesForm from "../inventory/forms/add-taxes-form";
// import CreateCouponForm from "../sales/forms/add-coupon-form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { CategoryPayload, CouponResponseObj, CustomerResponse, DiscountResponseObj, FallbackSalesResponse, ProductResponseObj, ProductVariantResponseObject, SingleProductType, TaxesResponseObj } from "@/models/types/shared/handlers-type";
// import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
// import { TOTAL_DISPLAY_ITEM } from "@/models/types/constants/sales-constants";
// import { OrderConfirmation } from "../sales/ui";
// import { DiscountView, CouponsView, TaxesView } from "../sales/views";
// import Cookies from "js-cookie";
// import { useCartStorage, useOfflineCustomers, useOfflineOrders } from "@/hooks/use-localforage";
// import { productCache, discountCache, taxCache, couponCache, cartUtils, offlineOrders } from "@/lib/storage-utils";
// import { DraftSelectionModal } from "../sales/draft-selection-modal";
// import PendingOrdersModal from "../sales/pending-orders-modal";
// import { submitOfflineOrder, prepareOrderData, addPaymentToOrder, SelectedDiscount, SelectedTax, SelectedCoupon, OrderSubmissionData } from "@/api/controllers/post/orders";
// import OrderInvoice from "../sales/invoice/OrderInvoice";
// import QuantityCalculator from "../sales/ui/quantity-calculator";
// import CustomerForm from "../customers/forms/add-customer-form";
// import { OfflineSalesSchema } from "@/components/data-table/offline-sales-table";
// import OfflineSalesInvoice from "../sales/invoice/OfflineSalesInvoice";

// const PosContents = () => {
//     const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);
//     const [invoiceData, setInvoiceData] = useState<FallbackSalesResponse | null>(null);

//     const pathname = usePathname();
//     const searchParams = useSearchParams();
//     const queryClient = useQueryClient();

//     const { hiddenScrollbar } = useCustomStyles();
//     const { getOfflineCustomers, setOfflineCustomers } = useOfflineCustomers();

//     const [businessId, setBusinessId] = useState(0);
//     const [branchId, setBranchId] = useState(0);
//     const [userId, setUserId] = useState(0);
//     const [isClient, setIsClient] = useState(false);

//     useEffect(() => {
//         if (typeof window !== "undefined") {
//             setIsClient(true);
//             const storedId = sessionStorage.getItem("selectedBusinessId");
//             if (storedId) setBusinessId(JSON.parse(storedId));

//             const storedBranchId = sessionStorage.getItem("selectedBranchId");
//             if (storedBranchId) setBranchId(JSON.parse(storedBranchId));

//             const user_auth_id = Cookies.get("authUserId");
//             if (user_auth_id) setUserId(JSON.parse(user_auth_id));
//         }
//     }, []);

//     const [isPhoneView, setIsPhoneView] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

//     const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
//     const [offlineCustomers, setofflinecustomers] = useState<CustomerResponse[]>([]);
//     const router = useRouter();

//     const [isQuantityCalculatorOpen, setIsQuantityCalculatorOpen] = useState<boolean>(false);
//     const [calculatorContext, setCalculatorContext] = useState<{
//         variantId: number;
//         currentQuantity: number;
//         maxQuantity: number;
//         unitPrice: number;
//     } | null>(null);

//     useEffect(() => {
//         const handleInnerWidth = () => {
//             if (typeof window === "undefined") return;
//             if (window.innerWidth <= 768) {
//                 setIsPhoneView(true);
//                 return;
//             }
//             setIsPhoneView(false);
//         }
//         window.addEventListener("resize", handleInnerWidth);
//         return () => {
//             window.removeEventListener("resize", handleInnerWidth);
//         }
//     }, []);

//     const [productId, setProductId] = useState<string>("all");
//     const [variantsArr, setVariantsArr] = useState<ProductVariantResponseObject[]>([]);
//     const [currentItemCount, setCurrentItemCount] = useState<number>(0);
//     const [currentVariants, setCurrentVariants] = useState<ProductVariantResponseObject[]>([]);

//     const [selectedDiscount, setSelectedDiscount] = useState<SelectedDiscount | null>(null);
//     const [selectedTax, setSelectedTax] = useState<SelectedTax | null>(null);
//     const [selectedCoupon, setSelectedCoupon] = useState<SelectedCoupon | null>(null);

//     const {
//         cart: selectedVariants,
//         customer: selectedCustomer,
//         storeType,
//         matchedDiscounts,
//         matchedTaxes,
//         matchedCoupons,
//         updateCart: setSelectedVariants,
//         updateCustomer: setSelectedCustomer,
//         updateStoreType: setStoreType,
//         updateMatchedDiscounts,
//         updateMatchedTaxes,
//         updateMatchedCoupons,
//         clearAll: clearCart
//     } = useCartStorage();

//     const { createOrder, pendingOrders, syncPendingOrders, loadPendingOrders } = useOfflineOrders();
//     const [showPendingOrdersModal, setShowPendingOrdersModal] = useState<boolean>(false);
//     const [invoicePreview, setInvoicePreview] = useState<OfflineSalesSchema & Partial<{ customer_name: string; customer_phone: string; customer_email: string }> | null>(null);

//     const handleOpenPendingModal = () => setShowPendingOrdersModal(true);
//     const handleClosePendingModal = () => setShowPendingOrdersModal(false);

//     useEffect(() => {
//         let isMounted = true;
//         if (isMounted) {
//             (async () => {
//                 const offline_customers = await getOfflineCustomers(businessId);
//                 setofflinecustomers(offline_customers as CustomerResponse[]);
//             })();
//         }
//         return () => { isMounted = false; };
//     }, [businessId, getOfflineCustomers]);

//     const handlePendingView = (order: OfflineSalesSchema) => {
//         if (offlineCustomers?.length) {
//             const customer = offlineCustomers?.find(cs => cs?.id === +order?.customer_id);
//             const { ...rest } = order;
//             if (customer && Object.keys(customer)?.length) {
//                 const invoiceData = {
//                     ...rest,
//                     customer_name: customer?.name || "",
//                     customer_email: customer?.email,
//                     customer_phone: customer?.phone
//                 };
//                 setInvoicePreview(invoiceData);
//                 return;
//             }
//             const invoiceData = {
//                 ...rest,
//                 customer_name: "Walk-In",
//                 customer_email: "N/A",
//                 customer_phone: "N/A"
//             };
//             setInvoicePreview(invoiceData);
//         }
//     };

//     const handlePendingDelete = async (orderId: string) => {
//         await offlineOrders.removeOfflineOrder(orderId);
//         await loadPendingOrders();
//         toast.success("Pending order removed");
//     };

//     const [isOnline, setIsOnline] = useState(true);
//     const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
//     const [pendingOrderData, setPendingOrderData] = useState<OrderSubmissionData | null>(null);
//     const [isSyncing, setIsSyncing] = useState(false);
//     const [showDiscountForm, setShowDiscountForm] = useState(false);
//     const [showTaxesForm, setShowTaxesForm] = useState(false);
//     const [showSettingsModal, setShowSettingsModal] = useState(false);
//     const [showCouponForm, setShowCouponForm] = useState(false);
//     const [showCouponDropdown, setShowCouponDropdown] = useState(false);
//     const [couponsEnabled, setCouponsEnabled] = useState(false);
//     const [showDiscountView, setShowDiscountView] = useState(false);
//     const [showTaxesView, setShowTaxesView] = useState(false);
//     const [showCouponsView, setShowCouponsView] = useState(false);
//     const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);
//     const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
//     const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
//     const [showDraftSelectionModal, setShowDraftSelectionModal] = useState<boolean>(false);

//     const [filterCategory, setFilterCategory] = useState<string>("all");
//     const [filterBrand, setFilterBrand] = useState<string>("all");
//     const [skuFilter, setSkuFilter] = useState<string>("");

//     // API Queries
//     const { data: user_products, isSuccess: user_productsSuccess, isError: user_productsError } = useQuery({
//         queryKey: ["get-products", businessId],
//         queryFn: () => getUserProducts(businessId),
//         refetchOnWindowFocus: false,
//         retry: false,
//         enabled: businessId > 0
//     });

//     const { data: variants_data, isSuccess: variant_success, isError: variant_error } = useQuery({
//         queryKey: ["get-variants", productId, businessId],
//         queryFn: () => getVariantsByProductId({ productId, businessId }),
//         refetchOnWindowFocus: false,
//         retry: false,
//         enabled: productId !== "all" && businessId > 0
//     });

//     const { data: business_variants, isSuccess: business_variantsSuccess, isError: business_variantsError } = useQuery({
//         queryKey: ["get-business-variants", businessId],
//         queryFn: () => getVariantsByBusiness(`${businessId}`),
//         refetchOnWindowFocus: false,
//         retry: false,
//         enabled: businessId > 0
//     });

//     const { data: customers, isSuccess: customersSuccess, isError: customersError } = useQuery({
//         queryKey: ["get-customers", businessId],
//         queryFn: () => getCustomers({ businessId: Number(businessId) }),
//         refetchOnWindowFocus: false,
//         retry: false,
//         enabled: businessId > 0
//     });

//     const { data: couponsData, isSuccess: couponsSuccess, isError: couponsError } = useQuery({
//         queryKey: ["get-coupons", businessId],
//         queryFn: () => getProductCoupons({ businessId: Number(businessId) }),
//         enabled: businessId > 0,
//         refetchOnWindowFocus: false,
//         retry: false,
//     });

//     const { data: discountsData, isSuccess: discountSuccess, isError: discountError } = useQuery({
//         queryKey: ["get-discounts", businessId],
//         queryFn: () => getProductDiscounts({ businessId }),
//         enabled: businessId > 0,
//         refetchOnWindowFocus: false,
//         retry: false
//     });

//     const { data: taxesData, isSuccess: taxesSuccess, isError: taxesError } = useQuery({
//         queryKey: ["get-taxes", businessId],
//         queryFn: () => getProductTaxes({ businessId }),
//         enabled: businessId > 0,
//         refetchOnWindowFocus: false,
//         retry: false
//     });

//     const { data: productsWithDiscounts, isSuccess: productsDiscountsSuccess } = useQuery({
//         queryKey: ["get-products-discounts", businessId],
//         queryFn: async () => {
//             const data = await getDiscountsByBusinessId({ business_id: Number(businessId) });
//             if (data && businessId) await discountCache.cacheDiscounts(data, businessId.toString());
//             return data;
//         },
//         enabled: businessId > 0,
//         refetchOnWindowFocus: false,
//         retry: false
//     });

//     const { data: productsWithTaxes, isSuccess: productsTaxesSuccess } = useQuery({
//         queryKey: ["get-products-taxes", businessId],
//         queryFn: async () => {
//             const data = await getTaxesByBusinessId({ business_id: Number(businessId) });
//             if (data && businessId) await taxCache.cacheTaxes(data, businessId.toString());
//             return data;
//         },
//         enabled: businessId > 0,
//         refetchOnWindowFocus: false,
//         retry: false
//     });

//     const { data: productsWithCoupons, isSuccess: productsCouponsSuccess } = useQuery({
//         queryKey: ["get-products-coupons", businessId],
//         queryFn: async () => {
//             const data = await getCouponsByBusinessId({ business_id: Number(businessId) });
//             if (data && businessId) await couponCache.cacheCoupons(data, businessId.toString());
//             return data;
//         },
//         enabled: businessId > 0,
//         refetchOnWindowFocus: false,
//         retry: false
//     });

//     const { data: categories, isSuccess: categoriesSuccess, isError: categoriesError } = useQuery({
//         queryKey: ["get-categories", businessId],
//         queryFn: () => getProductCategories(businessId),
//         enabled: businessId !== 0,
//         refetchOnWindowFocus: false,
//         retry: false
//     });

//     // Memoized data processing
//     const productwithcoupons = useMemo(() => {
//         if (productsWithCoupons && productsCouponsSuccess) return productsWithCoupons?.products_with_coupons;
//         return [];
//     }, [productsWithCoupons, productsCouponsSuccess]);

//     const productwithtaxes = useMemo(() => {
//         if (productsWithTaxes && productsTaxesSuccess) return productsWithTaxes?.products_with_taxes;
//         return [];
//     }, [productsWithTaxes, productsTaxesSuccess]);

//     const productswithdiscounts = useMemo(() => {
//         if (productsWithDiscounts && productsDiscountsSuccess) return productsWithDiscounts?.products_with_discounts;
//         return [];
//     }, [productsWithDiscounts, productsDiscountsSuccess]);

//     const userProducts = useMemo(() => {
//         if (user_productsSuccess && !user_productsError) return user_products?.products;
//         return [];
//     }, [user_products, user_productsSuccess, user_productsError]);

//     const userProductsWithIds = useMemo(() => {
//         return userProducts?.map((item: ProductResponseObj) => ({ id: item?.id, productName: item?.name, brand: item?.brand }))
//     }, [userProducts]);

//     const uniqueBrands = useMemo(() => {
//         const brands = (userProductsWithIds || [])
//             .map((i: { id: number; productName: string; brand: string }) => i?.brand?.toLowerCase())
//             .filter(Boolean);
//         return Array.from(new Set(brands));
//     }, [userProductsWithIds]) as Array<string>;

//     const variantData = useMemo(() => {
//         if (variant_success && !variant_error) return variants_data?.variants;
//         return [];
//     }, [variants_data, variant_success, variant_error]);

//     const categoriesData = useMemo(() => {
//         if (categoriesSuccess && !categoriesError) return categories?.categories || [];
//         return [];
//     }, [categories, categoriesSuccess, categoriesError]);

//     const businessVariantsData = useMemo(() => {
//         if (business_variants && business_variantsSuccess && !business_variantsError) return business_variants?.variants ?? [];
//         return [];
//     }, [business_variants, business_variantsSuccess, business_variantsError]);

//     const productIdToBrand = useMemo(() => {
//         const map = new Map<number, string>();
//         (userProducts || []).forEach((p: ProductResponseObj) => {
//             map.set(p.id, (p.brand || "").toLowerCase());
//         });
//         return map;
//     }, [userProducts]);

//     const productIdToCategoryName = useMemo(() => {
//         const map = new Map<number, string>();
//         (userProducts || []).forEach((p: ProductResponseObj) => {
//             map.set(p.id, (p.category_name || "").toLowerCase());
//         });
//         return map;
//     }, [userProducts]);

//     const filteredVariants = useMemo(() => {
//         const skuQ = skuFilter.trim().toLowerCase();
//         return (variantsArr || []).filter((v: ProductVariantResponseObject) => {
//             const brand = productIdToBrand.get(v.product_id) || "";
//             const category = productIdToCategoryName.get(v.product_id) || "";
//             const sku = (v.sku || "").toLowerCase();

//             if (filterBrand !== "all" && brand !== filterBrand) return false;
//             if (filterCategory !== "all" && category !== filterCategory) return false;
//             if (skuQ && !sku.includes(skuQ)) return false;
//             return true;
//         });
//     }, [variantsArr, filterBrand, filterCategory, skuFilter, productIdToBrand, productIdToCategoryName]);

//     const customersData = useMemo(() => {
//         if (customersSuccess && !customersError) return customers?.customers;
//         return [];
//     }, [customers, customersSuccess, customersError]);

//     useEffect(() => {
//         setOfflineCustomers(customersData, businessId);
//     }, [customersData, setOfflineCustomers, businessId]);

//     const couponsdata = useMemo(() => {
//         if (couponsSuccess && !couponsError) return couponsData?.coupons as CouponResponseObj[];
//         return [];
//     }, [couponsData, couponsSuccess, couponsError]);

//     const taxesdata = useMemo(() => {
//         if (taxesSuccess && !taxesError) return taxesData?.taxes as TaxesResponseObj[];
//         return [];
//     }, [taxesData, taxesSuccess, taxesError])

//     const discountsdata = useMemo(() => {
//         if (discountSuccess && !discountError) return discountsData?.discounts as DiscountResponseObj[];
//         return [];
//     }, [discountsData, discountSuccess, discountError]);

//     useEffect(() => {
//         if (searchParams.get("itemCount")) {
//             const itemCount = Number(searchParams.get("itemCount"));
//             setCurrentItemCount(itemCount);
//             const newArr = filteredVariants?.slice(itemCount * TOTAL_DISPLAY_ITEM, (itemCount + 1) * TOTAL_DISPLAY_ITEM);
//             setCurrentVariants(newArr);
//         } else {
//             setCurrentVariants(filteredVariants);
//         }
//     }, [searchParams, filteredVariants]);

//     useEffect(() => {
//         if (!searchParams.get("itemCount")) {
//             setCurrentVariants(filteredVariants);
//         }
//     }, [filteredVariants, searchParams]);

//     useEffect(() => {
//         setCurrentItemCount(0);
//     }, [filterCategory, filterBrand, skuFilter]);

//     useEffect(() => {
//         if (variantData && businessVariantsData) {
//             switch (productId) {
//                 case "all":
//                     setVariantsArr(businessVariantsData);
//                     productCache.cacheVariants(businessVariantsData, `${businessId}`);
//                     break;
//                 default:
//                     setVariantsArr(variantData);
//                     productCache.cacheVariants(variantData, `${businessId}`, productId);
//                     break;
//             }
//         }
//     }, [variantData, businessVariantsData, productId, businessId]);

//     useEffect(() => {
//         const loadCachedData = async () => {
//             if (!navigator.onLine && businessId) {
//                 const businessIdStr = businessId.toString();
//                 await Promise.all([
//                     discountCache.getCachedDiscounts(businessIdStr),
//                     taxCache.getCachedTaxes(businessIdStr),
//                     couponCache.getCachedCoupons(businessIdStr)
//                 ]);
//             }
//         };
//         loadCachedData();
//     }, [businessId]);

//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             setIsOnline(navigator.onLine);
//         }
//     }, []);

//     const handlePagination = (e: React.MouseEvent<HTMLOrSVGElement | HTMLElement>) => {
//         const target = e.currentTarget;
//         const dataId = target.dataset.id;
//         const maxPages = Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM);

//         if (dataId === "next-btn" && currentItemCount < maxPages - 1) {
//             setCurrentItemCount(prev => prev + 1);
//         } else if (dataId === "prev-btn" && currentItemCount > 0) {
//             setCurrentItemCount(prev => prev - 1);
//         }
//     }

//     const handlePayNow = async () => {
//         if (selectedVariants.length === 0) {
//             toast.error("Please add items to your order before proceeding");
//             return;
//         }

//         if (!selectedCustomer) {
//             toast.error("Please select a customer");
//             return;
//         }

//         if (!storeType) {
//             toast.error("Please select store type (In Store or Online)");
//             return;
//         }

//         const needed_items_data = selectedVariants?.map((item) => {
//             return {
//                 variant_id: item.id,
//                 quantity: item.quantity,
//                 unit_price: +item.selling_price,
//                 total_price: +item.selling_price * item.quantity,
//             }
//         });

//         let totalMatchedDiscount = 0;
//         let totalMatchedCoupon = 0;
//         let totalMatchedTax = 0;

//         selectedVariants.forEach(variant => {
//             const productId = variant.product_id;
//             const variantTotal = variant.quantity * Number(variant.selling_price);

//             const discounts = matchedDiscounts.get(productId);
//             if (discounts && discounts.length > 0) {
//                 discounts.forEach((discount: any) => {
//                     if ('percentage' in discount && discount.percentage) {
//                         totalMatchedDiscount += (variantTotal * Number(discount.percentage)) / 100;
//                     } else if ('amount' in discount && discount.amount) {
//                         totalMatchedDiscount += Number(discount.amount) * variant.quantity;
//                     }
//                 });
//             }

//             const coupons = matchedCoupons.get(productId);
//             if (coupons && coupons.length > 0) {
//                 coupons.forEach((coupon: any) => {
//                     if ("discount_percentage" in coupon && coupon?.discount_percentage) {
//                         totalMatchedCoupon += (variantTotal * Number(coupon.discount_percentage)) / 100;
//                     } else if ("discount_amount" in coupon && coupon?.discount_amount) {
//                         totalMatchedCoupon += Number(coupon.discount_amount) * variant.quantity;
//                     }
//                 });
//             }

//             const taxes = matchedTaxes.get(productId);
//             if (taxes && taxes.length > 0) {
//                 taxes.forEach((tax: any) => {
//                     totalMatchedTax += Number(tax.rate / 100) * subtotal;
//                 });
//             }
//         });

//         const orderData = prepareOrderData(
//             needed_items_data,
//             selectedCustomer,
//             storeType,
//             +userId,
//             +businessId,
//             +branchId,
//             undefined,
//             undefined,
//             selectedCoupon || undefined,
//             undefined,
//             "Order Created"
//         );

//         orderData.discount = totalMatchedDiscount;
//         orderData.coupon = totalMatchedCoupon;
//         orderData.taxes = totalMatchedTax;

//         setPendingOrderData(orderData);
//         setShowOrderConfirmation(true);
//     }

//     const handleConfirmOrder = async (paymentMethod: string | string[] | Array<[string, number]>) => {
//         if (!pendingOrderData) return;

//         const subtotal = pendingOrderData.items.reduce((sum, item) => sum + item.total_price, 0);
//         const discountAmount = pendingOrderData.discount || 0;
//         const taxAmount = pendingOrderData.taxes || 0;
//         const couponAmount = pendingOrderData.coupon || 0;
//         const totalAmount = subtotal - discountAmount - couponAmount + taxAmount;

//         const orderDataWithPayment = addPaymentToOrder(
//             pendingOrderData,
//             paymentMethod,
//             totalAmount
//         );

//         if (isOnline) {
//             try {
//                 const success = await submitOfflineOrder(orderDataWithPayment) as { success: boolean; _data: FallbackSalesResponse };
//                 if (success?.success) {
//                     toast.success(`Order created successfully! Total: ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(totalAmount)}`);
//                     await queryClient.invalidateQueries({
//                         queryKey: ["get-business-variants", businessId],
//                     });
//                     setInvoiceData(success._data);
//                     await clearCart();
//                     setSelectedDiscount(null);
//                     setSelectedTax(null);
//                     setSelectedCoupon(null);
//                     setShowOrderConfirmation(false);
//                     setPendingOrderData(null);
//                 } else {
//                     toast.error("Failed to create order. Please try again.");
//                 }
//             } catch (error) {
//                 console.error('Online order submission failed:', error);
//                 toast.error("Failed to create order. Please try again.");
//             }
//         } else {
//             const result = await createOrder(orderDataWithPayment);
//             if (result.success) {
//                 toast.info("Order saved offline. Will sync when connection is restored.");
//                 await clearCart();
//                 setSelectedDiscount(null);
//                 setSelectedTax(null);
//                 setSelectedCoupon(null);
//                 setShowOrderConfirmation(false);
//                 setPendingOrderData(null);
//                 if (offlineCustomers?.length <= 0) return;
//                 const customer_data = offlineCustomers?.find(cs => cs?.id === (orderDataWithPayment?.customer_id ? orderDataWithPayment?.customer_id : 0));
//                 const invoiceData = {
//                     ...result.data,
//                     customer_name: customer_data?.name || "Walk-In",
//                     customer_phone: customer_data?.phone || "N/A",
//                     customer_email: customer_data?.email || "N/A",
//                 }
//                 handlePendingView(invoiceData);
//             } else {
//                 toast.error("Failed to save order offline. Please try again.");
//             }
//         }
//     }

//     const handleCloseOrderConfirmation = () => {
//         setShowOrderConfirmation(false);
//         setPendingOrderData(null);
//     }

//     const handleSaveDraft = async () => {
//         if (selectedVariants.length === 0) {
//             toast.error("Add items to cart before saving a draft");
//             return;
//         }
//         setIsSavingDraft(true);
//         try {
//             const subtotal = selectedVariants.reduce((sum, v) => sum + v.quantity * Number(v.selling_price), 0);
//             let totalMatchedDiscount = 0;
//             let totalMatchedCoupon = 0;
//             let totalMatchedTax = 0;
//             selectedVariants.forEach(variant => {
//                 const pid = variant.product_id;
//                 const variantTotal = variant.quantity * Number(variant.selling_price);
//                 const discounts = matchedDiscounts.get(pid);
//                 if (discounts?.length) {
//                     discounts.forEach((d: any) => {
//                         if (d?.discount_type === "percentage") {
//                             totalMatchedDiscount += (variantTotal * Number(d.percentage)) / 100;
//                         } else if (d?.discount_type === "fixed-amount") {
//                             totalMatchedDiscount += Number(d.amount) * variant.quantity;
//                         } else {
//                             totalMatchedDiscount += Number(d.amount) * variant.quantity;
//                         }
//                     });
//                 }
//                 const coupons = matchedCoupons.get(pid);
//                 if (coupons?.length) {
//                     coupons.forEach((c: any) => {
//                         if (c?.coupons_type === "percentage") {
//                             totalMatchedCoupon += (variantTotal * Number(c.discount_percentage)) / 100;
//                         } else if (c?.coupons_type === "fixed-amount") {
//                             totalMatchedCoupon += Number(c.discount_amount) * variant.quantity;
//                         } else {
//                             totalMatchedCoupon += Number(c.discount_amount) * variant.quantity;
//                         }
//                     });
//                 }
//                 const taxes = matchedTaxes.get(pid);
//                 if (taxes?.length) {
//                     taxes.forEach((t: any) => {
//                         totalMatchedTax += Number(t.rate) * variant.quantity;
//                     });
//                 }
//             });

//             const total = subtotal - totalMatchedDiscount - totalMatchedCoupon + totalMatchedTax;

//             const draftId = `draft_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//             const draft = {
//                 id: draftId,
//                 name: `Draft ${new Date().toLocaleString()}`,
//                 businessId: Number(businessId),
//                 branchId: Number(branchId),
//                 userId: Number(userId),
//                 createdAt: new Date().toISOString(),
//                 cart: selectedVariants,
//                 customer: selectedCustomer,
//                 storeType,
//                 matchedDiscounts,
//                 matchedTaxes,
//                 matchedCoupons,
//                 totals: {
//                     subtotal,
//                     discount: totalMatchedDiscount + totalMatchedCoupon,
//                     tax: totalMatchedTax,
//                     total
//                 }
//             };

//             const ok = await cartUtils.saveCartDraft(draft);
//             if (ok) {
//                 toast.success("Cart saved to drafts");
//                 await setSelectedVariants([]);
//             } else {
//                 toast.error("Failed to save draft");
//             }
//         } catch (e) {
//             console.error(e);
//             toast.error("Unexpected error while saving draft");
//         } finally {
//             setIsSavingDraft(false);
//         }
//     }

//     const handleLoadLatestDraft = async () => {
//         setShowDraftSelectionModal(true);
//     }

//     const handleDraftSelected = async (draft: any) => {
//         try {
//             setIsLoadingDraft(true);
//             await setSelectedVariants(draft.cart || []);
//             if (draft.customer) await setSelectedCustomer(String(draft.customer));
//             if (draft.storeType) await setStoreType(String(draft.storeType));
//             if (draft.matchedDiscounts) await updateMatchedDiscounts(draft.matchedDiscounts);
//             if (draft.matchedTaxes) await updateMatchedTaxes(draft.matchedTaxes);
//             if (draft.matchedCoupons) await updateMatchedCoupons(draft.matchedCoupons);
//             toast.success("Draft loaded into cart");
//         } catch (err) {
//             console.error(err);
//             toast.error("Unexpected error while loading draft");
//         } finally {
//             setIsLoadingDraft(false);
//         }
//     }

//     const handleSelectedVariant = async (e: React.MouseEvent<HTMLButtonElement>) => {
//         const target = e.currentTarget;
//         try {
//             const items = JSON.parse(`${target.dataset.item}`);
//             const itemQuantity = JSON.parse(`${target.dataset.itemQuantity}`);

//             const productId = items.product_id;

//             if (productId) {
//                 if (productswithdiscounts && productswithdiscounts.length > 0) {
//                     const matchingDiscounts = productswithdiscounts.filter((discount: any) =>
//                         discount.product_id && discount.product_id === productId
//                     );

//                     if (matchingDiscounts.length > 0 && matchingDiscounts?.some((item: any) => item.discount_id !== null)) {
//                         const newMap = new Map(matchedDiscounts);
//                         newMap.set(productId, matchingDiscounts);
//                         await updateMatchedDiscounts(newMap);
//                         toast.success(`Applied ${matchingDiscounts.length} discount(s) to this product`, {
//                             description: matchingDiscounts.map((d: any) => d.name).join(', '),
//                             duration: 3000
//                         });
//                     }
//                 }

//                 if (productwithtaxes && productwithtaxes.length > 0) {
//                     const matchingTaxes = productwithtaxes.filter((tax: any) =>
//                         tax.product_id && tax.product_id === productId
//                     );

//                     if (matchingTaxes.length > 0 && matchingTaxes?.some((item: any) => item.tax_id !== null)) {
//                         const newMap = new Map(matchedTaxes);
//                         newMap.set(productId, matchingTaxes);
//                         await updateMatchedTaxes(newMap);
//                         toast.info(`Applied ${matchingTaxes.length} tax(es) to this product`, {
//                             description: matchingTaxes.map((t: any) => t.name).join(', '),
//                             duration: 3000
//                         });
//                     }
//                 }

//                 if (productwithcoupons && productwithcoupons.length > 0) {
//                     const matchingCoupons = productwithcoupons.filter((coupon: any) =>
//                         coupon.product_id && coupon.product_id === productId
//                     );

//                     if (matchingCoupons.length > 0 && matchingCoupons?.some((item: any) => item.coupon_id !== null)) {
//                         const newMap = new Map(matchedCoupons);
//                         newMap.set(productId, matchingCoupons);
//                         await updateMatchedCoupons(newMap);
//                         toast.success(`${matchingCoupons.length} coupon(s) available for this product`, {
//                             description: matchingCoupons.map((c: any) => c.code).join(', '),
//                             duration: 3000
//                         });
//                     }
//                 }
//             }

//             let newCart: (ProductVariantResponseObject & { maxQuantity?: number })[];
//             if (selectedVariants.some(item => item.id === items.id)) {
//                 newCart = selectedVariants.map(item =>
//                     item.id === items.id ? { ...item, quantity: item.quantity < +itemQuantity ? item.quantity + 1 : item.quantity } : item
//                 );
//             } else {
//                 newCart = [...selectedVariants, { ...items, quantity: 1, maxQuantity: itemQuantity }];
//             }

//             await setSelectedVariants(newCart);
//         } catch (err) {
//             console.log("Unexpected error occurred while trying to parse stringified Object");
//             console.info(err);
//         }
//     }

//     const handleQuantityChange = async (variantId: number, newQuantity: number, maxQuantity: number) => {
//         if (newQuantity <= 0) {
//             await handleRemoveVariant(variantId);
//             return;
//         }

//         if (newQuantity > maxQuantity) {
//             toast.info("Available Item Limit Reached", { className: "animate-pulse" });
//             return;
//         }

//         const newCart = selectedVariants.map(item =>
//             item.id === variantId ? { ...item, quantity: newQuantity } : item
//         );
//         await setSelectedVariants(newCart);
//     }

//     const handleCalculatorUpdate = (variantId: number, val: number, max: number) => {
//         const target = selectedVariants.find(v => v.id === variantId);
//         setCalculatorContext({
//             variantId,
//             currentQuantity: Math.max(1, val || 1),
//             maxQuantity: max,
//             unitPrice: Number(target?.selling_price || 0)
//         });
//         setIsQuantityCalculatorOpen(true);
//     }

//     const handleRemoveVariant = async (variantId: number) => {
//         const variantToRemove = selectedVariants.find(item => item.id === variantId);
//         if (variantToRemove?.product_id) {
//             const productId = variantToRemove.product_id;

//             const otherVariantsWithSameProduct = selectedVariants.filter(
//                 item => item.id !== variantId && item.product_id === productId
//             );

//             if (otherVariantsWithSameProduct.length === 0) {
//                 const newDiscountsMap = new Map(matchedDiscounts);
//                 newDiscountsMap.delete(productId);
//                 await updateMatchedDiscounts(newDiscountsMap);

//                 const newTaxesMap = new Map(matchedTaxes);
//                 newTaxesMap.delete(productId);
//                 await updateMatchedTaxes(newTaxesMap);

//                 const newCouponsMap = new Map(matchedCoupons);
//                 newCouponsMap.delete(productId);
//                 await updateMatchedCoupons(newCouponsMap);
//             }
//         }

//         const newCart = selectedVariants.filter(item => item.id !== variantId);
//         await setSelectedVariants(newCart);
//     }

//     const calculateOrderTotals = () => {
//         const subtotal = selectedVariants.reduce((sum, variant) => {
//             return sum + (variant.quantity * Number(variant.selling_price));
//         }, 0);

//         let totalDiscountAmount = 0;
//         selectedVariants.forEach(variant => {
//             const productId = variant.product_id;
//             const discounts = matchedDiscounts.get(productId);

//             if (discounts && discounts.length > 0) {
//                 discounts.forEach((discount: any) => {
//                     const variantTotal = variant.quantity * Number(variant.selling_price);
//                     if ("percentage" in discount && discount?.percentage) {
//                         totalDiscountAmount += (variantTotal * Number(discount.percentage)) / 100;
//                     } else if ("amount" in discount && discount?.amount) {
//                         totalDiscountAmount += Number(discount.amount) * variant.quantity;
//                     }
//                 });
//             }
//         });

//         let totalCouponAmount = 0;
//         selectedVariants.forEach(variant => {
//             const productId = variant.product_id;
//             const coupons = matchedCoupons.get(productId);

//             if (coupons && coupons.length > 0) {
//                 coupons.forEach((coupon: any) => {
//                     const variantTotal = variant.quantity * Number(variant.selling_price);
//                     if ("discount_percentage" in coupon && coupon?.discount_percentage) {
//                         totalCouponAmount += (variantTotal * Number(coupon.discount_percentage)) / 100;
//                     } else if ("discount_amount" in coupon && coupon?.discount_amount) {
//                         totalCouponAmount += Number(coupon.discount_amount) * variant.quantity;
//                     }
//                 });
//             }
//         });

//         let totalTaxAmount = 0;
//         selectedVariants.forEach(variant => {
//             const productId = variant.product_id;
//             const taxes = matchedTaxes.get(productId);

//             if (taxes && taxes.length > 0) {
//                 taxes.forEach((tax: any) => {
//                     totalTaxAmount += Number(tax.rate / 100) * subtotal;
//                 });
//             }
//         });

//         const tax = totalTaxAmount;
//         const discountAmount = totalDiscountAmount;
//         const couponAmount = totalCouponAmount;
//         const finalSubtotal = subtotal - discountAmount - couponAmount;
//         const total = finalSubtotal + tax;

//         return { subtotal, tax, total, discountAmount, couponAmount, finalSubtotal };
//     }

//     const { subtotal, tax, total, discountAmount, couponAmount } = calculateOrderTotals();

//     useEffect(() => {
//         router.push(`${pathname}?itemCount=${currentItemCount}`);
//     }, [currentItemCount, router, pathname]);

//     const handleManualSync = async () => {
//         setIsSyncing(true);
//         try {
//             toast.info(`Syncing ${pendingOrders.length} pending orders...`);
//             await syncPendingOrders(submitOfflineOrder);
//             toast.success('Orders synced successfully');
//         } catch (error) {
//             console.log(error);
//             toast.error('Failed to sync orders');
//         } finally {
//             setIsSyncing(false);
//         }
//     };

//     useEffect(() => {
//         const handleOnline = () => {
//             setIsOnline(true);
//             toast.success('Connection restored');
//         };

//         const handleOffline = () => {
//             setIsOnline(false);
//             toast.warning('You are now offline. Orders will be saved locally.');
//         };

//         if (typeof window !== 'undefined') {
//             window.addEventListener('online', handleOnline);
//             window.addEventListener('offline', handleOffline);

//             return () => {
//                 window.removeEventListener('online', handleOnline);
//                 window.removeEventListener('offline', handleOffline);
//             };
//         }
//     }, []);

//     const sectionVariant: Variants = {
//         hidden: {
//             opacity: 0,
//             y: 20,
//             transition: {
//                 duration: 0.3,
//                 ease: [0.32, 0.72, 0, 1]
//             }
//         },
//         visible: {
//             opacity: 1,
//             y: 0,
//             transition: {
//                 duration: 0.4,
//                 ease: [0.32, 0.72, 0, 1],
//                 staggerChildren: 0.05
//             }
//         },
//         exit: {
//             opacity: 0,
//             y: -20,
//             transition: {
//                 duration: 0.25,
//                 ease: [0.32, 0.72, 0, 1]
//             }
//         }
//     };

//     const itemVariant: Variants = {
//         hidden: { y: 20, opacity: 0 },
//         visible: {
//             y: 0,
//             opacity: 1,
//             transition: {
//                 duration: 0.4,
//                 ease: [0.32, 0.72, 0, 1]
//             }
//         }
//     };

//     if (!isClient) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <div className="text-gray-500">Loading...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="w-full">
//             <div className="flex flex-col gap-y-4 sm:gap-y-6">
//                 {/* Header Section */}
//                 <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between px-3 sm:px-4 lg:px-6">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
//                             <Sparkles className="w-6 h-6 text-white" />
//                         </div>
//                         <div>
//                             <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                                 Staff Sales Portal
//                             </h1>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">Modern product catalog & checkout</p>
//                         </div>
//                     </div>

//                     {pendingOrders.length > 0 && (
//                         <div className="flex items-center gap-2">
//                             <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
//                                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
//                                 {pendingOrders.length} pending
//                             </div>
//                             {isOnline && (
//                                 <button
//                                     onClick={handleManualSync}
//                                     disabled={isSyncing}
//                                     className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSyncing
//                                             ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
//                                             : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
//                                         }`}
//                                 >
//                                     {isSyncing ? 'Syncing...' : 'Sync Now'}
//                                 </button>
//                             )}
//                             <button
//                                 onClick={handleOpenPendingModal}
//                                 className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
//                             >
//                                 View Orders
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Filters Section with Modern Design */}
//                 <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-3 sm:px-4 lg:px-6"
//                 >
//                     <div className="flex flex-wrap items-center gap-2 w-full">
//                         <Select value={`${productId}`} onValueChange={(value) => setProductId(value)}>
//                             <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
//                                 <SelectValue placeholder="Select Product" />
//                             </SelectTrigger>
//                             {userProducts.length ? (
//                                 <SelectContent>
//                                     <SelectItem value="all">All Products</SelectItem>
//                                     {userProducts.map((product: SingleProductType, index: number) => (
//                                         <SelectItem key={`product-${index}`} value={`${product.id}`}>{product.name}</SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             ) : (
//                                 <SelectContent>
//                                     <SelectItem disabled value="no_product">No Products Found</SelectItem>
//                                 </SelectContent>
//                             )}
//                         </Select>

//                         <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v)}>
//                             <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
//                                 <SelectValue placeholder="Category" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="all">All Categories</SelectItem>
//                                 {categoriesData?.length ? categoriesData?.map((item: CategoryPayload) => (
//                                     <SelectItem key={`category-${item?.id}`} value={`${item?.name?.toLowerCase()}`}>{item?.name}</SelectItem>
//                                 )) : <SelectItem value="0">No Categories</SelectItem>}
//                             </SelectContent>
//                         </Select>

//                         <Select value={filterBrand} onValueChange={(v) => setFilterBrand(v)}>
//                             <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
//                                 <SelectValue placeholder="Brand" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="all">All Brands</SelectItem>
//                                 {uniqueBrands?.length ? uniqueBrands?.map((brand: string, index: number) => (
//                                     <SelectItem key={`brand-${index}`} value={`${brand}`}>{brand}</SelectItem>
//                                 )) : (
//                                     <SelectItem value="0">No Brands</SelectItem>
//                                 )}
//                             </SelectContent>
//                         </Select>

//                         <input
//                             type="text"
//                             value={skuFilter}
//                             onChange={(e) => setSkuFilter(e.target.value)}
//                             placeholder="Search by SKU..."
//                             className="flex-1 min-w-[200px] text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
//                         />
//                     </div>

//                     <button
//                         onClick={() => setShowSettingsModal(!showSettingsModal)}
//                         className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 group whitespace-nowrap"
//                     >
//                         <div className="p-1 bg-white/20 rounded-md group-hover:bg-white/30 transition-colors">
//                             <Settings size={16} />
//                         </div>
//                         <span className="text-sm hidden sm:inline">Settings</span>
//                     </button>

//                     {/* Settings Modal - Similar to sales component */}
//                     <AnimatePresence>
//                         {showSettingsModal && (
//                             <motion.div
//                                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                                 transition={{ duration: 0.2 }}
//                                 className="absolute top-32 right-6 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
//                             >
//                                 <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
//                                     <div className="flex items-center gap-2">
//                                         <Settings size={16} />
//                                         <div>
//                                             <h3 className="font-semibold text-sm">Sales Settings</h3>
//                                             <p className="text-xs text-white/80">Configure features</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="p-4">
//                                     <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                                         <div className="flex items-center gap-3">
//                                             <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
//                                                 <Tag size={16} className="text-green-600 dark:text-green-400" />
//                                             </div>
//                                             <div>
//                                                 <div className="font-medium text-sm">Coupons</div>
//                                                 <div className="text-xs text-gray-500 dark:text-gray-400">Enable coupon management</div>
//                                             </div>
//                                         </div>
//                                         <Switch
//                                             checked={couponsEnabled}
//                                             onCheckedChange={setCouponsEnabled}
//                                             className="data-[state=checked]:bg-green-600"
//                                         />
//                                     </div>
//                                 </div>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </motion.div>

//                 {/* Mobile Cart Button */}
//                 {isPhoneView && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="fixed bottom-20 right-4 z-50"
//                     >
//                         <button
//                             onClick={() => setIsMobileCartOpen(true)}
//                             className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 active:scale-95"
//                         >
//                             <ShoppingCart size={24} />
//                             {selectedVariants.length > 0 && (
//                                 <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center animate-pulse ring-4 ring-white">
//                                     {selectedVariants.reduce((total, item) => total + item.quantity, 0)}
//                                 </div>
//                             )}
//                         </button>
//                     </motion.div>
//                 )}

//                 {/* Mobile Cart Slide-out */}
//                 <AnimatePresence>
//                     {isMobileCartOpen && isPhoneView && (
//                         <>
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 onClick={() => setIsMobileCartOpen(false)}
//                                 className="fixed inset-0 bg-black/50 z-50"
//                             />

//                             <motion.div
//                                 initial={{ x: "100%" }}
//                                 animate={{ x: 0 }}
//                                 exit={{ x: "100%" }}
//                                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
//                                 className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
//                             >
//                                 <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex items-center gap-3">
//                                             <ShoppingCart size={18} />
//                                             <div>
//                                                 <h2 className="text-lg font-semibold">Your Cart</h2>
//                                                 <p className="text-sm text-white/80">
//                                                     {selectedVariants.length} item{selectedVariants.length !== 1 ? 's' : ''}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                         <button
//                                             onClick={() => setIsMobileCartOpen(false)}
//                                             className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
//                                         >
//                                             ✕
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="flex-1 overflow-y-auto p-4" style={hiddenScrollbar}>
//                                     {selectedVariants.length > 0 ? (
//                                         <div className="space-y-3">
//                                             {selectedVariants.map((variant, index) => (
//                                                 <div key={`mobile-cart-${index}`} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
//                                                     <div className="flex gap-3">
//                                                         <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
//                                                             {variant?.image_url?.[0]?.secure_url ? (
//                                                                 <Image
//                                                                     width={100}
//                                                                     height={100}
//                                                                     className="w-full h-full object-cover"
//                                                                     src={variant.image_url[0].secure_url}
//                                                                     alt={variant.sku}
//                                                                 />
//                                                             ) : (
//                                                                 <div className="w-full h-full flex items-center justify-center">
//                                                                     <PiShoppingCartSimpleBold size={20} className="text-gray-400" />
//                                                                 </div>
//                                                             )}
//                                                         </div>

//                                                         <div className="flex-1">
//                                                             <h4 className="font-medium text-sm">{variant.sku}</h4>
//                                                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                                                                 {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(+variant?.selling_price || 0)}
//                                                             </p>

//                                                             <div className="flex items-center justify-between mt-2">
//                                                                 <div className="flex items-center gap-2">
//                                                                     <button onClick={() => handleQuantityChange(variant.id, variant.quantity - 1, +variant.maxQuantity!)} className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300">
//                                                                         <PiMinusBold size={10} className="mx-auto" />
//                                                                     </button>
//                                                                     <span className="text-sm font-medium w-8 text-center">{variant.quantity}</span>
//                                                                     <button onClick={() => handleQuantityChange(variant.id, variant.quantity + 1, +variant.maxQuantity!)} className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
//                                                                         <PiPlusBold size={10} className="mx-auto" />
//                                                                     </button>
//                                                                 </div>

//                                                                 <button onClick={() => handleRemoveVariant(variant.id)} className="w-6 h-6 rounded text-red-500 hover:bg-red-50">
//                                                                     <Trash size={12} className="mx-auto" />
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     ) : (
//                                         <div className="flex flex-col items-center justify-center h-40">
//                                             <ShoppingCart size={40} className="text-gray-300 mb-2" />
//                                             <p className="text-gray-500 text-sm">Your cart is empty</p>
//                                         </div>
//                                     )}
//                                 </div>

//                                 {selectedVariants.length > 0 && (
//                                     <div className="border-t p-4 space-y-3">
//                                         <div className="space-y-2 text-sm">
//                                             <div className="flex justify-between">
//                                                 <span>Subtotal</span>
//                                                 <span className="font-medium">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(subtotal)}</span>
//                                             </div>
//                                             {discountAmount > 0 && (
//                                                 <div className="flex justify-between text-green-600">
//                                                     <span>Discounts</span>
//                                                     <span>-{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(discountAmount)}</span>
//                                                 </div>
//                                             )}
//                                             {tax > 0 && (
//                                                 <div className="flex justify-between">
//                                                     <span>Tax</span>
//                                                     <span>+{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(tax)}</span>
//                                                 </div>
//                                             )}
//                                             <div className="flex justify-between font-bold text-base border-t pt-2">
//                                                 <span>Total</span>
//                                                 <span className="text-purple-600">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(total)}</span>
//                                             </div>
//                                         </div>

//                                         <button
//                                             onClick={() => {
//                                                 setIsMobileCartOpen(false);
//                                                 handlePayNow();
//                                             }}
//                                             className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg"
//                                         >
//                                             Proceed to Payment
//                                         </button>
//                                     </div>
//                                 )}
//                             </motion.div>
//                         </>
//                     )}
//                 </AnimatePresence>

//                 {/* Main Content Grid */}
//                 <motion.div
//                     variants={sectionVariant}
//                     initial="hidden"
//                     animate="visible"
//                     className={cn(`grid grid-cols-1 xl:grid-cols-[65%_35%] gap-6 px-3 sm:px-4 lg:px-6 ${isPhoneView ? 'mb-24' : ''}`)}
//                 >
//                     {/* Product Catalog */}
//                     <div className="w-full bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
//                         {currentVariants?.length > 0 ? (
//                             <div className="flex flex-col gap-4">
//                                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
//                                     {currentVariants.map((variant: ProductVariantResponseObject, index: number) => (
//                                         <motion.div
//                                             key={`product-${index}`}
//                                             variants={itemVariant}
//                                             whileHover={{ scale: 1.03, y: -5 }}
//                                             whileTap={{ scale: 0.98 }}
//                                             className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
//                                         >
//                                             {/* Product Image */}
//                                             <div className="relative w-full h-32 sm:h-40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden">
//                                                 {variant.image_url && variant.image_url.length > 0 ? (
//                                                     <Image
//                                                         width={300}
//                                                         height={300}
//                                                         className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
//                                                         src={variant.image_url[0]?.secure_url}
//                                                         alt={variant?.sku ?? "Product"}
//                                                     />
//                                                 ) : (
//                                                     <div className="h-full w-full flex items-center justify-center">
//                                                         <PiShoppingCartSimpleBold size={40} className="text-purple-200 dark:text-purple-700" />
//                                                     </div>
//                                                 )}

//                                                 {/* Stock Badge */}
//                                                 <div className="absolute top-2 right-2">
//                                                     <span className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${variant.quantity > variant.threshold
//                                                             ? 'bg-green-500/90 text-white'
//                                                             : variant.quantity > 0
//                                                                 ? 'bg-amber-500/90 text-white'
//                                                                 : 'bg-red-500/90 text-white'
//                                                         }`}>
//                                                         {variant.quantity > 0 ? `${variant.quantity}` : 'Out'}
//                                                     </span>
//                                                 </div>

//                                                 {/* Gradient Overlay */}
//                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                                             </div>

//                                             {/* Product Info */}
//                                             <div className="p-3 space-y-2">
//                                                 <div className="space-y-1">
//                                                     <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
//                                                         {userProductsWithIds?.find((item: ProductResponseObj) => item?.id === variant?.product_id)?.productName || "Product"}
//                                                     </h3>
//                                                     <div className="flex flex-wrap gap-1">
//                                                         {variant?.sku && (
//                                                             <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs border border-purple-100 dark:border-purple-800">
//                                                                 {variant.sku}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {/* Price */}
//                                                 <div className="flex items-baseline gap-1">
//                                                     <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                                                         {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(+variant?.selling_price || 0)}
//                                                     </p>
//                                                 </div>

//                                                 {/* Add to Cart Button */}
//                                                 <button
//                                                     data-item={JSON.stringify(variant)}
//                                                     data-item-quantity={variant.quantity}
//                                                     disabled={variant.quantity === 0}
//                                                     onClick={handleSelectedVariant}
//                                                     className={`w-full py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center gap-2 ${variant.quantity > 0
//                                                             ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
//                                                             : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
//                                                         }`}
//                                                 >
//                                                     {variant.quantity > 0 ? (
//                                                         <>
//                                                             <PiPlusBold size={12} />
//                                                             Add to Cart
//                                                         </>
//                                                     ) : (
//                                                         'Out of Stock'
//                                                     )}
//                                                 </button>
//                                             </div>
//                                         </motion.div>
//                                     ))}
//                                 </div>

//                                 {/* Pagination */}
//                                 <Pagination>
//                                     <PaginationContent>
//                                         <FiChevronLeft
//                                             className={`cursor-pointer ${currentItemCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                             onClick={currentItemCount > 0 ? handlePagination : undefined}
//                                             data-id="prev-btn"
//                                             size={17}
//                                         />
//                                         {Array.from({ length: Math.max(1, Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM)) }).map((_, index) => (
//                                             <PaginationItem key={`page-${index}`}>
//                                                 <PaginationLink
//                                                     onClick={() => setCurrentItemCount(index)}
//                                                     className={currentItemCount === index ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
//                                                 >
//                                                     {index + 1}
//                                                 </PaginationLink>
//                                             </PaginationItem>
//                                         ))}
//                                         {variantsArr?.length > TOTAL_DISPLAY_ITEM && <PaginationEllipsis />}
//                                         <FiChevronRight
//                                             className={`cursor-pointer ${currentItemCount >= Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM) - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                             onClick={currentItemCount < Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM) - 1 ? handlePagination : undefined}
//                                             data-id="next-btn"
//                                             size={17}
//                                         />
//                                     </PaginationContent>
//                                 </Pagination>
//                             </div>
//                         ) : (
//                             <div className="flex flex-col items-center justify-center h-96 text-center">
//                                 <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
//                                     <PiShoppingCartSimpleBold size={50} className="text-purple-400" />
//                                 </div>
//                                 <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
//                                 <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
//                                     {productId === "all"
//                                         ? "Add products to your inventory to start selling"
//                                         : "No variants for this product. Try selecting a different one"}
//                                 </p>
//                                 <button
//                                     onClick={() => router.push('/dashboard/inventory')}
//                                     className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg flex items-center gap-2"
//                                 >
//                                     <PiPlusBold size={16} />
//                                     Add Products
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {/* Desktop Cart Panel */}
//                     {!isPhoneView && (
//                         <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit sticky top-4">
//                             <div className="flex flex-col gap-4 p-4">
//                                 {/* Customer & Store Info */}
//                                 <div className="space-y-3">
//                                     <div className="flex items-center justify-between">
//                                         <label className="text-sm font-medium">Customer</label>
//                                         <button onClick={() => setShowCustomerForm(true)} className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
//                                             + New
//                                         </button>
//                                     </div>
//                                     <Select value={`${selectedCustomer}` || "0"} onValueChange={setSelectedCustomer}>
//                                         <SelectTrigger>
//                                             <SelectValue placeholder="Select Customer" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {!customersData.some((c: CustomerResponse) => c.id === 0) && <SelectItem value="0">Walk-In</SelectItem>}
//                                             {customersData?.map((customer: CustomerResponse, index: number) => (
//                                                 <SelectItem key={`customer-${index}`} value={`${customer.id}`}>{customer.name}</SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>

//                                     <div>
//                                         <label className="text-sm font-medium">Store Type</label>
//                                         <Select value={storeType || "walk_in"} onValueChange={setStoreType}>
//                                             <SelectTrigger className="mt-1">
//                                                 <SelectValue placeholder="Select" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="walk_in">In Store</SelectItem>
//                                                 <SelectItem value="online_order">Online</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                 </div>

//                                 {/* Cart Items */}
//                                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 max-h-[400px] overflow-y-auto" style={hiddenScrollbar}>
//                                     <div className="flex items-center gap-2 mb-3">
//                                         <ShoppingCart size={18} className="text-purple-600" />
//                                         <h3 className="font-semibold">Order Items</h3>
//                                     </div>
//                                     {selectedVariants.length ? (
//                                         <div className="space-y-3">
//                                             {selectedVariants.map((variant, index) => (
//                                                 <div key={`cart-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
//                                                     <div className="flex gap-3">
//                                                         <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
//                                                             {variant?.image_url?.[0]?.secure_url ? (
//                                                                 <Image width={50} height={50} className="w-full h-full object-cover" src={variant.image_url[0].secure_url} alt={variant.sku} />
//                                                             ) : (
//                                                                 <div className="w-full h-full flex items-center justify-center">
//                                                                     <PiShoppingCartSimpleBold size={16} className="text-gray-400" />
//                                                                 </div>
//                                                             )}
//                                                         </div>

//                                                         <div className="flex-1">
//                                                             <h4 className="font-medium text-sm">{variant.sku}</h4>
//                                                             <p className="text-xs text-purple-600 font-semibold">
//                                                                 {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(+variant?.selling_price || 0)}
//                                                             </p>

//                                                             <div className="flex items-center justify-between mt-2">
//                                                                 <div className="flex items-center gap-2">
//                                                                     <button onClick={() => handleQuantityChange(variant.id, variant.quantity - 1, variant.maxQuantity!)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200">
//                                                                         <PiMinusBold size={10} className="mx-auto" />
//                                                                     </button>
//                                                                     <span className="text-sm w-8 text-center font-medium">{variant.quantity}</span>
//                                                                     <button onClick={() => handleQuantityChange(variant.id, variant.quantity + 1, variant.maxQuantity!)} className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
//                                                                         <PiPlusBold size={10} className="mx-auto" />
//                                                                     </button>
//                                                                 </div>

//                                                                 <div className="flex gap-1">
//                                                                     <button onClick={() => handleCalculatorUpdate(variant.id, variant.quantity, variant.maxQuantity!)} className="w-6 h-6 rounded text-blue-500 hover:bg-blue-50">
//                                                                         <CalculatorIcon size={14} className="mx-auto" />
//                                                                     </button>
//                                                                     <button onClick={() => handleRemoveVariant(variant.id)} className="w-6 h-6 rounded text-red-500 hover:bg-red-50">
//                                                                         <Trash size={14} className="mx-auto" />
//                                                                     </button>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     ) : (
//                                         <div className="flex flex-col items-center py-8 text-center">
//                                             <ShoppingCart size={40} className="text-gray-300 mb-2" />
//                                             <p className="text-sm text-gray-500">No items yet</p>
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Order Summary */}
//                                 <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//                                     <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3">
//                                         <div className="flex items-center gap-2 text-white">
//                                             <Calculator size={16} />
//                                             <h3 className="font-semibold text-sm">Order Summary</h3>
//                                         </div>
//                                     </div>

//                                     <div className="p-3 space-y-2 text-sm">
//                                         <div className="flex justify-between">
//                                             <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
//                                             <span className="font-semibold">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(subtotal)}</span>
//                                         </div>

//                                         {discountAmount > 0 && (
//                                             <div className="flex justify-between text-green-600">
//                                                 <span>Discounts</span>
//                                                 <span>-{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(discountAmount)}</span>
//                                             </div>
//                                         )}

//                                         {tax > 0 && (
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600 dark:text-gray-400">Tax</span>
//                                                 <span>+{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(tax)}</span>
//                                             </div>
//                                         )}

//                                         {couponAmount > 0 && (
//                                             <div className="flex justify-between text-green-600">
//                                                 <span>Coupons</span>
//                                                 <span>-{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(couponAmount)}</span>
//                                             </div>
//                                         )}

//                                         <div className="border-t pt-2 flex justify-between font-bold text-base">
//                                             <span>Total</span>
//                                             <span className="text-purple-600">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(total)}</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Action Buttons */}
//                                 <div className="grid grid-cols-3 gap-2">
//                                     <button
//                                         onClick={handleSaveDraft}
//                                         disabled={isSavingDraft || selectedVariants.length === 0}
//                                         className={`py-2 text-xs font-medium rounded-lg transition-all ${isSavingDraft || selectedVariants.length === 0
//                                                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-green-600 text-white hover:bg-green-700'
//                                             }`}
//                                     >
//                                         {isSavingDraft ? 'Saving...' : 'Save'}
//                                     </button>
//                                     <button
//                                         onClick={handleLoadLatestDraft}
//                                         disabled={isLoadingDraft}
//                                         className={`py-2 text-xs font-medium rounded-lg transition-all ${isLoadingDraft
//                                                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-blue-600 text-white hover:bg-blue-700'
//                                             }`}
//                                     >
//                                         {isLoadingDraft ? 'Loading...' : 'Load'}
//                                     </button>
//                                     <button
//                                         onClick={handlePayNow}
//                                         disabled={selectedVariants.length === 0}
//                                         className={`py-2 text-xs font-medium rounded-lg transition-all ${selectedVariants.length === 0
//                                                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
//                                             }`}
//                                     >
//                                         Pay Now
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </motion.div>
//             </div>

//             {/* Modals */}
//             {showOrderConfirmation && pendingOrderData && (
//                 <OrderConfirmation
//                     onClose={handleCloseOrderConfirmation}
//                     onConfirm={handleConfirmOrder}
//                     orderData={{
//                         items: selectedVariants.map(variant => ({
//                             product_id: variant.product_id,
//                             variant_id: variant.id,
//                             quantity: variant.quantity,
//                             unit_price: Number(variant.selling_price),
//                             total_price: variant.quantity * Number(variant.selling_price),
//                             sku: variant.sku,
//                             image_url: variant.image_url
//                         })),
//                         customer: customersData?.find((c: CustomerResponse) => c.id === Number(selectedCustomer)),
//                         order_type: storeType,
//                         subtotal: pendingOrderData.items.reduce((sum, item) => sum + item.total_price, 0),
//                         taxes: pendingOrderData.taxes || 0,
//                         discount: pendingOrderData.discount || 0,
//                         coupon_amount: pendingOrderData?.coupon || 0,
//                         total_amount: pendingOrderData.items.reduce((sum, item) => sum + item.total_price, 0) - (pendingOrderData.discount || 0) - (pendingOrderData.coupon || 0) + (pendingOrderData.taxes || 0),
//                         coupon: selectedCoupon?.code || '',
//                         selectedDiscount: undefined,
//                         selectedTax: undefined,
//                         selectedCoupon: selectedCoupon || undefined
//                     }}
//                 />
//             )}

//             {showDiscountForm && <CreateDiscountForm handleFormClose={() => setShowDiscountForm(false)} business_id={`${businessId}`} />}
//             {showTaxesForm && <CreateTaxesForm handleFormClose={() => setShowTaxesForm(false)} business_id={`${businessId}`} />}
//             {showCouponForm && <CreateCouponForm handleFormClose={() => setShowCouponForm(false)} business_id={`${businessId}`} />}
//             {showCustomerForm && <CustomerForm business_id={`${businessId}`} handleFormClose={() => setShowCustomerForm(false)} />}

//             <DiscountView discounts={discountsdata} isOpen={showDiscountView} onClose={() => setShowDiscountView(false)} onSelectionChange={(selectedIds) => {
//                 if (selectedIds.length > 0) {
//                     const discount = discountsdata.find(d => d.id === selectedIds[0]);
//                     if (discount) setSelectedDiscount({
//                         id: discount.id,
//                         name: discount.name || '',
//                         amount: discount.amount ? Number(discount.amount) : undefined,
//                         percentage: discount.percentage,
//                         description: discount.description,
//                         end_date: discount.end_date
//                     });
//                 } else {
//                     setSelectedDiscount(null);
//                 }
//             }} />

//             <TaxesView taxes={taxesdata} isOpen={showTaxesView} onClose={() => setShowTaxesView(false)} onSelectionChange={(selectedIds) => {
//                 if (selectedIds.length > 0) {
//                     const tax = taxesdata.find(t => t.id === selectedIds[0]);
//                     if (tax) setSelectedTax({
//                         id: tax.id,
//                         name: tax.name || '',
//                         rate: +tax.rate,
//                         type: tax.type as 'inclusive' | 'exclusive',
//                         description: tax.description,
//                         created_at: tax.created_at
//                     });
//                 } else {
//                     setSelectedTax(null);
//                 }
//             }} />

//             <CouponsView coupons={couponsdata} isOpen={showCouponsView} onClose={() => setShowCouponsView(false)} onSelectionChange={(selectedIds) => {
//                 if (selectedIds.length > 0) {
//                     const coupon = couponsdata.find(c => c.id === selectedIds[0]);
//                     if (coupon) setSelectedCoupon({
//                         id: coupon.id,
//                         code: coupon.code || '',
//                         discount_percentage: coupon.discount_percentage,
//                         discount_amount: coupon.discount_amount ? Number(coupon.discount_amount) : undefined,
//                         description: coupon.description,
//                         usage_limit: coupon.usage_limit,
//                         end_date: coupon.end_date
//                     });
//                 } else {
//                     setSelectedCoupon(null);
//                 }
//             }} />

//             {isQuantityCalculatorOpen && calculatorContext && (
//                 <QuantityCalculator
//                     handleClose={() => setIsQuantityCalculatorOpen(false)}
//                     unit={calculatorContext.unitPrice}
//                     price={calculatorContext.unitPrice}
//                     maxQuantity={calculatorContext.maxQuantity}
//                     productId={calculatorContext.variantId}
//                     currentQuantity={calculatorContext.currentQuantity}
//                     onApply={async (newQty: number) => {
//                         const newCart = selectedVariants.map(item =>
//                             item.id === calculatorContext.variantId ? { ...item, quantity: newQty } : item
//                         );
//                         await setSelectedVariants(newCart);
//                     }}
//                 />
//             )}

//             {invoiceData && (
//                 <div className="w-full">
//                     <OrderInvoice orderData={invoiceData} onClose={() => setInvoiceData(null)} />
//                     <div className="w-full h-full fixed inset-0 bg-black/10 backdrop-blur-sm z-10" />
//                 </div>
//             )}

//             <DraftSelectionModal
//                 isOpen={showDraftSelectionModal}
//                 onClose={() => setShowDraftSelectionModal(false)}
//                 businessId={businessId}
//                 onDraftSelected={handleDraftSelected}
//             />

//             {!invoicePreview ? (
//                 <PendingOrdersModal
//                     isOpen={showPendingOrdersModal}
//                     onClose={handleClosePendingModal}
//                     orders={pendingOrders}
//                     onView={handlePendingView}
//                     onDelete={handlePendingDelete}
//                     title="Pending Orders"
//                 />
//             ) : null}

//             {invoicePreview && (
//                 <>
//                     <OfflineSalesInvoice sale={invoicePreview} onClose={() => setInvoicePreview(null)} />
//                     <div className="w-full h-full fixed inset-0 bg-black/10 backdrop-blur-sm z-10" />
//                 </>
//             )}
//         </div>
//     );
// }

// export default PosContents;
