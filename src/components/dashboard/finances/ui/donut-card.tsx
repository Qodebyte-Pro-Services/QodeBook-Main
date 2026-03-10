"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomStyles } from "@/hooks";
import React, { FC } from "react";

interface DonutChartCartProps {
    children: React.ReactNode;
    donutProps: Array<Record<string, string | number>>;
    title: string;
    description: string;
    label: string;
}

const DonutChartCard: FC<DonutChartCartProps> = ({children, donutProps, title, description, label}) => {
    const {customScrollbar} = useCustomStyles();
    return(
        <Card className="dark:bg-black">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    {children}
                    <div className="flex flex-col gap-y-2">
                        <div className="text-sm px-5 font-[550]">Summary</div>
                        <div className="max-h-[120px] px-5 h-full overflow-y-auto overflow-x-hidden space-y-2" style={customScrollbar}>
                            {donutProps?.map((item, idx) => (
                                <div key={`${label}-category-${idx}`} className="self-start w-full flex justify-between items-center">
                                    <div className="flex items-center gap-x-3">
                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: `${item?.color}`}} />
                                        <span className="text-sm font-[550]">{item?.label}</span>
                                    </div>
                                    <span className="text-sm font-[550]">{item?.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default DonutChartCard;