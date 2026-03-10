"use client";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A simple area chart"

const chartData = [
  { month: "XXVX", sales: 186 },
  { month: "XXNX", sales: 305 },
  { month: "XXLX", sales: 237 },
  { month: "XXUX", sales: 73 },
  { month: "XXIX", sales: 209 },
  { month: "XXLI", sales: 214 },
  { month: "XXOP", sales: 190 },
  { month: "PPIX", sales: 240 },
  { month: "JXXP", sales: 320 },
  { month: "XPIO", sales: 170 },
  { month: "XXPI", sales: 240 },
  { month: "JXXR", sales: 340 },
  { month: "XPOX", sales: 185 },
  { month: "JXPO", sales: 295 },
  { month: "XPUU", sales: 385 },
  { month: "XPOI", sales: 453 },
  { month: "XPOX", sales: 290 },
  { month: "XPOI", sales: 248 },
  { month: "XPOP", sales: 145 },
  { month: "JXYR", sales: 349 },
  { month: "JASD", sales: 457 },
  { month: "XSUY", sales: 298 },
]

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--color-template-chart-store)",
  },
} satisfies ChartConfig

function SaleLineGraph({title = "Sales Movement", content = "Monitor the product sales in and out of the store"} : {title?: string; content?: string;}) {
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
                    <div className="text-xs font-[500]">Total Sales</div>
                </div>
            </div>
        </div>
    </CardHeader>
      <CardContent>
        <ChartContainer className="xl:h-[380px] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="var(--color-template-chart-store)"
            //   fillOpacity={0.4}
              stroke="var(--color-template-primary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default SaleLineGraph;