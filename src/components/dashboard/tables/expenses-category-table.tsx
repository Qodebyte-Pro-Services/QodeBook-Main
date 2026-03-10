"use client";

import { getExpenseCategories, userBusinessesHandler } from "@/api/controllers/get/handler";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { expenseCategoryColumns } from "@/components/data-table/expense-table-column";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ExpenseCategoriesResponse } from "../finances/forms/add-expense";
import { useMemo } from "react";
import { BusinessReponseLogic } from "../finances/forms/add-expense-category-form";

const ExpenseCategoryTable = ({businessId}: {businessId: number}) => {

    const {data: category, isSuccess: categorySuccess, isError: categoryError, isLoading: categoryLoading} = useQuery({
        queryKey: ["get-expense-category", businessId],
        queryFn: () => getExpenseCategories(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const {data: business, isSuccess: businessSuccess, isError: businessError} = useQuery({
        queryKey: ["get-businesses"],
        queryFn: () => userBusinessesHandler(),
        refetchOnReconnect: "always",
        refetchOnWindowFocus: false,
        retry: false
    });

    const category_details = useMemo(() => {
        if (categorySuccess && !categoryError) {
            return category?.categories;
        }
        return [];
    }, [categorySuccess, categoryError, category]) as ExpenseCategoriesResponse[];

    const business_details = useMemo(() => {
        if (businessSuccess && !businessError) {
            return business?.businesses;
        }
        return [];
    }, [business, businessSuccess, businessError]) as BusinessReponseLogic[];

    const table_logic = useMemo(() => {
        if (category_details?.length && business_details?.length) {
            const businessMap = new Map(business_details.map(biz => [biz.id, biz.business_name]));
            return category_details.map(category => ({
                ...category,
                business_name: businessMap.get(category.business_id) || 'Unknown Business'
            }));
        }
        return [];
    }, [category_details, business_details]);

    return(
        <Card className="mt-5 dark:bg-black">
            <CardHeader>
                <CardTitle>Expense Category Records</CardTitle>
                <CardDescription>Track And Manage Expense Category Records</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTableWithNumberPagination columns={expenseCategoryColumns} data={table_logic} filterId="name" isLoading={categoryLoading} isShowCost={false} isShowStock={true} displayedText="Categories" placeholderText="Filter by category name / Id" />
            </CardContent>
        </Card>
    );
}

export default ExpenseCategoryTable;