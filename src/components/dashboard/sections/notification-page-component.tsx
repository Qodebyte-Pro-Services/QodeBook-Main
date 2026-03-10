"use client";

import React, { useMemo, useState } from "react";
import {
    RiNotification3Line,
    RiSearchLine,
    RiFilter3Line,
    RiCheckDoubleLine,
    RiDeleteBinLine,
    RiRefreshLine
} from "react-icons/ri";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "@/api/controllers/get/handler";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/api/controllers/put/handlers";
import { NotificationItem } from "../ui";
import { NotificationPropsType } from "../ui/notification-card";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { useCustomStyles } from "@/hooks";
import { cn } from "@/lib/utils";

const NotificationPageComponent = () => {
    const { customScrollbar } = useCustomStyles();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return 0;
        const selectedBusinessId = sessionStorage.getItem("selectedBusinessId");
        return selectedBusinessId ? +selectedBusinessId : 0;
    }, []);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["get-notifications", businessId],
        queryFn: () => getNotifications(businessId),
        enabled: businessId !== 0,
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-notifications", businessId] });
            queryClient.invalidateQueries({ queryKey: ["get-notification-count", businessId] });
            toast.success("Notification marked as read");
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(businessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-notifications", businessId] });
            queryClient.invalidateQueries({ queryKey: ["get-notification-count", businessId] });
            toast.success("All notifications marked as read");
        }
    });

    const notifications = data?.notifications || [];

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n: NotificationPropsType) => {
            const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.notification_type.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === "all" ||
                (filter === "unread" && !n.is_read) ||
                (filter === "read" && n.is_read);
            return matchesSearch && matchesFilter;
        });
    }, [notifications, searchQuery, filter]);

    const unreadCount = notifications.filter((n: NotificationPropsType) => !n.is_read).length;

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-template-primary/10 flex items-center justify-center text-template-primary">
                                <RiNotification3Line size={24} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
                        </div>
                        <p className="text-gray-500 font-medium">
                            Stay updated with your business activities and system alerts.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => refetch()}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200"
                            title="Refresh"
                        >
                            <RiRefreshLine size={20} />
                        </button>
                        <button
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={unreadCount === 0 || markAllReadMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 bg-template-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-template-primary/20 hover:shadow-xl hover:shadow-template-primary/30 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                        >
                            <RiCheckDoubleLine size={18} />
                            Mark all as read
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-grow w-full max-w-md">
                        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100/80 border-transparent focus:bg-white focus:ring-2 focus:ring-template-primary/20 focus:border-template-primary rounded-2xl text-sm font-medium transition-all duration-200"
                        />
                    </div>

                    <div className="flex items-center p-1.5 bg-gray-100 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        {(["all", "unread", "read"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap",
                                    filter === f
                                        ? "bg-white text-template-primary shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                )}
                            >
                                {f}
                                {f === "unread" && unreadCount > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-template-primary/10 text-[10px] rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto" style={customScrollbar}>
                <div className="max-w-5xl mx-auto p-6 sm:p-8">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y space-y-3 divide-gray-100">
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.map((notification: NotificationPropsType) => (
                                    <NotificationItem
                                        key={notification.id}
                                        data={notification}
                                        onMarkAsRead={(id) => markReadMutation.mutate({ notificationId: id, businessId })}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center"
                        >
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <RiNotification3Line size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                {searchQuery ? "No matching notifications" : "All caught up!"}
                            </h3>
                            <p className="text-gray-500 max-w-sm font-medium">
                                {searchQuery
                                    ? "We couldn't find any notifications matching your search criteria."
                                    : "You don't have any notifications right now. Check back later for updates."}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-6 text-sm font-bold text-template-primary hover:underline underline-offset-4"
                                >
                                    Clear search
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPageComponent;
