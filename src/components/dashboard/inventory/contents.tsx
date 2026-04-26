"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useReducer, useMemo, startTransition } from "react";
import Card, { ProductViewCardType } from "../card";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { TabList } from "..";
import { Card as CardWrapper, CardTitle, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { IoMdArrowUp } from "react-icons/io";
import { NotificationCard } from "../ui";
import { ConfigTables, StockManagementTable, StoreProductsTable } from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { MiniStockList, MobileNavbar, MobileSideBar } from "../sections";
import OrderTable from "../tables/order-table";
import { AttributeForm, CategoryForm, SupplierForm, TaxForm } from "./forms";
import CreateDiscountForm from "../sales/forms/add-discount-form";
import CreateCouponForm from "../sales/forms/add-coupon-form";
import { Plus, Table } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/config/store-config";
import { AddInventory, OrderForm, SuppliersForm } from "./sketch";
import { useQuery } from "@tanstack/react-query";
import { getFastMovingStocks, getLowStocksStatus, getOutOfStocksStatus, getStockAnalytics, getUserProducts, getVariantsByBusiness, getVariationAnalytics } from "@/api/controllers/get/handler";
import { IconType } from "react-icons";
import { PiShoppingCartSimple } from "react-icons/pi";
import { TbCurrencyNaira } from "react-icons/tb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FastMovingPayload, LowStocks, ProductVariantResponseObject } from "@/models/types/shared/handlers-type";
import { ProductOverviewLinGraph } from "../charts/product-overview-line-graph";
import { useCategoriesData, useStockAnalyticsData, useStockAnalyticsTotal, useStockQueryDataAnalytics } from "@/store/state/lib/stocks-state-manager";
import { CategoriesBar } from "../charts/category-horizontal-chart";
import { IoCubeOutline } from "react-icons/io5";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IoIosArrowRoundForward } from "react-icons/io";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import EditProductVariationsForm from "./forms/edit-product-variations";
import SupplierManagementTable from "../tables/suppliers-management";
import InventoryDonutChart from "../charts/inventory-pie-chart";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
// import { TransactionInvoice } from "../invoices";

type StateType = {
    isProductForm: boolean;
    isCategoryForm: boolean;
    isAttributeForm: boolean;
    isSupplierForm: boolean;
    isOrderForm: boolean;
    isTaxForm: boolean;
    isDiscountForm: boolean;
    isCouponForm: boolean;
}

type ActionType = {
    type: string;
    payload: boolean;
}

const formToggler = (state: StateType, action: ActionType): StateType => {
    switch (action.type) {
        case "isProduct":
            return { ...state, isProductForm: action.payload, isAttributeForm: false, isCategoryForm: false, isSupplierForm: false, isOrderForm: false, isTaxForm: false, isDiscountForm: false, isCouponForm: false }
        case "isCategory":
            return { ...state, isCategoryForm: action.payload, isAttributeForm: false, isProductForm: false, isSupplierForm: false, isOrderForm: false, isTaxForm: false, isDiscountForm: false, isCouponForm: false }
        case "isAttribute":
            return { ...state, isAttributeForm: action.payload, isProductForm: false, isCategoryForm: false, isSupplierForm: false, isOrderForm: false, isTaxForm: false, isDiscountForm: false, isCouponForm: false }
        case "isSupplier":
            return { ...state, isSupplierForm: action.payload, isProductForm: false, isCategoryForm: false, isAttributeForm: false, isOrderForm: false, isTaxForm: false, isDiscountForm: false, isCouponForm: false }
        case "isOrderForm":
            return { ...state, isOrderForm: action.payload, isProductForm: false, isCategoryForm: false, isAttributeForm: false, isSupplierForm: false, isTaxForm: false, isDiscountForm: false, isCouponForm: false }
        case "isTax":
            return { ...state, isTaxForm: action.payload, isProductForm: false, isCategoryForm: false, isAttributeForm: false, isSupplierForm: false, isOrderForm: false, isDiscountForm: false, isCouponForm: false }
        case "isDiscount":
            return { ...state, isDiscountForm: action.payload, isProductForm: false, isCategoryForm: false, isAttributeForm: false, isSupplierForm: false, isOrderForm: false, isTaxForm: false, isCouponForm: false }
        case "isCoupon":
            return { ...state, isCouponForm: action.payload, isProductForm: false, isCategoryForm: false, isAttributeForm: false, isSupplierForm: false, isOrderForm: false, isTaxForm: false, isDiscountForm: false }
        default:
            return { ...state };
    }
}

const InventoryContent = () => {
    const [tabLabels] = useState<Array<string>>(["Today", "Yesterday", "This Week", "This Month", "Custom Date"]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [transactionList, setTransactionList] = useState<Array<ProductViewCardType>>([]);
    const [tabGasLists] = useState<Array<string>>(["Overview", "Products", "Order Management", "Stock Management", "Suppliers", "Configuration"]);
    const [listCount, setlistCount] = useState<number>(0);

    const { setQueryUrl } = useStockQueryDataAnalytics();

    const [queryValues, setQueryValues] = useState<{ date_filter: string; start_date?: string; end_date?: string; }>({
        date_filter: "",
        start_date: "",
        end_date: ""
    });

    // Date picker modal states
    const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const { isNotifierOpen, setIsNotifier, setisMobileMenuOpen, isMobileMenuOpen, isPhoneView } = useDashboardContextHooks();

    const currentTabId = useSelector((state: RootState) => state.tableCurrentId);
    const [businessId, setBusinessId] = useState<number>(0);

    const [showAdjustForm, setShowAdjustForm] = useState<boolean>(false);
    const [showSuppliersForm, setShowSuppliersForm] = useState<boolean>(false);
    // const businesses = useDeferredValue(business_data?.data?.businesses);

    const { stockData } = useStockAnalyticsData();
    const { total: stockTotal } = useStockAnalyticsTotal();
    const { _categories } = useCategoriesData();

    const { data: products = { products: [] }, isLoading: isProducts, isSuccess, isError, refetch } = useQuery({
        queryKey: ['get-products', businessId],
        queryFn: () => getUserProducts(businessId),
        enabled: businessId !== 0,
        retry: false,
        refetchOnWindowFocus: 'always',
    });

    const { data: businessVariants, isSuccess: businessVariantSuccess, isError: businessVariantError } = useQuery({
        queryKey: ["get-business-variants", businessId],
        queryFn: () => getVariantsByBusiness(`${businessId}`),
        enabled: businessId !== 0,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always'
    });

    const productsData = useMemo(() => {
        if (products && isSuccess && !isError) return products.products;
        return [];
    }, [products, isSuccess, isError]);

    const variants = useMemo<ProductVariantResponseObject[]>(() => {
        if (businessVariantSuccess && !businessVariantError) {
            return businessVariants?.variants as ProductVariantResponseObject[];
        }
        return [];
    }, [businessVariants, businessVariantSuccess, businessVariantError]);

    useEffect(() => {
        if (typeof ("sessionStorage" in window) !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId") ? JSON.parse((sessionStorage.getItem("selectedBusinessId") as string)) : 0;
            setBusinessId(businessId);
        }
        return () => setBusinessId(businessId);
    }, [businessId]);

    const branchId = useMemo(() => {
        if (typeof window !== "undefined" && "sessionStorage" in window) {
            const branchId = sessionStorage.getItem("selectedBranchId") ? JSON.parse((sessionStorage.getItem("selectedBranchId") as string)) : 0;
            return branchId;
        }
        return 0;
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("inventorycount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("inventorycount", JSON.stringify(listCount));
        }
    }, [listCount]);
    const [indicatorBar, setIndicatorBar] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const listContainerRef = useRef<HTMLDivElement | null>(null);

    const [restockProductId, setRestockProductId] = useState<string>("");


    const [totalStocks, setTotalStocks] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [outOfStock, setOutOfStock] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [lowStock, setLowStock] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [inventoryValue, setInventoryValue] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [potentialSales, setPotentialSales] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [totalStockUnits, setTotalStockUnits] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [kgTotalStocks, setKgTotalStocks] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [kgOutOfStock, setKgOutOfStock] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [kgLowStock, setKgLowStock] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [kgInStock, setKgInStock] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [kgInventoryValue, setKgInventoryValue] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [kgPotentialSales, setKgPotentialSales] = useState<ProductViewCardType>({
        id: "",
        name: "",
        amount: 0,
        isCurrency: false,
        quantity: 0
    });

    const [stockCount, setStockCount] = useState<number>(0);

    const { data: lowStocks, isSuccess: lowStockSuccess, error: lowStockError } = useQuery({
        queryKey: ["get-low-stocks", businessId, stockCount],
        queryFn: () => getLowStocksStatus({ businessId: Number(businessId) }),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 1
    });

    const { data: outOfStocks, isSuccess: outOfStockSuccess, error: outOfStockError } = useQuery({
        queryKey: ["get-out-of-stock", businessId, stockCount],
        queryFn: () => getOutOfStocksStatus({ businessId: Number(businessId) }),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 1
    });

    const { data: fastMovingStocks, isSuccess: fastMovingStocksSuccess, error: fastMovingStocksError } = useQuery({
        queryKey: ["get-fast-moving-status", businessId],
        queryFn: () => getFastMovingStocks({ businessId: Number(businessId) }),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: false
    });

    const fastMovingStocksData = useMemo(() => {
        if (fastMovingStocksSuccess && !fastMovingStocksError) {
            return fastMovingStocks?.fast_moving || [];
        }
        return [];
    }, [fastMovingStocks, fastMovingStocksSuccess, fastMovingStocksError]);

    const lowStocksData = useMemo(() => {
        if (lowStockSuccess && !lowStockError) {
            return lowStocks?.low_stock || [];
        }
        return [];
    }, [lowStocks, lowStockSuccess, lowStockError]);

    const outStockData = useMemo(() => {
        if (outOfStockSuccess && !outOfStockError) {
            return outOfStocks?.out_of_stock || [];
        }
        return [];
    }, [outOfStocks, outOfStockSuccess, outOfStockError]);

    const [stocks, setStocks] = useState<LowStocks[][] | [][]>([]);

    useEffect(() => {
        setStocks([lowStocksData, outStockData]);
    }, [lowStocksData, outStockData]);

    const [state, dispatch] = useReducer(formToggler, {
        isProductForm: false,
        isCategoryForm: false,
        isAttributeForm: false,
        isSupplierForm: false,
        isOrderForm: false,
        isTaxForm: false,
        isDiscountForm: false,
        isCouponForm: false
    });

    const { hiddenScrollbar } = useCustomStyles();

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
        const node = tabRefs.current[activeTab];
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

        const period = tabLabels[activeTab].toLowerCase().replace(/\s/g, "_");
        let queryData = {} as { date_filter: string; start_date?: string; end_date?: string };
        switch (period) {
            case "custom_date": {
                const _period = "custom";
                const selectedFrom = selectedDateRange?.from?.toLocaleString();
                const selectedTo = selectedDateRange?.to?.toLocaleString();
                queryData = { ...queryData, date_filter: _period ?? "custom", start_date: selectedFrom, end_date: selectedTo };
            }
                break;
            default:
                queryData = { date_filter: (period.split("_")?.length ? period?.split("_")[period?.split("_")?.length - 1] : period) ?? "" }
                break;
        }
        setQueryValues(queryData);

    }, [activeTab, selectedDateRange?.from, selectedDateRange?.to, tabLabels]);

    const qualifiedQueryValues = useMemo(() => {
        const searchParams = new URLSearchParams();
        if (businessId || queryValues) {
            const newData = {
                business_id: +businessId,
                ...queryValues
            };
            Object.entries(newData)
                ?.filter(([, value]) => !!value)
                ?.forEach(([key, value]) => searchParams?.append(key, value.toString()));
        }
        return searchParams?.toString();
    }, [queryValues, businessId]);

    useEffect(() => {
        setQueryUrl(qualifiedQueryValues);
    }, [qualifiedQueryValues, setQueryUrl]);

    useEffect(() => {
        const activeList = listRefs.current[listCount];
        const listContainer = listContainerRef.current;

        if (activeList && listContainer) {
            const containerRect = listContainer.getBoundingClientRect();
            const listRect = activeList.getBoundingClientRect();
            const padding = 20;
            setIndicatorBar({
                left: (listRect.left - containerRect.left + listContainer.scrollLeft - padding / 2),
                width: listRect.width + padding
            });
        }
        localStorage.setItem("inventorycount", JSON.stringify(listCount));
    }, [listCount]);

    const { data: stockAnalytics, isLoading: isStockAnalytics, error: stockAnalyticsError } = useQuery({
        queryKey: ['stock-analytics', businessId, branchId, qualifiedQueryValues],
        queryFn: () => getStockAnalytics({ business_id: Number(businessId), branch_id: Number(branchId), url: `/api/finance/stock-analytics?${qualifiedQueryValues}` }),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: false
    });

    const { data: variationAnalytics, isLoading: isVariationAnalytics, error: variationAnalyticsError } = useQuery({
        queryKey: ["variation-analytics", businessId, branchId],
        queryFn: () => getVariationAnalytics({ business_id: Number(businessId), branch_id: Number(branchId) }),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: 'always',
    });

    useEffect(() => {
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            if (stockAnalytics && !isStockAnalytics && !stockAnalyticsError) {
                const total_stock_data = {
                    id: 1,
                    name: "In Stock",
                    amount: stockAnalytics?.inStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "SKUs"
                }
                const out_of_stock_data = {
                    id: 2,
                    name: "Out of Stock",
                    amount: stockAnalytics?.outOfStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "SKUs"
                }
                const low_stock_data = {
                    id: 3,
                    name: "Low Stock",
                    amount: stockAnalytics?.lowStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "SKUs"
                }
                const inventory_value_data = {
                    id: 4,
                    name: "Total Inventory Value",
                    amount: stockAnalytics?.inventoryValue,
                    isCurrency: true,
                    quantity: 0,
                    unit: ""
                }
                const potential_sales_data = {
                    id: 5,
                    name: "Total Sell Value",
                    amount: stockAnalytics?.potentialSaleValue,
                    isCurrency: true,
                    quantity: 0,
                    unit: ""
                }
                const totalStocksData = {
                    id: 6,
                    name: "Total Inventory Units",
                    amount: stockAnalytics?.totalStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "Units"
                }

                // KG Data
                const kg_in_stock_data = {
                    id: 7,
                    name: "In KG Stock",
                    amount: stockAnalytics?.kgInStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "KG"
                }
                const kg_out_of_stock_data = {
                    id: 8,
                    name: "Out of KG Stock",
                    amount: stockAnalytics?.kgOutOfStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "KG"
                }
                const kg_low_stock_data = {
                    id: 9,
                    name: "Low KG Stock",
                    amount: stockAnalytics?.kgLowStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "KG"
                }
                const kg_inventory_value_data = {
                    id: 10,
                    name: "KG Inventory Value",
                    amount: stockAnalytics?.kgInventoryValue,
                    isCurrency: true,
                    quantity: 0,
                    unit: ""
                }
                const kg_potential_sales_data = {
                    id: 11,
                    name: "KG Sell Value",
                    amount: stockAnalytics?.kgPotentialSaleValue,
                    isCurrency: true,
                    quantity: 0,
                    unit: ""
                }
                const kg_total_stocks_data = {
                    id: 12,
                    name: "Total KG Stock",
                    amount: stockAnalytics?.kgTotalStock,
                    isCurrency: false,
                    quantity: 0,
                    unit: "KG"
                }


                setTotalStocks(total_stock_data);
                setOutOfStock(out_of_stock_data);
                setLowStock(low_stock_data);

                setInventoryValue(inventory_value_data);
                setPotentialSales(potential_sales_data);
                setTotalStockUnits(totalStocksData);

                setKgInStock(kg_in_stock_data);
                setKgOutOfStock(kg_out_of_stock_data);
                setKgLowStock(kg_low_stock_data);
                setKgInventoryValue(kg_inventory_value_data);
                setKgPotentialSales(kg_potential_sales_data);
                setKgTotalStocks(kg_total_stocks_data);
                return;
            }
            const total_stock_data = {
                id: 1,
                name: "In Stock",
                amount: 0,
                isCurrency: false,
                quantity: 0,
                unit: "SKUs"
            }
            const out_of_stock_data = {
                id: 2,
                name: "Out of Stock",
                amount: 0,
                isCurrency: false,
                quantity: 0,
                unit: "SKUs"
            }
            const low_stock_data = {
                id: 3,
                name: "Low Stock",
                amount: 0,
                isCurrency: false,
                quantity: 0,
                unit: "SKUs"
            }
            const inventory_value_data = {
                id: 4,
                name: "Total Inventory Value",
                amount: 0,
                isCurrency: true,
                quantity: 0,
                unit: ""
            }
            const potential_sales_data = {
                id: 5,
                name: "Total Sell Value",
                amount: 0,
                isCurrency: true,
                quantity: 0,
                unit: ""
            }
            const totalStocksData = {
                id: 6,
                name: "Total Inventory Units",
                amount: 0,
                isCurrency: false,
                quantity: 0,
                unit: "Units"
            }

            const kg_fallback = {
                id: 0,
                name: "",
                amount: 0,
                isCurrency: false,
                quantity: 0,
                unit: ""
            };

            setTotalStocks(total_stock_data);
            setOutOfStock(out_of_stock_data);
            setLowStock(low_stock_data);

            setInventoryValue(inventory_value_data);
            setPotentialSales(potential_sales_data);
            setTotalStockUnits(totalStocksData);

            setKgInStock({ ...kg_fallback, id: 7, name: "In KG Stock", unit: "KG" });
            setKgOutOfStock({ ...kg_fallback, id: 8, name: "Out of KG Stock", unit: "KG" });
            setKgLowStock({ ...kg_fallback, id: 9, name: "Low KG Stock", unit: "KG" });
            setKgInventoryValue({ ...kg_fallback, id: 10, name: "KG Inventory Value", isCurrency: true });
            setKgPotentialSales({ ...kg_fallback, id: 11, name: "KG Sell Value", isCurrency: true });
            setKgTotalStocks({ ...kg_fallback, id: 12, name: "Total KG Stock", unit: "KG" });
        })
    }, [stockAnalytics, isStockAnalytics, stockAnalyticsError]);

    useEffect(() => {
        if (variationAnalytics && !isVariationAnalytics && !variationAnalyticsError) {

        }
    }, [variationAnalytics, isVariationAnalytics, variationAnalyticsError]);

    useEffect(() => {
        const transactions_data = [lowStock, outOfStock, totalStocks, totalStockUnits, inventoryValue, potentialSales];

        if (kgInStock.amount > 0) transactions_data.push(kgInStock);
        if (kgOutOfStock.amount > 0) transactions_data.push(kgOutOfStock);
        if (kgLowStock.amount > 0) transactions_data.push(kgLowStock);
        if (kgTotalStocks.amount > 0) transactions_data.push(kgTotalStocks);
        if (kgInventoryValue.amount > 0) transactions_data.push(kgInventoryValue);
        if (kgPotentialSales.amount > 0) transactions_data.push(kgPotentialSales);

        setTransactionList(transactions_data);
    }, [lowStock, outOfStock, totalStocks, inventoryValue, potentialSales, totalStockUnits, kgInStock, kgOutOfStock, kgLowStock, kgTotalStocks, kgInventoryValue, kgPotentialSales]);
    return (
        <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Inventory</div>
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                    {(listCount === 0) && (
                        <div
                            ref={containerRef}
                            style={hiddenScrollbar}
                            className="w-full relative rounded-sm bg-template-whitesmoke-dim dark:bg-black z-10 overflow-auto"
                        >
                            <div className="min-w-[520px] w-full flex gap-x-6 items-center py-2 px-3">
                                {tabLabels.map((label, idx) => (
                                    <div
                                        key={label}
                                        ref={el => { tabRefs.current[idx] = el; }}
                                        onClick={() => {
                                            setActiveTab(idx);
                                            if (idx === tabLabels.length - 1) {
                                                setShowDatePickerModal(true);
                                            }
                                        }}
                                        className={cn(`text-[13px] font-[600] cursor-pointer px-2 ${idx === activeTab ? "text-white" : ""}`)}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                            <div
                                className={"absolute -z-10 transition-all duration-300 ease-in-out top-1/2 rounded-sm -translate-y-1/2 h-[90%] bg-template-chart-store py-1 px-2"}
                                style={{
                                    left: indicatorStyle.left,
                                    width: indicatorStyle.width,
                                }}
                            />
                        </div>
                    )}
                    {(listCount === 1) && (
                        <button onClick={() => dispatch({ type: "isProduct", payload: !state.isProductForm })} className="py-2 px-4 rounded-md font-[550] self-start text-slate-100 bg-template-chart-store text-sm cursor-pointer flex items-center gap-x-3">
                            {!state.isProductForm && (<Plus size={18} />)}
                            {state.isProductForm && (<Table size={18} />)}
                            <span>{!state.isProductForm && "Add A Product"}</span>
                            <span>{state.isProductForm && "Show Table"}</span>
                        </button>
                    )}
                    {(listCount === 2) && (
                        <button onClick={() => dispatch({ type: "isOrderForm", payload: !state.isOrderForm })} className="py-2 px-4 rounded-md font-[550] text-slate-100 bg-template-chart-store text-sm cursor-pointer self-start flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Create Order</span>
                        </button>
                    )}
                    {(listCount === 3) && (
                        <button onClick={() => setShowAdjustForm(true)} className="py-2 px-4 rounded-md font-[550] text-slate-100 bg-template-chart-store text-sm cursor-pointer self-start flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Adjust Product</span>
                        </button>
                    )}
                    {(listCount === 4) && (
                        <button onClick={() => setShowSuppliersForm(true)} className="py-2 px-4 rounded-md font-[550] text-slate-100 bg-template-chart-store text-sm cursor-pointer self-start flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Add Suppliers</span>
                        </button>
                    )}
                    {((listCount === 5) && (currentTabId.currentId === 0)) && (
                        <button onClick={() => dispatch({ type: "isCategory", payload: true })} data-bid={businessId || 0} className="py-2 px-4 rounded-md font-[550] text-slate-100 self-start bg-template-chart-store text-sm cursor-pointer flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Add New Category</span>
                        </button>
                    )}
                    {((listCount === 5) && (currentTabId.currentId === 1)) && (
                        <button onClick={() => dispatch({ type: "isAttribute", payload: true })} data-bid={businessId || 0} className="py-2 px-4 rounded-md font-[550] text-slate-100 self-start bg-template-chart-store text-sm cursor-pointer flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Add New Attribute</span>
                        </button>
                    )}
                    {((listCount === 5) && (currentTabId.currentId === 2)) && (
                        <button onClick={() => dispatch({ type: "isTax", payload: true })} data-bid={businessId || 0} className="py-2 px-4 rounded-md font-[550] text-slate-100 self-start bg-template-chart-store text-sm cursor-pointer flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Add New Taxes</span>
                        </button>
                    )}
                    {((listCount === 5) && (currentTabId.currentId === 3)) && (
                        <button onClick={() => dispatch({ type: "isDiscount", payload: true })} data-bid={businessId || 0} className="py-2 px-4 rounded-md font-[550] text-slate-100 self-start bg-template-chart-store text-sm cursor-pointer flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Add New Discount</span>
                        </button>
                    )}
                    {((listCount === 5) && (currentTabId.currentId === 4)) && (
                        <button onClick={() => dispatch({ type: "isCoupon", payload: true })} data-bid={businessId || 0} className="py-2 px-4 rounded-md font-[550] text-slate-100 self-start bg-template-chart-store text-sm cursor-pointer flex items-center gap-x-3">
                            <Plus size={18} />
                            <span>Add New Coupon</span>
                        </button>
                    )}
                </div>
            </div>
            {listCount === 0 && (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {transactionList.map((data, index) => (
                        <Card key={index} data={data} icon={data.isCurrency ? TbCurrencyNaira : PiShoppingCartSimple} />
                    ))}
                </div>
            )}
            <div ref={listContainerRef} className="w-full bg-template-whitesmoke-dim dark:bg-black mx-auto rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                <div className="min-w-[590px] w-full flex items-center justify-between">
                    {tabGasLists?.map((item, index) => (
                        <TabList item={item} index={index} setlistCount={setlistCount} key={index} color={index === listCount ? "text-white" : ""} ref={el => {
                            if (el) listRefs.current[index] = el
                        }} />
                    ))}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 bg-template-chart-store h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{ left: indicatorBar.left, width: indicatorBar.width }} />
            </div>
            <div className={cn(`w-full ${isPhoneView ? "mb-24" : ""}`)}>
                <AnimatePresence mode="sync">
                    {listCount === 0 && (
                        <motion.div
                            key="overview"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mt-2 flex flex-col gap-y-5"
                        >
                            <motion.div variants={itemVariant} className="w-full bg-white dark:bg-black">
                                {!isProducts ? (
                                    <ProductOverviewLinGraph title="Stock Movement" content="Monitor your stocks in real time" productLists={productsData} />
                                ) : (
                                    <CardWrapper>
                                        <CardHeader>
                                            <CardTitle>Stock Movement</CardTitle>
                                            <CardDescription>Monitor your stocks in real time</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm font-[500]">
                                                No Available Records
                                            </div>
                                        </CardContent>
                                    </CardWrapper>
                                )}
                            </motion.div>
                            <motion.div variants={itemVariant} className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CardWrapper className="w-full dark:bg-black">
                                    <CardHeader>
                                        <CardTitle>Inventory Status Stock</CardTitle>
                                        <CardDescription>In Stock, Low & Out of Stock Distribution Across All SKUs.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-y-3 md:grid-cols-2">
                                            <InventoryDonutChart />
                                            <motion.div
                                                variants={itemVariant}
                                                className="flex md:justify-end w-full my-auto"
                                            >
                                                {stockData || stockData === null ? (
                                                    (
                                                        <div className="flex flex-col gap-y-6">
                                                            <motion.div variants={itemVariant} className="w-full flex md:w-fit justify-between md:justify-center items-center gap-x-2 md:gap-x-8">
                                                                <div className="flex items-center gap-x-2">
                                                                    <div className="w-4 h-4 rounded-full bg-template-chart-store"></div>
                                                                    <div className="text-xs font-[500]">In Stock</div>
                                                                </div>
                                                                <div className="text-xs font-[600]">{isNaN(Math.round(((stockData?.inStock || 0) * 100) / (stockTotal || 0))) ? 0 : Math.round(((stockData?.inStock || 0) * 100) / (stockTotal || 0))}%</div>
                                                            </motion.div>
                                                            <motion.div variants={itemVariant} className="w-full flex md:w-fit justify-between md:justify-center items-center gap-x-2 md:gap-x-8">
                                                                <div className="flex items-center gap-x-2">
                                                                    <div className="w-4 h-4 rounded-full bg-template-card-pending"></div>
                                                                    <div className="text-xs font-[500]">Low Stock</div>
                                                                </div>
                                                                <div className="text-xs font-[600]">{isNaN(Math.round(((stockData?.lowStock || 0) * 100) / (stockTotal || 0))) ? 0 : Math.round(((stockData?.lowStock || 0) * 100) / (stockTotal || 0))}%</div>
                                                            </motion.div>
                                                            <motion.div variants={itemVariant} className="w-full flex md:w-fit justify-between md:justify-center items-center gap-x-2 md:gap-x-8">
                                                                <div className="flex items-center gap-x-2">
                                                                    <div className="w-4 h-4 rounded-full bg-template-chart-gas"></div>
                                                                    <div className="text-xs font-[500]">Out Of Stock</div>
                                                                </div>
                                                                <div className="text-xs font-[600]">{isNaN(Math.round(((stockData?.outOfStock || 0) * 100)) / (stockTotal || 0)) ? 0 : Math.round(((stockData?.outOfStock || 0) * 100) / (stockTotal || 0))}%</div>
                                                            </motion.div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex flex-col gap-y-6">
                                                        <motion.div variants={itemVariant} className="w-full flex md:w-fit justify-between md:justify-center items-center gap-x-2 md:gap-x-8">
                                                            <div className="flex items-center gap-x-2">
                                                                <div className="w-4 h-4 rounded-full bg-template-chart-store"></div>
                                                                <div className="text-xs font-[500]">In Stock</div>
                                                            </div>
                                                            <div className="text-xs font-[600]">0%</div>
                                                        </motion.div>
                                                        <motion.div variants={itemVariant} className="w-full flex md:w-fit justify-between md:justify-center items-center gap-x-2 md:gap-x-8">
                                                            <div className="flex items-center gap-x-2">
                                                                <div className="w-4 h-4 rounded-full bg-template-card-pending"></div>
                                                                <div className="text-xs font-[500]">Low Stock</div>
                                                            </div>
                                                            <div className="text-xs font-[600]">0%</div>
                                                        </motion.div>
                                                        <motion.div variants={itemVariant} className="w-full flex md:w-fit justify-between md:justify-center items-center gap-x-2 md:gap-x-8">
                                                            <div className="flex items-center gap-x-2">
                                                                <div className="w-4 h-4 rounded-full bg-template-chart-gas"></div>
                                                                <div className="text-xs font-[500]">Out Of Stock</div>
                                                            </div>
                                                            <div className="text-xs font-[600]">0%</div>
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </CardWrapper>
                                <CardWrapper className="dark:bg-black">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col gap-y-0.5">
                                                <CardTitle>Inventory by Category</CardTitle>
                                                <CardDescription className="text-sm">Distribution of Stock Units Across Product Categories</CardDescription>
                                            </div>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                {_categories?.length ? (
                                                    <SelectContent>
                                                        {_categories?.map((item, index) => (
                                                            <SelectItem key={`horinzontal-category-${index}`} value={item.name}>{item.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                ) : null}
                                            </Select>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CategoriesBar />
                                    </CardContent>
                                </CardWrapper>
                            </motion.div>
                        </motion.div>
                    )}
                    {listCount === 0 && (
                        <motion.div variants={itemVariant} className="mt-4 w-full grid grid-cols-1 lg:grid-cols-[35%_65%] gap-4">
                            <div className=" w-full py-4 px-2 rounded-sm bg-white dark:bg-black">
                                <div className="flex flex-col h-full justify-between">
                                    <div className="flex flex-col gap-y-1">
                                        <div className="flex justify-between items-center">
                                            <div className="text-[13px] font-[550]">Low Stock Items</div>
                                            <Select onValueChange={(val) => {
                                                if (val === "low_stock") {
                                                    setStockCount(0);
                                                    return;
                                                }
                                                setStockCount(1);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Check Out List" title="Check Out" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low_stock">
                                                        Low Stock
                                                    </SelectItem>
                                                    <SelectItem value="out_stock">
                                                        Out Stock
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="text-[13px] font-[400]">Products that have reached threshold</div>
                                    </div>
                                    <div className="mt-3 h-full max-h-[300px] overflow-y-auto" style={hiddenScrollbar}>
                                        <div className="h-fit">
                                            {/* Low Stock Items oo */}
                                            <div className="flex flex-col gap-y-4">
                                                {stocks?.length > 1 ?
                                                    ((stocks[stockCount] || []) as LowStocks[] | [])?.map((item: LowStocks, index: number) => (
                                                        <MiniStockList setRestockProductId={setRestockProductId} onClick={dispatch} item={item} key={index} />
                                                    ))
                                                    : (
                                                        <p>No results</p>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CardWrapper className="dark:bg-black">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-x-1">
                                        <IoCubeOutline />
                                        <div className="text-sm font-[600]">Fast Moving Stock</div>
                                    </CardTitle>
                                    <CardDescription>Top-selling item based on recent sales performance</CardDescription>
                                </CardHeader>
                                <CardContent className="max-h-[350px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                    <div className="w-full min-w-[580px] overflow-x-auto" style={{
                                        scrollbarWidth: "none"
                                    }}>
                                        <div className="py-2.5 px-3 bg-template-whitesmoke dark:bg-black border-b-2 border-gray-500/20 flex">
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.25] text-xs font-bold">
                                                    <div>Image</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Item Image</div>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.4] text-xs font-bold">
                                                    <div>Item/SKU</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Item / Item SKU</div>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.35] text-xs font-bold">
                                                    <div>Category</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Category</div>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.4] text-xs font-bold truncate">
                                                    <div>Unit Sold</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Unit Sold (Last 30 Days)</div>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.4] text-xs font-bold">
                                                    <div>Current</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Current Stock</div>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.35] text-xs font-bold">
                                                    <div>Threshold</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Threshold</div>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger className="flex-[0.4] text-xs font-bold truncate">
                                                    <div>Revenue</div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                    <div className="text-xs font-[550]">Revenue Generated</div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {fastMovingStocksData?.length ?
                                            fastMovingStocksData?.map((item: FastMovingPayload, idx: number) => (
                                                <div key={`fast-moving-status-${idx}`} className="py-2.5 px-3 flex">
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.25] text-xs font-bold">
                                                            <div className="w-12 h-12 rounded-md bg-template-whitesmoke">
                                                                <Image width={350} height={350} className="w-full h-full object-contain object-center" src={item?.image_url?.[0]?.secure_url} alt={`image-variant-${item?.variant_id}`} />
                                                            </div>
                                                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {item?.image_url?.length > 1 ?
                                                                        item?.image_url?.map((item, idx) => (
                                                                            <div key={`image-variant-${item.public_id}`} className="w-12 h-12 rounded-md bg-template-whitesmoke">
                                                                                <Image width={350} height={350} className="w-full h-full object-contain object-center" src={item?.secure_url} alt={`image-variant-${idx}`} />
                                                                            </div>
                                                                        ))
                                                                        : (
                                                                            <div className="w-12 h-12 rounded-md bg-template-whitesmoke">
                                                                                <Image width={350} height={350} className="w-full h-full object-contain object-center" src={item.image_url?.[0].secure_url} alt={`image-variant-${item?.variant_id}`} />
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </TooltipContent>
                                                        </TooltipTrigger>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.4] text-xs font-[450] truncate">
                                                            <div>{item.sku}</div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                            <div className="text-xs font-[500]">{item.sku}</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.35] text-xs font-[450] truncate">
                                                            <div>N/A</div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                            <div className="text-xs font-[500]">{item.sku + "-" + " N/A"}</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.4] text-xs font-[450] truncate">
                                                            <div>{item.total_sold}</div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                            <div className="flex-[0.4] font-[500] text-xs">{item.total_sold} SKUs</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.4] text-xs font-[450] truncate">
                                                            <div>{item.quantity}</div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                            <div className="flex-[0.4] font-[500] text-xs text-green-500">{item.quantity} In Stock</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.35] text-xs font-[450] truncate">
                                                            <div>{item.threshold}</div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                            <div className="flex-[0.4] font-[500] text-xs text-orange-500">{item.threshold} Threshold</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex-[0.35] text-xs font-[450] truncate">
                                                            <div>{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "narrowSymbol" }).format(+item?.selling_price * +item?.total_sold)}</div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                                            <div className="flex-[0.4] font-[500] text-xs">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "narrowSymbol" }).format(+item?.selling_price * +item?.total_sold)}</div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            ))
                                            : (
                                                <div className="text-sm font-[500] px-5 py-3">No Items Available</div>
                                            )}
                                    </div>
                                </CardContent>
                                <CardFooter className="w-full">
                                    <div className="w-full flex items-center justify-between">
                                        <div className="text-xs font-[500]">Last Updated: <span className="text-template-primary">Just Now</span></div>
                                        <div className="flex items-center gap-x-1 text-template-primary">
                                            <div className="text-xs font-[500]">View Dashboard Report</div>
                                            <IoIosArrowRoundForward size={17} />
                                        </div>
                                    </div>
                                </CardFooter>
                            </CardWrapper>
                        </motion.div>
                    )}
                    {listCount === 1 && (
                        <motion.div
                            key="inventory"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mt-2"
                        >
                            {(!state.isProductForm) && <StoreProductsTable data={productsData} isLoading={isProducts} businessId={businessId} refetchProduct={refetch} />}
                            {(state.isProductForm) && <AddInventory switchToTable={() => dispatch({ type: "isProduct", payload: false })} businessId={+businessId} />}
                        </motion.div>
                    )}
                    {listCount === 2 && (
                        <motion.div
                            key="sales"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mt-2"
                        >
                            <OrderTable />
                        </motion.div>
                    )}
                    {listCount === 3 && (
                        <motion.div
                            key="stocks-manager"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mt-2"
                        >
                            <StockManagementTable />
                        </motion.div>
                    )}
                    {listCount === 4 && (
                        <motion.div
                            key="suppliers-table"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mt-2"
                        >
                            <SupplierManagementTable />
                        </motion.div>
                    )}
                    {listCount === 5 && (
                        <motion.div
                            key="config-tables"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full mt-2"
                        >
                            <ConfigTables />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {isNotifierOpen && <NotificationCard setIsOpen={setIsNotifier} />}
            {/* <TransactionInvoice /> */}
            {isMobileMenuOpen && (
                <MobileSideBar onClose={() => setisMobileMenuOpen(false)} isOpen={isMobileMenuOpen} />
            )}
            <MobileNavbar />
            {(state.isCategoryForm) && <CategoryForm businessId={+businessId} handleFormClose={() => dispatch({ type: "isCategory", payload: false })} />}
            {(state.isAttributeForm) && <AttributeForm businessId={`${businessId}`} handleFormClose={() => dispatch({ type: "isAttribute", payload: false })} />}
            {(state.isSupplierForm) && <SupplierForm businessId={`${businessId}`} handleFormClose={() => dispatch({ type: "isSupplier", payload: false })} />}
            {state.isOrderForm && (<OrderForm product_id={restockProductId} handleFormClose={() => dispatch({ type: "isOrderForm", payload: false })} business_id={businessId} />)}
            {(state.isTaxForm) && <TaxForm business_id={`${businessId}`} handleFormClose={() => dispatch({ type: "isTax", payload: false })} />}
            {(state.isDiscountForm) && <CreateDiscountForm business_id={`${businessId}`} handleFormClose={() => dispatch({ type: "isDiscount", payload: false })} />}
            {(state.isCouponForm) && <CreateCouponForm business_id={`${businessId}`} handleFormClose={() => dispatch({ type: "isCoupon", payload: false })} />}
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
            {showAdjustForm && (
                <EditProductVariationsForm
                    handleFormClose={() => setShowAdjustForm(false)}
                    productName="Not Listed"
                    variants={variants}
                    businessId={`${businessId}`}
                />
            )}
            {showSuppliersForm && (
                <SuppliersForm
                    handleFormClose={() => setShowSuppliersForm(false)}
                    business_id={businessId}
                />
            )}
        </div>
    );
}

export default InventoryContent;