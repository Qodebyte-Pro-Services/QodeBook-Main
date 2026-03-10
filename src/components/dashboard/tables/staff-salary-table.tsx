import { getStaffSalariesHistory } from "@/api/controllers/get/handler";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import staffHistoryColumns from "@/components/data-table/staff-history-columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

interface StaffSalaryLogic {
    staffId: string;
}

export type PaymentHistoryResponse = {
    id: number;
    amount: string;
    description: string;
    payment_method: string;
    payment_date: string;
    approved_by_role: string;
    approved_at: string;
    receipt_url: string;
    staff_name: string;
}

const StaffSalaryTable = ({staffId}: StaffSalaryLogic) => {
    const businessId = useMemo(() => {
        const current_id = sessionStorage.getItem("selectedBusinessId");
        return current_id ? JSON.parse(current_id) : 0;
    }, []);

    const {data: paymentData, isLoading: isPaymentHistoryLoading, isSuccess: isPaymentHistorySuccess, isError: isPaymentHistoryError, error: paymentHistoryError} = useQuery({
        queryKey: ["staff-salary", businessId, staffId],
        queryFn: () => getStaffSalariesHistory({businessId, staff_id: staffId}),
        enabled: businessId !== 0 && staffId !== "",
        refetchOnReconnect: "always",
        refetchOnWindowFocus: false,
        retry: false,
    });

    const paymentHistory = useMemo<Array<PaymentHistoryResponse>>(() => {
        if (!isPaymentHistoryError && isPaymentHistorySuccess) {
            return paymentData?.data;
        }
        return [];
    }, [isPaymentHistorySuccess, isPaymentHistoryError, paymentData]);

    return(
        <Card className="dark:bg-black">
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Manage and track staff salaries</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTableWithNumberPagination columns={staffHistoryColumns} data={paymentHistory} filterId="staff_name" isLoading={isPaymentHistoryLoading} isShowCost={true} isShowStock={true} displayedText="Salaries" placeholderText="Search By Staff Name" />
            </CardContent>
        </Card>
    );
}

export default StaffSalaryTable;