"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { useQuery } from "@tanstack/react-query";
import { getStaffLogs } from "@/api/controllers/get/handler";
import { StaffLogsResponse } from "@/models/types/shared/handlers-type";
import staffLogColumns from "@/components/data-table/staff-logs-column";

const StaffLogsTable = () => {
    const [lists] = useState<Array<string>>(["All", "Successful", "Failed"]);
    const [activeList, setActiveList] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? JSON.parse(storedId) : 0;
        }
        return 0;
    }, []);

    const { data: staffLogs, isLoading: staffLoading, isSuccess: staffSuccesss, isError: staffError } = useQuery({
        queryKey: ["get-staff-logs", businessId],
        queryFn: () => getStaffLogs(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false,
    });

    const staff_logs = useMemo<StaffLogsResponse[]>(() => {
        if (staffSuccesss && !staffError) {
            return staffLogs?.login_logs as StaffLogsResponse[] | [];
        }
        return [];
    }, [staffLogs, staffSuccesss, staffError]);

    const currentLogs = useMemo<StaffLogsResponse[]>(() => {
        if (staff_logs?.length) {
            const currentList = lists?.[activeList];
            if (currentList?.toLowerCase() === "all") {
                return staff_logs;
            }
            return staff_logs?.filter(item => currentList?.toLowerCase() === "successful" ? item?.success : !item?.success);
        }
        return [];
    }, [staff_logs, activeList, lists]);

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
        <Card className="dark:bg-black">
            <div className="flex flex-col gap-y-3">
                <CardHeader>
                    <CardTitle className="text-base font-[600]">Login Attempts</CardTitle>
                    <CardDescription className="text-xs font-[550] text-muted-foreground">View a record of recent login attempts to monitor account access.</CardDescription>
                </CardHeader>
                <div className="px-6">
                    <div ref={containerRef} className="w-full md:w-fit bg-template-whitesmoke-dim dark:bg-black/60 px-2 rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                        <div className="min-w-[300px] flex justify-between items-center gap-x-4">
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
                    <DataTableWithNumberPagination columns={staffLogColumns} data={currentLogs} isLoading={staffLoading} filterId="full_name" placeholderText="Search by Staff Name" isShowCost={false} isShowStock={true} displayedText="Logs" />
                </div>
            </div>
        </Card>
    );
}

export default StaffLogsTable;