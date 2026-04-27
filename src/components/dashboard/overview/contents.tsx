"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { OverviewCard, TabList } from "..";
import { DoubleChart, PieChart } from "../charts";
import { Card as CardWrapper, CardTitle, CardHeader, CardDescription, CardContent, Card } from "@/components/ui/card";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import { TSCard, MOCard, BPCard } from "./cards";
import { ExpensesTable, SalesTable, StockManagementTable } from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { MobileNavbar, MobileSideBar } from "../sections";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { BusinessModalCard } from "../modal";
import { CustomNaira, CustomUserGroup } from "@/components/customs/Icons";
import { TbCurrencyNaira } from "react-icons/tb";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { useQuery } from "@tanstack/react-query";
import { financeOverviewAnalytics } from "@/api/controllers/get/handler";
import { BusinessBranchForm } from "./forms";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { FinanceOverviewResponse } from "@/models/types/shared/handlers-type";
import { HiUserGroup } from "react-icons/hi2";
import { useDonutChartLabels } from "@/store/state/lib/chart-state-manager";
import StaffLogsTable from "../tables/staff-logs-table";
import StaffTable from "../tables/staff-table";
import { Calendar } from "@/components/ui/calendar";

const OverviewContent = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [tabGasLists] = useState<Array<string>>(["Overview", "Stock Movement", "Sales", "Expenses", "Login Attempts"]);
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("listcount");
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
            localStorage.setItem("listcount", JSON.stringify(listCount));
        }
    }, [listCount]);

    const branchId = useMemo(() => {
        if (typeof window !== "undefined") {
            const branch_id = sessionStorage?.getItem("selectedBranchId");
            return branch_id ? JSON.parse(branch_id) : 0;
        }
        return 0;
    }, []);

    const isDarkEnabled = useMemo(() => {
        if (typeof window === "undefined") return;
        const darkMode = localStorage.getItem("system-theme");
        return darkMode ? JSON.parse(darkMode) : false;
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

    const containerVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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

    const { data: financeOverviewData, isSuccess: financeOverviewSuccess, isError: financeOverviewError } = useQuery({
        queryKey: ["get-finance-overview", businessId, branchId, queryFiltering],
        queryFn: () => financeOverviewAnalytics(queryFiltering),
        enabled: +businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const finance_overview_card = useMemo(() => {
        if (financeOverviewSuccess && !financeOverviewError) {
            const { netIncome, grossIncome, discounts, totalExpense, productsCount, staffCount, staffWithShiftToday, stockMovement: { movememt_count } } = financeOverviewData as FinanceOverviewResponse;
            return [
                {
                    id: 1,
                    title: "Revenues",
                    amount: +grossIncome,
                    isCurrency: true,
                    icon: RiMoneyDollarBoxLine,
                    isPhoneViewIcon: RiMoneyDollarBoxLine,
                    arrowIcon: ((+grossIncome * 100) / (+grossIncome + +discounts + +netIncome)) ? IoMdArrowUp : IoMdArrowDown
                },
                {
                    id: 2,
                    title: "Total Discount",
                    amount: +discounts,
                    isCurrency: true,
                    icon: !isDarkEnabled ? CustomNaira : TbCurrencyNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: ((+discounts * 100) / (+grossIncome + +discounts + +netIncome)) ? IoMdArrowUp : IoMdArrowDown
                },
                {
                    id: 3,
                    title: "Net Income",
                    amount: +netIncome,
                    isCurrency: true,
                    icon: !isDarkEnabled ? CustomNaira : TbCurrencyNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: ((+netIncome * 100) / (+grossIncome + +discounts + +netIncome)) ? IoMdArrowUp : IoMdArrowDown
                },
                {
                    id: 4,
                    title: "Expenses",
                    amount: -totalExpense,
                    isCurrency: true,
                    icon: RiMoneyDollarBoxLine,
                    isPhoneViewIcon: RiMoneyDollarBoxLine,
                    arrowIcon: ((+totalExpense * 100) / (+grossIncome + +discounts + +netIncome)) ? IoMdArrowUp : IoMdArrowDown
                },
                // {
                //     id: 4,
                //     title: "Inventory Count",
                //     amount: productsCount,
                //     isCurrency: false,
                //     icon: PiShoppingCartSimpleBold,
                //     isPhoneViewIcon: PiShoppingCartSimpleBold
                // },
                // {
                //     id: 5,
                //     title: "Staff On Duty",
                //     isSlash: {
                //         active: staffWithShiftToday,
                //         total: staffCount
                //     },
                //     icon: !isDarkEnabled ? CustomUserGroup : HiUserGroup,
                //     isPhoneViewIcon: HiUserGroup
                // },
                {
                    id: 6,
                    title: "Cost Of Goods",
                    amount: parseFloat(financeOverviewData?.cogs),
                    isCurrency: true,
                    icon: PiShoppingCartSimpleBold,
                    isPhoneViewIcon: PiShoppingCartSimpleBold
                }
            ]
        }
        return [
            {
                id: 1,
                title: "Gross Income",
                amount: 0,
                isCurrency: true,
                icon: RiMoneyDollarBoxLine,
                isPhoneViewIcon: RiMoneyDollarBoxLine,
                arrowIcon: IoMdArrowUp
            },
            {
                id: 2,
                title: "Total Discount",
                amount: 0,
                isCurrency: true,
                icon: !isDarkEnabled ? CustomNaira : TbCurrencyNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: IoMdArrowUp
            },
            {
                id: 3,
                title: "Net Income",
                amount: 0,
                isCurrency: true,
                icon: !isDarkEnabled ? CustomNaira : TbCurrencyNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: IoMdArrowUp
            },
            {
                id: 4,
                title: "Expenses",
                amount: 0,
                isCurrency: true,
                icon: RiMoneyDollarBoxLine,
                isPhoneViewIcon: RiMoneyDollarBoxLine,
                arrowIcon: IoMdArrowDown
            },
            // {
            //     id: 4,
            //     title: "Inventory Count",
            //     amount: 0,
            //     isCurrency: false,
            //     icon: PiShoppingCartSimpleBold,
            //     isPhoneViewIcon: PiShoppingCartSimpleBold
            // },
            // {
            //     id: 5,
            //     title: "Staff On Duty",
            //     isSlash: {
            //         active: 0,
            //         total: 0
            //     },
            //     icon: !isDarkEnabled ? CustomUserGroup : HiUserGroup,
            //     isPhoneViewIcon: HiUserGroup
            // },
            {
                id: 6,
                title: "Cost Of Goods",
                amount: parseFloat(financeOverviewData?.cogs),
                isCurrency: true,
                icon: PiShoppingCartSimpleBold,
                isPhoneViewIcon: PiShoppingCartSimpleBold
            }
        ]
    }, [financeOverviewData, financeOverviewSuccess, financeOverviewError, isDarkEnabled]);

    const salesOverviewTopProducts = useMemo(() => {
        if (financeOverviewSuccess && !financeOverviewError) {
            const topSaledProducts = financeOverviewData?.topProducts as Array<{ name: string; units_sold: string; total_sales: string }> | [];
            return topSaledProducts;
        }
        return [];
    }, [financeOverviewData, financeOverviewSuccess, financeOverviewError]);

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
        localStorage.setItem("listcount", JSON.stringify(listCount));
    }, [listCount]);

    return (
        <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Dashboard</div>
                <div
                    ref={containerRef}
                    className="relative w-full md:w-fit overflow-x-auto rounded-sm bg-template-whitesmoke-dim dark:bg-black z-10"
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
            {listCount === 0 && (
                <div className="w-full relative">
                    <div className="w-full flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar" style={hiddenScrollbar}>
                        {finance_overview_card.map((data, index) => (
                            <div key={index} className="min-w-[280px] sm:min-w-[300px] md:min-w-[30%] lg:min-w-[19%] flex-shrink-0 snap-start">
                                <OverviewCard {...data} isIconView={isIconView} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
                            <CardWrapper className="dark:bg-black">
                                <CardHeader>
                                    <CardTitle>Sales By Category</CardTitle>
                                    <CardDescription>Breakdown Of Sales by Product Category</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-[70%] mx-auto grid grid-cols-1 md:grid-cols-2">
                                        <PieChart businessId={businessId} />
                                        <motion.div
                                            variants={itemVariant}
                                            className="flex md:justify-end w-full my-auto"
                                        >
                                            <div className="w-full flex flex-col gap-y-6">
                                                <motion.div variants={itemVariant} className="flex flex-col gap-y-3">
                                                    <div className="text-sm font-[500] text-auth-basic/70 dark:text-white">Today&apos;s Revenue</div>
                                                    <div className="flex flex-col mt-2">
                                                        <div className="text-sm md:text-base font-[600]">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "symbol", currencySign: "standard", unitDisplay: "long" }).format(donutChartLabels?.length ? donutChartLabels?.reduce((p, v) => p + (+v?.value || 0), 0) : 0)}</div>
                                                        <motion.div
                                                            className={`self-start px-0.5 rounded-full scale-90 text-template-chart-store border border-template-chart-store`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <IoMdArrowUp className="inline-block font-bold" size={18} />
                                                            <span className="text-[11px] md:text-[12.5px] font-[600]">
                                                                16%
                                                            </span>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                                <motion.div variants={itemVariant} className="w-full flex flex-col gap-y-3">
                                                    {donutChartLabels?.map((item, idx) => (
                                                        <motion.div key={`overview-donut-chart-${idx}`} variants={itemVariant} className="w-full flex items-center justify-between md:gap-x-8">
                                                            <div className="flex items-center gap-x-2">
                                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `${item?.color}` }}></div>
                                                                <div className="text-xs font-[500]">{item?.label}</div>
                                                            </div>
                                                            <div className="text-xs font-[600]">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "symbol", currencySign: "standard", unitDisplay: "long" }).format(+item?.value)}</div>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </CardWrapper>
                        </motion.div>
                        <motion.div
                            variants={containerVariant}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <motion.div className="h-full w-full" variants={itemVariant}><TSCard topSaledProducts={salesOverviewTopProducts} /></motion.div>
                            <motion.div className="h-full w-full md:col-span-2" variants={itemVariant}><MOCard /></motion.div>
                        </motion.div>
                    </motion.div>
                )}
                {listCount === 1 && (
                    <motion.div
                        key="inventory"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <StockManagementTable />
                    </motion.div>
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
                        <ExpensesTable businessId={+businessId} />
                    </motion.div>
                )}
                {listCount === 4 && (
                    <motion.div
                        key="login-attempts"
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
                                <Card className="mx-auto overflow-y-auto w-fit p-0 border-none shadow-none bg-transparent">
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
                                </Card>
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

export default OverviewContent;