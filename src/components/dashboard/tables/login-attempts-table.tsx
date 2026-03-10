"use client";

import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/login-table-columns";
import { login_attempts_data } from "@/store/data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { Task } from "@/store/data/login-attempts-data";

enum STATUS {
    failed = 0,
    success = 1        
}

const LoginAttemptsTable = () => {
    const [lists] = useState<Array<string>>(["All", "Successful", "Failed"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});
    const [loginAttemptsData, setLoginAttemptsData] = useState<Task[]>(login_attempts_data);

    useEffect(() => {
        const currentList = (lists[activeList]).toLowerCase();
        switch(currentList) {
            case "successful": {
                const data = login_attempts_data.concat().filter(item => item.status === STATUS.success);
                setLoginAttemptsData(data);
            }
                break;
            case "failed": {
                const data = login_attempts_data.concat().filter(item => item.status === STATUS.failed);
                setLoginAttemptsData(data);
            }
                break;
            default:
                setLoginAttemptsData(login_attempts_data);
                break;
        }
    }, [activeList, lists]);

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
                <CardTitle className="text-base font-[600]">Login Attempts</CardTitle>
                <CardDescription className="text-xs font-[550] text-muted-foreground">View a record of recent login attempts to monitor account access.</CardDescription>
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
            <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                <DataTable columns={columns} data={loginAttemptsData} filterId="status" placeholderText="Search by Order Name / ID" isShowCost={false} isShowStock={true} displayedText="Attempts" />
            </div>
        </div>
    </Card>
  );
}

export default LoginAttemptsTable;