"use client";

import React, { useMemo } from "react";
import { PiShoppingCartBold, PiMagnifyingGlass } from "react-icons/pi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

interface POSHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    cartCount: number;
    onCartToggle?: () => void;
    isOnline?: boolean;
}

const POSHeader: React.FC<POSHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    cartCount,
    onCartToggle,
    isOnline = true,
}) => {
    const staff_details = useMemo(() => {
        if (typeof window === "undefined") return null;
        const activeUser = Cookies.get("authActiveUser") ? Cookies.get("authActiveUser") : "user";
        const details = activeUser !== "user" ? JSON.parse(Cookies.get("staff_details")) : null;
        return details;
    }, []);
    return (
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="bg-template-primary w-[40px] h-[40px] flex items-center justify-center text-white text-xl font-[550] rounded-xl">
                    {staff_details ? staff_details?.full_name?.match(/\b\w/g).join("") : "A"}
                </div>
                <div className="flex flex-col leading-tight md:leading-4">
                    <div className="text-lg font-bold text-gray-900 hidden md:block">
                        Welcome back
                    </div>
                    <div className="text-[11px] font-[550] uppercase">{staff_details ? staff_details?.full_name : "Admin"}</div>
                </div>
            </div>

            <div className="flex-1 max-w-2xl px-2 sm:px-8">
                <div className="relative">
                    <PiMagnifyingGlass
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products by name or SKU..."
                        className="w-full pl-10 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-template-primary transition-all rounded-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative lg:hidden">
                    <button
                        onClick={onCartToggle}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <PiShoppingCartBold size={24} className="text-gray-700" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className={cn(
                    "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border transition-all duration-300",
                    isOnline
                        ? "text-green-700 bg-green-50 border-green-100"
                        : "text-amber-700 bg-amber-50 border-amber-100"
                )}>
                    <span className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isOnline ? "bg-green-500" : "bg-amber-500"
                    )}></span>
                    {isOnline ? "Online" : "Offline"}
                </div>
            </div>
        </header>
    );
};

export default POSHeader;
