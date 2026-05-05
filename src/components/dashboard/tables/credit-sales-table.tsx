"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import creditSalesColumn from "@/components/data-table/credit-sales-column";
import { useQuery } from "@tanstack/react-query";
import { getBusinessCreditAccounts } from "@/api/controllers/get/handler";
import { CreditAccountType } from "@/store/data/sales-table-data";

const CreditSalesTable = () => {
    const [lists] = useState<Array<string>>(["All", "Settled", "Unsettled"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? JSON.parse(storedId) : 0;
        }
        return 0;
    }, []);
    
    const {data: credit_data = {accounts: []}, isLoading, isSuccess, isError} = useQuery({
        queryKey: ["get-business-credit-accounts", businessId],
        queryFn: () => getBusinessCreditAccounts({businessId}),
        enabled: businessId !== 0,
        refetchOnWindowFocus: true,
        retry: false,
    });

    const filteredData = useMemo(() => {
        const statusItem = lists[activeList];
        if (isSuccess && !isError) {
            if (statusItem === "All") {
                return credit_data?.accounts;
            }
            return credit_data?.accounts?.filter((item: CreditAccountType) => 
                item.status.toLowerCase() === statusItem.toLowerCase()
            );
        }
        return [];
    }, [activeList, credit_data, isSuccess, isError, lists]);

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const {hiddenScrollbar} = useCustomStyles();

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
        <Card className="dark:bg-black">
            <div className="flex flex-col gap-y-3">
                <CardHeader>
                    <CardTitle className="text-base font-[600]">Credit Sales Accounts</CardTitle>
                    <CardDescription className="text-xs font-[550] text-muted-foreground">Manage and settle customer credit accounts.</CardDescription>
                </CardHeader>
                <div className="px-6">
                    <div ref={containerRef} className="w-full md:w-fit bg-template-whitesmoke-dim dark:bg-black/60 px-2 rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                        <div className="min-w-[400px] flex justify-start items-center gap-x-4">
                            {lists?.map((item, index) => (
                                <TabList item={item} index={index} setlistCount={setActiveList} key={index} ref={el => {
                                    if (el) listRefs.current[index] = el
                                }} />
                            ))}
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-template-primary h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{left: indicatorStyle.left, width: indicatorStyle.width}} />
                    </div>
                </div>
                <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                    <DataTableWithNumberPagination 
                        columns={creditSalesColumn} 
                        data={filteredData} 
                        isLoading={isLoading} 
                        filterId="customer_name" 
                        placeholderText="Search by Customer" 
                        isShowCost={false} 
                        isShowStock={false} 
                        displayedText="Credit Accounts" 
                    />
                </div>
            </div>
        </Card>
    );
}

export default CreditSalesTable;
