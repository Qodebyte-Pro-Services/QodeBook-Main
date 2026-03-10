"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { StoreProductTask } from "@/store/data/store-products-data";
import { getInventoryTotalVariants, getSalesAnalyticsData, getUserProducts } from "@/api/controllers/get/handler";
import { useQuery } from "@tanstack/react-query";
import { type DateRange } from "react-day-picker";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useDashboardContextHooks } from "@/hooks";

interface ProductOverviewQueryLogic {
    business_id: number;
    product_id: number;
    period: "day" | "hour" | "week" | "month" | "year";
    start_date: Date | string;
    end_date: Date | string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden min-w-[200px]">
                {payload.map((entry: any, index: number) => (
                    <div key={`tooltip-${index}`} className="flex">
                        <div
                            className="w-1.5 self-stretch"
                            style={{ backgroundColor: entry.color }}
                        />
                        <div className="p-3 flex-1">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                {new Date(label).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                })}
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-gray-900">
                                    {Number(entry.value).toLocaleString('en-NG', {
                                        style: 'currency',
                                        currency: 'NGN',
                                        maximumFractionDigits: 0
                                    })}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">sales</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const COLORS = [
    '#40922C',
    '#5CCE9C',
    '#E9695E',
    '#40922C',
    '#5CCE9C',
    '#E9695E',
    '#40922C',
];

export function SalesOverviewGraph({
    title,
    content,
}: {
    title: string;
    content: string;
}) {
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [productIds, setProductIds] = useState<number[]>([]);
    const [selectedPeriod, setSelectPeriod] = useState<string>("");
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
    const [isCustomDate, setIsCustomDate] = useState<boolean>(false);

    const { isPhoneView } = useDashboardContextHooks();

    const [totalSalesTotal, setTotalSalesTotal] = useState<number>(0);

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : 0;
        }
        return 0;
    }, []);

    const branchId = useMemo(() => {
        if (typeof window !== "undefined") {
            const selectedBranchId = sessionStorage.getItem("selectedBranchId");
            return selectedBranchId ? JSON.parse(selectedBranchId) : 0;
        }
        return 0;
    }, []);

    // Memoize date strings to prevent unnecessary recalculations
    // Use date timestamps for stable comparison (timestamps are primitives, not object references)
    const fromTimestamp = selectedDateRange?.from?.getTime() ?? null;
    const toTimestamp = selectedDateRange?.to?.getTime() ?? null;

    const startDateStr = useMemo(() => {
        if (fromTimestamp === null) return "";
        try {
            return new Date(fromTimestamp).toISOString().split("T")[0];
        } catch {
            return "";
        }
    }, [fromTimestamp]);

    const endDateStr = useMemo(() => {
        if (toTimestamp === null) return "";
        try {
            return new Date(toTimestamp).toISOString().split("T")[0];
        } catch {
            return "";
        }
    }, [toTimestamp]);

    const queryData = useMemo(() => {
        if (selectedPeriod || startDateStr || endDateStr || selectedProductId || businessId || branchId) {
            return {
                period: selectedPeriod,
                start_date: startDateStr,
                end_date: endDateStr,
                product_id: selectedProductId,
                business_id: businessId,
            }
        }
        return {
            period: "",
            start_date: "",
            end_date: "",
            product_id: "",
            business_id: "",
        }
    }, [selectedPeriod, startDateStr, endDateStr, selectedProductId, businessId, branchId]) as ProductOverviewQueryLogic;

    // Create a stable query URL string for the queryKey
    const queryUrl = useMemo(() => {
        if (typeof window === "undefined") return "";
        const searchParams = new URLSearchParams();
        Object.entries(queryData)
            ?.filter(([, value]) => value)
            ?.forEach(([key, value]) => {
                searchParams?.append(key, String(value));
            });
        return `/api/finance/sales-movement-analytics?${searchParams.toString()}`;
    }, [queryData]);

    const acceptedQueryData = useMemo(() => {
        if (!queryUrl) return { url: "", businessId: 0 };
        return {
            url: queryUrl,
            businessId: +businessId
        };
    }, [queryUrl, businessId]) as { url: string; businessId: number };

    const { data: totalStockMovements = { movements: [] }, isLoading: isStockLoading, isSuccess: isStockSuccess, isError: isStockError, error: stockError } = useQuery({
        queryKey: ["get-total-sales-analytics", businessId, queryUrl],
        queryFn: () => getSalesAnalyticsData(acceptedQueryData),
        enabled: !!queryUrl && businessId > 0,
        retry: false,
        refetchOnWindowFocus: false,
    });


    const {
        data: products,
        isLoading: isProductsLoading,
        isError: isProductsError
    } = useQuery({
        queryKey: ['get-products', businessId],
        queryFn: () => getUserProducts(businessId),
        enabled: businessId !== 0,
        retry: false,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (products?.products?.length) {
            const ids = products.products.map((product: StoreProductTask) => Number(product.id));
            setProductIds(ids);
        }
    }, [products]);

    const chartData = useMemo(() => {
        if (isStockSuccess && !isStockError && totalStockMovements?.movements) {
            const totalHeightSales = Math.max.apply(null, totalStockMovements.movements.map((movement: any) => +movement?.total_sales));
            setTotalSalesTotal(totalHeightSales);
            return totalStockMovements.movements;
        }
        return [];
    }, [isStockSuccess, isStockError, totalStockMovements?.movements]);

    if (isStockError) {
        return (
            <Card className="dark:bg-black">
                <CardHeader>
                    <CardTitle>Error Loading Chart</CardTitle>
                    <CardDescription>Failed to load chart data. Please try again.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-red-500">
                        {stockError?.message}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-black">
            <CardHeader className="pb-2">
                <div className="flex flex-col space-y-1.5">
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription>{content}</CardDescription>
                        </div>
                        <div className="relative flex gap-x-2 items-center">
                            <Select
                                value={selectedProductId === 0 ? '0' : selectedProductId.toString()}
                                onValueChange={(value) => {
                                    setSelectedProductId(value === '0' ? 0 : Number(value));
                                }}
                            >
                                <SelectTrigger className="py-2 px-3">
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">All Products</SelectItem>
                                    {products?.products?.map((product: StoreProductTask) => (
                                        <SelectItem
                                            key={product.id}
                                            value={product.id.toString()}
                                        >
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedPeriod} onValueChange={(value) => {
                                setSelectPeriod(value);
                                if (value === "custom") {
                                    setIsCustomDate(true);
                                } else {
                                    setIsCustomDate(false);
                                    setSelectedDateRange(undefined);
                                }
                            }}>
                                <SelectTrigger className="px-3 py-2">
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hour">Hour</SelectItem>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            {isCustomDate && (
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
                                                        setIsCustomDate(false);
                                                        setSelectedDateRange(undefined);
                                                        setSelectPeriod("day");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-template-primary hover:bg-template-primary/90"
                                                    onClick={() => {
                                                        if (selectedDateRange?.from && selectedDateRange?.to) {
                                                            console.log('Selected date range:', selectedDateRange);
                                                            setIsCustomDate(false);
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
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}

                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="first_sale"
                                tickLine={true}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    new Date(value)?.toLocaleString("default", {
                                        month: "short",
                                        day: "2-digit",
                                    })
                                }
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                            />
                            <YAxis
                                dataKey="total_sales"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                                domain={["auto", totalSalesTotal]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="total_sales"
                                name={products?.products?.find((p: StoreProductTask) => +p.id === selectedProductId)?.name || 'Movement'}
                                stroke={`${COLORS[0]}70`}
                                connectNulls={true}
                                strokeWidth={3}
                                dot={{
                                    r: 6,
                                    fill: COLORS[0],
                                    stroke: '#fff',
                                    strokeWidth: 1
                                }}
                                activeDot={{ r: 4, strokeWidth: 3 }}

                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}