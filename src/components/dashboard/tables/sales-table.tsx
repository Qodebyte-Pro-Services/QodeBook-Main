"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import salesColumn from "@/components/data-table/sale-table-columns";
import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/api/controllers/get/handler";
import { SalesSchema } from "@/store/data/sales-table-data";

const SalesTable = ({sales}: {sales?: SalesSchema[]}) => {
    const [lists] = useState<Array<string>>(["All", "Cash", "Bank-transfer", "Card"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? JSON.parse(storedId) : 0;
        }
        return 0;
    }, []);
    
    const {data: sales_data = {sales: []}, isLoading: salesLoading, isSuccess, isError} = useQuery({
        queryKey: ["get-product-sales", businessId],
        queryFn: () => getSales({businessId}),
        enabled: businessId !== 0,
        refetchOnWindowFocus: true,
        retry: false,
    });

    const salesData = useMemo(() => {
        const statusItem = lists[activeList];
        if (sales?.length) {
            if (statusItem === "All" || !statusItem) {
                return sales;
            }
            return sales?.filter(item => {
                const paymentMethods = item?.payments?.map(item => item?.method);
                return paymentMethods?.includes(statusItem?.toLowerCase()?.replace(/\-/g, "_"));
            });
        }
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
                <CardTitle className="text-base font-[600]">Sales</CardTitle>
                <CardDescription className="text-xs font-[550] text-muted-foreground">All pending, processing, in transit and canceled orders.</CardDescription>
            </CardHeader>
            <div className="px-6">
                <div ref={containerRef} className="w-full md:w-fit bg-template-whitesmoke-dim dark:bg-black/60 px-2 rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                    <div className="min-w-[560px] flex justify-between items-center gap-x-4">
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
                <DataTableWithNumberPagination columns={salesColumn} data={sales || salesData} isLoading={salesLoading} filterId="customer_name" placeholderText="Search by Order Name / ID" isShowCost={false} isShowStock={true} displayedText="Sales" />
            </div>
        </div>
    </Card>
  );
}

export default SalesTable;