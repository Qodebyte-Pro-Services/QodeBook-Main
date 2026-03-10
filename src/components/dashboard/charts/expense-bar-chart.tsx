"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import React, { FC, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { getExpenseIncomeOvertime } from "@/api/controllers/get/handler";
import { useQuery } from "@tanstack/react-query";

type ExpenseResponseLogic = {
  period: string;
  total_expense: string;
}

const chartConfig = {
  expense: {
    label: "Expense",
    color: "var(--color-template-chart-gas)",
  },
} satisfies ChartConfig

interface ExpenseBarLogic {
  periodSelected: string;
  selectedDateRange: DateRange | undefined;
  businessId: number;
  branchId: number;
}

const ExpenseBarChart: FC<ExpenseBarLogic> = ({ businessId, branchId, periodSelected, selectedDateRange }) => {

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
      ?.forEach(([k, v]) => searchParams.append(k, String(v)));
    if (Object.keys(Object.fromEntries(searchParams?.entries()))?.length) {
      return searchParams?.toString();
    }
    return "";
  }, [selectedDateRange, periodSelected, businessId, branchId]);

  const querySearch = useMemo(() => {
    if (queryStr) {
      return {
        url: `/api/finance/expense-overtime?${queryStr}`,
        businessId: Number(queryStr?.split("&")?.[0]?.split("=")?.[1]) || 0
      }
    }
    return {
      url: '',
      businessId: 0
    }
  }, [queryStr]);


  const { data: expenseOvertime, isSuccess: expenseSuccess, isError: expenseError } = useQuery({
    queryKey: ["get-expense-overtime", querySearch],
    queryFn: () => getExpenseIncomeOvertime(querySearch),
    enabled: querySearch?.businessId !== 0 && querySearch?.url !== "",
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: false
  });

  const expense_data = useMemo(() => {
    if (expenseSuccess && !expenseError) {
      return expenseOvertime?.expense;
    }
    return [];
  }, [expenseOvertime, expenseSuccess, expenseError]) as ExpenseResponseLogic[];

  const chart_data_logic = useMemo(() => {
    if (expense_data?.length) {
      return expense_data?.map(item => ({
        period: item?.period || "",
        expense: parseFloat(item?.total_expense) || 0,
      }));
    }
    return [{
      period: "",
      expense: 0,
    }];
  }, [expense_data]) as Array<{ period: string; expense: number }>;

  return (
    <Card className="dark:bg-black">
      <CardContent>
        <ChartContainer className="xl:h-[360px] w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chart_data_logic}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => new Date(value)?.toLocaleDateString("default", {month: "short", day: "2-digit"})}
            />
            <YAxis
              dataKey="expense"
              tickLine={true}
              tickMargin={10}
              axisLine={false}
              color="#000000"
            />
            <ChartTooltip
              cursor={false}
              content={({payload, label, active}) => {
                if (!active || !payload?.length) return null;            
                return (
                    <div className="bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                            {new Date(label)?.toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true})}
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
                    </div>
                )
              }}
            />
            <Bar dataKey="expense" fill="var(--color-template-chart-gas)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ExpenseBarChart;