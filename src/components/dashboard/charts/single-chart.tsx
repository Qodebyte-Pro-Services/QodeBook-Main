"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const description = "A bar chart";

const chartData: Array<{time: string; sales: number}> = [
  { time: "09:00", sales: 8500 },
  { time: "10:00", sales: 7800 },
  { time: "11:00", sales: 3000 },
  { time: "12:00", sales: 4000 },
  { time: "1:00", sales: 7900 },
  { time: "2:00", sales: 7900 },
  { time: "3:00", sales: 7900 },
  { time: "4:00", sales: 7900 },
  { time: "5:00", sales: 7600 },
]

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--color-template-chart-store)",
  },
} satisfies ChartConfig

const ChartFlow = () => {
  return (
    <Card>
      <CardHeader>
            <div className="w-full flex flex-col items-start gap-y-3  lg:flex-row lg:justify-between lg:items-center">
                <div className="flex flex-col gap-y-1">
                    <CardTitle>Stock Level Overtime</CardTitle>
                    <CardDescription>Sales and Expenses for the past 7 days</CardDescription>
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
                      <DropdownMenuLabel>Filter</DropdownMenuLabel>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Product</DropdownMenuItem>
                      <DropdownMenuItem>Category</DropdownMenuItem>
                      <DropdownMenuItem>Date Range</DropdownMenuItem>
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
              dataKey="time"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <YAxis
                dataKey="sales"
                tickLine={true}
                tickMargin={10}
                axisLine={false}
                color="#000000"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="sales" fill="var(--color-template-chart-store)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartFlow;