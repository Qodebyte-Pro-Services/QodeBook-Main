"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { OverviewCard, TabList } from "..";
import { DoubleChart, SalesPieChart } from "../charts";
import { Card as CardWrapper, CardTitle, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { ExpensesTable, LoginAttemptsTable, SalesTable, StoreProductsTable } from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { MobileNavbar, MobileSideBar } from "../sections";
import { BusinessModalCard } from "@/components/dashboard/modal";
import { CustomNaira } from "@/components/customs/Icons";
import { TbCurrencyNaira } from "react-icons/tb";
import { useQuery } from "@tanstack/react-query";
import { financeOverviewAnalytics, getUserProducts } from "@/api/controllers/get/handler";
import { BusinessBranchForm } from "@/components/dashboard/overview/forms";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { useDonutChartLabels } from "@/store/state/lib/chart-state-manager";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import DonutChartCard from "../finances/ui/donut-card";
import ExpenseCategoryDonutChart from "../charts/expense-donut-chart";
import { StockProductArea } from "../charts/stock-product-analytics";
import { SalesOverviewGraph } from "../charts/sales-overview-line-graph";
import { useSalesAnalytics, useStockAnalyticsData, useStockAnalyticsTotal } from "@/store/state/lib/stocks-state-manager";
import { CategoriesBar } from "../charts/category-horizontal-chart";
import { ProductOverviewLinGraph } from "../charts/product-overview-line-graph";
import { ProductMultipleLineChart } from "../charts/product-line-multiple";
import InventoryDonutChart from "../charts/inventory-pie-chart";
import FinanceDoubleChart from "../charts/finance-double-line";
import ExpenseContentsGraph from "../finances/sections/expense-contents-graph";
import BudgetContentsGraph from "../finances/sections/budget-contents-graph";
import BudgetDonutGraph from "../charts/budget-donut-chart";
import ExpenseCategoryTable from "../tables/expenses-category-table";
import BudgetTable from "../tables/budget-table";
import StaffListTable from "../tables/staff-list-table";
import CustomersTable from "../tables/customer-tables";
import { Calendar } from "@/components/ui/calendar";
import StaffLogsTable from "../tables/staff-logs-table";

const ReportContents = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [tabGasLists] = useState<Array<string>>(["Overview", "Sales", "Inventory", "Finance", "Staff", "Customer", "System Logs"]);
    const [listCount, setlistCount] = useState<number>(0);
    const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number>(0);
    const [openBranchModal, setOpenBranchModal] = useState<boolean>(false);

    const tabLabels = useMemo(() => ["Today", "Yesterday", "This Week", "This Month", "This year", "Custom Date"], []);

    const [overtimeQueryFilters, setOvertimeQueryFilters] = useState<{ date_filter: string; start_date: string; end_date: string; }>({
        date_filter: "",
        start_date: "",
        end_date: ""
    });

    // Date picker modal states
    const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const [indicatorBar, setIndicatorBar] = useState<{ left: number; width: number }>({ left: 0, width: 0 || 90 });

    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const listContainerRef = useRef<HTMLDivElement | null>(null);

    const { hiddenScrollbar } = useCustomStyles();

    const { isNotifierOpen, setIsNotifier, setisMobileMenuOpen, isMobileMenuOpen, isPhoneView, isIconView } = useDashboardContextHooks();

    const { donutChartLabels } = useDonutChartLabels();
    const { setSalesAnalytics, salesAnalytics: salesPieData } = useSalesAnalytics();
    const { stockData } = useStockAnalyticsData();
    const { total: stockTotal } = useStockAnalyticsTotal();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("report-listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }

        const handleStorageChange = () => {
            const selectedBusinessId = sessionStorage.getItem('selectedBusinessId');
            if (selectedBusinessId) {
                setShowBusinessModal(false);
                window.location.reload();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const existingBusinessId = sessionStorage.getItem('selectedBusinessId');
        if (existingBusinessId) {
            setShowBusinessModal(false);
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (typeof ("sessionStorage" in window) !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId") ? JSON.parse((sessionStorage.getItem("selectedBusinessId") as string)) : 0;
            setBusinessId(businessId);
        }
        return () => setBusinessId(businessId);
    }, [businessId]);

    useEffect(() => {
        const originalSetItem = sessionStorage.setItem;
        sessionStorage.setItem = function (key, value) {
            const event = new Event('sessionStorageChange');
            originalSetItem.apply(this, [key, value]);
            window.dispatchEvent(event);
        };

        const handleSessionStorageChange = (e: Event) => {
            if (e.type === 'sessionStorageChange') {
                const selectedBusinessId = sessionStorage.getItem('selectedBusinessId');
                if (selectedBusinessId) {
                    setShowBusinessModal(false);
                    // Remove window.location.reload() to prevent infinite reload
                    // Use router.refresh() or state updates instead if needed
                }
            }
        };

        window.addEventListener('sessionStorageChange', handleSessionStorageChange);

        return () => {
            sessionStorage.setItem = originalSetItem;
            window.removeEventListener('sessionStorageChange', handleSessionStorageChange);
        };
    }, []);

    useEffect(() => {
        const selectedBusinessId = sessionStorage.getItem('selectedBusinessId');
        if (!selectedBusinessId) {
            setShowBusinessModal(true);
        }
    }, []);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("report-listcount", JSON.stringify(listCount));
        }
    }, [listCount]);

    const branchId = useMemo(() => {
        if (typeof window !== "undefined") {
            const branch_id = sessionStorage?.getItem("selectedBranchId");
            return branch_id ? JSON.parse(branch_id) : 0;
        }
        return 0;
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

        const label = tabLabels[activeTab]?.split(/\s/g)?.length ? tabLabels[activeTab]?.replace(/\s/g, "_")?.toLowerCase() : tabLabels[activeTab]?.toLowerCase();
        if (label?.toLowerCase()?.startsWith("custom")) {
            setOvertimeQueryFilters(prev => ({
                ...prev,
                date_filter: label?.slice(0, label?.indexOf("_")),
                start_date: selectedDateRange?.from?.toISOString()?.split("T")?.[0] || "",
                end_date: selectedDateRange?.to?.toISOString()?.split("T")?.[0] || ""
            }));
        } else {
            setOvertimeQueryFilters({
                date_filter: label,
                start_date: "",
                end_date: ""
            });
        }
    }, [activeTab, selectedDateRange, tabLabels]);

    const query_filtering_data = useMemo(() => {
        if (businessId || typeof overtimeQueryFilters === "object") {
            const data = {
                business_id: businessId ? +businessId : 0,
                // branch_id: branchId ? +branchId : 0,
                ...overtimeQueryFilters
            }
            return data;
        }
        return {
            business_id: 0,
            // branch_id: 0,
            date_filter: "",
            start_date: "",
            end_date: ""
        }
    }, [businessId, overtimeQueryFilters]);

    const queryFiltering = useMemo(() => {
        const searchParams = new URLSearchParams();
        if (query_filtering_data) {
            Object?.entries(query_filtering_data)
                ?.filter(([, value]) => value)
                ?.forEach(([key, value]) => searchParams?.append(key, String(value)));
        }
        return {
            url: `/api/finance/overview?${searchParams?.toString() || `business_id=${query_filtering_data?.business_id}`}`,
            business_id: query_filtering_data?.business_id
        };
    }, [query_filtering_data]);

    const salesQueryFiltering = useMemo(() => {
        const searchParams = new URLSearchParams();
        if (query_filtering_data) {
            Object?.entries(query_filtering_data)
                ?.filter(([, value]) => value)
                ?.forEach(([key, value]) => searchParams?.append(key, String(value)));
        }
        return {
            url: `/api/finance/sales-analytics?${searchParams?.toString() || `business_id=${query_filtering_data?.business_id}`}`,
            business_id: query_filtering_data?.business_id
        };
    }, [query_filtering_data]);

    const varQueryFiltering = useMemo(() => {
        const searchParams = new URLSearchParams();
        if (query_filtering_data) {
            Object?.entries(query_filtering_data)
                ?.filter(([, value]) => value)
                ?.forEach(([key, value]) => searchParams?.append(key, String(value)));
        }
        return {
            url: `/api/finance/variation-analytics?${searchParams?.toString() || `business_id=${query_filtering_data?.business_id}`}`,
            business_id: query_filtering_data?.business_id
        };
    }, [query_filtering_data]);

    const expenseQueryFiltering = useMemo(() => {
        const searchParams = new URLSearchParams();
        if (query_filtering_data) {
            Object?.entries(query_filtering_data)
                ?.filter(([, value]) => value)
                ?.forEach(([key, value]) => searchParams?.append(key?.toLowerCase() === "date_filter" ? "period" : key, String(value)));
        }
        return {
            url: `/api/finance/expense-analytics?${searchParams?.toString() || `business_id=${query_filtering_data?.business_id}`}`,
            business_id: query_filtering_data?.business_id
        };
    }, [query_filtering_data]);

    const { data: financeOverviewData, isSuccess: financeOverviewSuccess, isError: financeOverviewError } = useQuery({
        queryKey: ["get-finance-overview", businessId, branchId, queryFiltering],
        queryFn: () => financeOverviewAnalytics(queryFiltering),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: salesAnalytics, isSuccess: salesAnalyticsSuccess, isError: salesAnalyticsError } = useQuery({
        queryKey: ["get-sales-analytics", businessId, salesQueryFiltering],
        queryFn: () => financeOverviewAnalytics(salesQueryFiltering),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const { data: expenseAnalytics, isSuccess: expenseAnalyticsSuccess, isError: expenseAnalyticsError } = useQuery({
        queryKey: ["get-expense-analytics", businessId, expenseQueryFiltering],
        queryFn: () => financeOverviewAnalytics(expenseQueryFiltering),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const { data: variationAnalytics, isSuccess: variationAnalyticsSuccess, isError: variationAnalyticsError } = useQuery({
        queryKey: ["get-variation-analytics", businessId, varQueryFiltering],
        queryFn: () => financeOverviewAnalytics(varQueryFiltering),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const { data: products = { products: [] }, isLoading: isProducts, isSuccess: isProductSuccess, isError: isProductError, refetch } = useQuery({
        queryKey: ['get-products', businessId],
        queryFn: () => getUserProducts(businessId),
        enabled: businessId !== 0,
        retry: false,
        refetchOnWindowFocus: 'always',
    });

    const isDarkModeEnabled = useMemo(() => {
        if (typeof window === "undefined") return;
        const currentStatus = localStorage.getItem("system-theme");
        return currentStatus ? JSON.parse(currentStatus) : false;
    }, []);

    const overview_overview_card = useMemo(() => {
        if (financeOverviewSuccess && salesAnalyticsSuccess && expenseAnalyticsSuccess && variationAnalyticsSuccess && !salesAnalyticsError && !financeOverviewError && !expenseAnalyticsError && !variationAnalyticsError) {
            const data = [
                {
                    id: "overview-1",
                    title: "Total Sales",
                    amount: salesAnalytics?.totalSales,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (salesAnalytics?.totalSales / (salesAnalytics?.totalSales * 100)) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "overview-2",
                    title: "Total Expenses",
                    amount: parseFloat(expenseAnalytics?.totalExpenses?.total_approved_expense),
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (parseFloat(expenseAnalytics?.totalExpenses?.total_approved_expense) / (parseFloat(expenseAnalytics?.totalExpenses?.total_approved_expense) * 100)) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "overview-3",
                    title: "Currently Inventory Values",
                    amount: variationAnalytics?.inventory_value,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (salesAnalytics?.totalSales / (salesAnalytics?.totalSales * 100)) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "overview-4",
                    title: "Gross Profit",
                    amount: financeOverviewData?.grossIncome,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (financeOverviewData?.grossIncome / (financeOverviewData?.grossIncome * 100)) <= 0 ? IoArrowDown : IoArrowUp
                }
            ]

            return data;
        }
        return [
            {
                id: "overview-fallback-1",
                title: "Total Sales",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "overview-fallback-2",
                title: "Total Expenses",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "overview-fallback-3",
                title: "Currently Inventory Values",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "overview-fallback-4",
                title: "Gross Profit",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            }
        ]
    }, [financeOverviewSuccess, financeOverviewError, financeOverviewData, salesAnalyticsSuccess, salesAnalyticsError, salesAnalytics, expenseAnalytics, expenseAnalyticsError, expenseAnalyticsSuccess, variationAnalyticsSuccess, variationAnalyticsError, variationAnalytics, isDarkModeEnabled]);

    const sales_overview_card = useMemo(() => {
        if (financeOverviewSuccess && salesAnalyticsSuccess && expenseAnalyticsSuccess && variationAnalyticsSuccess && !salesAnalyticsError && !financeOverviewError && !expenseAnalyticsError && !variationAnalyticsError) {
            const data = [
                {
                    id: "sales-1",
                    title: "Total Sales",
                    amount: salesAnalytics?.totalSales,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (salesAnalytics?.totalSales / (salesAnalytics?.totalSales * 100)) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "sales-2",
                    title: "Cash Sales",
                    amount: +(salesAnalytics?.paymentMethodRatio?.find((item: { method: string; total: string; count: string }) => item?.method === "cash")?.total || 0),
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: +(salesAnalytics?.paymentMethodRatio?.find((item: { method: string; total: string; count: string }) => item?.method === "cash")?.total || 0) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "sales-3",
                    title: "POS Sales",
                    amount: salesAnalytics?.totalSales,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: salesAnalytics?.totalSales <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "sales-4",
                    title: "Bank Tranfer",
                    amount: +(salesAnalytics?.paymentMethodRatio?.find((item: { method: string; total: string; count: string }) => item?.method === "bank_transfer")?.total || 0),
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: +(salesAnalytics?.paymentMethodRatio?.find((item: { method: string; total: string; count: string }) => item?.method === "bank_transfer")?.total || 0) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "sales-5",
                    title: "Most Sold Product",
                    amount: +(financeOverviewData?.topProducts?.map((item: { total_sales: string }) => item?.total_sales)?.reduce((p: number, v: string) => p + +v, 0) || 0),
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (financeOverviewData?.topProducts?.map((item: { total_sales: string }) => item?.total_sales)?.reduce((p: number, v: string) => p + +v, 0) / (financeOverviewData?.topProducts?.map((item: { total_sales: string }) => item?.total_sales)?.reduce((p: number, v: string) => p + +v, 0) * 100)) <= 0 ? IoArrowDown : IoArrowUp
                },
                {
                    id: "sales-6",
                    title: "Total Paid Staff",
                    amount: +(financeOverviewData?.totalStaffSalaryPaid || 0),
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: (financeOverviewData?.totalStaffSalaryPaid / (financeOverviewData?.totalStaffSalaryPaid * 100)) <= 0 ? IoArrowDown : IoArrowUp
                }
            ]
            return data;
        }
        return [
            {
                id: "sales-fallback-1",
                title: "Total Sales",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "sales-fallback-2",
                title: "Cash Sales",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "sales-fallback-3",
                title: "POS Sales",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "sales-fallback-4",
                title: "Bank Tranfer",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "sales-fallback-5",
                title: "Most Sold Product",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            },
            {
                id: "sales-fallback-6",
                title: "Total Paid Staff",
                amount: 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: 0 ? IoArrowDown : IoArrowUp
            }
        ]
    }, [financeOverviewSuccess, financeOverviewError, financeOverviewData, salesAnalyticsSuccess, salesAnalyticsError, salesAnalytics, expenseAnalytics, expenseAnalyticsError, expenseAnalyticsSuccess, variationAnalyticsSuccess, variationAnalyticsError, variationAnalytics, isDarkModeEnabled])

    useEffect(() => {
        if (salesAnalyticsSuccess && !salesAnalyticsError) {
            const needed_sales_analytics = {
                total: +salesAnalytics?.totalSales || 0,
                walk_in: +salesAnalytics?.orderTypeRatio?.[0]?.total || 0,
                online: +salesAnalytics?.orderTypeRatio?.[1]?.total || 0,
            }
            setSalesAnalytics(needed_sales_analytics);
        }
    }, [salesAnalyticsSuccess, salesAnalyticsError, salesAnalytics, setSalesAnalytics]);

    const productsData = useMemo(() => {
        if (products && isProductSuccess && !isProductError) return products.products;
        return [];
    }, [products, isProductSuccess, isProductError]);

    useEffect(() => {
        const activeList = (listRefs.current[listCount as number] as HTMLDivElement);
        const listContainer = listContainerRef.current as HTMLDivElement;

        if (activeList && listContainer) {
            const containerRect = (listContainer && listContainer.getBoundingClientRect());
            const listRect = (activeList && activeList.getBoundingClientRect());
            const padding = 20;
            setIndicatorBar({
                left: (listRect?.left - containerRect?.left + listContainer.scrollLeft - padding / 2),
                width: listRect?.width + padding
            });
        }
        localStorage.setItem("report-listcount", JSON.stringify(listCount));
    }, [listCount]);

    return (
        <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="w-full text-base font-[600]">Dashboard</div>
                <div
                    ref={containerRef}
                    className="relative w-full overflow-x-auto rounded-sm bg-template-whitesmoke-dim dark:bg-black z-10"
                    style={hiddenScrollbar}
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
                                className={cn(`text-[13px] font-[600] cursor-pointer text-nowrap px-2 ${idx === activeTab ? "text-white" : ""}`)}
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                    <div
                        className={"absolute -z-10 transition-all duration-300 ease-in-out top-1/2 rounded-sm -translate-y-1/2 h-[90%] bg-template-chart-store py-1 px-2"}
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width || 80,
                        }}
                    />
                </div>
            </div>
            {listCount === 0 && (<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {overview_overview_card.map((data, index) => (
                    <OverviewCard key={index} {...data} isIconView={isIconView} />
                ))}
            </div>)}

            {listCount === 1 && (<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sales_overview_card.map((data, index) => (
                    <OverviewCard key={index} {...data} isIconView={isIconView} />
                ))}
            </div>)}
            <div ref={listContainerRef} className="w-full bg-template-whitesmoke-dim dark:bg-black mx-auto rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                <div className="min-w-[590px] w-full flex items-center justify-between">
                    {tabGasLists.map((item, index) => (
                        <TabList item={item} index={index} setlistCount={setlistCount} key={index} color={listCount === index ? 'text-white' : ''} ref={el => {
                            if (el) listRefs.current[index] = el
                        }} />
                    ))}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 bg-template-chart-store h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{ left: indicatorBar.left, width: indicatorBar.width }} />
            </div>
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
                            <DoubleChart businessId={businessId} />
                        </motion.div>
                        <motion.div variants={itemVariant}>
                            <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">
                                <DonutChartCard
                                    label="Expense"
                                    title="Expense By Category"
                                    description="Breakdown Of Expenses"
                                    donutProps={donutChartLabels}
                                >
                                    <ExpenseCategoryDonutChart businessId={businessId} />
                                </DonutChartCard>
                                <StockProductArea businessId={businessId} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {listCount === 1 && (
                    <>
                        <motion.div
                            key="sales-overview"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 flex flex-col gap-y-5 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <motion.div variants={itemVariant} className="w-full bg-white dark:bg-black py-3 md:px-2">
                                <SalesOverviewGraph title="Sales Movement" content="Monitor the product sales in and out of the store" />
                            </motion.div>
                            <div className="w-full">
                                <motion.div variants={itemVariant}>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CardWrapper className="dark:bg-black">
                                            <CardHeader>
                                                <CardTitle>Sales By Activity</CardTitle>
                                                <CardDescription>Breakdown Of Sales by Item Purchase</CardDescription>
                                            </CardHeader>
                                            <div className="w-full grid grid-cols-1">
                                                <SalesPieChart />
                                                <motion.div
                                                    variants={itemVariant}
                                                    className="flex md:justify-end w-full my-auto md:px-15"
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
                                        </CardWrapper>
                                        <CardWrapper className="dark:bg-black">
                                            <CardHeader>
                                                <CardTitle>Product Sales</CardTitle>
                                                <CardDescription>View monthly Product Sales</CardDescription>
                                            </CardHeader>
                                            <div className="w-full">
                                                <CategoriesBar />
                                            </div>
                                        </CardWrapper>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                        <motion.div
                            key="inventory"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <SalesTable />
                        </motion.div>
                    </>
                )}
                {listCount === 2 && (
                    <>
                        <motion.div variants={itemVariant} className="w-full bg-white dark:bg-black py-3 px-2">
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
                        <div className="w-full grid grid-cols-1 md:grid-cols-[60%_40%] gap-4">
                            <ProductMultipleLineChart title="Products Sales" content="Breakdown of product sales" productLists={productsData} />
                            <CardWrapper className="dark:bg-black">
                                <CardHeader>
                                    <CardTitle>Stock Movement</CardTitle>
                                    <CardDescription>Flow of Inventory In and Out of Store</CardDescription>
                                </CardHeader>
                                <div className="w-full grid grid-cols-1 bg-white dark:bg-black gap-y-3">
                                    <InventoryDonutChart />
                                    <motion.div
                                        variants={itemVariant}
                                        className="flex justify-center w-full my-auto"
                                    >
                                        {stockData || stockData === null ? (
                                            (
                                                <div className="w-full flex flex-col gap-y-6 px-15">
                                                    <motion.div variants={itemVariant} className="w-full flex justify-between items-center">
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="w-4 h-4 rounded-full bg-template-chart-store"></div>
                                                            <div className="text-xs font-[500]">In Stock</div>
                                                        </div>
                                                        <div className="text-xs font-[600]">{isNaN(Math.round(((stockData?.inStock || 0) * 100) / (stockTotal || 0))) ? 0 : Math.round(((stockData?.inStock || 0) * 100) / (stockTotal || 0))}%</div>
                                                    </motion.div>
                                                    <motion.div variants={itemVariant} className="w-full flex justify-between items-center">
                                                        <div className="flex justify-between items-center gap-x-2">
                                                            <div className="w-4 h-4 rounded-full bg-template-card-pending"></div>
                                                            <div className="text-xs font-[500]">Low Stock</div>
                                                        </div>
                                                        <div className="text-xs font-[600]">{isNaN(Math.round(((stockData?.lowStock || 0) * 100) / (stockTotal || 0))) ? 0 : Math.round(((stockData?.lowStock || 0) * 100) / (stockTotal || 0))}%</div>
                                                    </motion.div>
                                                    <motion.div variants={itemVariant} className="w-full flex justify-between items-center">
                                                        <div className="flex justify-between items-center gap-x-2">
                                                            <div className="w-4 h-4 rounded-full bg-template-chart-gas"></div>
                                                            <div className="text-xs font-[500]">Out Of Stock</div>
                                                        </div>
                                                        <div className="text-xs font-[600]">{isNaN(Math.round(((stockData?.outOfStock || 0) * 100)) / (stockTotal || 0)) ? 0 : Math.round(((stockData?.outOfStock || 0) * 100) / (stockTotal || 0))}%</div>
                                                    </motion.div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-full flex flex-col gap-y-6">
                                                <motion.div variants={itemVariant} className="w-full">
                                                    <div className="flex justify-between items-center gap-x-2">
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
                            </CardWrapper>
                        </div>
                        <motion.div
                            key="sales"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <StoreProductsTable businessId={businessId} data={productsData} isLoading={isProducts} refetchProduct={refetch} />
                        </motion.div>
                    </>
                )}
                {listCount === 3 && (
                    <>
                        <motion.div
                            key="finance-overview-section"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 flex flex-col gap-y-5 ${isPhoneView ? 'mb-2' : ''}`)}
                        >
                            <motion.div variants={itemVariant} className="w-full bg-white dark:bg-black">
                                <FinanceDoubleChart businessId={businessId} />
                            </motion.div>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-4">
                            <ExpenseContentsGraph />
                            <DonutChartCard
                                label="Expense"
                                title="Expense By Category"
                                description="Breakdown Of Expenses"
                                donutProps={donutChartLabels}
                            >
                                <ExpenseCategoryDonutChart businessId={businessId} />
                            </DonutChartCard>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-4">
                            <DonutChartCard
                                label="Budget"
                                title="Budget By Category"
                                description="Breakdown Of Budgets"
                                donutProps={donutChartLabels}
                            >
                                <BudgetDonutGraph businessId={businessId} />
                            </DonutChartCard>
                            <BudgetContentsGraph />
                        </div>
                        <motion.div
                            key="expenses"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <ExpensesTable businessId={+businessId} />
                            <ExpenseCategoryTable businessId={businessId} />
                            <motion.div
                                key="report-budgets"
                                variants={sectionVariant}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={cn(`w-full mt-2 ${isPhoneView ? 'mb-2' : ''}`)}
                            >
                                <BudgetTable businessId={businessId} />
                            </motion.div>
                        </motion.div>
                    </>
                )}
                {listCount === 4 && (
                    <motion.div
                        key="staff-list-table"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <StaffListTable />
                    </motion.div>
                )}
                {listCount === 5 && (
                    <motion.div
                        key="report-customer-table"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <CustomersTable />
                    </motion.div>
                )}
                {listCount === 6 && (
                    <motion.div
                        key="report-login-table"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <StaffLogsTable />
                    </motion.div>
                )}
            </AnimatePresence>
            {isNotifierOpen && <NotificationCard setIsOpen={setIsNotifier} />}
            {/* <TransactionInvoice /> */}
            {isMobileMenuOpen && (
                <MobileSideBar onClose={() => setisMobileMenuOpen(false)} isOpen={isMobileMenuOpen} />
            )}
            <MobileNavbar />
            {showBusinessModal && (
                <BusinessModalCard onClose={() => setShowBusinessModal(false)} />
            )}
            {openBranchModal && (
                <BusinessBranchForm handleFormClose={() => setOpenBranchModal(false)} business_id={`${businessId}`} />
            )}

            {/* Date Picker Modal */}
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
        </div>
    );
}

export default ReportContents;