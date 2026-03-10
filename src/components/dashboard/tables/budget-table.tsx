"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RxPlus } from "react-icons/rx";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { useQuery } from "@tanstack/react-query";
import { getBudgets } from "@/api/controllers/get/handler";
import { useEffect, useMemo, useState } from "react";
import { budgetColumn } from "@/components/data-table/budget-column";

export type BudgetReponseLogic = {
    id: number;
    amount: string;
    period_start: string;
    period_end: string;
    carry_over: string;
    budget_spent: string;
    budget_remaining: string;
    budget_month: string;
    budget_year: string;
    status: string;
    rejection_reason: string;
    created_at: string;
    business_name: string;
    category_name: string;
    approved_by_user_name: string;
    approved_by_staff_name: string;
};

const BudgetTable = ({ handleOpenForm, businessId }: { handleOpenForm?: () => void; businessId: number }) => {

  const [currentPath, setCurrentPath] = useState<string>("");

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["get-budgets", businessId],
    queryFn: () => getBudgets(businessId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: false,
    enabled: businessId !== 0
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("location" in window)) return;
    const pathname = new URL(window.location.href).pathname;
    setCurrentPath(pathname);
    return () => setCurrentPath("");
  }, []);

  const tableData = useMemo<BudgetReponseLogic[]>(() => {
    if (isSuccess && !isError) {
      return data?.data || [];
    }
    return [];
  }, [isSuccess, isError, data]);

  return (
    <Card className="dark:bg-black">
      <div className="flex flex-col gap-y-3">
        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex flex-col gap-y-1">
                <CardTitle className="text-base font-[600]">Budgets Record</CardTitle>
                <CardDescription className="text-xs font-[550] text-muted-foreground">Manage all your business budgets</CardDescription>
            </div>
            {currentPath === "/reports" ? null : (
              <button onClick={() => handleOpenForm?.()} className="px-4 py-2 rounded-md bg-template-primary text-white font-[550] text-sm flex items-center gap-x-2">
                  <RxPlus size={20} />
                  <span>Add Budgets</span>
              </button>
            )}
        </CardHeader>
        <CardContent className="py-5 bg-white dark:bg-black rounded-sm">
            <DataTableWithNumberPagination columns={budgetColumn} data={tableData} filterId="category_name" isLoading={isLoading} placeholderText="Filter By Category Name" isShowStock={true} isShowCost={false} displayedText="Expenses" />
        </CardContent>
      </div>
    </Card>
  );
}

export default BudgetTable;