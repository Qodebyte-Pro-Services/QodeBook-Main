"use client";

import { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useMemo, useState } from "react";
import {
    RiNotification3Line,
    RiCheckDoubleLine,
    RiRefreshLine,
    RiMailLine,
    RiSmartphoneLine,
    RiSignalTowerLine,
    RiArrowRightLine
} from "react-icons/ri";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "@/api/controllers/get/handler";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/api/controllers/put/handlers";
import { NotificationItem } from "../../ui";
import { NotificationPropsType } from "../../ui/notification-card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const NotificationSettings = ({ sectionVariant, isPhoneView }: { sectionVariant: Variants; isPhoneView: boolean; }) => {
    const queryClient = useQueryClient();
    const [preferences, setPreferences] = useState({
        email: true,
        sms: false,
        push: true,
    });

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

    const notifications = useMemo(() => (data?.notifications || []).slice(0, 5), [data]);
    const unreadCount = (data?.notifications || []).filter((n: NotificationPropsType) => !n.is_read).length;

    const togglePreference = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
        toast.info(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${!preferences[key] ? 'enabled' : 'disabled'}`);
    };

    return (
        <motion.div
            key="notification"
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(`w-full mt-2 space-y-6 ${isPhoneView ? 'mb-24' : ''}`)}
        >
            {/* Preferences Card */}
            <Card className="dark:bg-black border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-template-primary/[0.03] to-transparent py-6">
                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                        <RiNotification3Line className="text-template-primary" />
                        Preference Settings
                    </CardTitle>
                    <CardDescription>Configure how you want to receive alerts and updates</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                        <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <RiMailLine size={20} />
                                </div>
                                <div>
                                    <Label className="text-sm font-bold">Email Notifications</Label>
                                    <p className="text-xs text-gray-500">Receive summaries and important alerts via email</p>
                                </div>
                            </div>
                            <Switch checked={preferences.email} onCheckedChange={() => togglePreference('email')} />
                        </div>

                        <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                    <RiSmartphoneLine size={20} />
                                </div>
                                <div>
                                    <Label className="text-sm font-bold">SMS Notifications</Label>
                                    <p className="text-xs text-gray-500">Get critical stock alerts directly on your phone</p>
                                </div>
                            </div>
                            <Switch checked={preferences.sms} onCheckedChange={() => togglePreference('sms')} />
                        </div>

                        <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                    <RiSignalTowerLine size={20} />
                                </div>
                                <div>
                                    <Label className="text-sm font-bold">Push Notifications</Label>
                                    <p className="text-xs text-gray-500">Enable real-time browser and desktop alerts</p>
                                </div>
                            </div>
                            <Switch checked={preferences.push} onCheckedChange={() => togglePreference('push')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Notifications Card */}
            <Card className="dark:bg-black border-none shadow-sm overflow-hidden">
                <CardHeader className="py-6 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Recent Notifications</CardTitle>
                        <CardDescription>Your latest system activity and business alerts</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <RiRefreshLine size={18} />
                        </button>
                        <button
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={unreadCount === 0 || markAllReadMutation.isPending}
                            className="p-2 hover:bg-gray-100 rounded-lg text-template-primary disabled:opacity-30 transition-colors"
                            title="Mark all as read"
                        >
                            <RiCheckDoubleLine size={18} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-2 p-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notification: NotificationPropsType) => (
                                    <NotificationItem
                                        key={notification.id}
                                        data={notification}
                                        onMarkAsRead={(id) => markReadMutation.mutate({ notificationId: id, businessId })}
                                        className="hover:bg-transparent px-6"
                                    />
                                ))}
                            </AnimatePresence>
                            <div className="p-4 bg-gray-50/50 flex justify-center">
                                <Link
                                    href="/notifications"
                                    className="flex items-center gap-2 text-xs font-black text-template-primary hover:text-template-primary/80 transition-all uppercase tracking-widest"
                                >
                                    View full history
                                    <RiArrowRightLine />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RiNotification3Line size={32} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">All caught up!</p>
                            <p className="text-xs text-gray-500">No recent notifications found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default NotificationSettings;