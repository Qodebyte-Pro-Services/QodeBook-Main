import { create } from "zustand";

interface CustomDeleteCardLogic {
    title: string;
    setTitle: (prm: string) => void
};

const useCustomDeleteHandler = create<CustomDeleteCardLogic>((set) => ({
    title: "",
    setTitle: (title: string) => set({title})
}));

const useIsStaffActive = create<{isStaff: string; setIsStaff: (prm: string) => void}>((set) => ({
    isStaff: "",
    setIsStaff: (isStaff: string) => set({isStaff})
}))

export {useCustomDeleteHandler, useIsStaffActive};