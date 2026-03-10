"use client";

import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import customerColumns from "@/components/data-table/customer-columns";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState} from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers, getStaffByBusinessId } from "@/api/controllers/get/handler";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CiSearch } from "react-icons/ci";
import { StaffResponseLogic } from "@/models/types/shared/handlers-type";
import staffListColumn from "@/components/data-table/staff-list-column";
import { GoPlus } from "react-icons/go";

interface StaffListTableLogic {
    setShowStaffForm?: React.Dispatch<React.SetStateAction<boolean>>;
}

const StaffListTable = ({setShowStaffForm}: StaffListTableLogic) => {
    const [currentPath, setCurrentPath] = useState<string>("");
    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const id = sessionStorage.getItem("selectedBusinessId");
            return id ? JSON.parse(id) : 0;
        }
        return 0;
    }, []);

    const {data: staffList, isSuccess: staffSuccess, isError: staffError, error: staffErrorData, refetch: staffRefetch, isLoading: staffLoading} = useQuery({
        queryKey: ["get-staff-list", businessId],
        queryFn: () => getStaffByBusinessId(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    useEffect(() => {
        if (typeof window === "undefined" || !("location" in window)) return;
        const pathname = new URL(window.location.href).pathname;
        setCurrentPath(pathname);
        return () => setCurrentPath("");
    }, []);

    const staffData = useMemo<Array<StaffResponseLogic>>(() => {
        if (staffSuccess && !staffError) {
            return staffList?.staff || [];
        }
        return [];
    }, [staffList, staffError, staffSuccess]);

    if (staffLoading) {
        return (
            <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <RiLoader4Line className="animate-spin h-12 w-12 text-template-primary" />
                    <p className="text-foreground/60 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (staffError) {
        const errorMessage = staffErrorData instanceof Error ? staffErrorData.message : 'Failed to load dashboard data';
        toast.error(errorMessage);
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background p-4">
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button onClick={() => staffRefetch()} className="w-full">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <Card className="dark:bg-black">
            <div className="flex flex-col gap-y-3">
                <CardHeader className="flex justify-between">
                    <div className="space-y-1 w-full">
                        <CardTitle className="text-base font-[600]">Staff Directory</CardTitle>
                        <CardDescription className="text-sm font-[550] text-muted-foreground">Manage your staff information</CardDescription>
                    </div>
                    {currentPath === "/reports" ? null : (
                        <div className="w-max">
                            <button onClick={() => setShowStaffForm?.(true)} className="flex items-center gap-x-3 py-2 px-4 rounded-md font-[550] bg-template-primary text-white text-sm text-nowrap">
                                <GoPlus size={25} />
                                <span>Add New Staff</span>
                            </button>
                        </div>
                    )}
                </CardHeader>
                <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                    <DataTableWithNumberPagination filterId="full_name" placeholderText="Search staff by name" columns={staffListColumn} data={staffData || []} isShowCost={false} isShowStock={true} displayedText="Staff" />
                </div>
            </div>
        </Card>
    );
}

export default StaffListTable;