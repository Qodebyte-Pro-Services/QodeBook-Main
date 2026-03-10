import { DefaultType } from "@/models/types/shared/project-type";
import React, { createContext, useState } from "react";

type DashBoardContextTypes = {
    selectedTab: string;
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
    isNotifierOpen: boolean;
    setIsNotifier: React.Dispatch<React.SetStateAction<boolean>>;
    isMobileMenuOpen: boolean;
    setisMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isPhoneView: boolean;
    setIsPhoneView: React.Dispatch<React.SetStateAction<boolean>>;
    isIconView: boolean;
    setIsIconView: React.Dispatch<React.SetStateAction<boolean>>;
    isSupplyOrderId: number;
    setIsSupplyOrderId: React.Dispatch<React.SetStateAction<number>>;
}

export const DashboardContext = createContext<DashBoardContextTypes | undefined>(undefined);
const DashboardContextController = ({children}: DefaultType) => {
    const [selectedTab, setSelectedTab] = useState<string>("");
    const [isNotifierOpen, setIsNotifier] = useState<boolean>(false);
    const [isMobileMenuOpen, setisMobileMenuOpen] = useState<boolean>(false);
    const [isPhoneView, setIsPhoneView] = useState<boolean>(false);
    const [isIconView, setIsIconView] = useState<boolean>(false);
    const [isSupplyOrderId, setIsSupplyOrderId] = useState<number>(0);

    const data = {
        selectedTab,
        setSelectedTab,
        isNotifierOpen,
        setIsNotifier,
        isMobileMenuOpen,
        setisMobileMenuOpen,
        isPhoneView,
        setIsPhoneView,
        isIconView,
        setIsIconView,
        isSupplyOrderId,
        setIsSupplyOrderId
    };
    
    return(
        <DashboardContext.Provider value={data}>
            {children}
        </DashboardContext.Provider>
    );
}

export default DashboardContextController;