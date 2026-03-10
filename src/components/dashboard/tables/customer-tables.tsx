"use client";

import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import customerColumns from "@/components/data-table/customer-columns";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo} from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/api/controllers/get/handler";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CustomersTable = () => {
    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const id = sessionStorage.getItem("selectedBusinessId");
            return id ? JSON.parse(id) : 0;
        }
        return 0;
    }, []);

    const {data: customerData, isLoading: customerLoading, isSuccess: customerSuccess, isError: customerError, error: customerErrorData, refetch: customerRefetch} = useQuery({
        queryKey: ["get-customers", businessId],
        queryFn: () => getCustomers({businessId}),
        refetchOnWindowFocus: false,
        retry: false,
    });

    const customerdata = useMemo(() => {
        if (customerSuccess) {
            return customerData?.customers;
        }
        return [];
    }, [customerData, customerSuccess]);

    if (customerLoading) {
        return (
            <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <RiLoader4Line className="animate-spin h-12 w-12 text-template-primary" />
                    <p className="text-foreground/60 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (customerError) {
        const errorMessage = customerErrorData instanceof Error ? customerErrorData.message : 'Failed to load dashboard data';
        toast.error(errorMessage);
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background p-4">
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button onClick={() => customerRefetch()} className="w-full">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <Card className="w-full dark:bg-black">
            <div className="flex flex-col gap-y-3">
                <CardHeader>
                    <CardTitle className="text-base font-[600]">Customers</CardTitle>
                    <CardDescription className="text-xs font-[550] text-muted-foreground">Manage your customer database</CardDescription>
                </CardHeader>
                <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                    <DataTableWithNumberPagination columns={customerColumns} data={customerdata} filterId="name" placeholderText="Search by Customer Name / ID" isShowCost={false} isShowStock={true} displayedText="Customers" />
                </div>
            </div>
        </Card>
    );
}

export default CustomersTable;