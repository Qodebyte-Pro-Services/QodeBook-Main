"use client";

import { useCustomStyles } from "@/hooks";
import { DefaultType } from "@/models/types/shared/project-type";
import DashboardContextController from "@/store/state/global/dashboard-context-controller";

const LayoutWrapper = ({children}: DefaultType) => {
    const {hiddenScrollbar} = useCustomStyles();
    return(
        <DashboardContextController>
            <div className="w-screen h-screen overflow-x-hidden overflow-y-auto" style={hiddenScrollbar}>
                {children}
            </div>
        </DashboardContextController>
    );
}

export default LayoutWrapper;