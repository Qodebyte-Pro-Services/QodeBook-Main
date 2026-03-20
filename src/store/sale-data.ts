import { SalesReportLogic } from "@/models/types/shared/handlers-type"
import { create } from "zustand";

interface SalesReportDataLogic {
    salesReport: Map<string, SalesReportLogic>;
    searchKey: string;
    setSearchKey: (prm: string) => void;
    setSalesReport: (prm: Map<string, SalesReportLogic>) => void;
}

export const useSalesReportData = create<SalesReportDataLogic>((set, get) => ({
    salesReport: new Map(),
    searchKey: "",
    setSearchKey: (prm: string) => set({searchKey: prm}),
    setSalesReport: (prm: Map<string, SalesReportLogic>) => {
        // Instead of replacing, merge new data with existing data
        const currentSalesReport = get().salesReport;
        const mergedMap = new Map(currentSalesReport);
        
        // Add/update entries from the new map
        prm.forEach((value, key) => {
            mergedMap.set(key, value);
        });
        
        set({salesReport: mergedMap});
    }
}));