"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useMemo } from "react";
import { getCategoryStockDistribution, getProductCategories } from "@/api/controllers/get/handler";
import { useQuery } from "@tanstack/react-query";
import { CategoryPayload } from "@/models/types/shared/handlers-type";
import { useCategoriesData } from "@/store/state/lib/stocks-state-manager";

interface ChartDataPoint {
  categoryName: string;
  value: number;
  fill: string;
}

interface CategoryDistribution {
  categories: Array<{
    category_id: number;
    category_name: string;
    total_stock: string;
  }>;
}

export function CategoriesBar() {
  const { setCategories } = useCategoriesData();

  const businessId = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const selectedBusinessId = sessionStorage.getItem("selectedBusinessId");
    return selectedBusinessId ? JSON.parse(selectedBusinessId) : 0;
  }, []);

  const branchId = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const selectedBranchId = sessionStorage.getItem("selectedBranchId");
    return selectedBranchId ? JSON.parse(selectedBranchId) : 0;
  }, []);

  const { data: categoryDistribution, isSuccess: isCategorySuccess, isError: isCategoryError } = useQuery<CategoryDistribution>({
    queryKey: ["get-category-distribution", businessId, branchId],
    queryFn: () => getCategoryStockDistribution({ businessId: +businessId, branchId: +branchId }),
    enabled: +businessId !== 0 && +branchId !== 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always'
  });

  const { data: category = { categories: [] }, isSuccess: isCategoriesSuccess, isError: isCategoriesError } = useQuery<{ categories: CategoryPayload[] }>({
    queryKey: ["get-categories", businessId],
    queryFn: () => getProductCategories(businessId),
    enabled: +businessId !== 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always'
  });

  useEffect(() => {
    if (isCategoriesSuccess && category?.categories) {
      setCategories(category.categories);
    }
  }, [isCategoriesSuccess, category?.categories, setCategories]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (isCategorySuccess && categoryDistribution?.categories) {
      return categoryDistribution.categories.map((cat) => ({
        categoryName: cat.category_name,
        value: Number(cat.total_stock) || 0,
        fill: "var(--color-template-primary)",
      }));
    }
    return [];
  }, [categoryDistribution, isCategorySuccess]);

  const chartConfig = useMemo<ChartConfig>(() => {
    if (isCategoriesSuccess && category?.categories) {
      return category.categories.reduce<ChartConfig>((acc, cat) => {
        acc[cat.name] = {
          label: cat.name,
          color: "var(--color-template-primary)",
        };
        return acc;
      }, {});
    }
    return {};
  }, [category?.categories, isCategoriesSuccess]);

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
        }}
      >
        <YAxis
          dataKey="categoryName"
          type="category"
          tickLine={true}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig]?.label as string
          }
        />
        <XAxis dataKey="value" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="value" layout="vertical" barSize={40} radius={5} />
      </BarChart>
    </ChartContainer>
  )
}
