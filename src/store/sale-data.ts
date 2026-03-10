import { SalesReportLogic } from "@/models/types/shared/handlers-type"
import { create } from "zustand";

interface SalesReportDataLogic {
    salesReport: Map<string, SalesReportLogic>;
    searchKey: string;
    setSearchKey: (prm: string) => void;
    setSalesReport: (prm: Map<string, SalesReportLogic>) => void;
}

export const useSalesReportData = create<SalesReportDataLogic>((set) => ({
    salesReport: new Map(),
    searchKey: "",
    setSearchKey: (prm: string) => set({searchKey: prm}),
    setSalesReport: (prm: Map<string, SalesReportLogic>) => set({salesReport: prm})
}));