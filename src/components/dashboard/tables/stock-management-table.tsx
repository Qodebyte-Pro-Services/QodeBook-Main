"use client";

import { stockColumn } from "@/components/data-table/stock-columns";
import { StockTask } from "@/store/data/stock-management-data";
import { Card } from "@/components/ui/card";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { useQuery } from "@tanstack/react-query";
import { getStocksMovement, getStocksMovementAnalytics } from "@/api/controllers/get/handler";
import { CgSpinnerAlt } from "react-icons/cg";
// import { StockMovementTypes } from "@/models/types/shared/handlers-type";

const StockManagementTable = () => {
    // const [lists] = useState<Array<string>>(["All", "Restock"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    const [logsType, setLogsType] = useState<string[]>(["All"]);

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const [inventoryData, setInventoryData] = useState<Array<StockTask>>([]);
    // const [stockAnalytics, setStockAnalytics] = useState<StockMovementTypes>({movements: []});

    // const branchId = useMemo(() => {
    //     if (typeof window !== "undefined") {
    //         const branchId = sessionStorage.getItem("selectedBranchId");
    //         return branchId ? JSON.parse(branchId) : 0;
    //     }
    //     return 0;
    // }, []);

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : 1;
        }
        return 0;
    }, []);

    const { data: stocksMovement, isLoading: stockLoading, error: stockError, refetch: stockRefetch, isSuccess: stockSuccess } = useQuery({
        queryKey: ['stock-movement', businessId],
        queryFn: () => getStocksMovement({ business_id: businessId }),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        retry: 2
    });

    const { data: stocksMovementAnalytics, error: stockAnalyticsError, refetch: stockAnalyticsRefetch, isSuccess: stockAnalyticsSuccess } = useQuery({
        queryKey: ["stock-movement-analytics", businessId],
        queryFn: () => getStocksMovementAnalytics({ businessId }),
        enabled: businessId !== 0,
        refetchOnWindowFocus: 'always',
        refetchIntervalInBackground: false,
    });

    useEffect(() => {
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            // if (!stockAnalyticsSuccess) {
            //     stockAnalyticsRefetch();
            // }
            if (stockAnalyticsSuccess && !stockAnalyticsError) {
                // setStockAnalytics({movements: stocksMovementAnalytics?.movements || []});
            }
        })
    }, [stocksMovementAnalytics, stockAnalyticsSuccess, stockAnalyticsError, stockAnalyticsRefetch]);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            // if (!stockSuccess) {
            //     stockRefetch();
            // }
            const stockTypes = stocksMovement?.logs?.reduce((initial: string[], items: StockTask) => {
                if (!initial.includes(items.type)) {
                    initial.push(items.type);
                }
                return initial;
            }, ["All"]);
            const new_types = new Set(stockTypes);
            const newTypes = Array.from(new_types) as string[];
            setLogsType(newTypes || []);
        })
    }, [stocksMovement, stockError, stockSuccess]);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 300));
            if (stocksMovement?.logs) {
                setInventoryData(stocksMovement?.logs || []);
            }
        })
    }, [stocksMovement, stockSuccess, stockError])

    useEffect(() => {
        const currentList = logsType[activeList];
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (currentList?.toLowerCase() === "all") {
                const stocks = stocksMovement?.logs || [];
                setInventoryData(stocks);
                return;
            }
            const filteredItems = stocksMovement?.logs?.filter((item: StockTask) => item.type.toLowerCase() === currentList?.toLowerCase()) || [];
            setInventoryData(filteredItems);
        })
    }, [activeList, stocksMovement, logsType]);

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
        <Card className="dark:bg-black">
            <div className="flex flex-col gap-y-3">
                {/* <StockLineGraph title="Stock Investment" content="Monitor the flow of your inventory in and out of the storage" chart_data={stockAnalytics} /> */}
                {/* <DoubleChartFlow title="Stock Investment" content="Monitor the flow of your inventory in and out of the storage" chart_data={stockAnalytics} /> */}
                <div className="px-6">
                    <div ref={containerRef} className="bg-template-whitesmoke-dim dark:bg-black dark:border-template-whitesmoke-dim w-fit px-2 rounded-sm relative z-10" style={hiddenScrollbar}>
                        <div className="flex items-center gap-x-4">
                            {logsType?.map((item, index) => (
                                <TabList item={item} index={index} setlistCount={setActiveList} key={index} ref={el => {
                                    if (el) listRefs.current[index] = el
                                }} />
                            ))}
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-template-primary h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
                    </div>
                </div>
                {stockLoading ? (
                    <div className="text-center px-4 py-5 flex items-center justify-center gap-x-1 bg-white dark:bg-black rounded-sm">
                        <CgSpinnerAlt size={24} className="text-template-primary animate-spin" />
                        <div className="text-sm font-[550] text-template-text-secondary">Loading stocks...</div>
                    </div>
                ) : (
                    <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                        <DataTableWithNumberPagination columns={stockColumn} data={inventoryData} filterId="type" placeholderText="Search by Type..." isShowCost={false} isShowStock={true} displayedText="Stocks" />
                    </div>
                )}
            </div>
        </Card>
    );
}

export default StockManagementTable;