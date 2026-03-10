"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuppliersByBusinessId } from "@/api/controllers/get/handler";
import { Card } from "@/components/ui/card";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { supplierColumn } from "@/components/data-table/supplier-column";
import { CgSpinnerAlt } from "react-icons/cg";

const SupplierManagementTable = () => {
    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : 1;
        }
        return 0;
    }, []);

    const { data: suppliers, isLoading: suppliersLoading, error: suppliersError, isSuccess: suppliersSuccess } = useQuery({
        queryKey: ["suppliers", businessId],
        queryFn: () => getSuppliersByBusinessId(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: false,
    });

    const suppliersData = useMemo(() => {
        if (suppliersSuccess && !suppliersError) {
            return suppliers?.suppliers || [];
        }
        return [];
    }, [suppliers, suppliersSuccess, suppliersError]);

    return (
        <Card className="dark:bg-black">
            <div className="w-full">
                {suppliersLoading ? (
                    <div className="text-center px-4 py-5 flex items-center justify-center gap-x-1 bg-white dark:bg-black rounded-sm">
                        <CgSpinnerAlt size={24} className="text-template-primary animate-spin" />
                        <div className="text-sm font-[550] text-template-text-secondary">Loading suppliers...</div>
                    </div>
                ) : (
                    <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                        <DataTableWithNumberPagination columns={supplierColumn} data={suppliersData} filterId="name" placeholderText="Search by Name..." isShowCost={false} isShowStock={true} displayedText="Suppliers" />
                    </div>
                )}
            </div>
        </Card>
    );
}

export default SupplierManagementTable;