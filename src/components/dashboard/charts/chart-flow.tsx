"use client"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { useState } from "react"

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
import { SlidersHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProductVariantStockMovement } from "@/models/types/shared/handlers-type"

export const description = "A bar chart";

const chartConfig = {
  movement: {
    label: "Variant Movement: ",
    color: "var(--color-template-chart-store)",
  },
  positive: {
    color: "#5CCE9C",
  },
  negative: {
    color: "#385EF3",
  },
} satisfies ChartConfig

const ChartFlow = ({title, content, chart_data}: {title: string; content: string; chart_data?: ProductVariantStockMovement}) => {
    const [selectedVariantId, setSelectedVariantId] = useState<number>(chart_data?.variants?.[0]?.variant_id || 0);
    
    const selectedVariant = chart_data?.variants?.find(
        variant => variant.variant_id === selectedVariantId
    );
    
    const chartData = selectedVariant?.flow?.map(item => ({
        period: item.period,
        movement: item.movement
    })) || [
        {
            period: chart_data?.variants?.[0]?.flow?.[0]?.period,
            movement: chart_data?.variants?.[0]?.flow?.[0]?.movement
        }
    ];
    
  return (
    <Card>
      <CardHeader>
            <div className="w-full flex flex-col items-start gap-y-3  lg:flex-row lg:justify-between lg:items-center">
                <div className="flex flex-col gap-y-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{content}</CardDescription>
                </div>
                <div className="flex gap-x-4 items-center">
                    <Select>
                        <SelectTrigger className="focus:outline-none">
                            <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent className="focus:outline-none">
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                        </SelectContent>
                    </Select>
                    <DropdownMenu>
                    <DropdownMenuTrigger className="text-auth-basic/50 flex items-center gap-x-1 border border-auth-basic/50 px-4 rounded-sm">
                      <SlidersHorizontal size={15} />
                      <DropdownMenuLabel>Variants</DropdownMenuLabel>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {chart_data?.variants?.map((variant) => (
                            <DropdownMenuItem key={variant?.variant_id} onClick={() => setSelectedVariantId(variant?.variant_id)}>{variant?.sku}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              tickFormatter={(value) => value.slice(0, 10)}
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
            <Bar {...(chartData?.length < 7 && {barSize: 100})} dataKey="movement" radius={2}>
              {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry?.movement ? (+entry?.movement < 0 ? "#E9695E" : "#5CCE9C") : "#E9695E"} 
                  />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartFlow;