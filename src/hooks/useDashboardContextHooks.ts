"use client";

import { DashboardContext } from "@/store/state/global/dashboard-context-controller"
import { useContext } from "react"

const useDashboardContextHooks = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboardContextHooks must be used within a DashboardContextProvider");
    }
    return context;
}

export default useDashboardContextHooks;