import { create } from "zustand";

interface DonutChartLabelsLogic {
    donutChartLabels: Array<{label: string; value: string; color: string}>;
    setDonutChartLabels: (data: Array<{label: string; value: string; color: string}>) => void
}

const useDonutChartLabels = create<DonutChartLabelsLogic>(set => ({
    donutChartLabels: [],
    setDonutChartLabels: (data) => set({donutChartLabels: data})
}));

export {useDonutChartLabels};