"use client";

import { useCustomStyles } from "@/hooks";
import { cn } from "@/lib/utils";
import { DefaultType } from "@/models/types/shared/project-type";
import { HTMLAttributes } from "react";

const StaffAuthLayout = ({children, className, ...props}: DefaultType & {className?: string; props?: HTMLAttributes<HTMLDivElement>}) => {
    const {hiddenScrollbar} = useCustomStyles();

    return(
        <div className={cn("w-screen h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-template-primary via-template-chart-store to-template-whitesmoke", className)} style={hiddenScrollbar} {...props}>
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    );
}

export default StaffAuthLayout;