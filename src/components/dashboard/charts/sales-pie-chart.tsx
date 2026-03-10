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
import { useSalesAnalytics, useSalesPieData, useStockAnalyticsData, useStockAnalyticsTotal, useStockQueryDataAnalytics } from "@/store/state/lib/stocks-state-manager";

interface StockAnalyticsLogic {
    totalStock?: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
}

type ChartDataLogic = {
    data: Array<{label: string; sales: number; value: number; fill: string}>;
    total: number;
};

const chartConfig = {
    sales: {
        label: "Sales",
    },
    online: {
        label: "Online Customers",
        color: "var(--color-template-blue)",
    },
    walk_in: {
        label: "Walk In",
        color: "var(--color-template-chart-store)",
    }
} satisfies ChartConfig;

const COLORFILLS = [
    "var(--color-template-blue)",
    "var(--color-template-chart-store)",
];

const CustomTooltip = ({ active, payload}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border rounded-lg shadow-lg dark:bg-black">
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
                                    <span className="font-medium">{new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", compactDisplay: "short"}).format(entry?.payload?.value)} Sales</span>
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

const ChartPieDonut = () => {
    const {salesAnalytics} = useSalesAnalytics();
    const {_url: _url_} = useSalesPieData();

    const chartData = useMemo<ChartDataLogic>(() => {
        const charts_data = Object.entries(salesAnalytics)
        ?.filter(([key]) => key.toLowerCase() !== "total")
        ?.map(([key, value], idx) => ({
            label: key,
            sales: Math.round((+value * 360) / salesAnalytics?.total) || 0,
            value: +value,
            fill: COLORFILLS[idx],
        }));
        if (charts_data?.length) {
            return {
                data: charts_data,
                total: salesAnalytics?.total
            }
        }
        return { data: [], total: 0 };
    }, [salesAnalytics]);

    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-square flex justify-center items-center w-full max-h-[250px]"
        >
            <PieChart>
                <Tooltip label={true} content={<CustomTooltip />} />
                <Pie
                    data={chartData.data}
                    dataKey="sales"
                    nameKey="label"
                    innerRadius={60}
                />
            </PieChart>
        </ChartContainer>
    );
};

export default ChartPieDonut;