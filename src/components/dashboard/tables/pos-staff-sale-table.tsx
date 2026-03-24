"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import salesColumn from "@/components/data-table/sale-table-columns";
import { useQuery } from "@tanstack/react-query";
import { getSales, getStaffDailySalesAndKpis } from "@/api/controllers/get/handler";
import { SalesSchema } from "@/store/data/sales-table-data";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { ArrowBigLeftDash } from "lucide-react";
import { useViewTransaction } from "@/store/state/lib/pos-state-manager";

type PaymentMethodData = {
    count: number;
    amount: number;
    percentage: number;
};

type StaffSalesKpis = {
    total_transactions: number;
    total_sales_amount: number;
    total_discount: number;
    total_tax: number;
    order_type_breakdown: {
        walk_in: { count: number; percentage: number };
        online_order: { count: number; percentage: number };
    };
    payment_method_breakdown: Record<string, PaymentMethodData>;
};

type StaffSalesResponse = {
    sales: SalesSchema[];
    kpis: StaffSalesKpis;
    date: string;
    staff_id: string;
};

const PosStaffSalesTable = () => {
    const [lists] = useState<Array<string>>(["All", "Cash", "Bank-transfer", "Card"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    const { setView } = useViewTransaction();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? JSON.parse(storedId) : 0;
        }
        return 0;
    }, []);

    const staffId = useMemo(() => {
        if (typeof window === "undefined") return "";
        const staffId = Cookies.get("authStaffId");
        return staffId;
    }, []);

    const { data: sales_data = {
        sales: [],
        kpis: {
            total_transactions: 0,
            total_sales_amount: 0,
            total_discount: 0,
            total_tax: 0,
            order_type_breakdown: {
                walk_in: { count: 0, percentage: 0 },
                online_order: { count: 0, percentage: 0 }
            },
            payment_method_breakdown: {}
        },
        date: "",
        staff_id: ""
    } as StaffSalesResponse, isLoading: salesLoading, isSuccess, isError } = useQuery({
        queryKey: ["get-staff-daily-sales-kpis", businessId],
        queryFn: () => getStaffDailySalesAndKpis({ businessId }),
        enabled: businessId !== 0,
        refetchOnWindowFocus: true,
        retry: false,
    });

    const salesData = useMemo(() => {
        const statusItem = lists[activeList];
        if (isSuccess && !isError) {
            if (statusItem === "All" || !statusItem) {
                return sales_data?.sales as SalesSchema[];
            }
            return sales_data?.sales?.filter((item: SalesSchema) => {
                const paymentMethods = item?.payments?.map(item => item?.method);
                return paymentMethods.includes(statusItem?.toLowerCase()?.replace(/\-/g, "_"));
            });
        }
        return [];
    }, [activeList, sales_data, isSuccess, isError, lists]);

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const { hiddenScrollbar } = useCustomStyles();

    useEffect(() => {
        const node = listRefs.current[activeList];
        const containerNode = containerRef.current;
        if (node && containerNode) {
            const nodeRect = node.getBoundingClientRect();
            const containerRect = containerNode.getBoundingClientRect();
            const padding = 8;
            setIndicatorStyle({
                left: (nodeRect.left - containerRect.left + containerNode.scrollLeft - padding / 2),
                width: nodeRect.width + padding,
            });
        }
    }, [activeList]);


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            key={"pos-staff-sale-table"}
            transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 20 }}
            className="w-full"
        >
            <Card className="dark:bg-black">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-1">
                            <CardTitle className="text-base font-[600]">Sales</CardTitle>
                            <CardDescription className="text-xs font-[550] text-muted-foreground">All pending, processing, in transit and canceled orders.</CardDescription>
                        </div>
                        <button onClick={() => setView("pos")} className="w-8 h-8 rounded-sm cursor-pointer bg-template-primary text-white flex items-center justify-center">
                            <ArrowBigLeftDash className="w-6 h-6" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-100px)] overflow-y-auto">
                    <div className="h-fit space-y-6">
               
                        {isSuccess && sales_data?.kpis && (
                            <div className="space-y-4">
                           
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Transactions</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sales_data.kpis.total_transactions || 0}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Sales</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">₦{(sales_data.kpis.total_sales_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Discount</p>
                                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₦{(sales_data.kpis.total_discount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Tax</p>
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₦{(sales_data.kpis.total_tax || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                           
                                {sales_data.kpis.order_type_breakdown && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Walk-in Orders</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sales_data.kpis.order_type_breakdown.walk_in?.count || 0}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">({sales_data.kpis.order_type_breakdown.walk_in?.percentage || 0}%)</p>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Online Orders</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{sales_data.kpis.order_type_breakdown.online_order?.count || 0}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">({sales_data.kpis.order_type_breakdown.online_order?.percentage || 0}%)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                     
                                {sales_data.kpis.payment_method_breakdown && Object.keys(sales_data.kpis.payment_method_breakdown).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Payment Methods</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {Object.entries(sales_data.kpis.payment_method_breakdown).map(([method, data]) => {
                                                const paymentData = data as PaymentMethodData;
                                                return (
                                                <div key={method} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 capitalize">{method.replace(/_/g, " ")}</p>
                                                    <div className="flex items-baseline justify-between">
                                                        <div>
                                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{paymentData.count}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">₦{(paymentData.amount || 0).toLocaleString()}</p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{paymentData.percentage || 0}%</p>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="px-6">
                            <div ref={containerRef} className="w-full md:w-fit bg-template-whitesmoke-dim dark:bg-black/60 px-2 rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                                <div className="min-w-[560px] flex justify-between items-center gap-x-4">
                                    {lists?.map((item, index) => (
                                        <TabList item={item} index={index} setlistCount={setActiveList} key={index} ref={el => {
                                            if (el) listRefs.current[index] = el
                                        }} />
                                    ))}
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-template-primary h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
                            </div>
                        </div>
                        <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                            <DataTableWithNumberPagination columns={salesColumn} data={salesData} isLoading={salesLoading} filterId="customer_name" placeholderText="Search by Order Name / ID" isShowCost={false} isShowStock={true} displayedText="Sales" />
                        </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default PosStaffSalesTable;