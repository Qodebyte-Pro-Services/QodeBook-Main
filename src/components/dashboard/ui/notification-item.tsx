"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationPropsType } from "../ui/notification-card";
import { CustomBuilding } from "@/components/customs/Icons";
import {
    RiInformationLine,
    RiAlertLine,
    RiCheckboxCircleLine,
    RiTimerLine,
    RiArrowRightSLine,
    RiMailOpenLine,
    RiCalendarLine,
    RiUserLine,
    RiHashtag
} from "react-icons/ri";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface NotificationItemProps {
    data: NotificationPropsType;
    onMarkAsRead?: (id: number) => void;
    className?: string;
}

const NotificationItem = ({ data, onMarkAsRead, className }: NotificationItemProps) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const isUnread = !data.is_read;

    const getIcon = () => {
        const type = data.notification_type?.toLowerCase() || "";
        if (type.includes("order")) return <RiCheckboxCircleLine className="text-emerald-500" size={20} />;
        if (type.includes("stock") || type.includes("inventory")) return <RiAlertLine className="text-amber-500" size={20} />;
        if (type.includes("system")) return <RiInformationLine className="text-green-500" size={20} />;
        return <CustomBuilding size={20} color={isUnread ? "#3b82f6" : "#64748b"} />;
    };

    const getBgColor = () => {
        const type = data.notification_type?.toLowerCase() || "";
        if (type.includes("order")) return "bg-emerald-50";
        if (type.includes("stock")) return "bg-amber-50";
        if (type.includes("system")) return "bg-green-50";
        return "bg-gray-50";
    };

    const formattedDate = format(new Date(data.created_at), "MMM dd, yyyy HH:mm:ss");

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "group relative border-b border-gray-100 last:border-0 p-4 transition-all duration-200 hover:bg-gray-50/80 cursor-pointer",
                    isUnread && "bg-template-primary/[0.02]",
                    className
                )}
                onClick={() => setIsDetailsOpen(true)}
            >
                <div className="flex gap-4">
                    {/* Indicator */}
                    {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-template-primary rounded-r-full" />
                    )}

                    {/* Icon Container */}
                    <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm",
                        getBgColor()
                    )}>
                        {getIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 truncate uppercase tracking-wider">
                                {data?.notification_type?.split("_")?.join(" ")}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 whitespace-nowrap">
                                <RiTimerLine size={12} />
                                {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
                            </div>
                        </div>

                        <p className={cn(
                            "text-sm leading-relaxed mb-3",
                            isUnread ? "text-gray-900 font-medium" : "text-gray-500"
                        )}>
                            {data.message}
                        </p>

                        <div className="flex items-center gap-4">
                            {isUnread && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead?.(data.id);
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-template-primary hover:text-template-primary/80 transition-colors"
                                >
                                    <RiMailOpenLine size={14} />
                                    Mark as read
                                </button>
                            )}
                            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                Details
                                <RiArrowRightSLine size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    <div className="relative">
                        {/* Header Gradient */}
                        <div className={cn("h-32 w-full", getBgColor(), "opacity-50")} />

                        <div className="px-8 pb-8 -mt-16">
                            <div className="flex items-end justify-between mb-6">
                                <div className={cn(
                                    "w-24 h-24 rounded-3xl shadow-xl flex items-center justify-center border-4 border-white",
                                    getBgColor()
                                )}>
                                    {getIcon()}
                                </div>
                                <div className="flex gap-2">
                                    {isUnread && (
                                        <button
                                            onClick={() => {
                                                onMarkAsRead?.(data.id);
                                                setIsDetailsOpen(false);
                                            }}
                                            className="px-4 py-2 bg-template-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-template-primary/20 hover:shadow-xl transition-all"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>

                            <DialogHeader className="text-left mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        {data.notification_type}
                                    </span>
                                    {isUnread && (
                                        <span className="px-3 py-1 bg-template-primary/10 text-template-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                            New alert
                                        </span>
                                    )}
                                </div>
                                <DialogTitle className="text-2xl font-black text-gray-900 leading-tight">
                                    Notification Details
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                        {data.message}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                            <RiCalendarLine size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tight">Timestamp</p>
                                            <p className="text-sm font-bold text-gray-900">{formattedDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                            <RiHashtag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tight">Notification ID</p>
                                            <p className="text-sm font-bold text-gray-900">#{data.id}</p>
                                        </div>
                                    </div>

                                    {data.read_by && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                                <RiUserLine size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tight">Read By</p>
                                                <p className="text-sm font-bold text-gray-900">{data.read_by}</p>
                                            </div>
                                        </div>
                                    )}

                                    {data.read_at && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <RiCalendarLine size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tight">Read At</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {format(new Date(data.read_at), "MMM dd, yyyy HH:mm:ss")}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NotificationItem;
