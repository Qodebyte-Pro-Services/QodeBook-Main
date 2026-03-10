"use client"
import { Pie, PieChart } from "recharts";

import {
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart"
import { useQuery } from "@tanstack/react-query";
import { getBudgetAllocation } from "@/api/controllers/get/handler";
import { useEffect, useMemo } from "react";
import { useDonutChartLabels } from "@/store/state/lib/chart-state-manager";

const BudgetDonutChart = ({businessId}: {businessId: number}) => {

    const { setDonutChartLabels } = useDonutChartLabels();

    const {data: budgetAllocation, isSuccess: budgetAllocationuccess, isError: budgetAllocationError} = useQuery({
        queryKey: ["get-budget-analytics", businessId],
        queryFn: () => getBudgetAllocation({businessId}),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const expenseCategories = useMemo(() => {
        if (budgetAllocationuccess && !budgetAllocationError) {
            return budgetAllocation?.allocation;
        }
        return [];
    }, [budgetAllocation, budgetAllocationuccess, budgetAllocationError]) as Array<{category: string; total_budget: string;}>;

    const chart_data_logic = useMemo(() => {
        const colors = ["--color-chart-1", "--color-chart-2", "--color-chart-3", "--color-chart-4", "--color-chart-5", "--color-chart-6", "--color-chart-7", "--color-chart-8", "--color-chart-9", "--color-chart-10"];
        if (expenseCategories?.length) {
            return expenseCategories?.map((item, idx) => ({
                category: item?.category || "",
                value: parseFloat(item?.total_budget) || 0,
                fill: `var(${colors[idx]})` || ""
            }));
        };
        return [
            {
                category: "No Budget Allocation",
                value: 0,
                fill: "var(--color-chart-1)"
            }
        ];
    }, [expenseCategories]) as Array<{category: string; value: number; fill: string}>;

    const chart_config_data = useMemo(() => {
        const config_pattern = chart_data_logic?.reduce((prev, item) => {
            prev[item.category?.toLowerCase()] = {
                label: item?.category?.replace(/\b\w/g, char => char?.toUpperCase()),
                color: item?.fill
            }
            return prev;
        }, {} as Record<string, Record<string, string>>);
        Object.assign(config_pattern, {
            category: {
                label: "Category"
            }
        });
        return config_pattern;
    }, [chart_data_logic]);

    useEffect(() => {
        if (chart_data_logic?.length) {
            const donut_labels_pattern = chart_data_logic?.map((item, idx, arr) => ({label: item?.category, value: ((+item?.value / arr?.reduce((p, v) => p + +v?.value, 0) || 0) * 100)?.toFixed(2), color: item?.fill}));
            setDonutChartLabels(donut_labels_pattern);
            return;
        }
        setDonutChartLabels([]);
    }, [chart_data_logic, setDonutChartLabels])

    return (
        <ChartContainer
            config={chart_config_data}
            className="mx-auto aspect-square max-h-[250px]"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        
                        const data = payload[0].payload;
                        const percentage = ((data.value / expenseCategories?.reduce((p, v) => p + +(v?.total_budget), 0)) * 100).toFixed(1);
                        
                        return (
                            <div className="rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: data.fill }}
                                    />
                                    <p className="font-semibold text-sm">{data.category}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">₦{data.value.toLocaleString()}</span>
                                        <span className="text-xs ml-2">({percentage}%)</span>
                                    </p>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${percentage}%`,
                                                background: `linear-gradient(90deg, ${data.fill} 0%, ${data.fill}80 100%)`,
                                                boxShadow: `0 0 8px ${data.fill}40`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
                <Pie
                    data={chart_data_logic}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={60}
                />
            </PieChart>
        </ChartContainer>
    )
}

export default BudgetDonutChart;