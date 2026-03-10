"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { StockMovementTypes } from "@/models/types/shared/handlers-type";

export const description = "A multiple bar chart";

const chartConfig = {
    total_moved: {
        label: "Total Moved",
        color: "var(--color-template-chart-store)",
    },
    movement_count: {
        label: "Movement Count",
        color: "var(--color-template-chart-gas)",
    },
} satisfies ChartConfig;

const DoubleChartFlow = ({title, content, chart_data}: {title: string; content: string; chart_data?: StockMovementTypes}) => {
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
                    <BarChart accessibilityLayer data={chart_data?.movements}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="period"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString("default", {hour:"2-digit", minute: "2-digit"}).split(",")[1]}
                        />
                        <YAxis 
                            dataKey="total_moved"
                            tickLine={true}
                            tickMargin={10}
                            axisLine={false}
                            color="#000000"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent labelFormatter={(value) => new Date(value).toLocaleDateString("default", {month:"long", day: "2-digit", year: "numeric"})} indicator="dashed" />}
                        />
                        <Bar
                            dataKey="total_moved"
                            fill="var(--color-template-chart-store)"
                            radius={0}
                        />
                        <Bar
                            dataKey="movement_count"
                            fill="var(--color-template-chart-gas)"
                            radius={0}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default DoubleChartFlow;