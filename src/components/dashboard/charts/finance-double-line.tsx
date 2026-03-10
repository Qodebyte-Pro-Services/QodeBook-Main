"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getExpenseIncomeOvertime } from "@/api/controllers/get/handler";
import { useDashboardContextHooks } from "@/hooks";
import { Calendar } from "@/components/ui/calendar";

const chartConfig = {
    income: {
        label: "Income",
        color: "var(--color-template-chart-store)",
    },
    expense: {
        label: "Expenses",
        color: "var(--color-template-chart-gas)",
    },
} satisfies ChartConfig;

type ExpenseResponseLogic = {
    period: string;
    total_expense: string;
}

type IncomeResponseLogic = {
    period: string;
    total_income: string;
}

type IncomeExpenseResponseLogic = {
    expense: Array<ExpenseResponseLogic>;
    income: Array<IncomeResponseLogic>;
};

const FinanceDoubleChart = ({ businessId }: { businessId: number }) => {
    const [periodSelected, setPeriodSelected] = useState<string>("");
    const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const { isPhoneView } = useDashboardContextHooks();

    useEffect(() => {
        if (periodSelected?.toLowerCase() === "custom") {
            setShowDatePickerModal(true);
            return;
        }
        setShowDatePickerModal(false);
        setSelectedDateRange(undefined);
    }, [periodSelected]);

    const branchId = useMemo(() => {
        if (typeof window === "undefined") return;
        const branch_id = sessionStorage.getItem("selectedBranchId");
        return branch_id ? JSON.parse(branch_id) : 0;
    }, []);

    const queryStr = useMemo(() => {
        const data = {
            business_id: businessId,
            branch_id: branchId,
            period: periodSelected?.toLowerCase(),
            start_date: selectedDateRange?.from?.toISOString()?.split("T")?.[0] || "",
            end_date: selectedDateRange?.to?.toISOString()?.split("T")?.[0] || ""
        }
        const searchParams = new URLSearchParams();
        Object.entries(data)
            ?.filter(([, v]) => Boolean(v))
            ?.forEach(([k, v]) => searchParams.append(k, v));
        if (Object.keys(Object.fromEntries(searchParams?.entries()))?.length) {
            return searchParams?.toString();
        }
        return "";
    }, [selectedDateRange, periodSelected, businessId, branchId]);

    const querySearch = useMemo(() => {
        if (queryStr) {
            return {
                url: `/api/finance/income-expense-overtime?${queryStr}`,
                businessId: Number(queryStr?.split("&")?.[0]?.split("=")?.[1]) || 0
            }
        }
        return {
            url: '',
            businessId: 0
        }
    }, [queryStr]);


    const { data: incomeExpenseOvertime, isSuccess: incomeExpenseSuccess, isError: incomeExpenseError } = useQuery({
        queryKey: ["get-income-expense-overtime", querySearch],
        queryFn: () => getExpenseIncomeOvertime(querySearch),
        enabled: querySearch?.businessId !== 0 && querySearch?.url !== "",
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const income_expense_data = useMemo(() => {
        if (incomeExpenseSuccess && !incomeExpenseError) {
            return incomeExpenseOvertime;
        }
        return {
            expense: [],
            income: []
        };
    }, [incomeExpenseOvertime, incomeExpenseSuccess, incomeExpenseError]) as IncomeExpenseResponseLogic;

    const chart_data_logic = useMemo(() => {
        if (Object.values(income_expense_data)?.filter(item => item?.length > 0)?.length) {
            const incomedata = income_expense_data?.income;
            const expensedata = income_expense_data?.expense;
            return expensedata?.map((item, idx) => ({
                period: item?.period || "",
                expense: parseFloat(item?.total_expense) || 0,
                income: parseFloat(incomedata?.[idx]?.total_income) || 0
            }));
        }
        return [{
            period: "",
            expense: 0,
            income: 0
        }];
    }, [income_expense_data]) as Array<{ period: string; income: number; expense: number }>;

    return (
        <>
            <Card className="dark:bg-black">
                <CardHeader>
                    <div className="w-full flex flex-col gap-y-1.5 md:flex-row justify-between md:items-center">
                        <div className="flex flex-col gap-y-1">
                            <CardTitle>Today&apos;s Overview</CardTitle>
                            <CardDescription>Income and Expenses Chart</CardDescription>
                        </div>
                        <div className="flex gap-x-4 items-center">
                            <div className="flex gap-x-1">
                                <div className="w-4 h-4 rounded-xs bg-template-chart-store" />
                                <div className="text-xs font-[500]">Income</div>
                            </div>
                            <div className="flex gap-x-1">
                                <div className="w-4 h-4 rounded-xs bg-template-chart-gas" />
                                <div className="text-xs font-[500]">Expenses</div>
                            </div>
                            <Select value={periodSelected} onValueChange={setPeriodSelected}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ChartContainer className="max-h-[300px] w-full" config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={chart_data_logic}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null;
                                    return (
                                        <div className="bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                {new Date(payload?.[0]?.payload?.period)?.toLocaleDateString("default", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                                            </p>
                                            <div className="space-y-2">
                                                {payload.map((entry, index) => {
                                                    const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
                                                    return (
                                                        <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: config?.color || entry.color }}
                                                                />
                                                                <span className="text-sm font-medium">
                                                                    {config?.label || entry.name}:
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-semibold">
                                                                {new Intl.NumberFormat('en-NG', {
                                                                    style: 'currency',
                                                                    currency: 'NGN',
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                }).format(Number(entry.value))}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {payload.length > 1 && (
                                                <div className="mt-3 pt-3 border-t border-border">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Net:</span>
                                                        <span
                                                            className={`text-sm font-semibold ${Number(payload[0].value) - Number(payload[1]?.value || 0) >= 0
                                                                ? 'text-green-500'
                                                                : 'text-red-500'
                                                                }`}
                                                        >
                                                            {new Intl.NumberFormat('en-NG', {
                                                                style: 'currency',
                                                                currency: 'NGN',
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                                signDisplay: 'exceptZero'
                                                            }).format(Number(payload[0].value) - Number(payload[1]?.value || 0))}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                            <Line
                                dataKey="income"
                                type="monotone"
                                stroke="var(--color-template-chart-store)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-template-chart-store)",
                                }}
                                activeDot={{
                                    radius: 6
                                }}
                            />
                            <Line
                                dataKey="expense"
                                type="monotone"
                                stroke="var(--color-template-chart-gas)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-template-chart-gas)",
                                }}
                                activeDot={{
                                    radius: 6
                                }}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
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
                                        setPeriodSelected("day");
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
        </>
    );
};

export default FinanceDoubleChart;