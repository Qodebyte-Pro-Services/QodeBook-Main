"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StoreProductTask } from "@/store/data/store-products-data";
import { startTransition, use, useEffect, useMemo, useState } from "react";
import {useQuery } from "@tanstack/react-query";
import { getProductVariantStocks } from "@/api/controllers/get/handler";

export const description = "A bar chart";

const chartConfig = {
  movement: {
    label: "Total Movement",
    color: "var(--color-template-chart-store)",
  },
} satisfies ChartConfig

const ChartFlow = ({title, content, productLists}: {title: string; content: string; productLists?: StoreProductTask[]}) => {
  const [selectedProduct, setSelectedProduct] = useState<number>(Number(productLists?.[0]?.id) || 0);
  const [chartData, setChartData] = useState<{period: string; movement: number}[]>([]);
  const [chartDataMapper, setChartDataMapper] = useState<Map<string, number>>(new Map<string, number>([["0", 0]]));

  const businessId = useMemo(() => {
    if (typeof window !== "undefined") {
      const businessId = sessionStorage.getItem("selectedBusinessId");
      return businessId ? JSON.parse(businessId) : 0;
    }
    return 0;
  }, []);

  const {data: stockChartData, isLoading: isStockChartLoading, isSuccess: isStockChartSuccess} = useQuery({
      queryKey: ["product-variant-stock-movement", businessId, selectedProduct],
      queryFn: () => getProductVariantStocks({businessId: businessId, productId: selectedProduct}),
      refetchOnWindowFocus: false,
      retry: false
  });

  useEffect(() => {
    if (stockChartData?.variants?.length === 0) {
      setChartData([{
        period: `${new Date().toLocaleDateString()}`,
        movement: 0
      }]);
      return;
    }
    if (stockChartData?.variants) {
      const periodMap = new Map<string, number>(chartDataMapper);
      stockChartData.variants.forEach((variant: {flow: {period: string; movement: number; reason: string;}[]}) => {
        variant.flow?.forEach(item => {
          const existing = periodMap.get(item.period) || 0;
          periodMap.set(item.period, existing + item.movement);
          setChartDataMapper(prev => {
            prev.set(item.period, existing + item.movement);
            return prev;
          });
        });
      });
      setChartData(Array.from(periodMap.entries()).map(([period, movement]) => ({ period, movement })));
    }
  }, [selectedProduct, stockChartData?.variants])

  return (
    <Card>
      <CardHeader>
            <div className="w-full flex flex-col items-start gap-y-3 lg:flex-row lg:justify-between lg:items-center">
                <div className="flex flex-col gap-y-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{content}</CardDescription>
                </div>
                <div className="flex gap-x-4 items-center">
                    <Select 
                      onValueChange={(value) => setSelectedProduct(Number(value))}
                    >
                      <SelectTrigger className="focus:outline-none">
                        <SelectValue placeholder="Available Products Graph" />
                      </SelectTrigger>
                      {productLists?.length ? (
                        <SelectContent className="focus:outline-none">
                          {productLists?.map((item, index) => (
                            <SelectItem key={`product-graph-${index}`} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </SelectContent>
                      ) : (
                        <SelectContent className="focus:outline-none">
                          <SelectItem value="----" disabled>No Products Available</SelectItem>
                        </SelectContent>
                      )}
                    </Select>
                </div>
            </div>
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
              tickFormatter={(value) => new Date(value ?? Date.now()).toLocaleDateString("default", {month: "short", day: "numeric"})}
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
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar {...(chartData?.length < 7 && {barSize: 100})} dataKey="movement" fill="var(--color-template-chart-store)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartFlow;