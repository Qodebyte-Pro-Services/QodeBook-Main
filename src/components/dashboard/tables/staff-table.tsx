"use client";

import { columns } from "@/components/data-table/store-product-column";
import { StoreProductTask } from "@/store/data/store-products-data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { useQuery } from "@tanstack/react-query";
import { getProductCategories } from "@/api/controllers/get/handler";

type CategoriesRes = {
    id: number;
    business_id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

const StaffTable = ({data, isLoading, businessId, refetchProduct}: {data: Array<StoreProductTask>; isLoading: boolean; businessId: number; refetchProduct: () => void}) => {
    const [lists, setLists] = useState<Array<{id: number; name: string}>>([{id: 0, name: "All"}]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const [inventoryData, setInventoryData] = useState<Array<StoreProductTask>>(data);
    const productsData = useDeferredValue(inventoryData);

    const {data: categories = { categories: [] }, isLoading: isCategories} = useQuery({
        queryKey: ["get-categories", businessId],
        queryFn: async () => await getProductCategories(businessId),
        enabled: businessId !== 0
    });

    useEffect(() => {
        if (!isCategories && categories?.categories.length > 0) {
            const list = [{id: 0, name: "All"}, ...categories?.categories?.map((item: CategoriesRes) => ({
                id: item.id,
                name: item.name
            }))];
            setLists(list);
        }
    }, [categories, isCategories]);

    useEffect(() => {
        if (!isLoading && data.length > 0) {
            setInventoryData(data);
        }
    }, [data, isLoading]);

    useEffect(() => {
        const currentList = lists[activeList];
        if (currentList.name.toLowerCase() === "all") {
            setInventoryData(data);
            return;
        }
        if (isLoading) return;
        const inventory_data = data.filter((item: StoreProductTask) => item.category_id === currentList.id);
        setInventoryData(inventory_data);
    }, [activeList, lists, isLoading, data]);

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
    <Card>
        <div className="flex flex-col gap-y-3">
            <CardHeader>
                <CardTitle className="text-base font-[600]">Stock Investment</CardTitle>
                <CardDescription className="text-xs font-[550] text-muted-foreground">Monitor the flow of your inventory in and out of the storage</CardDescription>
            </CardHeader>
            <div className="px-6 w-full overflow-x-auto" style={hiddenScrollbar}>
                <div ref={containerRef} className="bg-template-whitesmoke-dim w-fit px-2 rounded-sm relative z-10" style={hiddenScrollbar}>
                    <div className="flex items-center gap-x-4">
                        {lists?.map((item, index) => (
                            <TabList item={item} index={index} setlistCount={setActiveList} key={index} ref={el => {
                                if (el) listRefs.current[index] = el
                            }} />
                        ))}
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 bg-white h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{left: indicatorStyle.left, width: indicatorStyle.width}} />
                </div>
            </div>
            <div className="px-4 py-5 bg-white rounded-sm">
                <DataTableWithNumberPagination columns={columns} data={productsData} filterId="name" placeholderText="Search by inventory name/ID..." isShowCost={false} isShowStock={true} displayedText="Stocks" isLoading={isLoading} />
            </div>
        </div>
    </Card>
  );
}

export default StaffTable;