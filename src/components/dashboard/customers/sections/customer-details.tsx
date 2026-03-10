"use client";

import React, { useState, useEffect, useMemo} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toast as reactToast } from "react-toastify";
import { PiCaretDoubleLeft, PiCaretLeftBold } from "react-icons/pi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTable } from "../../tables";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCustomerById, getCustomerTransactions } from "@/api/controllers/get/handler";
import { CustomerResponse } from "@/models/types/shared/handlers-type";
import { CgSpinner } from "react-icons/cg";
import { useDeleteUserAccount } from "@/hooks/useControllers";
import CustomDeleteHandler from "../../ui/custom-delete-handler";
import { useCustomDeleteHandler } from "@/store/state/lib/ui-state-manager";

const CustomerDetails = ({id}: {id: string}) => {
    const [listCount, setlistCount] = useState<number>(0);

    const deleteUserHandler = useDeleteUserAccount();
    const router = useRouter();

    const {setTitle} = useCustomDeleteHandler();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : null;
        }
        return 0;
    }, []);

    const request_data = useMemo(() => {
        if (id && businessId) {
            return {
                businessId: +businessId,
                customerId: id
            }
        }
        return {
            businessId: 0,
            customerId: 0
        }
    }, [id, businessId]) as {customerId: string; businessId: number};

    const {data: customerDetails, isLoading: customerDetailLoading, isSuccess: customerDetailSuccess, isError: customerDetailError, refetch: refetchCustomerDetails, isRefetching: isRefetchingCustomerDetails} = useQuery({
        queryKey: ["get-customer-id", id, businessId],
        queryFn: () => getCustomerById(request_data),
        enabled: typeof id !== "undefined" && +businessId > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const {data: customerSales, isLoading: salesLoading, isSuccess: salesSuccess, isError: salesError} = useQuery({
        queryKey: ["get-customer-sales", businessId],
        queryFn: () => getCustomerTransactions({customerId: +id, businessId}),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: businessId !== 0
    });

    const customerDetail = useMemo(() => {
        if (customerDetailSuccess && !customerDetailError) {
            return customerDetails?.customer || null;
        }
        return null;
    }, [customerDetails, customerDetailSuccess, customerDetailError]) as CustomerResponse;

    const salesData = useMemo(() => {
        if (salesSuccess && !salesError) {
            return customerSales?.orders;
        }
        return [];
    }, [customerSales, salesSuccess, salesError]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("listcount", JSON.stringify(listCount));
        }
    }, [listCount]);

    useEffect(() => {
        setTitle("User");
    }, []);

    const handleDeleteUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const userId = button.dataset.id;

        const req_data = {};

        if (userId && businessId) {
            Object.assign(req_data, {userId, businessId: +businessId});
        }

        reactToast(CustomDeleteHandler, {
            async onClose(req) {
                switch(req) {
                    case "confirm": {
                        try {
                            await deleteUserHandler.mutateAsync((req_data as {userId: string; businessId: number}), {
                                onSuccess: async (data) => {
                                    toast.success(data?.messsage ?? "User Account Deleted Successfully");
                                    router.replace("/customer");
                                },
                                onError: (err) => {
                                    if (err instanceof Error) {
                                        toast.error(err.message ?? "Error Occurred while Trying To Delete User");
                                        return;
                                    }
                                    toast.error("Unexpected Error Occurred While Trying To Delete User");
                                }
                            })
                        }catch(err) {
                            toast.error("Error Occurred While Trying To Delete User");
                        }
                    }
                    break;
                    case "cancel": {
                        toast.info("User Account Not Deleted");
                    }
                    break;
                    default:
                        return;
                }
            }
        })
    }

    if (customerDetailLoading || isRefetchingCustomerDetails) {
        return(
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex items-center gap-x-2">
                    <CgSpinner className="animate-spin" size={22} />
                    <div className="text-base font-[550]">Loading...</div>
                </div>
            </div>
        )
    }

    if (customerDetailError) {
        return(
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex items-center gap-x-2">
                    <button onClick={() => refetchCustomerDetails()} className="px-4 py-1.5 rounded-sm bg-template-primary text-white">Try Again</button>
                    <button onClick={() => history.back()} className="px-4 py-1.5 rounded-sm bg-template-whitesmoke text-black border border-white/60">Go Back</button>
                </div>
            </div>
        )
    }

    return(
        <div className="flex flex-col gap-y-5">
            {/* Dashboard Header Section o */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Customer Summary</div>
            </div>
            <div className="flex items-center gap-x-3">
                <div onClick={() => history.back()} className="flex items-center gap-x-1">
                    <PiCaretLeftBold size={15} />
                    <span className="text-black/60 dark:text-white/60 font-[550] text-[13px]">Customer management</span>
                </div>
                <div className="flex items-center gap-x-2">
                    <PiCaretDoubleLeft size={14} />
                    <span className="text-black dark:text-white font-[550] text-[13px]">Customer Summary</span>
                </div>
            </div>
            <Card className="dark:bg-black">
                <CardHeader>
                    <CardTitle>Customer Summary</CardTitle>
                </CardHeader>
                <CardHeader className="flex items-center gap-x-2">
                    <div className="w-10 h-10 rounded-full">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80" alt="profile" className="w-full h-full object-cover rounded-full aspect-video object-top" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs font-bold">{customerDetail?.name}</div>
                        <div className="text-[10.5px] text-black/50 dark:text-white/50">{customerDetail?.email}</div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-6">
                    <div className="flex flex-col">
                        <div className="text-[13px] font-[550]">Customer ID</div>
                        <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{customerDetail?.id}</div>
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[13px] font-[550]">Contact Info</div>
                        <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{customerDetail?.phone ?? "N/A"}</div>
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[13px] font-[550]">Entry Date</div>
                        <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{new Date(customerDetail?.created_at ?? Date.now().toLocaleString()).toLocaleString("default", {month: "short", day: "2-digit", year: "numeric"})}</div>
                    </div>
                </CardContent>
            </Card>
            {/* Here i go add the table */}
            <SalesTable sales={salesData} />
            <Card className="px-4 py-3 dark:bg-black">
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="w-full border-2 border-dotted border-red-500 rounded-md py-2 px-4 flex justify-between items-center">
                    <div className="flex flex-col gap-">
                        <div className="text-xs font-[550]">Delete Customer Data</div>
                        <div className="text-[10px] font-[550] text-black/50">Remove all data related to employee. Once you take this action, no going BACK.</div>
                    </div>
                    <button onClick={handleDeleteUser} data-id={customerDetail?.id || id} className="flex items-center gap-x-2 px-4 py-2 rounded-md bg-red-500 cursor-pointer text-white">
                        <Trash2 size={15} />
                        <span>Delete</span>
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}


export default CustomerDetails;