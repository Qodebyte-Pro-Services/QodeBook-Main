"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pie, PieChart, Tooltip } from "recharts";
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getStockAnalytics } from "@/api/controllers/get/handler";
import { useStockAnalyticsData, useStockAnalyticsTotal, useStockQueryDataAnalytics } from "@/store/state/lib/stocks-state-manager";

interface StockAnalyticsLogic {
    totalStock?: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
}

type ChartDataLogic = {
    data: Array<{label: string; skus: number; fill: string}>;
    total: number;
};

const chartConfig = {
    skus: {
        label: "SKUs",
    },
    outOfStock: {
        label: "Out Of Stock",
        color: "var(--color-template-chart-gas)",
    },
    inStock: {
        label: "In Stock",
        color: "var(--color-template-chart-store)",
    },
    lowStock: {
        label: "Low Stock",
        color: "var(--color-template-card-pending)"
    }
} satisfies ChartConfig;

const COLORFILLS = [
    "var(--color-template-chart-gas)",
    "var(--color-template-card-pending)",
    "var(--color-template-chart-store)"
];

const CustomTooltip = ({ active, payload}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-black p-4 border rounded-lg shadow-lg">
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={`tooltip-${index}`} className="flex flex-col gap-y-0.5">
                            <div className="text-xs font-[500]">{entry?.payload?.label?.replace(/([A-Z])/g, " $1")?.toUpperCase()}</div>
                            <div className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: entry?.payload?.fill }}
                                />
                                <span className="text-sm">
                                    <span className="font-medium">{entry?.payload?.value} SKUs</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const InventoryDonutChart = () => {
    const { setStockData } = useStockAnalyticsData();
    const { setTotal } = useStockAnalyticsTotal();
    const { _url_ } = useStockQueryDataAnalytics();

    const [ignoredKeys] = useState<string[]>(["totalstock", "potentialsalevalue", "inventoryvalue"]);

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return;
        const selectedBusinessId = sessionStorage.getItem("selectedBusinessId");
        return selectedBusinessId ? JSON.parse(selectedBusinessId) : 0;
    }, []);

    const branchId = useMemo(() => {
        if (typeof window === "undefined") return 0;
        const selectedBranchId = sessionStorage.getItem("selectedBranchId");
        return selectedBranchId ? JSON.parse(selectedBranchId) : 0;
    }, []);

    const { data: stockAnalytics, isSuccess, isError } = useQuery({
        queryKey: ["get-stock-analytics", businessId, branchId, _url_],
        queryFn: () => getStockAnalytics({ business_id: businessId, branch_id: branchId, url: `/api/finance/stock-analytics?${_url_ || `business_id=${businessId}`}`}),
        enabled: businessId !== 0 && branchId !== 0,
        refetchOnWindowFocus: 'always',
        retry: false
    });


    const chartData = useMemo<ChartDataLogic>(() => {
        if (isSuccess && !isError && stockAnalytics) {
            const stocks_data = stockAnalytics as StockAnalyticsLogic;
            const entries = Object.entries(stocks_data)
                .filter(([key]) => !ignoredKeys.includes(`${key.toLowerCase()}`));
                
            const total = entries.reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
            
            return {
                data: entries.map(([key, value], idx) => ({
                    label: key,
                    skus: total > 0 ? Math.floor((Number(value) * 360) / total) : 0,
                    value: +value,
                    fill: COLORFILLS[idx] || '#cccccc'
                })),
                total
            };
        }
        return { data: [], total: 0 };
    }, [stockAnalytics, isSuccess, isError]);

    useEffect(() => {
        if (isSuccess && !isError && stockAnalytics) {
            const stocks_data = stockAnalytics as StockAnalyticsLogic;
            setStockData(stocks_data);
            
            const entries = Object.entries(stocks_data)
                .filter(([key]) => !ignoredKeys?.includes(`${key.toLowerCase()}`));
                
            const total = entries.reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
            setTotal(total);
        }
    }, [stockAnalytics, isSuccess, isError, setStockData, setTotal]);

    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-square max-h-[250px] w-full flex justify-center items-center"
        >
            <PieChart>
                <Tooltip label={true} content={<CustomTooltip />} />
                <Pie
                    data={chartData.data}
                    dataKey="skus"
                    nameKey="label"
                    innerRadius={60}
                />
            </PieChart>
        </ChartContainer>
    );
};

export default InventoryDonutChart;