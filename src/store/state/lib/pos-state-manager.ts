import { create } from "zustand";

interface ViewTransactionState {
    view: "pos" | "sales" | "pending";
    setView: (data: "pos" | "sales" | "pending") => void;
}

const useViewTransaction = create<ViewTransactionState>(set => ({
    view: "pos",
    setView: (data: "pos" | "sales" | "pending") => set({ view: data })
}));

export { useViewTransaction };