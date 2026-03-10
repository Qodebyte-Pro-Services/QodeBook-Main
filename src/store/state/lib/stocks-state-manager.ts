import { CategoryPayload } from "@/models/types/shared/handlers-type";
import { create } from "zustand";

type StockAnalyticsStateLogic = {
    outOfStock: number;
    lowStock: number;
    inStock: number;
    totalStock?: number;
}

interface StockAnalyticsLogic {
    stockData: StockAnalyticsStateLogic | null;
    setStockData: (data: StockAnalyticsStateLogic) => void
}

interface StockAnayticsTotalLogic {
    total: number;
    setTotal: (payload: number) => void
}

interface CategoriesLogic {
    _categories: CategoryPayload[];
    setCategories: (data: CategoryPayload[]) => void
}

interface CategoriesNameLogic {
    _categoryName: string;
    setCategoryName: (_name: string) => void
}

interface StockAnalyticsQueryDataLogic {
    _url_: string;
    setQueryUrl: (url: string) => void
}

interface SalesEngagementLogic {
    _url: string;
    setQueryUrl: (url: string) => void;
};

interface SalesDataLogic {
    total: number;
    online: number;
    walk_in: number;
}

interface SalesDataAnalyticsLogic {
    salesAnalytics: SalesDataLogic;
    setSalesAnalytics: (data: SalesDataLogic) => void;
}

const useStockAnalyticsData = create<StockAnalyticsLogic>((set) => ({
    stockData: null,
    setStockData: (data: StockAnalyticsStateLogic) => set({stockData: data})
}));

const useStockAnalyticsTotal = create<StockAnayticsTotalLogic>((set) => ({
    total: 0,
    setTotal: (payload: number) => set({total: payload})
}));

const useCategoriesData = create<CategoriesLogic>((set) => ({
    _categories: [],
    setCategories: (data: CategoryPayload[]) => set({_categories: data})
}));

const useCategoryName = create<CategoriesNameLogic>((set) => ({
    _categoryName: "",
    setCategoryName: (_name: string) => set({_categoryName: _name})
}));

const useStockQueryDataAnalytics = create<StockAnalyticsQueryDataLogic>((set) => ({
    _url_: "",
    setQueryUrl: (url: string) => set({_url_: url})
}));

const useSalesPieData = create<SalesEngagementLogic>((set) => ({
    _url: "",
    setQueryUrl: (url: string) => set({_url: url})
}));

const useSalesAnalytics = create<SalesDataAnalyticsLogic>((set) => ({
    salesAnalytics: {
        online: 0,
        walk_in: 0,
        total: 0
    },
    setSalesAnalytics: (data: SalesDataLogic) => set({salesAnalytics: data})
}));


export {useStockAnalyticsData, useStockAnalyticsTotal, useCategoriesData, useCategoryName, useStockQueryDataAnalytics, useSalesPieData, useSalesAnalytics};