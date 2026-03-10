"use client";

import React, { useMemo, useState } from "react";
import { RiNotification3Fill, RiCloseLine, RiCheckDoubleLine, RiSettings3Line } from "react-icons/ri";
import { NotificationList } from "../sections";
import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getNotifications, getNotificationsCount } from "@/api/controllers/get/handler";
import Link from "next/link";

type NotificationType = {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NotificationPropsType {
    id: number,
    business_id: number,
    variant_id: number,
    notification_type: string,
    message: string,
    is_read: boolean,
    read_at: string | null,
    read_by: string | null,
    created_at: string
}

const NotificationCard = ({ setIsOpen }: NotificationType) => {
    const { customScrollbar } = useCustomStyles();
    const componentId = React.useId();
    const handleClose = () => {
        setIsOpen(false);
    }

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return;
        const selectedBusinessId = sessionStorage.getItem("selectedBusinessId");
        return selectedBusinessId ? +selectedBusinessId : 0;
    }, []) as number;

    const { data: notificationData, isLoading: notificationLoading, isSuccess: notificationSuccess, isError: notificationError } = useQuery({
        queryKey: ["get-notifications", businessId],
        queryFn: () => getNotifications(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false,
    });

    const { data: notificationCountData, isLoading: notificationCountLoading, isSuccess: notificationCountSuccess, isError: notificationCountError } = useQuery({
        queryKey: ["get-notification-count", businessId],
        queryFn: () => getNotificationsCount(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const notificationCount = useMemo(() => {
        if (!notificationCountError && notificationCountSuccess) {
            return notificationCountData?.unread_count || 0;
        }
        return 0;
    }, [notificationCountData, notificationCountSuccess, notificationCountError]);

    const notification_data = useMemo(() => {
        if (notificationSuccess && !notificationError) {
            return notificationData?.notifications;
        }
        return [];
    }, [notificationData, notificationSuccess, notificationError]);

    const handleMarkAllRead = () => {
        console.log('Mark all notifications as read');
    }

    const handleSettings = () => {
        console.log('Open notification settings');
    }
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={handleClose}
            />

            <motion.div
                key="notification-panel"
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        duration: 0.3
                    }
                }}
                exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -20,
                    transition: { duration: 0.2 }
                }}
                className="fixed top-4 right-4 w-[calc(100vw-2rem)] sm:w-96 lg:w-[420px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-template-primary/5 to-template-chart-store/5 border-b border-gray-100 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-template-primary to-template-chart-store flex items-center justify-center shadow-lg">
                                    <RiNotification3Fill size={20} className="text-white" />
                                </div>
                                {notificationCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                            {notificationCount > 99 ? '99+' : notificationCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                <p className="text-sm text-gray-500">
                                    {notificationCount === 0 ? 'All caught up!' : `${notificationCount} new notification${notificationCount !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 group"
                        >
                            <RiCloseLine size={18} className="text-gray-600 group-hover:text-gray-800" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-3 py-1.5 bg-template-primary/10 hover:bg-template-primary/20 text-template-primary rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                            <RiCheckDoubleLine size={16} />
                            <span className="hidden sm:inline">Mark all read</span>
                        </button>

                        <button
                            onClick={handleSettings}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                            <RiSettings3Line size={16} />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto" style={customScrollbar}>
                    {notificationCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <RiNotification3Fill size={24} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h4>
                            <p className="text-gray-500 text-sm">You&apos;re all caught up! Check back later for updates.</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            <div className="space-y-1">
                                {notification_data?.map((notification: NotificationPropsType, index: number) => (
                                    <NotificationList
                                        className="p-3 hover:bg-template-chart-store/30 rounded-xl transition-colors duration-200"
                                        key={`${componentId}-notification-${index}`}
                                        id={`notification-${index}`}
                                        data={notification}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {notificationCount > 0 && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                        <Link
                            href="/notifications"
                            onClick={handleClose}
                            className="w-full block py-2 text-center text-sm font-bold text-template-primary hover:text-template-primary/80 transition-colors duration-200"
                        >
                            View all notifications
                        </Link>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export default NotificationCard;