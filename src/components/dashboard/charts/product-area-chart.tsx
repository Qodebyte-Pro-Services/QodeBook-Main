"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Package, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getInventoryTotalVariants } from "@/api/controllers/get/handler"
import { StockMovementAnalytics } from "@/models/types/shared/handlers-type"

const gradientDef = (
  <defs>
    <linearGradient id="colorMovement" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="hsl(#40922C)" stopOpacity={0.8} />
      <stop offset="95%" stopColor="hsl(#40922C)" stopOpacity={0.1} />
    </linearGradient>
  </defs>
);


const chartConfig = {
  movement: {
    label: "Stock Movement",
    color: "hsl(#40922C)",
  },
} satisfies ChartConfig;


interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: any;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data?.net_moved >= 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    
    return (
      <div className="bg-background p-3 rounded-lg border shadow-lg backdrop-blur-sm bg-opacity-90">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {new Date(label as string).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-full",
            isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          )}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {payload[0].value?.toLocaleString()} units
            </p>
            <p className="text-xs text-muted-foreground">
              {isPositive ? 'Stock In' : 'Stock Out'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MotionCard = motion(Card);

export function ProductAreaChart({ productId, businessId }: { productId: number; businessId: number }) {

    const queryData = useMemo(() => {
      const searchParamsHandler = new URLSearchParams();
        if (productId || businessId) {
          const data = {
            business_id: +businessId,
            product_id: +productId,
            period: "hour"
          }
          Object.entries(data)
          ?.filter(([key, value]) => value !== 0 || value)
          ?.forEach(([key, value]) => searchParamsHandler.append(key, `${value}`));
        }
        return {
          url: `/api/finance/stock-movement-analytics?${searchParamsHandler.toString()}`,
          business_id: +businessId
        };
    }, [productId, businessId]) as {url: string; business_id: number;};

    const {data: productVariantsData, isLoading: productVariantLoading, isSuccess: productVariantSuccess, isError: productVariantError, error: productVariantErrorData, refetch: productVariantRefetch} = useQuery({
        queryKey: ["get-specific-product-variant", queryData, productId, businessId],
        queryFn: () => getInventoryTotalVariants(queryData),
        enabled: productId !== 0 && businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false,
    });
    
    const charts_data = useMemo(() => {
      if (productVariantSuccess && !productVariantError) {
        return productVariantsData?.movements || [];
      }
    }, [productVariantError, productVariantSuccess, productVariantsData]) as StockMovementAnalytics;

    const chartData = useMemo(() => {
      if (charts_data?.length) {
        return charts_data?.map(item => ({
          period: item?.first_movement,
          movement: +item?.net_moved < 0 ? 0 : +item?.net_moved
        }));
      }
    }, [charts_data]);

  // Calculate trend data
  const trendData = useMemo(() => {
    if (!chartData?.length) return null;

    console.log(chartData);
    
    const first = chartData[0]?.movement || 0;
    const last = chartData[chartData.length - 1]?.movement || 0;
    const diff = last - first;
    const percentage = first !== 0 ? (diff / Math.abs(first)) * 100 : 100;
    
    return {
      isPositive: diff >= 0,
      value: Math.abs(diff).toLocaleString(),
      percentage: Math.abs(percentage).toFixed(1),
      trend: diff >= 0 ? 'up' : 'down',
    };
  }, [chartData]);

  // Loading state
  if (productVariantLoading) {
    return (
      <Card className="h-[450px] flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading stock data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <MotionCard 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row  items-center justify-between">
          <div className="max-[500px]:self-start">
            <CardTitle className="self-start flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-template-primary" />
              Stock Movement
            </CardTitle>
            <CardDescription className="mt-1">
              Track inventory changes over time
            </CardDescription>
          </div>
          {trendData && (
            <div className="max-[500px]:self-end flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50">
              {trendData.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {trendData.percentage}% {trendData.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      {chartData?.length ? (
        <CardContent className="pt-2 flex-1">
          <ChartContainer className="h-[320px] w-full" config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 10,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              {gradientDef}
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => 
                  new Date(value)?.toLocaleDateString("default", {
                    month: "short", 
                    day: "numeric"
                  })
                }
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={40}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${value / 1000}k`;
                  return value.toString();
                }}
              />
              <RechartsTooltip 
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'hsl(var(--border))',
                  strokeDasharray: '4 4',
                  strokeWidth: 1,
                }}
              />
              <Area
                dataKey="movement"
                type="monotone"
                stroke="#40922C"
                strokeWidth={2}
                fillOpacity={1}
                fill="#40922C70"
                activeDot={{
                  r: 6,
                  stroke: '#40922C',
                  strokeWidth: 2,
                  fill: '#40922C',
                }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      ) : (
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium mb-1">No movement data available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {productVariantError 
              ? "Failed to load stock movement data. Please try again later."
              : "Stock movement data will appear here once available."
            }
          </p>
        </CardContent>
      )}
    </MotionCard>
  )
}
