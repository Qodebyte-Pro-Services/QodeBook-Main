"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { TabList } from "..";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { MobileNavbar, MobileSideBar } from "../sections";
import { BusinessModalCard } from "../modal";
import { useQuery } from "@tanstack/react-query";
import { AdminAccountSettings, NotificationSettings, PermissionSettings, StationSettings, SystemSettings } from "./sections";
import { getUserDetails } from "@/api/controllers/get/handler";
import BranchSettings from "./sections/branch-settings";
import BusinessSettings from "./sections/business-settings";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { key } from "localforage";

interface StaffDetails {
    staff_id: string;
    business_id: number;
    branch_id: number;
    email: string;
    full_name: string;
    role: string;
    permissions: Array<string>;
    isStaff: boolean;
    iat: number;
    exp: number;
}

const SettingContents = () => {
    const [listCount, setlistCount] = useState<number>(0);
    const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);

    const [settingLists] = useState<string[]>(["Profile", "Branches", "Permissions", "Business", "Notifications", "System"]);

    const [indicatorBar, setIndicatorBar] = useState<{ left: number; width: number }>({ left: 0, width: 0 || 90 });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { data: userDetails, isLoading: userLoading, isSuccess: userSuccess } = useQuery({
        queryKey: ["user-profiles"],
        queryFn: () => getUserDetails(),
        refetchOnWindowFocus: false,
        retry: false
    });

    const user_details = useMemo(() => {
        if (userSuccess) {
            return userDetails?.user;
        }
        return {};
    }, [userDetails, userSuccess]);

    const staff_data = useMemo(() => {
        if (typeof window === "undefined") return;
        const details = jwtDecode(Cookies.get("authToken") || "");
        return details || null;
    }, []) as (StaffDetails | null);

    const staff_details = useMemo(() => {
        if (!staff_data) return null;
        return Object.entries(staff_data)?.reduce((acc, [key, value]) => {
            return {
                ...acc,
                [key === 'full_name' ? 'first_name' : key]: key === "full_name" ? value.split(" ")[0] : value,
                [key === 'full_name' ? 'last_name' : '']: key === "full_name" ? value?.split(" ")[1] : "",
            }
        }, {} as Omit<StaffDetails, 'full_name'> & { first_name: string; last_name: string });
    }, [staff_data]);

    const { hiddenScrollbar } = useCustomStyles();

    const { isNotifierOpen, setIsNotifier, isMobileMenuOpen, isPhoneView, isIconView } = useDashboardContextHooks();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : null;
        }
        return 0;
    }, []);

    const branchId = useMemo(() => {
        if (typeof window !== "undefined") {
            const branch_id = sessionStorage.getItem("selectedBranchId");
            return branch_id ? JSON.parse(branch_id) : null;
        }
        return 0;
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("setting-listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }
    }, []);

    const handleTabCount = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("setting-listcount", JSON.stringify(listCount));
        }
    };

    useEffect(() => {
        handleTabCount();
    }, [listCount]);

    const PADDING = 30;

    useEffect(() => {
        const containerDiv = containerRef.current as HTMLDivElement;
        const listDiv = tabRefs.current[listCount] as HTMLDivElement;
        const containerLeft = containerDiv.getBoundingClientRect().left;
        const containerScrollLeft = containerDiv.scrollLeft;
        const listLeft = listDiv.getBoundingClientRect().left;
        setIndicatorBar((prev) => ({
            ...prev,
            left: listLeft - containerLeft + containerScrollLeft - (PADDING / 2),
            width: listDiv.offsetWidth + PADDING
        }));
    }, [listCount]);

    const sectionVariant: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                duration: 0.3,
                ease: [0.32, 0.72, 0, 1]
            }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1],
                staggerChildren: 0.05
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1]
            }
        }
    };

    return (
        <div className="flex flex-col gap-y-5">
            {/* Dashboard Header Section o */}
            <div className="flex flex-col gap-y-3">
                <div className="text-base font-[600]">Settings</div>
                <div ref={containerRef} style={hiddenScrollbar} className="relative z-10 w-full flex gap-x-6 md:justify-between bg-template-whitesmoke-dim dark:bg-black rounded-sm px-4 overflow-x-auto">
                    {settingLists.map((item, index) => (
                        <TabList ref={(el) => {
                            if (el) {
                                tabRefs.current[index] = el;
                            }
                        }} key={index} setlistCount={() => setlistCount(index)} color={listCount === index ? "text-white" : ""} item={item} index={index} />
                    ))}
                    <div className="absolute left-4 top-0 h-full w-1 rounded-sm transition-all duration-300 ease-in-out bg-template-primary -z-10" style={{ left: indicatorBar.left, width: indicatorBar.width }} />
                </div>
            </div>
            <AnimatePresence mode="wait">
                {listCount === 0 && (
                    <AdminAccountSettings user_details={Object.keys(user_details).length > 0 ? user_details : staff_details} user_loading={userLoading} sectionVariant={sectionVariant} isPhoneView={isPhoneView} />
                )}
                {listCount === 1 && (
                    <BranchSettings sectionVariant={sectionVariant} isPhoneView={isPhoneView} />
                )}
                {listCount === 2 && (
                    <PermissionSettings created_by={`${user_details.email}`} sectionVariant={sectionVariant} isPhoneView={isPhoneView} />
                )}
                {listCount === 3 && (
                    <BusinessSettings sectionVariant={sectionVariant} isPhoneView={isPhoneView} />
                )}
                {listCount === 4 && (
                    <NotificationSettings sectionVariant={sectionVariant} isPhoneView={isPhoneView} />
                )}
                {listCount === 5 && (
                    <motion.div
                        key="login-attempts"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <SystemSettings sectionVariant={sectionVariant} isPhoneView={isPhoneView} />
                    </motion.div>
                )}
            </AnimatePresence>
            {isNotifierOpen && <NotificationCard setIsOpen={setIsNotifier} />}
            {isMobileMenuOpen && (
                <MobileSideBar isOpen={isMobileMenuOpen} />
            )}
            <MobileNavbar />
            {showBusinessModal && (
                <BusinessModalCard onClose={() => setShowBusinessModal(false)} />
            )}
        </div>
    );
}

export default SettingContents;