"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { SaleOverviewCard, TabList } from "..";
import { SalesPieChart } from "../charts";
import { Card as CardWrapper, CardTitle, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { LoginAttemptsTable, SalesTable } from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MobileNavbar, MobileSideBar } from "../sections";
import { toast } from "sonner";
import { RiArrowLeftDoubleLine } from "react-icons/ri";
import { BusinessModalCard } from "../modal";
import { IconType } from "react-icons";
import { TbCurrencyNaira } from "react-icons/tb";
import { PiCaretLeft, PiMinusBold, PiPlusBold, PiShoppingCart, PiShoppingCartSimpleBold } from "react-icons/pi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getProductCoupons, getProductDiscounts, getProductTaxes, getUserProducts, getVariantsByBusiness, getVariantsByProductId, getDiscountsByBusinessId, getTaxesByBusinessId, getCouponsByBusinessId, getTopSellingProducts, getSalesAnalyticsData, getProductCategories } from "@/api/controllers/get/handler";
import Image from "next/image";
import { Trash, ShoppingCart, Calculator, Tag, ChevronDown, Percent, Settings, CalculatorIcon } from "lucide-react";
import CreateDiscountForm from "./forms/add-discount-form";
import CreateTaxesForm from "../inventory/forms/add-taxes-form";
import CreateCouponForm from "./forms/add-coupon-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CategoryPayload, CouponResponseObj, CustomerResponse, DiscountResponseObj, FallbackSalesResponse, ProductResponseObj, ProductVariantResponseObject, SingleProductType, TaxesResponseObj } from "@/models/types/shared/handlers-type";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TOTAL_DISPLAY_ITEM } from "@/models/types/constants/sales-constants";
import { OrderConfirmation, SalesReport } from "./ui";
import { DiscountView, CouponsView, TaxesView } from "./views";
import Cookies from "js-cookie";
import { useCartStorage, useOfflineCustomers, useOfflineOrders } from "@/hooks/use-localforage";
import { productCache, discountCache, taxCache, couponCache, cartUtils, offlineOrders } from "@/lib/storage-utils";
import { DraftSelectionModal } from "./draft-selection-modal";
import PendingOrdersModal from "./pending-orders-modal";
import SalesInvoice from "./invoice/SalesInvoice";
import type { SalesSchema } from "@/store/data/sales-table-data";
import { submitOfflineOrder, prepareOrderData, addPaymentToOrder, SelectedDiscount, SelectedTax, SelectedCoupon, OrderSubmissionData } from "@/api/controllers/post/orders";
import OrderInvoice from "./invoice/OrderInvoice";
import QuantityCalculator from "./ui/quantity-calculator";
import { SalesOverviewGraph } from "../charts/sales-overview-line-graph";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { BsPersonWalking } from "react-icons/bs";
import { useSalesAnalytics } from "@/store/state/lib/stocks-state-manager";
import CustomerForm from "../customers/forms/add-customer-form";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import offlineSalesColumn, { OfflineSalesSchema } from "@/components/data-table/offline-sales-table";
import OfflineSalesTable from "../tables/offline-sales-table";
import OfflineSalesInvoice from "./invoice/OfflineSalesInvoice";
import { Calendar } from "@/components/ui/calendar";

type TopsellingProductCurrentLogic = {
    id: number;
    name: string;
    units_sold: string;
    total_sales: string;
}

type TopSellingProductLogic = TopsellingProductCurrentLogic & {
    image_url: Array<{ secure_url: string; public_id: string }>;
}

const SalesContent = ({ onPOSStateChange }: { onPOSStateChange?: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [activeTab, setActiveTab] = useState<number>(-1);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [tabGasLists, setTabGasLists] = useState<Array<string>>(["Overview", "POS", "Transactions", "Reports"]);
    const [listCount, setlistCount] = useState<number>(0);
    const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);

    const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const [queryFilters, setQueryFilters] = useState<{ date_filter: string; start_date: string; end_date: string }>({
        date_filter: "",
        start_date: "",
        end_date: ""
    });

    const tabLabels = useMemo(() => {
        return ["Today", "Yesterday", "This Week", "This Month", "This year", "Custom Date"];
    }, []);

    const [invoiceData, setInvoiceData] = useState<FallbackSalesResponse | null>(null);

    const [indicatorBar, setIndicatorBar] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const queryClient = useQueryClient();

    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const listContainerRef = useRef<HTMLDivElement | null>(null);

    const { hiddenScrollbar } = useCustomStyles();

    const { getOfflineCustomers, setOfflineCustomers } = useOfflineCustomers();

    const [businessId, setBusinessId] = useState(0);
    const [branchId, setBranchId] = useState(0);
    const [userId, setUserId] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsClient(true);
            const storedId = sessionStorage.getItem("selectedBusinessId");
            if (storedId) {
                setBusinessId(JSON.parse(storedId));
            }

            const storedBranchId = sessionStorage.getItem("selectedBranchId");
            if (storedBranchId) {
                setBranchId(JSON.parse(storedBranchId));
            }

            const user_auth_id = Cookies.get("authUserId");
            if (user_auth_id) {
                setUserId(JSON.parse(user_auth_id));
            }
        }
    }, []);

    const { isNotifierOpen, setIsNotifier, isMobileMenuOpen, isPhoneView, isIconView } = useDashboardContextHooks();

    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [offlineCustomers, setofflinecustomers] = useState<CustomerResponse[]>([]);

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("sales-listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
            // Set online status after component mounts
            setIsOnline(navigator.onLine);
        }
    }, []);

    const [isQuantityCalculatorOpen, setIsQuantityCalculatorOpen] = useState<boolean>(false);
    const [calculatorContext, setCalculatorContext] = useState<{
        variantId: number;
        currentQuantity: number;
        maxQuantity: number;
        unitPrice: number;
    } | null>(null);

    const { setSalesAnalytics, salesAnalytics: salesPieData } = useSalesAnalytics();

    const [productId, setProductId] = useState<string>("all");
    const [variantsArr, setVariantsArr] = useState<ProductVariantResponseObject[]>([]);
    const [currentItemCount, setCurrentItemCount] = useState<number>(0);
    const [currentVariants, setCurrentVariants] = useState<ProductVariantResponseObject[]>([]);


    // State for selected discount, tax, and coupon
    const [selectedDiscount, setSelectedDiscount] = useState<SelectedDiscount | null>(null);
    const [selectedTax, setSelectedTax] = useState<SelectedTax | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<SelectedCoupon | null>(null);

    // my custom localforage hooks
    const {
        cart: selectedVariants,
        customer: rawCustomer,
        storeType: rawStoreType,
        // isLoading: cartLoading,
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

    const selectedCustomer = rawCustomer || "0";
    const storeType = rawStoreType || "walk_in";

    const { createOrder, pendingOrders, syncPendingOrders, loadPendingOrders } = useOfflineOrders();
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState<boolean>(false);
    const [invoicePreview, setInvoicePreview] = useState<OfflineSalesSchema & Partial<{ customer_name: string; customer_phone: string; customer_email: string }> | null>(null);

    const handleOpenPendingModal = () => {
        setShowPendingOrdersModal(true);
    };

    const handleClosePendingModal = () => {
        setShowPendingOrdersModal(false);
    };

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            (async () => {
                const offline_customers = await getOfflineCustomers(businessId);
                setofflinecustomers(offline_customers as CustomerResponse[]);
            })();
        }
        return () => {
            isMounted = false
        };
    }, [businessId, getOfflineCustomers]);

    const handlePendingView = (order: OfflineSalesSchema) => {
        if (offlineCustomers?.length) {
            const customer = offlineCustomers?.find(cs => cs?.id === +order?.customer_id);
            const { ...rest } = order;
            if (customer && Object.keys(customer)?.length) {
                const invoiceData = {
                    ...rest,
                    customer_name: customer?.name || "",
                    customer_email: customer?.email,
                    customer_phone: customer?.phone
                };
                setInvoicePreview(invoiceData);
                return;
            }
            const invoiceData = {
                ...rest,
                customer_name: "Walk-In",
                customer_email: "N/A",
                customer_phone: "N/A"
            };
            setInvoicePreview(invoiceData);
        }
    };

    const handlePendingDelete = async (orderId: string) => {
        await offlineOrders.removeOfflineOrder(orderId);
        await loadPendingOrders();
        toast.success("Pending order removed");
    };
    const [isOnline, setIsOnline] = useState(true);
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState<OrderSubmissionData | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showDiscountForm, setShowDiscountForm] = useState(false);
    const [showTaxesForm, setShowTaxesForm] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [showCouponDropdown, setShowCouponDropdown] = useState(false);
    const [couponsEnabled, setCouponsEnabled] = useState(false);
    const [showDiscountView, setShowDiscountView] = useState(false);
    const [showTaxesView, setShowTaxesView] = useState(false);
    const [showCouponsView, setShowCouponsView] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);
    const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
    const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
    const [showDraftSelectionModal, setShowDraftSelectionModal] = useState<boolean>(false);

    const isDarkModeEnabled = useMemo(() => {
        if (typeof window === "undefined") return;
        const currentStatusTheme = localStorage.getItem("system-theme");
        return currentStatusTheme ? JSON.parse(currentStatusTheme) : false;
    }, []);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterBrand, setFilterBrand] = useState<string>("all");
    const [skuFilter, setSkuFilter] = useState<string>("");

    const { data: user_products, isError: user_productsError, isSuccess: user_productsSuccess } = useQuery({
        queryKey: ["get-products", businessId],
        queryFn: () => getUserProducts(businessId),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: businessId > 0
    });

    const { data: top_selling_products, isLoading: topSellingProductsLoading, isSuccess: topSellingProductsSuccess, isError: topSellingProductsError } = useQuery({
        queryKey: ["get-top-products", businessId],
        queryFn: () => getTopSellingProducts({ businessId }),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: variants_data, isSuccess: variant_success, isError: variant_error } = useQuery({
        queryKey: ["get-variants", productId, businessId],
        queryFn: () => getVariantsByProductId({ productId, businessId }),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: productId !== "all" && businessId > 0
    });

    const { data: business_variants, isSuccess: business_variantsSuccess, isError: business_variantsError } = useQuery({
        queryKey: ["get-business-variants", businessId],
        queryFn: () => getVariantsByBusiness(`${businessId}`),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: businessId > 0
    });

    const { data: customers, isSuccess: customersSuccess, isError: customersError } = useQuery({
        queryKey: ["get-customers", businessId],
        queryFn: () => getCustomers({ businessId: Number(businessId) }),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: businessId > 0
    });

    const { data: couponsData, isSuccess: couponsSuccess, isError: couponsError } = useQuery({
        queryKey: ["get-coupons", businessId],
        queryFn: () => getProductCoupons({ businessId: Number(businessId) }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
        retry: false,
    });

    const { data: discountsData, isSuccess: discountSuccess, isError: discountError } = useQuery({
        queryKey: ["get-discounts", businessId],
        queryFn: () => getProductDiscounts({ businessId }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: taxesData, isSuccess: taxesSuccess, isError: taxesError } = useQuery({
        queryKey: ["get-taxes", businessId],
        queryFn: () => getProductTaxes({ businessId }),
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: productsWithDiscounts, isSuccess: productsDiscountsSuccess } = useQuery({
        queryKey: ["get-products-discounts", businessId],
        queryFn: async () => {
            const data = await getDiscountsByBusinessId({ business_id: Number(businessId) });
            if (data && businessId) {
                await discountCache.cacheDiscounts(data, businessId.toString());
            }
            return data;
        },
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: productsWithTaxes, isSuccess: productsTaxesSuccess } = useQuery({
        queryKey: ["get-products-taxes", businessId],
        queryFn: async () => {
            const data = await getTaxesByBusinessId({ business_id: Number(businessId) });
            if (data && businessId) {
                await taxCache.cacheTaxes(data, businessId.toString());
            }
            return data;
        },
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: productsWithCoupons, isSuccess: productsCouponsSuccess } = useQuery({
        queryKey: ["get-products-coupons", businessId],
        queryFn: async () => {
            const data = await getCouponsByBusinessId({ business_id: Number(businessId) });
            if (data && businessId) {
                await couponCache.cacheCoupons(data, businessId.toString());
            }
            return data;
        },
        enabled: businessId > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: categories, isSuccess: categoriesSuccess, isError: categoriesError } = useQuery({
        queryKey: ["get-categories", businessId],
        queryFn: () => getProductCategories(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const productwithcoupons = useMemo(() => {
        if (productsWithCoupons && productsCouponsSuccess) {
            return productsWithCoupons?.products_with_coupons;
        }
        return [];
    }, [productsWithCoupons, productsCouponsSuccess]);


    const productwithtaxes = useMemo(() => {
        if (productsWithTaxes && productsTaxesSuccess) {
            return productsWithTaxes?.products_with_taxes;
        }
        return [];
    }, [productsWithTaxes, productsTaxesSuccess]);

    const productswithdiscounts = useMemo(() => {
        if (productsWithDiscounts && productsDiscountsSuccess) {
            return productsWithDiscounts?.products_with_discounts;
        }
        return [];
    }, [productsWithDiscounts, productsDiscountsSuccess]);

    const userProducts = useMemo(() => {
        if (user_productsSuccess && !user_productsError) {
            return user_products?.products;
        }
        return [];
    }, [user_products, user_productsSuccess, user_productsError]);

    const userProductsWithIds = useMemo(() => {
        return userProducts?.map((item: ProductResponseObj) => ({ id: item?.id, productName: item?.name, brand: item?.brand }))
    }, [userProducts]);

    const uniqueBrands = useMemo(() => {
        const brands = (userProductsWithIds || [])
            .map((i: { id: number; productName: string; brand: string }) => i?.brand?.toLowerCase())
            .filter(Boolean);
        return Array.from(new Set(brands));
    }, [userProductsWithIds]) as Array<string>;

    const variantData = useMemo(() => {
        if (variant_success && !variant_error) {
            return variants_data?.variants;
        }
        return [];
    }, [variants_data, variant_success, variant_error]);

    const categoriesData = useMemo(() => {
        if (categoriesSuccess && !categoriesError) {
            return categories?.categories || [];
        }
        return [];
    }, [categories, categoriesSuccess, categoriesError]);

    const businessVariantsData = useMemo(() => {
        if (business_variants && business_variantsSuccess && !business_variantsError) {
            return business_variants?.variants ?? [];
        }
        return [];
    }, [business_variants, business_variantsSuccess, business_variantsError]);

    const productIdToBrand = useMemo(() => {
        const map = new Map<number, string>();
        (userProducts || []).forEach((p: ProductResponseObj) => {
            map.set(p.id, (p.brand || "").toLowerCase());
        });
        return map;
    }, [userProducts]);

    const productIdToCategoryName = useMemo(() => {
        const map = new Map<number, string>();
        (userProducts || []).forEach((p: ProductResponseObj) => {
            map.set(p.id, (p.category_name || "").toLowerCase());
        });
        return map;
    }, [userProducts]);

    const filteredVariants = useMemo(() => {
        const skuQ = skuFilter.trim().toLowerCase();
        return (variantsArr || []).filter((v: ProductVariantResponseObject) => {
            const brand = productIdToBrand.get(v.product_id) || "";
            const category = productIdToCategoryName.get(v.product_id) || "";
            const sku = (v.sku || "").toLowerCase();

            if (filterBrand !== "all" && brand !== filterBrand) return false;
            if (filterCategory !== "all" && category !== filterCategory) return false;
            if (skuQ && !sku.includes(skuQ)) return false;
            return true;
        });
    }, [variantsArr, filterBrand, filterCategory, skuFilter, productIdToBrand, productIdToCategoryName]);

    const customersData = useMemo(() => {
        if (customersSuccess && !customersError) {
            return customers?.customers;
        }
        return [];
    }, [customers, customersSuccess, customersError]);

    useEffect(() => {
        setOfflineCustomers(customersData, businessId);
    }, [customersData, setOfflineCustomers, businessId]);

    const couponsdata = useMemo(() => {
        if (couponsSuccess && !couponsError) {
            return couponsData?.coupons as CouponResponseObj[];
        }
        return [];
    }, [couponsData, couponsSuccess, couponsError]);

    const taxesdata = useMemo(() => {
        if (taxesSuccess && !taxesError) {
            return taxesData?.taxes as TaxesResponseObj[];
        }
        return [];
    }, [taxesData, taxesSuccess, taxesError])

    const discountsdata = useMemo(() => {
        if (discountSuccess && !discountError) {
            return discountsData?.discounts as DiscountResponseObj[];
        }
        return [];
    }, [discountsData, discountSuccess, discountError]);

    //! top selling products --> (TSP)
    const TSP = useMemo(() => {
        if (top_selling_products && topSellingProductsSuccess && !topSellingProductsError) {
            return top_selling_products?.topProducts || [];
        }
        return [];
    }, [top_selling_products, topSellingProductsSuccess, topSellingProductsError]);

    const TSP_data = useMemo(() => {
        if (TSP?.length) {
            return TSP?.map((item: TopsellingProductCurrentLogic) => {
                const qualifiedData = userProducts?.find((product: ProductResponseObj) => product?.id === item?.id) as ProductResponseObj;
                if (qualifiedData) {
                    return {
                        id: qualifiedData?.id,
                        name: qualifiedData?.name,
                        units_sold: item?.units_sold,
                        total_sales: item?.total_sales,
                        image_url: qualifiedData?.image_url
                    }
                }
                return {
                    ...item,
                    image_url: []
                }
            });
        }
    }, [TSP, userProducts]) as Array<TopSellingProductLogic>;

    useEffect(() => {
        if (searchParams.get("itemCount")) {
            const itemCount = Number(searchParams.get("itemCount"));
            setCurrentItemCount(itemCount);
            const newArr = filteredVariants?.slice(itemCount * TOTAL_DISPLAY_ITEM, (itemCount + 1) * TOTAL_DISPLAY_ITEM);
            setCurrentVariants(newArr);
        } else {
            setCurrentVariants(filteredVariants);
        }
    }, [searchParams, filteredVariants]);


    useEffect(() => {
        if (pendingOrders?.length) {
            setTabGasLists(prev => {
                if (!(prev?.some(item => item?.toLowerCase() === "offline transaction"))) {
                    return [...prev, "Offline Transaction"];
                }
                return prev;
            });
            return;
        }
        setTabGasLists(prev => {
            if (prev?.some(item => (item?.toLowerCase() === "offline transaction" || item?.toLowerCase()?.includes("offline")))) {
                return prev?.slice(0, -1);
            }
            return prev;
        });
    }, [pendingOrders]);

    const isAvalidJson = (str: string) => {
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            return false;
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const required_permissions = ["view_analytics", "view_sales_overview", "view_sales_report"];
        const staff_permissions = Cookies.get("staff_roles") || JSON.stringify({ role: "user", permissions: [] });
        const isStaff = Cookies.get("authActiveUser") || "user";
        const has_required_permissions = isAvalidJson(staff_permissions) && required_permissions?.every((permission: string) => (JSON.parse(staff_permissions) as { role: string; permissions: Array<string> })?.permissions.includes(permission));
        if (has_required_permissions && isStaff === "Staff") {
            setTabGasLists(prev => {
                return prev?.filter(item => required_permissions?.includes(item?.toLowerCase()))
            });
            return;
        }
        if (!has_required_permissions && isStaff === "Staff") {
            setTabGasLists(prev => {
                return prev?.slice(0, 1);
            });
            return;
        }
    }, []);

    useEffect(() => {
        if (!searchParams.get("itemCount")) {
            setCurrentVariants(filteredVariants);
        }
    }, [filteredVariants, searchParams]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentItemCount(0);
    }, [filterCategory, filterBrand, skuFilter]);

    useEffect(() => {
        if (variantData && businessVariantsData) {
            switch (productId) {
                case "all":
                    setVariantsArr(businessVariantsData);
                    productCache.cacheVariants(businessVariantsData, `${businessId}`);
                    break;
                default:
                    setVariantsArr(variantData);
                    productCache.cacheVariants(variantData, `${businessId}`, productId);
                    break;
            }
        }
    }, [variantData, businessVariantsData, productId, businessId]);

    useEffect(() => {
        const loadCachedData = async () => {
            if (!navigator.onLine && businessId) {
                const businessIdStr = businessId.toString();

                const [cachedDiscounts, cachedTaxes, cachedCoupons] = await Promise.all([
                    discountCache.getCachedDiscounts(businessIdStr),
                    taxCache.getCachedTaxes(businessIdStr),
                    couponCache.getCachedCoupons(businessIdStr)
                ]);
            }
        };

        loadCachedData();
    }, [businessId]);

    const handlePagination = (e: React.MouseEvent<HTMLOrSVGElement | HTMLElement>) => {
        const target = e.currentTarget;
        const dataId = target.dataset.id;
        const maxPages = Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM);

        if (dataId === "next-btn" && currentItemCount < maxPages - 1) {
            setCurrentItemCount(prev => prev + 1);
        } else if (dataId === "prev-btn" && currentItemCount > 0) {
            setCurrentItemCount(prev => prev - 1);
        }
    }

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
            toast.error("Please select store type (In Store or Online)");
            return;
        }

        const needed_items_data = selectedVariants?.map((item) => {
            return {
                variant_id: item.id,
                quantity: item.quantity,
                unit_price: +item.selling_price,
                total_price: +item.selling_price * item.quantity,
                // sku: item.sku
            }
        });

        // Calculate total discount, coupon and tax from matched variants
        let totalMatchedDiscount = 0;
        let totalMatchedCoupon = 0;
        let totalMatchedTax = 0;

        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const variantTotal = variant.quantity * Number(variant.selling_price);

            // Calculate discount from matched discounts
            const discounts = matchedDiscounts.get(productId);
            console.log('Discounts for product', productId, ':', discounts);
            if (discounts && discounts.length > 0) {
                discounts.forEach((discount: any) => {

                    if ('percentage' in discount && discount.percentage) {
                        totalMatchedDiscount += (variantTotal * Number(discount.percentage)) / 100;
                    }
                    else if ('amount' in discount && discount.amount) {
                        totalMatchedDiscount += Number(discount.amount) * variant.quantity;
                    }
                });
            }

            const coupons = matchedCoupons.get(productId);
            if (coupons && coupons.length > 0) {
                coupons.forEach((coupon: any) => {
                    if ("discount_percentage" in coupon && coupon?.discount_percentage) {
                        totalMatchedCoupon += (variantTotal * Number(coupon.discount_percentage)) / 100;
                    } else if ("discount_amount" in coupon && coupon?.discount_amount) {
                        totalMatchedCoupon += Number(coupon.discount_amount) * variant.quantity;
                    } else {
                        totalMatchedCoupon += Number(coupon.discount_amount) * variant.quantity;
                    }
                });
            }

            const taxes = matchedTaxes.get(productId);
            if (taxes && taxes.length > 0) {
                taxes.forEach((tax: any) => {
                    totalMatchedTax += Number(tax.rate / 100) * subtotal;
                });
            }
        });

        const orderData = prepareOrderData(
            needed_items_data,
            selectedCustomer,
            storeType,
            +userId,
            +businessId,
            +branchId,
            undefined, // selectedDiscount - not using manual selection
            undefined, // selectedTax - not using manual selection
            selectedCoupon || undefined,
            undefined, // staffId - can be added later if needed
            "Order Created" // note - can be added later if needed
        );

        // Override the calculated amounts with the matched amounts
        orderData.discount = totalMatchedDiscount;
        orderData.coupon = totalMatchedCoupon;
        orderData.taxes = totalMatchedTax;

        setPendingOrderData(orderData);
        setShowOrderConfirmation(true);
    }

    const handleConfirmOrder = async (paymentMethod: string | string[] | Array<[string, number]>) => {
        if (!pendingOrderData) return;

        // Calculate total amount considering discounts and taxes
        const subtotal = pendingOrderData.items.reduce((sum, item) => sum + item.total_price, 0);
        const discountAmount = pendingOrderData.discount || 0;
        const taxAmount = pendingOrderData.taxes || 0;
        const couponAmount = pendingOrderData.coupon || 0;
        const totalAmount = subtotal - discountAmount - couponAmount + taxAmount;

        const orderDataWithPayment = addPaymentToOrder(
            pendingOrderData,
            paymentMethod,
            totalAmount
        );

        if (isOnline) {
            try {
                const success = await submitOfflineOrder(orderDataWithPayment) as { success: boolean; _data: FallbackSalesResponse };
                if (success?.success) {
                    toast.success(`Order created successfully! Total: ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(totalAmount)}`);
                    await (queryClient.invalidateQueries({
                        queryKey: ["get-business-variants", businessId],
                    }));
                    setInvoiceData(success._data);
                    await clearCart();
                    setSelectedDiscount(null);
                    setSelectedTax(null);
                    setSelectedCoupon(null);
                    setShowOrderConfirmation(false);
                    setPendingOrderData(null);
                } else {
                    toast.error("Failed to create order. Please try again.");
                }
            } catch (error) {
                console.error('Online order submission failed:', error);
                toast.error("Failed to create order. Please try again.");
            }
        } else {
            const result = await createOrder(orderDataWithPayment);
            if (result.success) {
                toast.info("Order saved offline. Will sync when connection is restored.");
                await clearCart();
                setSelectedDiscount(null);
                setSelectedTax(null);
                setSelectedCoupon(null);
                setShowOrderConfirmation(false);
                setPendingOrderData(null);
                if (offlineCustomers?.length <= 0) return;
                const customer_data = offlineCustomers?.find(cs => cs?.id === (orderDataWithPayment?.customer_id ? orderDataWithPayment?.customer_id : 0));
                const invoiceData = {
                    ...result.data,
                    customer_name: customer_data?.name || "Walk-In",
                    customer_phone: customer_data?.phone || "N/A",
                    customer_email: customer_data?.email || "N/A",
                }
                handlePendingView(invoiceData);
            } else {
                toast.error("Failed to save order offline. Please try again.");
            }
        }
    }

    const handleCloseOrderConfirmation = () => {
        setShowOrderConfirmation(false);
        setPendingOrderData(null);
    }

    const handleSaveDraft = async () => {
        if (selectedVariants.length === 0) {
            toast.error("Add items to cart before saving a draft");
            return;
        }
        setIsSavingDraft(true);
        try {
            // Subtotal
            const subtotal = selectedVariants.reduce((sum, v) => sum + v.quantity * Number(v.selling_price), 0);
            // Compute matched totals from Maps
            let totalMatchedDiscount = 0;
            let totalMatchedCoupon = 0;
            let totalMatchedTax = 0;
            selectedVariants.forEach(variant => {
                const pid = variant.product_id;
                const variantTotal = variant.quantity * Number(variant.selling_price);
                const discounts = matchedDiscounts.get(pid);
                if (discounts?.length) {
                    discounts.forEach((d: any) => {
                        if (d?.discount_type === "percentage") {
                            totalMatchedDiscount += (variantTotal * Number(d.percentage)) / 100;
                        } else if (d?.discount_type === "fixed-amount") {
                            totalMatchedDiscount += Number(d.amount) * variant.quantity;
                        } else {
                            totalMatchedDiscount += Number(d.amount) * variant.quantity;
                        }
                    });
                }
                const coupons = matchedCoupons.get(pid);
                if (coupons?.length) {
                    coupons.forEach((c: any) => {
                        if (c?.coupons_type === "percentage") {
                            totalMatchedCoupon += (variantTotal * Number(c.discount_percentage)) / 100;
                        } else if (c?.coupons_type === "fixed-amount") {
                            totalMatchedCoupon += Number(c.discount_amount) * variant.quantity;
                        } else {
                            totalMatchedCoupon += Number(c.discount_amount) * variant.quantity;
                        }
                    });
                }
                const taxes = matchedTaxes.get(pid);
                if (taxes?.length) {
                    taxes.forEach((t: any) => {
                        totalMatchedTax += Number(t.rate) * variant.quantity;
                    });
                }
            });

            const total = subtotal - totalMatchedDiscount - totalMatchedCoupon + totalMatchedTax;

            const draftId = `draft_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const draft = {
                id: draftId,
                name: `Draft ${new Date().toLocaleString()}`,
                businessId: Number(businessId),
                branchId: Number(branchId),
                userId: Number(userId),
                createdAt: new Date().toISOString(),
                cart: selectedVariants,
                customer: selectedCustomer,
                storeType,
                matchedDiscounts,
                matchedTaxes,
                matchedCoupons,
                totals: {
                    subtotal,
                    discount: totalMatchedDiscount + totalMatchedCoupon,
                    tax: totalMatchedTax,
                    total
                }
            };

            const ok = await cartUtils.saveCartDraft(draft);
            if (ok) {
                toast.success("Cart saved to drafts");
                // Clear only the cart after saving draft
                await setSelectedVariants([]);
            } else {
                toast.error("Failed to save draft");
            }
        } catch (e) {
            console.error(e);
            toast.error("Unexpected error while saving draft");
        } finally {
            setIsSavingDraft(false);
        }
    }

    const handleLoadLatestDraft = async () => {
        setShowDraftSelectionModal(true);
    }

    const handleDraftSelected = async (draft: any) => {
        try {
            setIsLoadingDraft(true);
            // Restore cart state
            await setSelectedVariants(draft.cart || []);
            await setSelectedCustomer(draft.customer ? String(draft.customer) : "0");
            await setStoreType(draft.storeType ? String(draft.storeType) : "walk_in");
            if (draft.matchedDiscounts) await updateMatchedDiscounts(draft.matchedDiscounts);
            if (draft.matchedTaxes) await updateMatchedTaxes(draft.matchedTaxes);
            if (draft.matchedCoupons) await updateMatchedCoupons(draft.matchedCoupons);
            toast.success("Draft loaded into cart");
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error while loading draft");
        } finally {
            setIsLoadingDraft(false);
        }
    }

    const handleSelectedVariant = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        try {
            const items = JSON.parse(`${target.dataset.item}`);
            const itemQuantity = JSON.parse(`${target.dataset.itemQuantity}`);

            const productId = items.product_id;

            if (productId) {
                if (productswithdiscounts && productswithdiscounts.length > 0) {
                    const matchingDiscounts = productswithdiscounts.filter((discount: any) =>
                        discount.product_id && discount.product_id === productId
                    );

                    if (matchingDiscounts.length > 0 && matchingDiscounts?.some((item: any) => item.discount_id !== null)) {
                        const newMap = new Map(matchedDiscounts);
                        newMap.set(productId, matchingDiscounts);
                        await updateMatchedDiscounts(newMap);
                        toast.success(`Applied ${matchingDiscounts.length} discount(s) to this product`, {
                            description: matchingDiscounts.map((d: any) => d.name).join(', '),
                            duration: 3000
                        });
                    }
                }

                if (productwithtaxes && productwithtaxes.length > 0) {
                    const matchingTaxes = productwithtaxes.filter((tax: any) =>
                        tax.product_id && tax.product_id === productId
                    );

                    if (matchingTaxes.length > 0 && matchingTaxes?.some((item: any) => item.tax_id !== null)) {
                        const newMap = new Map(matchedTaxes);
                        newMap.set(productId, matchingTaxes);
                        await updateMatchedTaxes(newMap);
                        toast.info(`Applied ${matchingTaxes.length} tax(es) to this product`, {
                            description: matchingTaxes.map((t: any) => t.name).join(', '),
                            duration: 3000
                        });
                    }
                }

                if (productwithcoupons && productwithcoupons.length > 0) {
                    const matchingCoupons = productwithcoupons.filter((coupon: any) =>
                        coupon.product_id && coupon.product_id === productId
                    );

                    if (matchingCoupons.length > 0 && matchingCoupons?.some((item: any) => item.coupon_id !== null)) {
                        const newMap = new Map(matchedCoupons);
                        newMap.set(productId, matchingCoupons);
                        await updateMatchedCoupons(newMap);
                        console.log(`Found ${matchingCoupons.length} coupon(s) for product ${productId}`);
                        toast.success(`${matchingCoupons.length} coupon(s) available for this product`, {
                            description: matchingCoupons.map((c: any) => c.code).join(', '),
                            duration: 3000
                        });
                    }
                }
            }

            let newCart: (ProductVariantResponseObject & { maxQuantity?: number })[];
            if (selectedVariants.some(item => item.id === items.id)) {
                newCart = selectedVariants.map(item =>
                    item.id === items.id ? { ...item, quantity: item.quantity < +itemQuantity ? item.quantity + 1 : item.quantity } : item
                );
            } else {
                newCart = [...selectedVariants, { ...items, quantity: 1, maxQuantity: itemQuantity }];
            }

            await setSelectedVariants(newCart);
        } catch (err) {
            console.log("Unexpected error occurred while trying to parse stringified Object");
            console.info(err);
        }
    }

    const handleQuantityChange = async (variantId: number, newQuantity: number, maxQuantity: number) => {
        if (newQuantity <= 0) {
            await handleRemoveVariant(variantId);
            return;
        }

        if (newQuantity > maxQuantity) {
            toast.info("Available Item Limit Reached", { className: "animate-pulse" });
            return;
        }

        const newCart = selectedVariants.map(item =>
            item.id === variantId ? { ...item, quantity: newQuantity } : item
        );
        await setSelectedVariants(newCart);
    }

    const handleCalculatorUpdate = (variantId: number, val: number, max: number) => {
        const target = selectedVariants.find(v => v.id === variantId);
        setCalculatorContext({
            variantId,
            currentQuantity: Math.max(1, val || 1),
            maxQuantity: max,
            unitPrice: Number(target?.selling_price || 0)
        });
        setIsQuantityCalculatorOpen(true);
    }

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

        const newCart = selectedVariants.filter(item => item.id !== variantId);
        await setSelectedVariants(newCart);
    }

    const calculateOrderTotals = () => {
        const subtotal = selectedVariants.reduce((sum, variant) => {
            return sum + (variant.quantity * Number(variant.selling_price));
        }, 0);

        // Calculate total discount amount based on discount_type
        let totalDiscountAmount = 0;
        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const discounts = matchedDiscounts.get(productId);

            if (discounts && discounts.length > 0) {
                discounts.forEach((discount: any) => {
                    const variantTotal = variant.quantity * Number(variant.selling_price);
                    if ("percentage" in discount && discount?.percentage) {
                        totalDiscountAmount += (variantTotal * Number(discount.percentage)) / 100;
                    } else if ("amount" in discount && discount?.amount) {
                        totalDiscountAmount += Number(discount.amount) * variant.quantity;
                    } else {
                        totalDiscountAmount += Number(discount.amount) * variant.quantity;
                    }
                });
            }
        });

        // Calculate total coupon amount based on coupons_type
        let totalCouponAmount = 0;
        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const coupons = matchedCoupons.get(productId);

            if (coupons && coupons.length > 0) {
                coupons.forEach((coupon: any) => {
                    const variantTotal = variant.quantity * Number(variant.selling_price);
                    if ("discount_percentage" in coupon && coupon?.discount_percentage) {
                        totalCouponAmount += (variantTotal * Number(coupon.discount_percentage)) / 100;
                    } else if ("discount_amount" in coupon && coupon?.discount_amount) {
                        totalCouponAmount += Number(coupon.discount_amount) * variant.quantity;
                    } else {
                        totalCouponAmount += Number(coupon.discount_amount) * variant.quantity;
                    }
                });
            }
        });

        // Calculate total tax amount
        let totalTaxAmount = 0;
        selectedVariants.forEach(variant => {
            const productId = variant.product_id;
            const taxes = matchedTaxes.get(productId);

            if (taxes && taxes.length > 0) {
                taxes.forEach((tax: any) => {
                    totalTaxAmount += Number(tax.rate / 100) * subtotal;
                });
            }
        });

        // const taxRate = 0; // Legacy tax rate, now replaced by totalTaxAmount
        const tax = totalTaxAmount; // Use calculated tax amount
        const discountAmount = totalDiscountAmount;
        const couponAmount = totalCouponAmount;
        const finalSubtotal = subtotal - discountAmount - couponAmount; // Subtotal after discount and coupon
        const total = finalSubtotal + tax; // Final total after discount, coupon and tax

        return { subtotal, tax, total, discountAmount, couponAmount, finalSubtotal };
    }

    const { subtotal, tax, total, discountAmount, couponAmount } = calculateOrderTotals();

    useEffect(() => {
        router.push(`${pathname}?itemCount=${currentItemCount}`);
    }, [currentItemCount, router, pathname]);

    const handleManualSync = async () => {
        setIsSyncing(true);
        try {
            toast.info(`Syncing ${pendingOrders.length} pending orders...`);
            await syncPendingOrders(submitOfflineOrder);
            toast.success('Orders synced successfully');
        } catch (error) {
            console.log(error);
            toast.error('Failed to sync orders');
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Connection restored');
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('You are now offline. Orders will be saved locally.');
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);


    const sectionVariant: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1]
            }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1],
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1]
            }
        }
    };

    const itemVariant: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1]
            }
        }
    };

    useEffect(() => {
        const node = tabRefs.current[activeTab || 0];
        const containerNode = containerRef.current;
        if (node && containerNode) {
            const nodeRect = node.getBoundingClientRect();
            const containerRect = containerNode.getBoundingClientRect();
            const padding = 8;
            setIndicatorStyle({
                left: (nodeRect.left - containerRect.left + containerNode.scrollLeft - padding / 2),
                width: nodeRect.width + padding,
            });
        }

        const date_filtered = tabLabels[activeTab]?.split(/\s/g)?.length ? tabLabels[activeTab]?.replace(/\s/g, "_")?.toLowerCase() : tabLabels[activeTab]?.toLowerCase();
        if (date_filtered?.startsWith("custom")) {
            let startDate = selectedDateRange?.from?.toISOString() || "";
            let endDate = selectedDateRange?.to?.toISOString() || "";
            startDate = startDate?.split("T")[0];
            endDate = endDate?.split("T")[0];
            setQueryFilters(prev => ({
                ...prev,
                date_filter: "custom",
                start_date: startDate,
                end_date: endDate
            }));
        } else {
            setQueryFilters({
                date_filter: date_filtered,
                start_date: "",
                end_date: ""
            });
        }
    }, [activeTab, selectedDateRange, tabLabels]);

    const query_filtering_data = useMemo(() => {
        const query = {} as { business_id: number; branch_id: number; date_filter: string; start_date?: string; end_date?: string; }
        if (businessId || branchId || queryFilters) {
            let count = 0;
            const queryData = Object.entries(queryFilters)
                ?.filter(([, value]) => value)
                ?.reduce((prev, [key, value]) => {
                    count++
                    console.log(count);
                    prev[key] = value;
                    return prev;
                }, {} as Record<string, string | number>);
            Object.assign(query, { ...queryData, business_id: +businessId, branch_id: +branchId });
        }
        return query;
    }, [queryFilters, businessId, branchId]) as { business_id: number; branch_id: number; date_filter: string; start_date?: string; end_date?: string; };

    const query_string = useMemo(() => {
        if (typeof window === "undefined") return;
        const searchParams = new URLSearchParams();
        Object.entries(query_filtering_data)
            ?.forEach(([key, value]) => searchParams?.append(key, String(value)));
        return searchParams?.toString();
    }, [query_filtering_data]);

    const query_filtering_payload = useMemo(() => {
        if (query_string && businessId) {
            return {
                url: `/api/finance/sales-analytics?${query_string}`,
                businessId: +businessId
            }
        };
        return {
            url: `/api/finance/sales-analytics?business_id=${businessId}`,
            businessId: +businessId
        }
    }, [query_string, businessId]) as { url: string; businessId: number; };

    const { data: salesCardData, isSuccess: salesCardSuccess, isError: salesCardError } = useQuery({
        queryKey: ["get-sales-data", query_filtering_payload, businessId, branchId],
        queryFn: () => getSalesAnalyticsData(query_filtering_payload),
        enabled: businessId !== 0,
        retry: false
    });

    const sales_card_data = useMemo(() => {
        if (salesCardSuccess && !salesCardError) {
            const data = [
                {
                    id: 1,
                    title: "Total Orders",
                    amount: salesCardData?.totalOrders || 0,
                    isCurrency: false,
                    icon: TbCurrencyNaira,
                    isPhoneViewIcon: TbCurrencyNaira
                },
                {
                    id: 2,
                    title: "Total Sales",
                    amount: salesCardData?.totalSales || 0,
                    isCurrency: true,
                    icon: TbCurrencyNaira,
                    isPhoneViewIcon: TbCurrencyNaira
                },
                {
                    id: 3,
                    title: "Cash : Bank Transfer : Card",
                    amount: `${+salesCardData?.paymentMethodRatio?.[0]?.count || 0} : ${+salesCardData?.paymentMethodRatio?.[1]?.count || 0} : ${+salesCardData?.paymentMethodRatio?.[2]?.count || 0}`,
                    isCurrency: false,
                    icon: PiShoppingCart,
                    isPhoneViewIcon: PiShoppingCart
                },
                {
                    id: 4,
                    title: "Online : Walk_In",
                    amount: `${+salesCardData?.orderTypeRatio?.[0]?.count || 0} : ${+salesCardData?.orderTypeRatio?.[1]?.count || 0}`,
                    isCurrency: false,
                    icon: BsPersonWalking,
                    isPhoneViewIcon: BsPersonWalking
                }
            ];
            return data;
        }
        return [
            {
                id: 1,
                title: "Total Orders",
                amount: 0,
                isCurrency: true,
                icon: TbCurrencyNaira,
                isPhoneViewIcon: TbCurrencyNaira
            },
            {
                id: 2,
                title: "Total Sales",
                amount: 0,
                isCurrency: true,
                icon: TbCurrencyNaira,
                isPhoneViewIcon: TbCurrencyNaira
            },
            {
                id: 3,
                title: "Cash : Bank Transfer : Card",
                amount: 0 + " : " + 0 + " : " + 0,
                isCurrency: true,
                icon: PiShoppingCart,
                isPhoneViewIcon: PiShoppingCart
            },
            {
                id: 4,
                title: "Online : Walk_In",
                amount: `0 : 0`,
                isCurrency: false,
                icon: BsPersonWalking,
                isPhoneViewIcon: BsPersonWalking
            }
        ];
    }, [salesCardData, salesCardSuccess, salesCardError]) as Array<{ id: number; title: string; isCurrency: boolean; amount: number; icon?: IconType; isPhoneViewIcon?: IconType }>;

    useEffect(() => {
        if (salesCardSuccess && !salesCardError) {
            const needed_sales_analytics = {
                total: +salesCardData?.totalSales || 0,
                walk_in: +salesCardData?.orderTypeRatio?.[0]?.total || 0,
                online: +salesCardData?.orderTypeRatio?.[1]?.total || 0,
            }
            setSalesAnalytics(needed_sales_analytics);
        }
    }, [salesCardData, salesCardSuccess, salesCardError, setSalesAnalytics])

    useEffect(() => {
        const activeList = (listRefs.current[listCount as number] as HTMLDivElement);
        const listContainer = listContainerRef.current as HTMLDivElement;

        if (activeList && listContainer) {
            const containerRect = listContainer.getBoundingClientRect();
            const listRect = activeList.getBoundingClientRect();
            const padding = 20;
            setIndicatorBar({
                left: (listRect.left - containerRect.left + listContainer.scrollLeft - padding / 2),
                width: listRect.width + padding
            });
        }
        localStorage.setItem("sales-listcount", JSON.stringify(listCount));

        const sidebar = document.querySelector('[class*="hidden lg:flex max-w-[25dvw]"]');
        const overviewWrapper = document.querySelector('[class*="w-full lg:w-[85%]"]');

        if (listCount === 1) {
            if (sidebar) {
                (sidebar as HTMLElement).style.display = 'none';
            }
            if (overviewWrapper) {
                overviewWrapper.classList.remove('lg:w-[85%]');
                overviewWrapper.classList.add('lg:w-full');
            }
        } else {
            if (sidebar) {
                (sidebar as HTMLElement).style.display = '';
            }
            if (overviewWrapper) {
                overviewWrapper.classList.remove('lg:w-full');
                overviewWrapper.classList.add('lg:w-[85%]');
            }
        }

        if (onPOSStateChange) {
            onPOSStateChange(listCount === 1);
        }

        return () => {
            if (sidebar) {
                (sidebar as HTMLElement).style.display = '';
            }
            if (overviewWrapper) {
                overviewWrapper.classList.remove('lg:w-full');
                overviewWrapper.classList.add('lg:w-[85%]');
            }
        };
    }, [listCount, onPOSStateChange]);

    // Show loading state during SSR/hydration
    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className={`flex flex-col gap-y-3 sm:gap-y-5 ${listCount === 1 ? 'w-full' : ''}`}>
                {/* Dashboard Header Section o */}
                <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:justify-between px-2 sm:px-4 lg:px-0">
                    <div className="text-sm sm:text-base font-[600] w-fit shrink-0">Sales &amp; Orders Management</div>
                    {listCount === 0 && (
                        <div
                            ref={containerRef}
                            className="w-full sm:w-fit relative overflow-x-auto rounded-sm bg-template-whitesmoke-dim dark:bg-black z-10"
                            style={hiddenScrollbar}
                        >
                            <div className="min-w-[540px] w-full flex gap-x-3 sm:gap-x-6 items-center py-2 px-3">
                                {tabLabels.map((label, idx) => (
                                    <div
                                        key={label}
                                        ref={el => { tabRefs.current[idx] = el; }}
                                        onClick={() => {
                                            setActiveTab(idx);
                                            setShowDatePickerModal(idx === tabLabels?.length - 1);
                                        }}
                                        className={cn("text-[13px] font-[600] cursor-pointer text-nowrap px-1 sm:px-2", idx === activeTab && "text-white")}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                            <div
                                className={"absolute -z-10 transition-all duration-300 ease-in-out top-1/2 rounded-sm -translate-y-1/2 bg-template-chart-store h-full py-1"}
                                style={{
                                    left: indicatorStyle.left,
                                    width: indicatorStyle.width,
                                }}
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between px-2 sm:px-4 lg:px-0">
                    {listCount === 1 ? (
                        <button
                            onClick={() => setlistCount(0)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-black dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                        >
                            <PiCaretLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-medium">Back to Overview</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-x-2 sm:gap-x-3">
                            <PiCaretLeft size={15} className="hidden sm:block" />
                            <div className="text-[10px] sm:text-xs text-black/50 dark:text-white/50">Sales & Orders</div>
                            <RiArrowLeftDoubleLine size={14} className="hidden sm:block" />
                            <div className="text-xs sm:text-sm">Products</div>
                        </div>
                    )}

                    {/* Offline Orders Indicator */}
                    {pendingOrders.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''}
                            </div>
                            {isOnline && (
                                <div className="flex items-center gap-x-4">
                                    <button
                                        onClick={handleManualSync}
                                        disabled={isSyncing}
                                        className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1 ${isSyncing
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-template-primary text-white hover:bg-template-primary/90'
                                            }`}
                                    >
                                        {isSyncing ? (
                                            <>
                                                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                Syncing...
                                            </>
                                        ) : (
                                            'Sync Now'
                                        )}
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={handleOpenPendingModal}
                                className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1 bg-template-primary text-white hover:bg-template-primary/90`}
                            >
                                Display Items
                            </button>
                        </div>
                    )}
                </div>

                {/* Sales List Tabs oo */}
                <div ref={listContainerRef} className="w-full sm:w-fit bg-template-whitesmoke-dim dark:bg-black rounded-sm relative z-10 overflow-x-auto px-2 sm:px-0" style={hiddenScrollbar}>
                    <div className="min-w-[280px] sm:min-w-[590px] w-full flex items-center justify-between">
                        {tabGasLists.map((item, index) => (
                            <TabList item={item} index={index} setlistCount={setlistCount} key={index} color={listCount === index ? 'text-white' : ''} ref={el => {
                                if (el) listRefs.current[index] = el
                            }} />
                        ))}
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 bg-template-chart-store h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{ left: indicatorBar.left, width: indicatorBar.width || listRefs.current?.[listCount || 0]?.getBoundingClientRect().width }} />
                </div>
                {listCount === 0 ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4 lg:px-0">
                        {sales_card_data.map((data, index) => (
                            <SaleOverviewCard key={index} {...data} isIconView={isIconView} />
                        ))}
                    </div>
                ) : null}
                <AnimatePresence mode="wait">
                    {listCount === 0 && (
                        <motion.div
                            key="overview"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 flex flex-col gap-y-5 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <motion.div variants={itemVariant} className="w-full bg-white dark:bg-black">
                                <SalesOverviewGraph title="Sales Movement" content="Monitor the product sales in and out of the store" />
                            </motion.div>
                            <div className="w-full grid grid-cols-1 xl:grid-cols-[60%_40%] gap-4 px-2 sm:px-4 lg:px-0">
                                <motion.div variants={itemVariant}>
                                    <CardWrapper className="dark:bg-black">
                                        <CardHeader>
                                            <CardTitle>Sales By Activity</CardTitle>
                                            <CardDescription>Breakdown Of Sales by Item Purchase</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2">
                                                <SalesPieChart />
                                                <motion.div
                                                    variants={itemVariant}
                                                    className="flex md:justify-end w-full my-auto"
                                                >
                                                    <div className="w-full flex flex-col gap-y-6">
                                                        <motion.div variants={itemVariant} className="w-full flex flex-col gap-y-3">
                                                            <motion.div variants={itemVariant} className="w-full flex items-center justify-between md:gap-x-8">
                                                                <div className="flex items-center gap-x-2">
                                                                    <div className="w-4 h-4 rounded-full bg-template-blue"></div>
                                                                    <div className="text-xs font-[500]">Online</div>
                                                                </div>
                                                                <div className="text-xs font-[600]">{Math.round((salesPieData?.online * 100) / salesPieData?.total) ? 100 - Math.round((salesPieData?.online * 100) / salesPieData?.total) : 0}%</div>
                                                            </motion.div>
                                                            <motion.div variants={itemVariant} className="w-full flex items-center justify-between md:gap-x-8">
                                                                <div className="flex items-center gap-x-2">
                                                                    <div className="w-4 h-4 rounded-full bg-template-chart-store"></div>
                                                                    <div className="text-xs font-[500]">Walk In</div>
                                                                </div>
                                                                <div className="text-xs font-[600]">{Math.round((salesPieData?.walk_in * 100) / salesPieData?.total) ? 100 - Math.round((salesPieData?.walk_in * 100) / salesPieData?.total) : 0}%</div>
                                                            </motion.div>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </CardWrapper>
                                </motion.div>
                                <div className="w-full h-full bg-white dark:bg-black rounded-sm">
                                    <div className="flex flex-col gap-y-3">
                                        <div className="flex py-2 px-3 flex-col gap-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-base font-[550]">Top Selling products</div>
                                                <button className="shrink-0 py-1.5 rounded-sm px-4 text-sm font-[550] text-white bg-template-primary">View All</button>
                                            </div>
                                            <div className="text-sm text-black/50 dark:text-white/50">List of products with the highest sales</div>
                                        </div>
                                        <div className="w-full h-[250px] overflow-y-auto overflow-x-hidden" style={hiddenScrollbar}>
                                            <div className="w-full h-fit">
                                                <div className="flex flex-col gap-y-1">
                                                    {topSellingProductsLoading ? (
                                                        <div className="text-sm font-[500] text-black/50 px-3 py-2">Loading...</div>
                                                    ) : TSP_data?.length ? TSP_data?.map((product, index) => (
                                                        <div key={`top-selling-product-${index}`} className="cursor-pointer py-2 px-3 hover:bg-template-chart-store/20 grid grid-cols-[35%_65%] gap-x-2">
                                                            <div className="w-full h-25 rounded-sm bg-template-whitesmoke">
                                                                <Image width={350} height={350} className="h-full w-full object-contain object-center" src={`${product.image_url?.[0]?.secure_url}`} alt={product?.name ?? "Product 1"} />
                                                            </div>
                                                            <div className="flex flex-col justify-between">
                                                                <div className="text-sm font-[550]">{product?.name ?? "N/A"}</div>
                                                                <div className="flex flex-col gap-y-1">
                                                                    <div className="text-xs text-black/50 dark:text-white/50">Price</div>
                                                                    <div className="text-[15.5px] font-[550]">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(+product?.total_sales) || 0}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-sm font-[500] text-black/50 px-3 py-2">No Available Data</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {listCount === 1 && (
                        <div className="w-full flex flex-col gap-y-4 px-2 sm:px-4 lg:px-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between w-full">
                                <div className="flex items-center gap-x-2">
                                    <div className="w-full sm:w-[65%]">
                                        <Select value={`${productId}`} onValueChange={(value) => setProductId(value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            {userProducts.length ? (
                                                <SelectContent>
                                                    <SelectItem value="all">Show All</SelectItem>
                                                    {userProducts.map((product: SingleProductType, index: number) => (
                                                        <SelectItem key={`product-${index}`} value={`${product.id}`}>{product.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            ) : (
                                                <SelectContent>
                                                    <SelectItem disabled value="no_product">No Products Found</SelectItem>
                                                </SelectContent>
                                            )}
                                        </Select>
                                    </div>
                                    <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categoriesData?.length ? categoriesData?.map((item: CategoryPayload) => (
                                                <SelectItem key={`variant-categories-${item?.id}`} value={`${item?.name?.toLowerCase()}`}>{item?.name}</SelectItem>
                                            )) : <SelectItem value="0">No Categories</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterBrand} onValueChange={(v) => setFilterBrand(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Brands</SelectItem>
                                            {uniqueBrands?.length ? uniqueBrands?.map((brand: string, index: number) => (
                                                <SelectItem key={`variant-brand-${index}`} value={`${brand}`}>{brand}</SelectItem>
                                            )) : (
                                                <SelectItem value="0">No Brands</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <input
                                        type="text"
                                        value={skuFilter}
                                        onChange={(e) => setSkuFilter(e.target.value)}
                                        placeholder="Filter by SKU"
                                        className="w-auto text-sm border border-gray-500/50 py-1.5 px-4 rounded-md focus:outline-none"
                                    />
                                </div>


                                {/* Settings/Controls Button */}
                                <div className="relative w-full sm:w-[35%] flex justify-end items-center">
                                    <button
                                        onClick={() => setShowSettingsModal(!showSettingsModal)}
                                        className="flex justify-end items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-template-primary to-template-primary/90 text-white rounded-lg font-medium hover:from-template-primary/90 hover:to-template-primary transition-all duration-200 shadow-sm hover:shadow-md group"
                                    >
                                        <div className="p-1 bg-white/20 rounded-md group-hover:bg-white/30 transition-colors">
                                            <Settings size={16} />
                                        </div>
                                        {/* <span className="text-sm">Controls</span>
                                        <ChevronDown 
                                            size={16} 
                                            className={`transition-transform duration-200 ${showSettingsModal ? 'rotate-180' : ''}`} 
                                        /> */}
                                    </button>

                                    {/* Settings Modal */}
                                    <AnimatePresence>
                                        {showSettingsModal && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-black rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                            >
                                                {/* Header */}
                                                <div className="bg-gradient-to-r from-template-primary to-template-primary/90 p-4 text-white dark:text-black">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-white/20 rounded-md">
                                                            <Settings size={16} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-white text-sm dark:text-black">Sales Controls</h3>
                                                            <p className="text-xs text-white/80 dark:text-black/80">Enable features for your sales</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Toggle Controls */}
                                                <div className="p-4 space-y-4">
                                                    {/* Coupon Toggle Only */}
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/40 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                                <Tag size={16} className="text-green-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-800 text-sm dark:text-black">Coupons</div>
                                                                <div className="text-xs text-gray-500 dark:text-black/80">Enable coupon management</div>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={couponsEnabled}
                                                            onCheckedChange={setCouponsEnabled}
                                                            className="data-[state=checked]:bg-green-600"
                                                        />
                                                    </div>

                                                    {/* Info Box */}
                                                    <div className="p-3 bg-green-50 rounded-lg">
                                                        <p className="text-xs text-green-700">
                                                            <strong>Note:</strong> Discounts and taxes are automatically applied based on product configurations.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="bg-gray-50 dark:bg-black/40 px-4 py-2 border-t border-gray-100 dark:border-black/40">
                                                    <p className="text-xs text-gray-500 dark:text-black/40 text-center">Configure your sales features</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Conditional Feature Buttons */}
                                <div className="flex items-center gap-3">
                                    {/* Coupons Dropdown - Only show when enabled */}
                                    {couponsEnabled && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative"
                                        >
                                            <button
                                                onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md group"
                                            >
                                                <div className="p-1 bg-white/20 rounded-md group-hover:bg-white/30 transition-colors">
                                                    <Tag size={16} />
                                                </div>
                                                <span className="text-sm">Coupons</span>
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-200 ${showCouponDropdown ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {/* Coupons Dropdown Menu */}
                                            <AnimatePresence>
                                                {showCouponDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                                    >
                                                        {/* Header */}
                                                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 bg-white/20 rounded-md">
                                                                    <Tag size={16} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-white text-sm">Coupon Management</h3>
                                                                    <p className="text-xs text-white/80">Manage promotional coupons</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Menu Items */}
                                                        <div className="p-2">
                                                            <button
                                                                onClick={() => {
                                                                    setShowCouponForm(true);
                                                                    setShowCouponDropdown(false);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-green-50 rounded-lg transition-colors duration-200 group"
                                                            >
                                                                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                                                    <Tag size={16} className="text-green-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-800 text-sm">Create Coupon</div>
                                                                    <div className="text-xs text-gray-500">Add new promotional coupon</div>
                                                                </div>
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setShowCouponsView(true);
                                                                    setShowCouponDropdown(false);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-green-50 rounded-lg transition-colors duration-200 group"
                                                            >
                                                                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                                                    <Percent size={16} className="text-green-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-800 text-sm">View Coupons</div>
                                                                    <div className="text-xs text-gray-500">Manage existing coupons</div>
                                                                </div>
                                                            </button>
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                                                            <p className="text-xs text-gray-500 text-center">Boost sales with promotional coupons</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            {/* Mobile Cart Preview Button */}
                            {isPhoneView && listCount === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="fixed bottom-20 right-4 z-50"
                                >
                                    <button
                                        onClick={() => setIsMobileCartOpen(true)}
                                        className="relative bg-template-primary hover:bg-template-primary/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                                    >
                                        <ShoppingCart size={24} />
                                        {selectedVariants.length > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                                                {selectedVariants.reduce((total, item) => total + item.quantity, 0)}
                                            </div>
                                        )}
                                    </button>
                                </motion.div>
                            )}

                            {/* Mobile Cart Slide-out Menu */}
                            <AnimatePresence>
                                {isMobileCartOpen && isPhoneView && (
                                    <>
                                        {/* Backdrop */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsMobileCartOpen(false)}
                                            className="fixed inset-0 bg-black/50 z-50"
                                        />

                                        {/* Slide-out Menu */}
                                        <motion.div
                                            initial={{ x: "100%" }}
                                            animate={{ x: 0 }}
                                            exit={{ x: "100%" }}
                                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-black shadow-2xl z-50 flex flex-col"
                                        >
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-template-primary to-template-primary/80 p-4 text-white">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                            <ShoppingCart size={18} />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-lg font-semibold">Your Cart</h2>
                                                            <p className="text-sm text-white/80">
                                                                {selectedVariants.length} item{selectedVariants.length !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsMobileCartOpen(false)}
                                                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Cart Items */}
                                            <div className="flex-1 overflow-y-auto p-4">
                                                {selectedVariants.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {selectedVariants.map((variant, index) => (
                                                            <motion.div
                                                                key={`mobile-cart-${index}`}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                                                                        {variant?.image_url?.[0]?.secure_url ? (
                                                                            <Image
                                                                                width={350}
                                                                                height={350}
                                                                                className="w-full h-full object-cover"
                                                                                src={`${variant.image_url?.[0]?.secure_url}`}
                                                                                alt={`${variant.sku}`}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <PiShoppingCartSimpleBold size={16} className="text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-medium text-sm text-gray-900 truncate">
                                                                            {variant.sku}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-500 mb-2">
                                                                            {new Intl.NumberFormat("en-NG", {
                                                                                style: "currency",
                                                                                currency: "NGN"
                                                                            }).format(+variant?.selling_price || 0)}
                                                                        </p>

                                                                        {/* Quantity Controls */}
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => handleQuantityChange(variant.id, variant.quantity - 1, +variant.maxQuantity!)}
                                                                                    className="w-6 h-6 rounded-md flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors"
                                                                                >
                                                                                    <PiMinusBold size={10} />
                                                                                </button>
                                                                                <span className="text-sm font-medium w-8 text-center">
                                                                                    {variant.quantity}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleQuantityChange(variant.id, variant.quantity + 1, +variant.maxQuantity!)}
                                                                                    className="w-6 h-6 rounded-md flex items-center justify-center bg-template-primary text-white hover:bg-template-primary/90 transition-colors"
                                                                                >
                                                                                    <PiPlusBold size={10} />
                                                                                </button>
                                                                            </div>

                                                                            <button
                                                                                onClick={() => handleRemoveVariant(variant.id)}
                                                                                className="w-6 h-6 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <Trash size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-40 text-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                            <ShoppingCart size={24} className="text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500 text-sm">Your cart is empty</p>
                                                        <p className="text-gray-400 text-xs mt-1">Add items to get started</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer with Total and Action */}
                                            {selectedVariants.length > 0 && (
                                                <div className="border-t border-gray-100 p-4 space-y-4">
                                                    {/* Order Summary */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Subtotal</span>
                                                            <span className="font-medium">
                                                                {new Intl.NumberFormat("en-NG", {
                                                                    style: "currency",
                                                                    currency: "NGN"
                                                                }).format(subtotal)}
                                                            </span>
                                                        </div>

                                                        {/* Show Automatic Discounts */}
                                                        {discountAmount > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-green-600 font-medium">Product Discounts</span>
                                                                    <span className="font-medium text-green-600">
                                                                        -{new Intl.NumberFormat("en-NG", {
                                                                            style: "currency",
                                                                            currency: "NGN"
                                                                        }).format(discountAmount)}
                                                                    </span>
                                                                </div>
                                                                {/* Show discount details per product */}
                                                                <div className="pl-2 space-y-0.5">
                                                                    {Array.from(matchedDiscounts.entries()).map(([productId, discounts]) => {
                                                                        const variant = selectedVariants.find(v => v.product_id === productId);
                                                                        if (!variant) return null;

                                                                        return discounts.map((discount: any, idx: number) => (
                                                                            <div key={`discount-${productId}-${idx}`} className="flex justify-between text-xs text-gray-500">
                                                                                <span className="truncate max-w-[150px]">{discount.discount_name}</span>
                                                                                <span>{`₦${discount.amount}`}</span>
                                                                            </div>
                                                                        ));
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Show Automatic Taxes */}
                                                        {tax > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Product Taxes</span>
                                                                    <span className="font-medium">
                                                                        +{new Intl.NumberFormat("en-NG", {
                                                                            style: "currency",
                                                                            currency: "NGN"
                                                                        }).format(tax)}
                                                                    </span>
                                                                </div>
                                                                {/* Show tax details per product */}
                                                                <div className="pl-2 space-y-0.5">
                                                                    {Array.from(matchedTaxes.entries()).map(([productId, taxes]) => {
                                                                        const variant = selectedVariants.find(v => v.product_id === productId);
                                                                        if (!variant) return null;

                                                                        return taxes.map((tax: any, idx: number) => (
                                                                            <div key={`tax-${productId}-${idx}`} className="flex justify-between text-xs text-gray-500">
                                                                                <span className="truncate max-w-[150px]">{tax.name}</span>
                                                                                <span>{`₦${tax.rate}`}</span>
                                                                            </div>
                                                                        ));
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Show Automatic Coupons */}
                                                        {couponAmount > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-green-600 font-medium">Product Coupons</span>
                                                                    <span className="font-medium text-green-600">
                                                                        -{new Intl.NumberFormat("en-NG", {
                                                                            style: "currency",
                                                                            currency: "NGN"
                                                                        }).format(couponAmount)}
                                                                    </span>
                                                                </div>
                                                                {/* Show coupon details per product */}
                                                                <div className="pl-2 space-y-0.5">
                                                                    {Array.from(matchedCoupons.entries()).map(([productId, coupons]) => {
                                                                        const variant = selectedVariants.find(v => v.product_id === productId);
                                                                        if (!variant) return null;

                                                                        return coupons.map((coupon: any, idx: number) => (
                                                                            <div key={`coupon-${productId}-${idx}`} className="flex justify-between text-xs text-gray-500">
                                                                                <span className="truncate max-w-[150px]">{coupon.coupon_code}</span>
                                                                                <span>{`₦${coupon.discount_amount || "N/A"}`}</span>
                                                                            </div>
                                                                        ));
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Show Available Coupons */}
                                                        {matchedCoupons.size > 0 && (
                                                            <div className="p-2 bg-green-50 rounded-lg">
                                                                <p className="text-xs text-green-700 font-medium mb-1">Available Coupons</p>
                                                                <div className="space-y-0.5">
                                                                    {Array.from(matchedCoupons.entries()).map(([productId, coupons]) => {
                                                                        return coupons.map((coupon: any, idx: number) => (
                                                                            <div key={`coupon-${productId}-${idx}`} className="flex justify-between text-xs text-green-600">
                                                                                <span className="font-mono">{coupon.coupon_code ?? "N/A"}</span>
                                                                                <span>{`₦${coupon.discount_amount || "N/A"} off`}</span>
                                                                            </div>
                                                                        ));
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                                                            <span className="font-semibold">Total</span>
                                                            <span className="font-bold text-template-primary">
                                                                {new Intl.NumberFormat("en-NG", {
                                                                    style: "currency",
                                                                    currency: "NGN"
                                                                }).format(total)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="space-y-2">
                                                        <button
                                                            onClick={() => {
                                                                setIsMobileCartOpen(false);
                                                                handlePayNow();
                                                            }}
                                                            className="w-full bg-template-primary text-white py-3 rounded-lg font-medium hover:bg-template-primary/90 transition-colors"
                                                        >
                                                            Proceed to Payment
                                                        </button>
                                                        <button
                                                            onClick={() => setIsMobileCartOpen(false)}
                                                            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                                        >
                                                            Continue Shopping
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

                            <motion.div
                                key="cart-product"
                                variants={sectionVariant}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={cn(`w-full h-fit grid grid-cols-1 xl:grid-cols-[65%_35%] gap-y-6 xl:gap-x-6 ${isPhoneView ? 'mb-24' : ''} ${listCount === 1 ? 'max-w-full' : ''}`)}
                            >
                                <div className="w-full bg-white dark:bg-black rounded-md h-auto overflow-y-auto order-2 xl:order-1" style={hiddenScrollbar}>
                                    {currentVariants?.length > 0 ? (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="h-fit grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 p-2">
                                                {currentVariants?.map((variant: ProductVariantResponseObject, index: number) => (
                                                    <motion.div
                                                        key={`cart-variant-${index}`}
                                                        variants={itemVariant}
                                                        whileHover={{
                                                            scale: 1.02,
                                                            transition: { duration: 0.2 }
                                                        }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="group relative w-full bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md lg:hover:shadow-lg hover:border-primary/20 hover:ring-1 hover:ring-template-primary/20 transition-all duration-300 overflow-hidden"
                                                    >
                                                        <div className="relative w-full h-20 sm:h-28 lg:h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg overflow-hidden">
                                                            {variant.image_url && variant.image_url.length > 0 ? (
                                                                <Image
                                                                    width={350}
                                                                    height={350}
                                                                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                                                    src={variant.image_url?.[0]?.secure_url}
                                                                    alt={variant?.sku ?? "Product Variant"}
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                    <PiShoppingCartSimpleBold size={32} />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${variant.quantity > variant.threshold
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : variant.quantity > 0
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {variant.quantity > 0 ? `${variant.quantity} in stock` : 'Out of stock'}
                                                                </span>
                                                            </div>
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                        </div>
                                                        <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
                                                            <div className="space-y-1">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                                                                    {userProductsWithIds?.find((item: ProductResponseObj) => item?.id === variant?.product_id)?.productName || "Product"}
                                                                </h3>
                                                                <div className="flex flex-col items-start gap-1 flex-wrap">
                                                                    {variant?.sku ? (
                                                                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[9px] sm:text-[10px] border border-gray-200">{variant?.sku}</span>
                                                                    ) : null}
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-template-primary/10 text-template-primary text-[9px] sm:text-[10px] border border-template-primary/20">
                                                                        {userProductsWithIds?.find((item: ProductResponseObj) => item?.id === variant?.product_id)?.brand || ""}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Price o */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                                                                        {new Intl.NumberFormat("en-NG", {
                                                                            style: "currency",
                                                                            currency: "NGN",
                                                                            currencyDisplay: "symbol"
                                                                        }).format(+variant?.selling_price || 0)}
                                                                    </p>
                                                                    {/* {variant?.attributes?.[0]?.value && (
                                                                        <p className="text-xs text-gray-400">
                                                                            {variant?.attributes?.[0]?.value}
                                                                        </p>
                                                                    )} */}
                                                                </div>
                                                            </div>

                                                            <button
                                                                data-item={`${JSON.stringify(variant)}`}
                                                                data-item-quantity={variant.quantity}
                                                                disabled={variant.quantity === 0}
                                                                onClick={handleSelectedVariant}
                                                                aria-label={`Add ${variant?.sku ?? 'variant'} to cart`}
                                                                className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-[11px] sm:text-xs lg:text-sm transition-all duration-200 ${variant.quantity > 0
                                                                    ? 'bg-template-primary text-white hover:bg-template-primary/90 hover:shadow-md active:scale-95 cursor-pointer'
                                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {variant.quantity > 0 ? (
                                                                    <span className="flex items-center justify-center gap-2">
                                                                        <PiPlusBold size={14} />
                                                                        Add to Cart
                                                                    </span>
                                                                ) : (
                                                                    'Out of Stock'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <Pagination>
                                                <PaginationContent>
                                                    <FiChevronLeft
                                                        className={`cursor-pointer ${currentItemCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={currentItemCount > 0 ? handlePagination : undefined}
                                                        data-id="prev-btn"
                                                        size={17}
                                                    />
                                                    {Array.from({ length: Math.max(1, Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM)) }).map((_, index) => (
                                                        <PaginationItem key={`variants-product-${index}`}>
                                                            <PaginationLink
                                                                onClick={() => setCurrentItemCount(index)}
                                                                className={currentItemCount === index ? 'bg-template-primary text-white' : ''}
                                                            >
                                                                {index + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    {variantsArr?.length > TOTAL_DISPLAY_ITEM && (
                                                        <PaginationEllipsis />
                                                    )}
                                                    <FiChevronRight
                                                        className={`cursor-pointer ${currentItemCount >= Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM) - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={currentItemCount < Math.ceil(variantsArr?.length / TOTAL_DISPLAY_ITEM) - 1 ? handlePagination : undefined}
                                                        data-id="next-btn"
                                                        size={17}
                                                    />
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center h-96 text-center p-8"
                                        >
                                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                                <PiShoppingCartSimpleBold size={40} className="text-gray-400 dark:text-gray-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                No Products Available
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                                                {productId === "all"
                                                    ? "You haven't added any products yet. Start by adding your first product to begin selling."
                                                    : "This product doesn't have any variants. Try selecting a different product or add variants to this product."
                                                }
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => router.push('/dashboard/inventory')}
                                                    className="px-6 py-3 bg-template-primary text-white rounded-lg font-medium hover:bg-template-primary/90 transition-colors duration-200 flex items-center gap-2"
                                                >
                                                    <PiPlusBold size={16} />
                                                    Add Products
                                                </button>
                                                {productId !== "all" && (
                                                    <button
                                                        onClick={() => setProductId("all")}
                                                        className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                                    >
                                                        View All Products
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="w-full rounded-sm h-auto bg-white dark:bg-black py-3 order-1 xl:order-2">
                                    <div className="flex flex-col gap-4 h-full">
                                        <div className="w-full">
                                            <div className="flex flex-col gap-y-3 px-4">
                                                <div className="flex flex-col gap-y-0.5">
                                                    <div className="flex items-center justify-between px-1">
                                                        <div className="text-sm font-[500]">Customer information</div>
                                                        <button type="button" onClick={() => setShowCustomerForm(true)} className="inline-flex items-center gap-x-1 text-xs px-2 py-1 rounded-md bg-template-primary text-white hover:bg-template-primary/90">
                                                            <PiPlusBold size={12} />
                                                            New
                                                        </button>
                                                    </div>
                                                    <Select value={`${selectedCustomer}` || "0"} onValueChange={(value) => {
                                                        setSelectedCustomer(value);
                                                        if (value === 'add') {
                                                            setShowCustomerForm(true);
                                                        }
                                                    }}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Customer" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(customersData.filter((customer: CustomerResponse) => (customer.id === 0 || customer.name.toLowerCase() === "walk_in")))?.length <= 0 ? (
                                                                <SelectItem value="0">Walk-In</SelectItem>
                                                            ) : null}
                                                            {customersData?.length ? (
                                                                customersData?.map((customer: CustomerResponse, index: number) => (
                                                                    <SelectItem key={`sales-customer-${index}`} value={`${customer.id}`}>
                                                                        {customer.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem className="flex items-center gap-x-2 px-2 py-1.5 rounded-sm text-white bg-template-primary" value="add">
                                                                    <PiPlusBold size={16} />
                                                                    Add Customer
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex flex-col gap-y-0.5">
                                                    <div className="text-sm font-[500] px-1">Store Information</div>
                                                    <Select value={storeType || "walk_in"} onValueChange={setStoreType}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="walk_in">In Store</SelectItem>
                                                            <SelectItem value="online_order">Online (call / Whatsapp)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-r mt-3 max-h-[450px] overflow-y-auto from-template-primary/5 to-template-primary/10 border-l-4 border-template-primary mx-4 rounded-lg p-4 mb-4" style={hiddenScrollbar}>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 bg-template-primary rounded-full flex items-center justify-center">
                                                        <ShoppingCart size={16} className="text-white" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Order Details</h3>
                                                </div>
                                                {selectedVariants.length ? selectedVariants?.map((variant, index) => (
                                                    <div key={`variant-order-details-${index}`} className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
                                                        <div className="flex gap-4">
                                                            <div className="relative">
                                                                <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden border border-gray-200 dark:border-gray-700">
                                                                    <Image
                                                                        width={350}
                                                                        height={350}
                                                                        className="w-full h-full object-contain object-center"
                                                                        src={variant?.image_url?.[0]?.secure_url}
                                                                        alt={variant.sku}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 flex flex-col justify-between">
                                                                <div>
                                                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-1">{variant.sku}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-template-primary">
                                                                            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(+variant?.selling_price || 0)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantity</span>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleQuantityChange(variant.id, variant.quantity - 1, variant.maxQuantity!)}
                                                                    className="w-5 h-5 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
                                                                >
                                                                    <PiMinusBold size={12} className="text-gray-600" />
                                                                </button>
                                                                <input
                                                                    value={variant.quantity}
                                                                    onChange={(e) => handleQuantityChange(variant.id, parseInt(e.target.value) || 0, variant.maxQuantity!)}
                                                                    type="number"
                                                                    inputMode="numeric"
                                                                    min="1"
                                                                    className="w-16 py-1 text-center text-sm font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-template-primary/20 focus:border-template-primary outline-none transition-all duration-200"
                                                                />
                                                                <button
                                                                    onClick={() => handleQuantityChange(variant.id, variant.quantity + 1, variant.maxQuantity!)}
                                                                    className="w-5 h-5 bg-template-primary hover:bg-template-primary/90 text-white rounded-lg flex items-center justify-center transition-colors duration-200 shadow-sm"
                                                                >
                                                                    <PiPlusBold size={12} />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleCalculatorUpdate(variant.id, variant?.quantity, variant.maxQuantity!)}
                                                                    className="w-5 h-5 rounded-lg flex items-center justify-center text-green-500 hover:bg-red-50 transition-colors duration-200"
                                                                >
                                                                    <CalculatorIcon size={17} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveVariant(variant.id)}
                                                                    className="w-5 h-5 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors duration-200"
                                                                >
                                                                    <Trash size={17} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="text-sm text-gray-500 dark:text-white">No items in order</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Summary Section */}
                                            <div className="mx-4 h-auto">
                                                <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                    {/* Header */}
                                                    <div className="bg-gradient-to-r from-template-primary to-template-primary/80 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                                <Calculator size={14} className="text-white" />
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-white">Order Summary</h3>
                                                        </div>
                                                    </div>

                                                    {/* Summary Details */}
                                                    <div className="p-4 space-y-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-gray-300 rounded-full dark:bg-gray-700"></div>
                                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                                                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(subtotal)}
                                                                </span>
                                                            </div>

                                                            {/* Auto-Applied Discounts */}
                                                            {discountAmount > 0 && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-400 rounded-full dark:bg-green-500"></div>
                                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                            Product Discounts
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                        -{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(discountAmount)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Auto-Applied Taxes */}
                                                            {tax > 0 && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-400 rounded-full dark:bg-green-500"></div>
                                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                            Product Taxes
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                                                        +{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(tax)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Auto-Applied Coupons */}
                                                            {couponAmount > 0 && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-400 rounded-full dark:bg-green-500"></div>
                                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                            Product Coupons
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                        -{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(couponAmount)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Manual Discount - only show if manually selected */}
                                                            {selectedDiscount && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                                        <span className="text-sm font-medium text-gray-600">
                                                                            Manual Discount ({selectedDiscount.name})
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-green-600">
                                                                        -{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(
                                                                            selectedDiscount?.discount_type === "percentage" ? (subtotal * Number(selectedDiscount.percentage || 0)) / 100 : (selectedDiscount.amount || 0)
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Coupon */}
                                                            {selectedCoupon && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-400 rounded-full dark:bg-green-500"></div>
                                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                            Coupon ({selectedCoupon.code})
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                        -{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(
                                                                            selectedCoupon?.coupons_type === "percentage" ? (subtotal * Number(selectedCoupon.discount_percentage || 0)) / 100 : (selectedCoupon.discount_amount || 0) || couponAmount
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Manual Tax - only show if manually selected */}
                                                            {selectedTax && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                                                        <span className="text-sm font-medium text-gray-600">
                                                                            Manual Tax ({selectedTax.name} - {selectedTax.rate}%)
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-gray-800">
                                                                        +{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(
                                                                            (subtotal * selectedTax.rate) / 100
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Show matched taxes if no manual tax is selected */}
                                                            {!selectedTax && tax > 0 && (
                                                                <div className="flex items-center justify-between py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-amber-400 rounded-full dark:bg-amber-500"></div>
                                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Taxes (Auto-applied)</span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                                                        +{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(tax)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Total */}
                                                        <div className="border-t border-gray-100 pt-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 bg-template-primary rounded-full dark:bg-template-primary"></div>
                                                                    <span className="text-base font-bold text-gray-800 dark:text-gray-400">Total Amount</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xl font-bold text-template-primary dark:text-template-primary">
                                                                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard" }).format(total)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">Inclusive of all taxes</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                            <button
                                                onClick={handleSaveDraft}
                                                disabled={isSavingDraft || selectedVariants.length === 0}
                                                className={`w-full text-white font-[550] text-sm py-2 mt-3 rounded-sm transition-colors duration-200 ${isSavingDraft || selectedVariants.length === 0
                                                    ? 'bg-green-300 cursor-not-allowed'
                                                    : 'bg-green-800/80 hover:bg-green-700 cursor-pointer'
                                                    }`}
                                            >
                                                {isSavingDraft ? 'Saving...' : 'Save To Draft'}
                                            </button>
                                            <button
                                                onClick={handleLoadLatestDraft}
                                                disabled={isLoadingDraft}
                                                className={`w-full text-white font-[550] text-sm py-2 mt-3 rounded-sm transition-colors duration-200 ${isLoadingDraft
                                                    ? 'bg-green-300 cursor-not-allowed'
                                                    : 'bg-green-700 hover:bg-green-600 cursor-pointer'
                                                    }`}
                                            >
                                                {isLoadingDraft ? 'Loading...' : 'Load Draft'}
                                            </button>
                                            <button
                                                onClick={handlePayNow}
                                                disabled={selectedVariants.length === 0}
                                                className={`mt-3 py-2 px-3 w-full text-sm rounded-sm font-medium transition-all duration-200 ${selectedVariants.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-template-primary text-white hover:bg-template-primary/90 cursor-pointer'
                                                    }`}
                                            >
                                                {selectedVariants.length === 0 ? 'Add Items' : 'Pay Now'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {listCount === 2 && (
                        <motion.div
                            key="sales"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <SalesTable />
                        </motion.div>
                    )}
                    {listCount === 3 && (
                        <motion.div
                            key="expenses"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <SalesReport />
                        </motion.div>
                    )}
                    {listCount === 4 && (
                        <motion.div
                            key="offline-orders"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <OfflineSalesTable sales={pendingOrders} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {isNotifierOpen && <NotificationCard setIsOpen={setIsNotifier} />}
                {/* <TransactionInvoice /> */}
                {isMobileMenuOpen && (
                    <MobileSideBar isOpen={isMobileMenuOpen} />
                )}
                <MobileNavbar />
                {showBusinessModal && (
                    <BusinessModalCard onClose={() => setShowBusinessModal(false)} />
                )}
                {/* Order Confirmation Modal */}
                {showOrderConfirmation && pendingOrderData && (
                    <OrderConfirmation
                        onClose={handleCloseOrderConfirmation}
                        onConfirm={handleConfirmOrder}
                        orderData={{
                            items: selectedVariants.map(variant => ({
                                product_id: variant.product_id,
                                variant_id: variant.id,
                                quantity: variant.quantity,
                                unit_price: Number(variant.selling_price),
                                total_price: variant.quantity * Number(variant.selling_price),
                                sku: variant.sku,
                                image_url: variant.image_url
                            })),
                            customer: customersData?.find((c: CustomerResponse) => c.id === Number(selectedCustomer)),
                            order_type: storeType,
                            subtotal: pendingOrderData.items.reduce((sum, item) => sum + item.total_price, 0),
                            taxes: pendingOrderData.taxes || 0,
                            discount: pendingOrderData.discount || 0,
                            coupon_amount: pendingOrderData?.coupon || 0,
                            total_amount: pendingOrderData.items.reduce((sum, item) => sum + item.total_price, 0) - (pendingOrderData.discount || 0) - (pendingOrderData.coupon || 0) + (pendingOrderData.taxes || 0),
                            coupon: selectedCoupon?.code || '',
                            selectedDiscount: undefined, // Not using manual selection
                            selectedTax: undefined, // Not using manual selection
                            selectedCoupon: selectedCoupon || undefined
                        }}
                    />
                )}

                {/* Discount Form Modal */}
                {showDiscountForm && (
                    <CreateDiscountForm
                        handleFormClose={() => setShowDiscountForm(false)}
                        business_id={`${businessId}`}
                    />
                )}

                {/* Taxes Form Modal */}
                {showTaxesForm && (
                    <CreateTaxesForm
                        handleFormClose={() => setShowTaxesForm(false)}
                        business_id={`${businessId}`}
                    />
                )}

                {/* Coupon Form Modal */}
                {showCouponForm && (
                    <CreateCouponForm
                        handleFormClose={() => setShowCouponForm(false)}
                        business_id={`${businessId}`}
                    />
                )}

                {/* Simple View Components */}
                <DiscountView
                    discounts={discountsdata}
                    isOpen={showDiscountView}
                    onClose={() => setShowDiscountView(false)}
                    onSelectionChange={(selectedIds) => {
                        // Handle discount selection - get the first selected discount
                        if (selectedIds.length > 0) {
                            const discount = discountsdata.find(d => d.id === selectedIds[0]);
                            if (discount) {
                                setSelectedDiscount({
                                    id: discount.id,
                                    name: discount.name || '',
                                    amount: discount.amount ? Number(discount.amount) : undefined,
                                    percentage: discount.percentage,
                                    description: discount.description,
                                    end_date: discount.end_date
                                });
                            }
                        } else {
                            setSelectedDiscount(null);
                        }
                    }}
                />

                <TaxesView
                    taxes={taxesdata}
                    isOpen={showTaxesView}
                    onClose={() => setShowTaxesView(false)}
                    onSelectionChange={(selectedIds) => {
                        // Handle tax selection - get the first selected tax
                        if (selectedIds.length > 0) {
                            const tax = taxesdata.find(t => t.id === selectedIds[0]);
                            if (tax) {
                                setSelectedTax({
                                    id: tax.id,
                                    name: tax.name || '',
                                    rate: +tax.rate,
                                    type: tax.type as 'inclusive' | 'exclusive',
                                    description: tax.description,
                                    created_at: tax.created_at
                                });
                            }
                        } else {
                            setSelectedTax(null);
                        }
                    }}
                />

                <CouponsView
                    coupons={couponsdata}
                    isOpen={showCouponsView}
                    onClose={() => setShowCouponsView(false)}
                    onSelectionChange={(selectedIds) => {
                        if (selectedIds.length > 0) {
                            const coupon = couponsdata.find(c => c.id === selectedIds[0]);
                            if (coupon) {
                                setSelectedCoupon({
                                    id: coupon.id,
                                    code: coupon.code || '',
                                    discount_percentage: coupon.discount_percentage,
                                    discount_amount: coupon.discount_amount ? Number(coupon.discount_amount) : undefined,
                                    description: coupon.description,
                                    usage_limit: coupon.usage_limit,
                                    end_date: coupon.end_date
                                });
                            }
                        } else {
                            setSelectedCoupon(null);
                        }
                    }}
                />
            </div>
            {isQuantityCalculatorOpen && calculatorContext && (
                <QuantityCalculator
                    handleClose={() => setIsQuantityCalculatorOpen(false)}
                    unit={calculatorContext.unitPrice}
                    price={calculatorContext.unitPrice}
                    maxQuantity={calculatorContext.maxQuantity}
                    productId={calculatorContext.variantId}
                    currentQuantity={calculatorContext.currentQuantity}
                    onApply={async (newQty: number) => {
                        const newCart = selectedVariants.map(item =>
                            item.id === calculatorContext.variantId
                                ? { ...item, quantity: newQty }
                                : item
                        );
                        await setSelectedVariants(newCart);
                    }}
                />
            )}
            {invoiceData && (
                <div className="w-full">
                    <OrderInvoice orderData={invoiceData} onClose={() => setInvoiceData(null)} />
                    <div className="w-full h-full fixed inset-0 bg-black/10 backdrop-blur-sm z-10" />
                </div>
            )}
            {showDatePickerModal && (
                <div className="fixed inset-0 overflow-y-auto z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white dark:bg-black rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-fit mx-auto sm:mx-4"
                    >
                        <div className="p-6">
                            <div className="flex justify-center mb-6">
                                <CardWrapper className="mx-auto overflow-y-auto w-fit p-0 border-none shadow-none bg-transparent">
                                    <CardContent className="p-0 flex">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={selectedDateRange?.from}
                                            selected={selectedDateRange}
                                            onSelect={setSelectedDateRange}
                                            numberOfMonths={isPhoneView ? 1 : 2}
                                            className="p-3"
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                        />
                                    </CardContent>
                                </CardWrapper>
                            </div>

                            {selectedDateRange?.from && selectedDateRange?.to && (
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Selected Range:</span>{" "}
                                        {selectedDateRange.from.toLocaleDateString()} - {selectedDateRange.to.toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 dark:text-white">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowDatePickerModal(false);
                                        setSelectedDateRange(undefined);
                                        setActiveTab(0);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-template-primary hover:bg-template-primary/90"
                                    onClick={() => {
                                        if (selectedDateRange?.from && selectedDateRange?.to) {
                                            console.log('Selected date range:', selectedDateRange);
                                            setShowDatePickerModal(false);
                                        }
                                    }}
                                    disabled={!selectedDateRange?.from || !selectedDateRange?.to}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            {showCustomerForm && <CustomerForm business_id={`${businessId}`} handleFormClose={() => setShowCustomerForm(false)} />}

            <DraftSelectionModal
                isOpen={showDraftSelectionModal}
                onClose={() => setShowDraftSelectionModal(false)}
                businessId={businessId}
                onDraftSelected={handleDraftSelected}
            />
            {!invoicePreview ? (
                <PendingOrdersModal
                    isOpen={showPendingOrdersModal}
                    onClose={handleClosePendingModal}
                    orders={pendingOrders}
                    onView={handlePendingView}
                    onDelete={handlePendingDelete}
                    title="Pending Orders"
                />

            ) : null}

            {invoicePreview && (
                <>
                    <OfflineSalesInvoice
                        sale={invoicePreview}
                        onClose={() => setInvoicePreview(null)}
                    />
                    <div className="w-full h-full fixed inset-0 bg-black/10 backdrop-blur-sm z-10" />
                </>
            )}
        </>
    );
}

export default SalesContent;