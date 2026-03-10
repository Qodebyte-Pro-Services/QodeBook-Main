"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CartesianGrid, XAxis, YAxis, Tooltip as TooltipProps, Bar, BarChart, Cell } from "recharts";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Loader2, BarChart as BarChartIcon } from "lucide-react";

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
    color: "var(--color-template-chart-store)",
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

const MotionCard = motion(Card);

export function StockProductArea({ businessId }: { businessId: number }) {

    const queryData = useMemo(() => {
      const searchParamsHandler = new URLSearchParams();
        if (businessId) {
          const data = {
            business_id: +businessId,
          }
          Object.entries(data)
          ?.filter(([key, value]) => value !== 0 || value)
          ?.forEach(([key, value]) => searchParamsHandler.append(key, `${value}`));
        }
        return {
          url: `/api/finance/stock-movement-analytics?${searchParamsHandler.toString()}`,
          business_id: +businessId
        };
    }, [businessId]) as {url: string; business_id: number;};

    const {data: productVariantsData, isLoading: productVariantLoading, isSuccess: productVariantSuccess, isError: productVariantError, error: productVariantErrorData, refetch: productVariantRefetch} = useQuery({
        queryKey: ["get-specific-product-variant", queryData, businessId],
        queryFn: () => getInventoryTotalVariants(queryData),
        enabled: businessId !== 0,
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
          movement: Number(item?.net_moved)
        }));
      }
    }, [charts_data]);

  // Calculate trend data
  const trendData = useMemo(() => {
    if (!chartData?.length) return null;
    
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
      <Card className="h-[450px] flex flex-col dark:bg-black">
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
    <Card className="dark:bg-black">
        <CardHeader>
          <CardTitle>Stock Movement</CardTitle>
          <CardDescription>Track Your Stock Movement Analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="xl:h-[360px] w-full" config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value)?.toLocaleDateString("default", {month: "short", day: "2-digit"})}
              />
              <YAxis
                  dataKey="movement"
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
                                              {entry?.value}
                                          </span>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )
                  }}
              />
              <Bar dataKey="movement" radius={2}>
                {chartData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.movement >= 0 ? "var(--color-template-chart-store)" : "#ef4444"} 
                  />
                ))}
              </Bar>
              </BarChart>
          </ChartContainer>
        </CardContent>
    </Card>
  )
}
