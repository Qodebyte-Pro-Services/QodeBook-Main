"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { StoreProductTask } from "@/store/data/store-products-data";
import { getInventoryTotalVariants, getUserProducts } from "@/api/controllers/get/handler";
import { useQuery } from "@tanstack/react-query";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { BadgeTwo } from "@/components/ui/badge-two";
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
        const item = payload[0]?.payload;
        return (
            <div className="bg-white dark:bg-black p-4 border rounded-lg shadow-lg">
                <p className="font-semibold text-sm mb-1">
                    {new Date(label).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true
                    })}
                </p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={`tooltip-${index}`} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">
                                Total Movement: <span className="font-medium">{entry.value}</span>
                            </span>
                        </div>
                    ))}
                </div>
                {Array.isArray(item?.movements) && item.movements.length > 0 ? (
                    <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">Movements Breakdown</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between text-xs">
                                <BadgeTwo variant={'default'} className="uppercase">Total Increase</BadgeTwo>
                                <span className="font-medium">{item?.total_increased}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <BadgeTwo variant={'destructive'} className="uppercase">Total Decrease</BadgeTwo>
                                <span className="font-medium">{item?.total_decreased}</span>
                            </div>
                        </div>
                    </div>
                ) : null}
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

export function ProductOverviewLinGraph({
    title,
    content,
    productLists
}: {
    title: string;
    content: string;
    productLists?: StoreProductTask[]
}) {
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [productIds, setProductIds] = useState<number[]>([]);
    const [selectedPeriod, setSelectPeriod] = useState<string>("");
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
    const [isCustomDate, setIsCustomDate] = useState<boolean>(false);

    const { isPhoneView } = useDashboardContextHooks();

    const [totalNetMoved, setTotalNetMoved] = useState<number>(0);

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

    const queryData = useMemo(() => {
        if (selectedPeriod || selectedDateRange?.from || selectedProductId || businessId || branchId) {
            return {
                period: selectedPeriod,
                start_date: selectedDateRange?.from?.toISOString()?.split("T")?.[0],
                end_date: selectedDateRange?.to?.toISOString()?.split("T")?.[0],
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
    }, [selectedPeriod, selectedDateRange, selectedProductId, businessId, branchId]) as ProductOverviewQueryLogic;

    const acceptedQueryData = useMemo(() => {
        if (typeof window === "undefined") return;
        const searchParams = new URLSearchParams();
        Object.entries(queryData)
            ?.filter(([key, value]) => value)
            ?.forEach(([key, value]) => {
                searchParams?.append(key, String(value));
            });
        return {
            url: `/api/finance/stock-movement-analytics?${searchParams.toString()}`,
            business_id: +businessId
        }
    }, [queryData]) as { url: string; business_id: number };

    const { data: totalStockMovements = { movements: [] }, isLoading: isStockLoading, isSuccess: isStockSuccess, isError: isStockError, error: stockError } = useQuery({
        queryKey: ["get-stock-total-movement", businessId, acceptedQueryData],
        queryFn: () => getInventoryTotalVariants(acceptedQueryData),
        enabled: !!acceptedQueryData,
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
        enabled: businessId != 0,
        retry: false,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (products?.products?.length) {
            const ids = products.products.map((product: StoreProductTask) => Number(product.id));
            setProductIds(ids);
        }
    }, [products, productLists]);

    const chartData = useMemo(() => {
        if (isStockSuccess && !isStockError) {
            console.log(totalStockMovements?.movements);
            const total_net_moved = Math.max.apply(null, totalStockMovements?.movements?.map((item: any) => +item.net_moved));
            setTotalNetMoved(total_net_moved);
            return totalStockMovements?.movements || [];
        }
        return [];
    }, [isStockSuccess, isStockError, totalStockMovements]);

    const yAxisDomain = useMemo(() => {
        if (!chartData || chartData.length === 0) {
            return ['auto', 'auto'];
        }

        const values = chartData
            .map((item: any) => +item.net_moved)
            .filter((val: any) => typeof val === 'number' && !isNaN(val))
            .sort((a: number, b: number) => b - a);

        if (values.length === 0) {
            return ['auto', 'auto'];
        }

        const maxValue = totalNetMoved * 1.3;
        const minValue = Math.min(...values);
        const minWithPadding = minValue < 0 ? minValue * 1.1 : minValue * 0.9;

        return [Math.floor(minWithPadding), Math.ceil(maxValue)];
    }, [totalNetMoved, chartData]);

    const clippedData = useMemo(() => {
        if (!chartData || chartData.length === 0 || yAxisDomain[1] === 'auto') {
            return null;
        }

        const maxDomain = yAxisDomain[1];
        const clipped = chartData.filter((item: any) =>
            typeof item.net_moved === 'number' && item.net_moved > maxDomain
        );

        if (clipped.length === 0) return null;

        const maxClipped = Math.max(...clipped.map((item: any) => item.net_moved));

        return {
            count: clipped.length,
            maxValue: maxClipped,
            dates: clipped.map((item: any) =>
                new Date(item.first_movement).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            )
        };
    }, [chartData, yAxisDomain]);


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
                    <div className="flex flex-col gap-y-1.5 md:flex-row justify-between md:items-center">
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
                {clippedData && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-800">
                                    {clippedData.count} data point{clippedData.count > 1 ? 's' : ''} exceed{clippedData.count === 1 ? 's' : ''} the visible range
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Highest value: <span className="font-medium">{clippedData.maxValue.toLocaleString()}</span> on {clippedData.dates.join(', ')}
                                </p>
                                <p className="text-xs text-amber-600 mt-1">
                                    Chart scaled to show recent trends more clearly
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="w-full overflow-x-auto pb-4">
                    <div className="min-w-[1000px] h-[450px]">
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
                                    dataKey="first_movement"
                                    tickLine={true}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                    minTickGap={20}
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
                                    dataKey="net_moved"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => Number(v).toLocaleString()}
                                    tick={{ fontSize: 12 }}
                                    tickMargin={8}
                                    domain={yAxisDomain}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="net_moved"
                                    name={products?.products?.find((p: StoreProductTask) => +p.id === selectedProductId)?.name || 'Movement'}
                                    stroke={`${COLORS[0]}70`}
                                    connectNulls={true}
                                    strokeWidth={3}
                                    dot={(chartData?.length ?? 0) > 300 ? false : {
                                        r: 6,
                                        fill: COLORS[0],
                                        stroke: '#fff',
                                        strokeWidth: 1,
                                    }}
                                    activeDot={{ r: 4, strokeWidth: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}