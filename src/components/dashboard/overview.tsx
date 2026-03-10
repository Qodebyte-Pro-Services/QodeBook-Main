/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { ColumnHeader, ColumnWrapper } from ".";
import { LayoutScroller as ColumnScroller } from "../layouts";
import { DefaultType } from "@/models/types/shared/project-type";
import { Nunito_Sans } from "next/font/google";
import { useEffect, useMemo } from "react";

const nunito = Nunito_Sans({
    variable: "--font-nunito-sans",
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    style: "normal",
    subsets: ["latin"]
})

type OverviewProps = DefaultType & {
    isFullWidth?: boolean;
}

const Overview = ({children, isFullWidth = false}: OverviewProps) => {
    const {hiddenScrollbar} = useCustomStyles();

    const {setIsIconView, setIsPhoneView} = useDashboardContextHooks();

    const isDarkEnabled = useMemo(() => {
        if (typeof window === "undefined") return;
        const darkMode = localStorage.getItem("system-theme");
        return darkMode ? JSON.parse(darkMode) : false;
    }, []);
    
    useEffect(() => {
        if (isDarkEnabled) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkEnabled]);
        
    useEffect(() => {
        if (typeof window !== "undefined") {
            const matchedMedia = window.matchMedia("(max-width: 768px)");
            setIsIconView(matchedMedia.matches);
            
            const mediaHandler = (e: MediaQueryListEvent) => {
                setIsIconView(e.matches);
            }

            matchedMedia.addEventListener("change", mediaHandler);
            return () => {
                matchedMedia.removeEventListener("change", mediaHandler);
            }
        }
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 560px)");
        
        setIsPhoneView(mediaQuery.matches);
        
        const handleResize = () => {
            setIsPhoneView(mediaQuery.matches);
        };
        
        mediaQuery.addEventListener('change', handleResize);
        
        return () => {
            mediaQuery.removeEventListener('change', handleResize);
        };
    }, []);
    
    return(
        <ColumnWrapper className={`w-full ${isFullWidth ? 'lg:w-full' : 'lg:w-[85%]'} mx-auto bg-template-whitesmoke dark:bg-[#121212] transition-all duration-300`} customStyle={hiddenScrollbar}>
            <ColumnHeader />
            <ColumnScroller>
                    <div className={`w-full px-4 py-6 ${nunito.className} antialiased`}>
                        <div className="container mx-auto">
                            {children}
                        </div>
                    </div>
            </ColumnScroller>
        </ColumnWrapper>
    );
}

export default Overview;