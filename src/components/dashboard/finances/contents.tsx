"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { OverviewCard, TabList } from "..";
import { DoubleChart } from "../charts";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import { ExpensesTable, LoginAttemptsTable, SalesTable } from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { MobileNavbar, MobileSideBar } from "../sections";
import { BusinessModalCard } from "../modal";
import { IconType } from "react-icons";
import { CustomNaira } from "@/components/customs/Icons";
import { TbCurrencyNaira } from "react-icons/tb";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { useQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { financeOverview, getBudgetAnalytics, getExpenses } from "@/api/controllers/get/handler";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import CreateExpenseForm from "./forms/add-expense";
import CreateExpenseCategory from "./forms/add-expense-category-form";
import BudgetTable from "../tables/budget-table";
import CreateBudgetForm from "./forms/create-budget";
import ExpenseContentsGraph from "./sections/expense-contents-graph";
import ExpenseCategoryDonutChart from "../charts/expense-donut-chart";
import DonutChartCard from "./ui/donut-card";
import ExpenseCategoryTable from "../tables/expenses-category-table";
import BudgetDonutGraph from "../charts/budget-donut-chart";
import BudgetContentsGraph from "./sections/budget-contents-graph";
import { BsCashCoin } from "react-icons/bs";
import { ExpenseTask } from "@/store/data/expenses-data";
import { useDonutChartLabels } from "@/store/state/lib/chart-state-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
// import { TransactionInvoice } from "../invoices";
// import { BusinessModalCard } from "../modal";

const FinanceContents = () => {
    const [tabGasLists] = useState<Array<string>>(["Overview", "Expenses", "Budgets"]);
    const [listCount, setlistCount] = useState<number>(0);
    const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);
    const [businessId, setBusinessId] = useState<number>(0);
    const [showExpenseForm, setShowExpenseForm] = useState<boolean>(false);
    const [showExpenseCategoryForm, setExpenseCategoryForm] = useState<boolean>(false);
    const [showIsBudget, setIsShowBudget] = useState<boolean>(false);

    // Date picker modal states
    const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const [overviewData, setOverviewData] = useState<Array<{ id: number; title: string; amount?: number; isCurrency?: boolean; icon?: IconType; arrowIcon?: IconType; isPhoneViewIcon?: IconType; isSlash?: { active: number; total: number; icon?: IconType; isPhoneViewIcon?: IconType; arrowIcon?: IconType; } }>>([]);

    const [indicatorBar, setIndicatorBar] = useState<{ left: number; width: number }>({ left: 0, width: 0 || 90 });

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const listContainerRef = useRef<HTMLDivElement | null>(null);

    const { hiddenScrollbar } = useCustomStyles();

    const { isNotifierOpen, setIsNotifier, setisMobileMenuOpen, isMobileMenuOpen, isPhoneView, isIconView } = useDashboardContextHooks();
    const { donutChartLabels } = useDonutChartLabels();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("finance-listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof ("sessionStorage" in window) !== "undefined") {
            const id = sessionStorage.getItem("selectedBusinessId") ? JSON.parse((sessionStorage.getItem("selectedBusinessId") as string)) : 0;
            setBusinessId(id);
            return;
        }
        setBusinessId(0);
        return () => setBusinessId(0);
    }, []);

    const { data: financeData, isLoading, isSuccess, isError } = useQuery({
        queryKey: ['user-financeoverview', businessId],
        queryFn: () => financeOverview(`${businessId}`),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: +businessId !== 0,
    });

    const { data: expenses, isSuccess: expensesSuccess, isError: expenseError } = useQuery({
        queryKey: ["get-expenses", businessId],
        queryFn: () => getExpenses(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const { data: budgetData, isSuccess: budgetSuccess, isError: budgetError } = useQuery({
        queryKey: ["get-budget-analytics", businessId, listCount],
        queryFn: () => getBudgetAnalytics(businessId),
        enabled: businessId !== 0 && listCount > 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const expense_data = useMemo(() => {
        if (expensesSuccess && !expenseError) {
            return expenses?.data;
        }
        return [];
    }, [expenses, expensesSuccess, expenseError]) as ExpenseTask[];

    const budget_data = useMemo(() => {
        if (budgetSuccess && !budgetError) {
            return budgetData?.analytics;
        }
        return null;
    }, [budgetData, budgetSuccess, budgetError]);

    const isDarkModeEnabled = useMemo(() => {
        if (typeof window === "undefined") return;
        const currentStatus = localStorage.getItem("system-theme");
        return currentStatus ? JSON.parse(currentStatus) : false;
    }, []);

    useEffect(() => {
        if (!isLoading && isSuccess && !isError) {
            const _data = [
                {
                    id: 1,
                    title: "Total Tax Collected",
                    amount: financeData?.taxes,
                    isCurrency: true,
                    icon: BsCashCoin,
                    isPhoneViewIcon: BsCashCoin,
                    arrowIcon: IoMdArrowUp,
                },
                {
                    id: 2,
                    title: "Total Discount",
                    amount: financeData?.discounts,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                },
                {
                    id: 3,
                    title: "Total Coupon",
                    amount: financeData?.netIncome,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                },
                {
                    id: 4,
                    title: "Top Budget Used",
                    amount: financeData?.budgetByCategory?.length,
                    isCurrency: false,
                    icon: PiShoppingCartSimpleBold,
                    arrowIcon: IoMdArrowUp,
                },
                {
                    id: 6,
                    title: "Total Expenses",
                    amount: expense_data?.length ? expense_data?.reduce((p, v) => p += parseFloat(v?.amount), 0) : 0,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowUp,
                },
                {
                    id: 7,
                    title: "Net Income",
                    amount: financeData?.netIncome,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                },
                {
                    id: 8,
                    title: "Gross Income",
                    amount: financeData?.grossIncome,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                }
            ];
            setOverviewData(_data);
        } else {
            setOverviewData([
                {
                    id: 1,
                    title: "Total Tax Collected",
                    amount: 0,
                    isCurrency: true,
                    icon: BsCashCoin,
                    isPhoneViewIcon: BsCashCoin,
                    arrowIcon: IoMdArrowUp,
                },
                {
                    id: 2,
                    title: "Total Discount",
                    amount: 0,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                },
                {
                    id: 3,
                    title: "Total Coupon",
                    amount: 0,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                },
                {
                    id: 4,
                    title: "Top Budget Used",
                    amount: 0,
                    isCurrency: false,
                    icon: PiShoppingCartSimpleBold,
                    arrowIcon: IoMdArrowUp,
                },
                {
                    id: 6,
                    title: "Total Expenses",
                    amount: 0,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowUp,
                },
                {
                    id: 7,
                    title: "Net Income",
                    amount: 0,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                },
                {
                    id: 8,
                    title: "Gross Income",
                    amount: 0,
                    isCurrency: true,
                    icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                    isPhoneViewIcon: TbCurrencyNaira,
                    arrowIcon: IoMdArrowDown,
                }
            ]);
        }
        return () => setOverviewData([]);
    }, [financeData, isSuccess, isError, expense_data, isLoading, isDarkModeEnabled]);

    const expenseCardData = useMemo(() => {
        return [
            {
                id: 1,
                title: "Total Expenses",
                amount: expense_data?.length ? expense_data?.reduce((p, v) => p += parseFloat(v?.amount), 0) : 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: IoMdArrowUp,
            }
        ]
    }, [expense_data, isDarkModeEnabled]);

    const budgetCardData = useMemo(() => {
        return [
            {
                id: 1,
                title: "Total Budget",
                amount: budget_data?.total_budget || 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: IoMdArrowUp,
            },
            {
                id: 2,
                title: "Total Spent",
                amount: budget_data?.total_budget_spent || 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: IoMdArrowDown,
            },
            {
                id: 3,
                title: "Remaining Budget",
                amount: budget_data?.total_remaining || 0,
                isCurrency: true,
                icon: isDarkModeEnabled ? TbCurrencyNaira : CustomNaira,
                isPhoneViewIcon: TbCurrencyNaira,
                arrowIcon: IoMdArrowDown,
            }
        ]
    }, [budget_data, isDarkModeEnabled]);

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
        localStorage.setItem("finance-listcount", JSON.stringify(listCount));
    }, [listCount]);

    // if (isLoading) {
    //     return (
    //       <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-background">
    //         <div className="flex flex-col items-center gap-4">
    //           <RiLoader4Line className="animate-spin h-12 w-12 text-template-primary" />
    //           <p className="text-foreground/60 font-medium">Loading your dashboard...</p>
    //         </div>
    //       </div>
    //     );
    // }

    return (
        <div className="flex flex-col gap-y-5">
            <div className="w-full text-base font-[600]">Finance Management</div>
            <div ref={listContainerRef} className="w-full sm:w-fit rounded-sm relative z-10 overflow-x-auto bg-template-whitesmoke-dim dark:bg-black" style={hiddenScrollbar}>
                <div className="flex items-center gap-x-10">
                    {tabGasLists.map((item, index) => (
                        <TabList item={item} index={index} setlistCount={setlistCount} key={index} color={listCount === index ? 'text-white' : ''} ref={el => {
                            if (el) listRefs.current[index] = el
                        }} />
                    ))}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 bg-template-chart-store h-full -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{ left: indicatorBar.left, width: indicatorBar.width }} />
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
                        <div className="w-full relative">
                            <div className="w-full flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar" style={hiddenScrollbar}>
                                {overviewData.map((data, index) => (
                                    <div key={index} className="min-w-[280px] sm:min-w-[300px] md:min-w-[30%] lg:min-w-[13.5%] flex-shrink-0 snap-start">
                                        <OverviewCard {...data} isIconView={isIconView} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <motion.div variants={itemVariant} className="w-full bg-white dark:bg-black">
                            <DoubleChart businessId={businessId} />
                        </motion.div>
                    </motion.div>
                )}
                {listCount === 0 && (
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
                )}
                {listCount === 1 && (
                    <>
                        <div className="w-full relative">
                            <div className="w-full flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar" style={hiddenScrollbar}>
                                {expenseCardData?.map((data, index) => (
                                    <div key={index} className="min-w-[280px] sm:min-w-[300px] md:min-w-[30%] lg:min-w-[24%] flex-shrink-0 snap-start">
                                        <OverviewCard {...data} isIconView={isIconView} />
                                    </div>
                                ))}
                            </div>
                        </div>
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
                        <motion.div
                            key="sales"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <ExpensesTable businessId={businessId} handleOpenForm={(str) => {
                                if (str === "expense-category") {
                                    setExpenseCategoryForm(true);
                                } else {
                                    setShowExpenseForm(true);
                                }
                            }} />
                            <ExpenseCategoryTable businessId={businessId} />
                        </motion.div>
                    </>
                )}
                {listCount === 2 && (
                    <>
                        <div className="w-full relative">
                            <div className="w-full flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar" style={hiddenScrollbar}>
                                {budgetCardData?.map((data, index) => (
                                    <div key={index} className="min-w-[280px] sm:min-w-[300px] md:min-w-[30%] lg:min-w-[24%] flex-shrink-0 snap-start">
                                        <OverviewCard {...data} isIconView={isIconView} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-4">
                            <BudgetContentsGraph />
                            <DonutChartCard
                                label="Budget"
                                title="Budget By Category"
                                description="Breakdown Of Budgets"
                                donutProps={donutChartLabels}
                            >
                                <BudgetDonutGraph businessId={businessId} />
                            </DonutChartCard>
                        </div>
                        <motion.div
                            key="budgets"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <BudgetTable businessId={businessId} handleOpenForm={() => setIsShowBudget(true)} />
                        </motion.div>
                    </>
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
                        <LoginAttemptsTable />
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
                                        setlistCount(0);
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
            {showExpenseForm ? (
                <CreateExpenseForm businessId={businessId} handleFormClose={() => setShowExpenseForm(false)} />
            ) : null}
            {showExpenseCategoryForm ? (
                <CreateExpenseCategory handleFormClose={() => setExpenseCategoryForm(false)} />
            ) : null}
            {showIsBudget ? (
                <CreateBudgetForm businessId={businessId} handleFormClose={() => setIsShowBudget(false)} />
            ) : null}
        </div>
    );
}

export default FinanceContents;