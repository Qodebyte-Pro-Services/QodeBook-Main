"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { StoreProductTask } from "@/store/data/store-products-data";
import { getProductVariantStocks, getUserProducts } from "@/api/controllers/get/handler";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border rounded-lg shadow-lg">
                <p className="font-semibold text-sm mb-1">
                    {new Date(label).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
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
                                {entry.name}: <span className="font-medium">{entry.value}</span>
                            </span>
                        </div>
                    ))}
                </div>
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

export function ProductMultipleLineChart({
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

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : 0;
        }
        return 0;
    }, []);

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
    }, [products, productLists]);

    const stockQueries = useQueries({
        queries: productIds?.map((productId) => ({
            queryKey: ['product-stock-movement', businessId, productId],
            queryFn: () => getProductVariantStocks({ businessId, productId }),
            enabled: !!businessId && productId !== undefined,
            retry: false,
            refetchOnWindowFocus: true,
        })) || []
    });

    const chartData = useMemo(() => {
        if (selectedProductId === 0) {
            // Collect all unique periods across all products
            const allPeriods = new Set<string>();
            const productDataMap = new Map<number, Map<string, number>>();

            stockQueries.forEach((query, index) => {
                const productId = productIds[index];
                const periodMap = new Map<string, number>();

                if (query.data?.variants && query.data.variants.length > 0) {
                    query.data.variants.forEach((variant: any) => {
                        if (variant.flow && Array.isArray(variant.flow)) {
                            variant.flow.forEach((flow: any) => {
                                const period = flow.period;
                                allPeriods.add(period);
                                
                                // Sum movements for the same period
                                const currentMovement = periodMap.get(period) || 0;
                                periodMap.set(period, currentMovement + (flow.movement || 0));
                            });
                        }
                    });
                }

                if (periodMap.size > 0) {
                    productDataMap.set(productId, periodMap);
                }
            });

            // Convert to array format for recharts
            const sortedPeriods = Array.from(allPeriods).sort((a, b) => 
                new Date(a).getTime() - new Date(b).getTime()
            );

            return sortedPeriods.map(period => {
                const dataPoint: any = { period };
                
                productDataMap.forEach((periodMap, productId) => {
                    const product = products?.products?.find((p: StoreProductTask) => +p.id === productId);
                    const productName = product?.name || `Product ${productId}`;
                    dataPoint[productName] = periodMap.get(period) || null;
                });

                return dataPoint;
            });
        } else {
            // Single product view
            const selectedIndex = productIds.indexOf(selectedProductId);
            if (selectedIndex === -1 || !stockQueries[selectedIndex]?.data?.variants) {
                return [];
            }

            return stockQueries[selectedIndex].data.variants.flatMap((variant: any) =>
                variant.flow?.map((flow: any) => ({
                    period: flow.period,
                    movement: flow.movement,
                    reason: flow.reason
                })) || []
            ).sort((a: any, b: any) =>
                new Date(a.period).getTime() - new Date(b.period).getTime()
            );
        }
    }, [stockQueries, productIds, selectedProductId, products]);

    const productLines = useMemo(() => {
        if (selectedProductId === 0 && chartData.length > 0) {
            const firstDataPoint = chartData[0];
            return Object.keys(firstDataPoint).filter(key => key !== 'period');
        }
        return [];
    }, [chartData, selectedProductId]);

    const isLoading = stockQueries.some(query => query.isLoading) || isProductsLoading;
    const error = stockQueries.find(query => query.error)?.error ||
        (isProductsError ? new Error("Failed to load products") : null);

    if (isLoading) {
        return (
            <Card className="dark:bg-black">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{content}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <Skeleton className="h-full w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="dark:bg-black">
                <CardHeader>
                    <CardTitle>Error Loading Chart</CardTitle>
                    <CardDescription>Failed to load chart data. Please try again.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-red-500">
                        {error.message}
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
                        <div className="w-fit md:w-48">
                            <Select
                                value={selectedProductId === 0 ? '0' : selectedProductId.toString()}
                                onValueChange={(value) => {
                                    setSelectedProductId(value === '0' ? 0 : Number(value));
                                }}
                            >
                                <SelectTrigger className="w-full">
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
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
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
                                dataKey="period"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })
                                }
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                tickMargin={8}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            
                            {selectedProductId === 0 ? (
                                productLines.map((productName, index) => (
                                    <Line
                                        key={productName}
                                        type="monotone"
                                        dataKey={productName}
                                        name={productName}
                                        stroke={`${COLORS[index % COLORS.length]}80` || "#40922c80"}
                                        strokeWidth={2}
                                        dot={{
                                            r: 4,
                                            fill: COLORS[index % COLORS.length] || "#40922c",
                                            stroke: '#fff',
                                            strokeWidth: 1
                                        }}
                                        activeDot={{ r: 4, strokeWidth: 3 }}
                                        connectNulls
                                    />
                                ))
                            ) : (
                                <Line
                                    type="monotone"
                                    dataKey="movement"
                                    name={products?.products?.find((p: StoreProductTask) => +p.id === selectedProductId)?.name || 'Movement'}
                                    stroke={`${COLORS[0]}70`}
                                    strokeWidth={2}
                                    dot={{ 
                                        r: 6, 
                                        fill: COLORS[0],
                                        stroke: '#fff',
                                        strokeWidth: 1
                                    }}
                                    activeDot={{ r: 4, strokeWidth: 3 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}