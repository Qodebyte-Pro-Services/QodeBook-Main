"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PiShoppingCartBold, PiMagnifyingGlass } from "react-icons/pi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { IoLogOutOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useUserLogoutAuth } from "@/hooks/useAuth";
import { useStaffAuthLogout } from "@/hooks/staff-controller";
import { useRouter } from "next/navigation";
import { useViewStaffBusinessSettings } from "@/hooks/useControllers";

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
       const [elapsedTime, setElapsedTime] = useState(() => {
        if (typeof window === "undefined") return 0;
        const storedTime = localStorage.getItem("posSessionElapsedTime");
        return storedTime ? parseInt(storedTime, 10) : 0;
    });
        const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number | null>(null);
    const [hasTimedOut, setHasTimedOut] = useState(false);
    const staff_details = useMemo(() => {
        if (typeof window === "undefined") return null;
        const activeUser = Cookies.get("authActiveUser") ? Cookies.get("authActiveUser") : "user";
        const details = activeUser !== "user" ? JSON.parse(Cookies.get("staff_details")) : null;
        return details;
    }, []);

    const router = useRouter();


    const isStaff = useMemo(() => {
        if (typeof window === "undefined") return false;
        const activeStaffId = Cookies.get("authStaffId") ? Cookies.get("authStaffId") : "";
        return activeStaffId !== "";
    }, []);

    const staffId = useMemo(() => {
        if (typeof window === "undefined") return "";
        const activeStaffId = Cookies.get("authStaffId") ? Cookies.get("authStaffId") : "";
        return activeStaffId;
    }, []);
   

    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const authLogoutHandler = useUserLogoutAuth();
    const authStaffLogoutHandler = useStaffAuthLogout();

    const businessId = useMemo(() => {
                if (typeof window !== "undefined") {
                    const storedId = sessionStorage.getItem("selectedBusinessId");
                    return storedId ? JSON.parse(storedId) : 0;
                }
            }, []);

        const handleAuthLogout = useCallback(async () => {
            if (businessId <= 0) {
                toast.info("Invalid Business Id", {
                    description: "Kindly select a business"
                });
                return;
            }
            setIsLoggingOut(true);
            try {
                if (isStaff) {
                    try {
                        await authStaffLogoutHandler.mutateAsync({ business_id: businessId, session_id: staffId });
                    } catch (err) {
                        console.warn("Staff logout API error:", err);
                    }
                    
                    Cookies.remove("authToken");
                    Cookies.remove("authActiveUser");
                    Cookies.remove("authStaffId");
                    Cookies.remove("staff_roles");
                    Cookies.remove("staff_details");
                    sessionStorage.removeItem("selectedBusinessId");
                    sessionStorage.removeItem("selectedBranchId");
                    sessionStorage.removeItem("posSessionElapsedTime");
                    localStorage.removeItem("posSessionElapsedTime");
                    router.push(`/staff/login/${businessId}`);
                    return;
                }
                
                try {
                    await authLogoutHandler.mutateAsync(businessId);
                } catch (err) {
                    console.warn("Admin logout API error:", err);
                }
                
                Cookies.remove("authToken");
                Cookies.remove("authActiveUser");
                sessionStorage.removeItem("selectedBusinessId");
                sessionStorage.removeItem("selectedBranchId");
                sessionStorage.removeItem("posSessionElapsedTime");
                localStorage.removeItem("posSessionElapsedTime");
                router.push("/login");
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err?.message || "Failed to logout");
                    return;
                }
                toast.error("Failed to logout");
            } finally {
                setIsLoggingOut(false);
            }
        }, [businessId, isStaff, staffId, authLogoutHandler, authStaffLogoutHandler, router]);

                   const ViewStaffBusinessSettings = useViewStaffBusinessSettings(isStaff, businessId?.toString() || "");

                const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(prev => {
                const nextTime = prev + 1;
                if (nextTime % 10 === 0) {
                    localStorage.setItem("posSessionElapsedTime", nextTime.toString());
                }
                return nextTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const lastActivityResetRef = React.useRef<number>(Date.now());

    useEffect(() => {
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        const handleActivity = () => {
            const now = Date.now();
            if (now - lastActivityResetRef.current >= 5000) {
                lastActivityResetRef.current = now;
                setElapsedTime(0);
                localStorage.setItem("posSessionElapsedTime", "0");
            }
        };

        activityEvents.forEach(event => document.addEventListener(event, handleActivity, true));
        return () => activityEvents.forEach(event => document.removeEventListener(event, handleActivity, true));
    }, []);
    
   
    useEffect(() => {
        if (isStaff && ViewStaffBusinessSettings?.isSuccess && ViewStaffBusinessSettings?.data) {
            const staffSettings = ViewStaffBusinessSettings.data?.staff_settings || ViewStaffBusinessSettings.data;
            const timeoutMinutes = staffSettings?.session_timeout_minutes || 480; 
            setSessionTimeoutMinutes(timeoutMinutes);
            localStorage.setItem("posSessionTimeoutMinutes", timeoutMinutes.toString());
        } else if (isStaff) {
            const cachedTimeout = localStorage.getItem("posSessionTimeoutMinutes");
            if (cachedTimeout) {
                setSessionTimeoutMinutes(parseInt(cachedTimeout, 10));
            } else {
                setSessionTimeoutMinutes(480);
            }
        }
    }, [isStaff, ViewStaffBusinessSettings?.isSuccess, ViewStaffBusinessSettings?.data]);

      
    useEffect(() => {
        if (!isStaff || !sessionTimeoutMinutes || hasTimedOut) return;

        const timeoutInSeconds = (sessionTimeoutMinutes * 60) - 60;
        
        if (elapsedTime > 0 && elapsedTime >= timeoutInSeconds) {
            setHasTimedOut(true);
         
            toast.warning("Session Expired", {
                description: "You have been logged out due to inactivity"
            });
           
            setTimeout(() => {
                handleAuthLogout();
            }, 1500);
        }
    }, [elapsedTime, isStaff, sessionTimeoutMinutes, hasTimedOut, handleAuthLogout]);
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

                    <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 leading-none mb-1">
                                {sessionTimeoutMinutes && `Session timeout: ${sessionTimeoutMinutes}m`}
                            </span>
                            <span className={`text-sm font-bold font-mono tabular-nums ${
                                sessionTimeoutMinutes && elapsedTime >= (sessionTimeoutMinutes * 60 * 0.9)
                                    ? 'text-red-600 dark:text-red-400 animate-pulse'
                                    : sessionTimeoutMinutes && elapsedTime >= (sessionTimeoutMinutes * 60 * 0.75)
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-emerald-700 dark:text-emerald-300'
                            }`}>
                                {formatTime(elapsedTime)}
                            </span>
                        </div>
            </div>

              <div onClick={handleAuthLogout} className="flex items-center rounded-sm gap-x-3 py-2 px-11 cursor-pointer">
                            <IoLogOutOutline size={20} className="text-red-500" />
                            <div className="text-base font-[500] text-red-500">Logout</div>
                        </div>
        </header>
    );
};

export default POSHeader;
