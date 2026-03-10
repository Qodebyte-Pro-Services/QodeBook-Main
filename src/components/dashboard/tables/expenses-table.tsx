"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RxPlus } from "react-icons/rx";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "@/api/controllers/get/handler";
import { useEffect, useMemo, useState } from "react";
import { columns } from "@/components/data-table/expense-table-column";

export type ExpenseTableLogic = {
  id: number;
  amount: string;
  description: string;
  expense_date: string;
  status: string;
  payment_method: string;
  payment_status: string;
  receipt_url: string;
  created_at: string;
  approved_at: string;
  status_updated_at: string;
  business_name: string;
  category_name: string;
  staff_name: string;
  approved_by_user_name: string;
  approved_by_staff_name: string;
}

const ExpenseTable = ({ handleOpenForm, businessId }: { handleOpenForm?: (field: "expense-form" | "expense-category") => void; businessId: number }) => {

  const [currentPath, setCurrentPath] = useState<string>("");

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["get-expenses", businessId],
    queryFn: () => getExpenses(businessId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: false,
    enabled: businessId !== 0
  });

  useEffect(() => {
    if (typeof window === "undefined" && !("location" in window)) return;
    const lt_props = new URL(window.location.href).pathname;
    setCurrentPath(lt_props);
  }, []);

  const tableData = useMemo(() => {
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
            <CardTitle className="text-base font-[600]">Expenses Record</CardTitle>
            <CardDescription className="text-xs font-[550] text-muted-foreground">Manage all your business expenses</CardDescription>
          </div>
          {currentPath === "/reports" ? null : (
            <div className="flex flex-col sm:flex-row items-center gap-x-3">
              <button onClick={() => handleOpenForm?.("expense-category")} className="px-4 py-2 rounded-md border-2 border-template-primary font-[550] text-sm text-template-primary flex items-center gap-x-2">
                <BiSolidCategoryAlt size={20} />
                <span>Add Expense Category</span>
              </button>
              <button onClick={() => handleOpenForm?.("expense-form")} className="px-4 py-2 rounded-md bg-template-primary text-white font-[550] text-sm flex items-center gap-x-2">
                <RxPlus size={20} />
                <span>Add Expense</span>
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="py-5 bg-white dark:bg-black rounded-sm">
            <DataTableWithNumberPagination columns={columns} data={tableData} filterId="category_name" isLoading={isLoading} placeholderText="Filter By Category Name" isShowStock={true} isShowCost={false} displayedText="Expenses" />
        </CardContent>
      </div>
    </Card>
  );
}

export default ExpenseTable;