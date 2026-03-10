"use client";

import { columns } from "@/components/data-table/order-table-columns";
import { StockOrderObject, SupplyOrderItemTypes } from "@/models/types/shared/handlers-type";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { useQuery } from "@tanstack/react-query";
import { getOrderStocks } from "@/api/controllers/get/handler";
import { useSelectedRowStore } from "@/store/selected-row-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplyOrderInvoice } from "../invoices/order-invoice";

const OrderTable = () => {
    const [lists] = useState<Array<string>>(["All", "Awaiting Payment", "Paid", "Delivered", "Canceled"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});
    const [showInvoice, setShowInvoice] = useState(false);

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const [orderdata, setorderdata] = useState<Array<StockOrderObject>>([]);
    const [orderItems, setOrderItems] = useState<Array<SupplyOrderItemTypes>>([]);

    const {selectedOrder} = useSelectedRowStore();
    
    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? Number(storedId) : 0;
        }
        return 0;
    }, []);

    const {data: stockOrderData, isLoading: stockOrderLoading, error: stockOrderError} = useQuery({
        queryKey: ["get-supply-orders", businessId],
        queryFn: () => getOrderStocks(`${businessId}`),
        enabled: !!businessId,
        refetchOnWindowFocus: 'always',
        retry: false
    });

    useEffect(() => {
        if (stockOrderLoading || stockOrderError || !stockOrderData?.supply_orders) {
            setorderdata([]);
            return;
        }

        const currentList = lists[activeList];
        startTransition(async () => {
            let filteredOrders = stockOrderData.supply_orders;
            
            if (currentList !== "All") {
                const statusMap: Record<string, string> = {
                    "Awaiting Payment": "awaiting_payment",
                    "Paid": "paid",
                    "Delivered": "delivered",
                    "Canceled": "canceled"
                };
                filteredOrders = filteredOrders.filter((order: StockOrderObject) => order.supply_status === statusMap[currentList]);
            }
            
            setorderdata(filteredOrders);
            
            // const allItems = filteredOrders.flatMap((order: any) => 
            //     order.items ? order.items.map((item: any) => ({...item, supply_order_id: order.id})) : []
            // );
            // setOrderItems(allItems);
        });

        return () => setorderdata([]);
    }, [activeList, stockOrderData, stockOrderLoading, stockOrderError, lists]);

    useEffect(() => {
        const updateIndicator = () => {
            const activeElement = listRefs.current[activeList];
            const container = containerRef.current;
            
            if (activeElement && container) {
                const containerRect = container.getBoundingClientRect();
                const elementRect = activeElement.getBoundingClientRect();
                
                setIndicatorStyle({
                    left: elementRect.left - containerRect.left,
                    width: elementRect.width
                });
            }
        };

        // Update on tab change
        updateIndicator();

        // Update on window resize
        window.addEventListener('resize', updateIndicator);
        
        return () => {
            window.removeEventListener('resize', updateIndicator);
        };
    }, [activeList]);

    const selectedOrderData = useMemo(() => {
        return orderdata.find((order: StockOrderObject) => order.id === selectedOrder?.id);
    }, [orderdata, selectedOrder]);

    useEffect(() => {
        if (selectedOrder) {
            setShowInvoice(true);
        }
    }, [selectedOrder]);

    const {hiddenScrollbar} = useCustomStyles();

    return (
        <Card className="dark:bg-black">
            <div className="flex flex-col gap-y-3">
                <CardHeader>
                    <CardTitle className="text-base font-[600]">Orders</CardTitle>
                    <CardDescription className="text-xs font-[550] text-muted-foreground">Track and manage product orders, including status, quantity and customer details</CardDescription>
                </CardHeader>
                <div className="px-6">
                    <div ref={containerRef} className="bg-template-whitesmoke-dim dark:bg-black w-fit px-2 rounded-sm relative z-10" style={hiddenScrollbar}>
                        <div className="flex items-center gap-x-4">
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
                    <DataTableWithNumberPagination columns={columns} data={orderdata} filterId="supplier_name" placeholderText="Search by Supplier name/ID..." isShowCost={false} isShowStock={true} displayedText="Orders" />
                </div>
            </div>
        </Card>
    );
};

export default OrderTable;