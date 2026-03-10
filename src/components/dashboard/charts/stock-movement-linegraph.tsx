"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StockMovementTypes } from "@/models/types/shared/handlers-type"

export const description = "An area chart with icons";

const chartConfig = {
    total_moved: {
        label: "Total Moved",
        color: "var(--color-template-chart-store)",
        icon: TrendingUp
    },
    movement_count: {
        label: "Movement Count",
        color: "var(--color-template-chart-gas)",
        icon: TrendingDown
    },
} satisfies ChartConfig;

function StockAreaGraph({title, content, chart_data}: {title: string; content: string; chart_data?: StockMovementTypes}) {
  return (
    <Card>
      <CardHeader>
        <div className="w-full flex flex-col gap-y-2 md:flex-row md:justify-between md:items-center">
            <div className="flex flex-col gap-y-1">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{content}</CardDescription>
            </div>
            <div className="flex gap-x-4 items-center">
                <div className="flex gap-x-1">
                    <div className="w-4 h-4 rounded-xs bg-template-chart-store" />
                    <div className="text-xs font-[500]">Total Moved</div>
                </div>
                <div className="flex gap-x-1">
                    <div className="w-4 h-4 rounded-xs bg-template-chart-gas" />
                    <div className="text-xs font-[500]">Movement Count</div>
                </div>
            </div>
        </div>
    </CardHeader>
      <CardContent>
        <ChartContainer className="xl:h-[380px] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chart_data?.movements}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString("default", {hour:"2-digit", minute: "2-digit"}).split(",")[1]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={(value) => new Date(value).toLocaleDateString("default", {month:"long", day: "2-digit", year: "numeric"})} indicator="line" />}
            />
            <Area
              dataKey="total_moved"
              type="natural"
              fill="var(--color-template-chart-store)"
              fillOpacity={0.4}
              stroke="var(--color-template-chart-store)"
              stackId="a"
            />
            <Area
              dataKey="movement_count"
              type="natural"
              fill="var(--color-template-chart-gas)"
              fillOpacity={0.4}
              stroke="var(--color-template-chart-gas)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default StockAreaGraph;