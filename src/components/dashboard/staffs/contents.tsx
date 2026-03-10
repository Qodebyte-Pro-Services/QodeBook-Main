"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { ExpensesTable, LoginAttemptsTable } from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { MobileNavbar, MobileSideBar } from "../sections";
import { BusinessModalCard } from "../modal";
import { IconType } from "react-icons";
import { GoPlus } from "react-icons/go";
import CustomersTable from "../tables/customer-tables";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { Card as StaffCard } from "./ui";
import { CreateStaffBusinessForm, CreateStaffForm } from "./forms";
import StaffListTable from "../tables/staff-list-table";
import { financeOverview, getStaffBusinessSettings } from "@/api/controllers/get/handler";
import { StaffBusinessSettings } from "@/models/types/shared/handlers-type";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CustomToastUI from "../ui/custom-toast-ui";
import { toast as reactToast } from "react-toastify";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { CgSpinner } from "react-icons/cg";
import { useDeleteBusinessSettings } from "@/hooks/useControllers";
import axiosInstance from "@/lib/axios";
import EditStaffBusinessForm from "./forms/edit-staff-business-settings";

const StaffContents = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [listCount, setlistCount] = useState<number>(0);
    const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);

    const [showBusinessSettingsForm, setShowBusinessSettingsForm] = useState<boolean>(false);
    const [editShowBusinessSettings, setEditShowBusinessSettings] = useState<boolean>(false);

    const [showStaffForm, setShowStaffForm] = useState<boolean>(false);
    const [showStaffSettings, setStaffSettings] = useState<boolean>(false);

    const [overviewData, setOverviewData] = useState<Array<{ id: number; title: string; amount?: number | string; isCurrency?: boolean; isSlash?: { active: number; total: number; icon?: IconType; isPhoneViewIcon?: IconType; arrowIcon?: IconType; } }>>([]);

    const [indicatorBar, setIndicatorBar] = useState<{ left: number; width: number }>({ left: 0, width: 0 || 90 });

    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const listContainerRef = useRef<HTMLDivElement | null>(null);

    const deleteBusinessSettingsHandler = useDeleteBusinessSettings();

    const { hiddenScrollbar } = useCustomStyles();

    const queryClient = useQueryClient();

    const { isNotifierOpen, setIsNotifier, isMobileMenuOpen, isPhoneView, isIconView } = useDashboardContextHooks();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : null;
        }
        return 0;
    }, []);

    const branchId = useMemo(() => {
        if (typeof window === "undefined") return 0;
        const branch_id = sessionStorage.getItem("selectedBranchId");
        return branch_id ? +branch_id : 0;
    }, []);

    const { data: staffBusinessSettings, isLoading: staffBusinessLoading, isSuccess: staffBusinessSuccess, isError: staffBusinessError } = useQuery({
        queryKey: ["get-staff-settings", businessId],
        queryFn: () => getStaffBusinessSettings(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: financeOverviewData, isSuccess: financeSuccess, isError: financeError } = useQuery({
        queryKey: ["get-finance-overview", businessId],
        queryFn: () => financeOverview(`${businessId}`),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const staff_card_data = useMemo(() => {
        if (financeSuccess && !financeError) {
            const responseLogic = {
                total_staff: financeOverviewData?.staffCount || 0,
                staff_on_duty: financeOverviewData?.staffWithShiftToday || 0
            }
            return responseLogic;
        }
        return {
            total_staff: 0,
            staff_on_duty: 0
        }
    }, [financeSuccess, financeError, financeOverviewData]) as { total_staff: number; staff_on_duty: number };

    const staff_business_settings = useMemo(() => {
        if (staffBusinessSuccess && !staffBusinessError) {
            return staffBusinessSettings as StaffBusinessSettings;
        }
        return null;
    }, [staffBusinessSettings, staffBusinessSuccess, staffBusinessError]);

    const closeBusinessSettingsForm = () => {
        setShowBusinessSettingsForm(false);
        queryClient.invalidateQueries({
            queryKey: ["get-staff-settings", businessId],
            refetchType: "active"
        });
    };

    const total_staff = useMemo(() => {
        return {
            icon: HiOutlineUserGroup,
            title: "Total Staff",
            amount: staff_card_data?.total_staff,
            isCurrency: false
        }
    }, [staff_card_data]);

    const on_duty_today = useMemo(() => {
        return {
            icon: HiOutlineUserGroup,
            title: "On Duty Today",
            amount: staff_card_data?.staff_on_duty,
            isCurrency: false
        }
    }, [staff_card_data]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("listcount", JSON.stringify(listCount));
        }
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

    const containerVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1]
            }
        }
    };

    useEffect(() => {
        const node = tabRefs.current[activeTab || 0];
        const containerNode = containerRef.current;
        if (node && containerNode) {
            const nodeRect = node.getBoundingClientRect();
            const containerRect = containerNode.getBoundingClientRect();
            const padding = 8;
            setIndicatorStyle({
                left: (nodeRect.left - containerRect.left + containerNode.scrollLeft - padding / 2),
                width: nodeRect.width + padding,
            });
        }
    }, [activeTab]);

    useEffect(() => {
        const activeList = (listRefs.current[listCount as number] as HTMLDivElement);
        const listContainer = listContainerRef.current as HTMLDivElement;

        if (activeList && listContainer) {
            const containerRect = (listContainer && listContainer.getBoundingClientRect());
            const listRect = (activeList && activeList.getBoundingClientRect());
            const padding = 20;
            setIndicatorBar({
                left: (listRect?.left - containerRect?.left + listContainer.scrollLeft - padding / 2),
                width: listRect?.width + padding
            });
        }
        localStorage.setItem("listcount", JSON.stringify(listCount));
    }, [listCount]);

    return (
        <div className="flex flex-col gap-y-5">
            {/* Dashboard Header Section o */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Staff Management</div>
                <button onClick={() => setStaffSettings(true)} className="flex items-center gap-x-3 py-2 px-4 rounded-md font-[550] bg-template-primary text-white text-sm">
                    <GoPlus size={25} />
                    <span>Add Staff Business Settings</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <StaffCard {...total_staff} />
                <StaffCard {...on_duty_today} />
            </div>
            <AnimatePresence mode="wait">
                {listCount === 0 && (
                    <>
                        <Card className="overflow-hidden">
                            <div className="bg-gradient-to-r from-template-primary to-template-chart-store px-4 py-3 text-white flex items-center justify-between">
                                <div className="text-sm font-[700]">Business Authentication Settings</div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (staff_business_settings) {
                                                setEditShowBusinessSettings(true);
                                            } else {
                                                setShowBusinessSettingsForm(true);
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs font-[600]"
                                    >
                                        {staff_business_settings ? "Edit" : "Create"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            reactToast(({ closeToast }) => (
                                                <CustomToastUI
                                                    closeToast={closeToast}
                                                    onConfirm={async () => {
                                                        try {
                                                            await deleteBusinessSettingsHandler.mutateAsync(businessId, {
                                                                onSuccess: (data) => {
                                                                    toast.success(data?.message || "Business settings deleted successfully");
                                                                    queryClient.invalidateQueries({
                                                                        queryKey: ["get-staff-business-settings", businessId],
                                                                        refetchType: "active"
                                                                    });
                                                                },
                                                                onError: (err) => {
                                                                    if (err instanceof Error) {
                                                                        toast.error(err?.message || "Error Occurred while trying to delete staff business settings");
                                                                    }
                                                                    toast.info("Unexpected error occurred while trying to delete business settings");
                                                                }
                                                            })
                                                        } catch (err) {
                                                            if (err instanceof Error) {
                                                                toast.error(err?.message || "Error Occurred while trying to delete staff business settings");
                                                            }
                                                            toast.info("Unexpected error occurred while trying to delete business settings");
                                                        }
                                                    }}
                                                    onCancel={() => toast.info("Business settings retained")}
                                                    title="Delete Business Settings?"
                                                    btnText="Delete"
                                                />
                                            ))
                                        }}
                                        className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-[600]"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                {staffBusinessLoading && (
                                    <div className="flex items-center gap-2 text-sm text-black/70"><CgSpinner className="animate-spin" size={16} /> Loading settings...</div>
                                )}
                                {!staffBusinessLoading && !staff_business_settings && (
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-black/10 border rounded-md p-3">
                                        <div className="text-[12px] text-black/60 font-[600]">No settings configured yet</div>
                                        <button onClick={() => setShowBusinessSettingsForm(true)} className="px-3 py-1.5 rounded-md bg-template-primary text-white text-xs font-[600]">Create Settings</button>
                                    </div>
                                )}
                                {!!staff_business_settings && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">Password Delivery</div>
                                            <div className="text-sm font-[700] capitalize">{staff_business_settings?.settings?.password_delivery_method}</div>
                                        </div>
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">Password Change Policy</div>
                                            <div className="text-sm font-[700] capitalize">{staff_business_settings?.settings?.password_change_policy}</div>
                                        </div>
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">Require OTP For Login</div>
                                            <div className="text-sm font-[700]">{staff_business_settings?.settings?.require_otp_for_login ? "Enabled" : "Disabled"}</div>
                                        </div>
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">OTP Delivery</div>
                                            <div className="text-sm font-[700] capitalize">{staff_business_settings?.settings?.otp_delivery_method}</div>
                                        </div>
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">Session Timeout (mins)</div>
                                            <div className="text-sm font-[700]">{staff_business_settings?.settings?.session_timeout_minutes}</div>
                                        </div>
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">Max Login Attempts</div>
                                            <div className="text-sm font-[700]">{staff_business_settings?.settings?.max_login_attempts}</div>
                                        </div>
                                        <div className="border rounded-md p-3 bg-white dark:bg-black">
                                            <div className="text-[11px] text-black/50 dark:text-white/50 font-[600]">Lockout Duration (mins)</div>
                                            <div className="text-sm font-[700]">{staff_business_settings?.settings?.lockout_duration_minutes}</div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <motion.div
                            key="staff-list-table"
                            variants={sectionVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                        >
                            <StaffListTable setShowStaffForm={setShowStaffForm} />
                        </motion.div>
                    </>
                )}
                {listCount === 3 && (
                    <motion.div
                        key="login-attempts"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <LoginAttemptsTable />
                    </motion.div>
                )}
            </AnimatePresence>
            {isNotifierOpen && <NotificationCard setIsOpen={setIsNotifier} />}
            {/* <TransactionInvoice /> */}
            {isMobileMenuOpen && (
                <MobileSideBar isOpen={isMobileMenuOpen} />
            )}
            <MobileNavbar />
            {showBusinessModal && (
                <BusinessModalCard onClose={() => setShowBusinessModal(false)} />
            )}
            {showStaffForm && (
                <CreateStaffForm businessId={businessId} branchId={branchId} onClose={() => setShowStaffForm(false)} />
            )}
            {showStaffSettings && (
                <CreateStaffBusinessForm businessId={businessId} branchId={branchId} onClose={() => setStaffSettings(false)} />
            )}
            <AnimatePresence>
                {showBusinessSettingsForm && (
                    <CreateStaffBusinessForm
                        onClose={closeBusinessSettingsForm}
                        businessId={businessId}
                        branchId={branchId}
                    />
                )}
                {editShowBusinessSettings && (
                    <EditStaffBusinessForm
                        businessId={businessId}
                        branchId={branchId}
                        data={staff_business_settings}
                        onClose={() => setEditShowBusinessSettings(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default StaffContents;