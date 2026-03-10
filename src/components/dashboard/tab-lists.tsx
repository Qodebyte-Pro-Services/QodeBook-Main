import { cn } from "@/lib/utils";
import React, { ForwardedRef } from "react";

interface TabListsProps {
    item: string | {id: number; name: string};
    index: number;
    setlistCount?: (index: number) => void; 
    ref?: ForwardedRef<HTMLDivElement>;
    color?: string;
}

const TabLists = ({ item, index, setlistCount, ref, color }: TabListsProps) => {
    const tabHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        const tabList = e.currentTarget;
        const dataId = +tabList.dataset.id!;
        if (setlistCount) setlistCount(dataId);
    }
    if (typeof item === "string") {
        return(
            <div ref={ref} onClick={tabHandler} data-id={index} className={cn(`px-3 py-1 text-sm cursor-pointer text-nowrap font-[500] capitalize ${color}`)}>{item}</div>
        );
    }else {
        return(
            <div ref={ref} onClick={tabHandler} data-id={index} className={cn(`px-3 py-1 text-sm cursor-pointer text-nowrap font-[500] capitalize ${color}`)}>{item.name}</div>
        )
    }
};

export default TabLists;