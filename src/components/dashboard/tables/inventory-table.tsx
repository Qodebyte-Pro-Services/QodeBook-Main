"use client";

import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import { data, Task } from "@/store/data/inventory-data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";

const InventoryTable = () => {
    const [lists] = useState<Array<string>>(["All", "Gas", "Accessories"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const [inventoryData, setInventoryData] = useState<Array<Task>>(data);

    useEffect(() => {
        const currentList = lists[activeList];
        switch(currentList.toLowerCase()) {
            case "accessories": {
                const inventory_data = data.concat().filter(item => item.item.toLowerCase() === currentList.toLowerCase());
                setInventoryData(inventory_data);
            }
                return;
            case "gas": {
                const inventory_data = data.concat().filter(item => item.item.toLowerCase() === currentList.toLowerCase());
                setInventoryData(inventory_data);
            }
                return;
            default:
                setInventoryData(data);
                return;
        }
    }, [activeList, lists]);

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
            <div className="px-6">
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
                <DataTable columns={columns} data={inventoryData} filterId="item" placeholderText="Search by inventory name/ID..." isShowCost={false} isShowStock={true} displayedText="Stocks" />
            </div>
        </div>
    </Card>
  );
}

export default InventoryTable;