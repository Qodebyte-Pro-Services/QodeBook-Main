"use client";

import { RiNotification2Line } from "react-icons/ri";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { RxCaretDown } from "react-icons/rx";
import { Nunito_Sans } from "next/font/google";
import { useDashboardContextHooks } from "@/hooks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { BranchResponseData } from "@/models/types/shared/handlers-type";
import { getBusinessBranches, getStaffById, getUserDetails } from "@/api/controllers/get/handler";
import { useQuery } from "@tanstack/react-query";
import { Settings, User, LogOut, Bell, HelpCircle, Building2, ChevronDown, Clock } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserLogoutAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useStaffAuthLogout } from "@/hooks/staff-controller";
import { useViewStaffBusinessSettings } from "@/hooks/useControllers";

const nunito = Nunito_Sans({
    variable: "--font-nunito-sans",
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    style: "normal",
    subsets: ["latin"]
});

const DashboardHeader = () => {
    const { setIsNotifier } = useDashboardContextHooks();
    const [branchesData, setBranchesData] = useState<BranchResponseData[]>([]);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const [isStaff, setIsStaff] = useState(false);

    const authLogoutHandler = useUserLogoutAuth();
    const authStaffLogoutHandler = useStaffAuthLogout();

    const [branchId, setBranchId] = useState<number | string>(0);
    const [elapsedTime, setElapsedTime] = useState(() => {
        if (typeof window === "undefined") return 0;
        const storedTime = localStorage.getItem("posSessionElapsedTime");
        return storedTime ? parseInt(storedTime, 10) : 0;
    });
    const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number | null>(null);
    const hasTimedOutRef = useRef(false);

    const router = useRouter();

    const staffId = useMemo(() => {
        if (typeof window === "undefined") return "";
        const staff_id = Cookies.get("authStaffId") || "";
        return staff_id;
    }, []);

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("selectedBusinessId");
            return storedId ? JSON.parse(storedId) : 0;
        }
    }, []);

    const { data: businessBranchesData, isError: isBranchError, isSuccess: isBranchSuccess } = useQuery({
        queryKey: ["business-branches", businessId],
        queryFn: () => getBusinessBranches(`${businessId}`),
        enabled: !!businessId,
        refetchOnWindowFocus: false,
        retry: false
    });

    const { data: userDetailsData, isError: isUserError, isSuccess: isUserSuccess } = useQuery({
        queryKey: ["get-user-details"],
        queryFn: () => getUserDetails(),
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: false
    });

    const staff_decoded_details = useMemo(() => {
        if (typeof window === "undefined") return null;
        const staff_token = Cookies.get("authToken") || "";
        const decoded_staff_details = jwtDecode(staff_token) || {};
        return decoded_staff_details;
    }, [staffId]) as Record<string, string | number | Array<string> | boolean>;

    const isStaffDecoded = (Object.keys(staff_decoded_details || {}).length === Object.values(staff_decoded_details || {}).filter(item => Array.isArray(item) ? item.length > 0 : !!item).length);

    const user_details = useMemo(() => {
        if (!isUserError && isUserSuccess) {
            return userDetailsData?.user;
        }
        return null;
    }, [isUserError, userDetailsData, isUserSuccess])

    useEffect(() => {
        if (businessBranchesData?.branches && !isBranchError) {
            setBranchesData(businessBranchesData.branches);

            // Auto-select if only one branch
            if (businessBranchesData.branches.length === 1) {
                const singleBranch = businessBranchesData.branches[0];
                setBranchId(singleBranch.id);
            } else {
                // Load from sessionStorage if available
                const storedBranchId = sessionStorage.getItem("selectedBranchId");
                if (storedBranchId) {
                    setBranchId(JSON.parse(storedBranchId));
                }
            }
        }
    }, [businessBranchesData, isBranchError]);

    useEffect(() => {
        if (branchId) {
            sessionStorage.setItem("selectedBranchId", JSON.stringify(branchId));
        }
    }, [branchId]);

    useEffect(() => {
        // Reset timeout ref when user logs in
        hasTimedOutRef.current = false;
        
        const interval = setInterval(() => {
            setElapsedTime(prev => {
                const nextTime = prev + 1;
                // Only update localStorage every 10 seconds to reduce writes
                if (nextTime % 10 === 0) {
                    localStorage.setItem("posSessionElapsedTime", nextTime.toString());
                }
                return nextTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

  
    const lastActivityResetRef = useRef<number>(Date.now());
    
    // Activity detection for both admin and staff
    // Admin: Only logs out when inactive (activity resets timer indefinitely)
    // Staff: Activity resets timer, but logged out if reaching business settings timeout
    useEffect(() => {
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        const handleActivity = () => {
            const now = Date.now();
            // Throttle activity resets to once per 5 seconds to avoid excessive state updates
            if (now - lastActivityResetRef.current >= 5000) {
                lastActivityResetRef.current = now;
                setElapsedTime(0);
                localStorage.setItem("posSessionElapsedTime", "0");
            }
        };

        // Attach event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, []);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const activeUser = Cookies.get("authActiveUser") || "admin";
        switch (activeUser?.toLowerCase()) {
            case "staff":
                setIsStaff(true);
                break;
            default:
                setIsStaff(false);
                break;
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
                    await authStaffLogoutHandler.mutateAsync({ business_id: businessId, session_id: staffId }, {
                        onSuccess(data) {
                            toast.success(data?.message || "User Logged out Successfully");
                        },
                        onError(err) {
                            console.warn("Staff logout API error:", err);
                        }
                    });
                } catch (err) {
                    console.warn("Staff logout error:", err);
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
                await authLogoutHandler.mutateAsync(businessId, {
                    onSuccess(data) {
                        toast.success(data?.message || "User Logged out Successfully");
                    },
                    onError(err) {
                        console.warn("Admin logout API error:", err);
                    }
                });
            } catch (err) {
                console.warn("Admin logout error:", err);
            }

        
            Cookies.remove("authToken");
            Cookies.remove("authActiveUser");
            Cookies.remove("authStaffId");
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

    // Only fetch staff business settings if user is actually a staff member
    const ViewStaffBusinessSettings = useViewStaffBusinessSettings(isStaff, businessId?.toString() || "");
    
   
    useEffect(() => {
        if (isStaff && ViewStaffBusinessSettings?.isSuccess && ViewStaffBusinessSettings?.data) {
            const staffSettings = ViewStaffBusinessSettings.data?.staff_settings || ViewStaffBusinessSettings.data;
            const timeoutMinutes = staffSettings?.session_timeout_minutes || 480; 
            setSessionTimeoutMinutes(timeoutMinutes);
        }
    }, [isStaff, ViewStaffBusinessSettings?.isSuccess, ViewStaffBusinessSettings?.data]);

    // Monitor session timeout for both staff and non-staff users
    useEffect(() => {
        if (hasTimedOutRef.current) return;

        let timeoutInSeconds: number;

        if (isStaff) {
            if (!sessionTimeoutMinutes) return;
            timeoutInSeconds = sessionTimeoutMinutes * 60;
        } else {
            timeoutInSeconds = 30 * 60;
        }

        if (elapsedTime > 0 && elapsedTime >= timeoutInSeconds) {
            hasTimedOutRef.current = true;
            toast.warning("Session Expired", {
                description: "You have been logged out due to inactivity"
            });
            // Auto-logout user
            handleAuthLogout();
        }
    }, [elapsedTime, isStaff, sessionTimeoutMinutes, handleAuthLogout]);
    

    return (
        <div className={`w-full py-5 px-4 flex items-center justify-between bg-white dark:bg-black ${nunito.className} antialiased`}>
            <div className="flex flex-col gap-y-[3px]">
                <div className="text-sm font-[600]" suppressHydrationWarning>Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 16 ? "Afternoon" : "Evening"}, {isStaff ? staff_decoded_details?.full_name : user_details?.first_name} {!isStaff ? "Admin" : "Staff"}</div>
                <div className="hidden sm:block text-[13px] font-[600] text-auth-basic/50 dark:text-white/50">Welcome back, nice to see you again!</div>
            </div>
            <div className="flex items-center gap-x-6">
                <div onClick={() => setIsNotifier(true)} className="w-[30px] h-[30px] cursor-pointer border border-gray-500 rounded-sm flex justify-center items-center">
                    <RiNotification2Line size={18} className="pointer-events-none" />
                </div>
                {!isStaff ? (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="outline-none focus:outline-none">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 dark:hover:text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md h-9 sm:h-10"
                                >
                                    <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">Branches</span>
                                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-64 p-2 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 mt-2">
                                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg mb-2">
                                    <DropdownMenuLabel className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-green-600" />
                                        Select Branch
                                    </DropdownMenuLabel>
                                </div>
                                <DropdownMenuRadioGroup value={`${branchId}`} onValueChange={(e) => setBranchId(parseInt(e))}>
                                    {(isBranchSuccess && !isBranchError && branchesData?.length) && branchesData?.map((item, index) => (
                                        <DropdownMenuRadioItem
                                            value={`${item.id}`}
                                            key={`business-branch-${index}`}
                                            className="capitalize px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-white hover:text-gray-900 data-[state=checked]:bg-green-50 data-[state=checked]:text-green-700 data-[state=checked]:font-semibold"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors"></div>
                                            {item.branch_name}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl shadow-sm">
                            <div className="relative">
                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-black shadow-sm"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 leading-none mb-1">
                                    Session timeout: 30m
                                </span>
                                <span className={`text-sm font-bold font-mono tabular-nums ${
                                    elapsedTime >= (30 * 60 * 0.9)
                                        ? 'text-red-600 dark:text-red-400 animate-pulse'
                                        : elapsedTime >= (30 * 60 * 0.75)
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-blue-700 dark:text-blue-300'
                                }`}>
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl shadow-sm">
                        <div className="relative">
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-black shadow-sm"></div>
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
                )}
                <div className="relative" ref={menuRef}>
                    <div
                        className="flex items-center gap-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        <div>
                            {user_details?.profile_image ? (
                                <Image src={user_details?.profile_image} fill alt={user_details?.first_name} className="w-9 h-9 rounded-full" />
                            ) : (
                                isStaffDecoded ? (
                                    <div className="bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center" suppressHydrationWarning>{(staff_decoded_details?.full_name as string)?.match(/\b\w/g)?.join("")?.toUpperCase()}</div>
                                ) : (
                                    <div className="bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center" suppressHydrationWarning>{((user_details?.first_name + " " + user_details?.last_name) as string)?.match(/\b\w/g)?.join("")?.toUpperCase()}</div>
                                )
                            )}
                        </div>
                        <div className="hidden lg:flex items-center gap-x-1">
                            <div className="text-sm font-[400]">{user_details?.first_name}</div>
                            <RxCaretDown
                                size={16}
                                className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Mini Modal */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                            {/* User Info Header */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-green-500 dark:via-green-500 dark:to-green-100 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full">
                                        {user_details?.profile_image ? (
                                            <Image src={user_details?.profile_image} fill alt={user_details?.first_name} className="w-full h-full object-contain object-center aspect-video" />
                                        ) : (
                                            isStaffDecoded ? (
                                                <div className="bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center" suppressHydrationWarning>{(staff_decoded_details?.full_name as string)?.match(/\b\w/g)?.join("")?.toUpperCase()}</div>
                                            ) : (
                                                <div className="bg-gray-200 rounded-full w-9 h-9 flex items-center justify-center" suppressHydrationWarning>{((user_details?.first_name + " " + user_details?.last_name) as string)?.match(/\b\w/g)?.join("")?.toUpperCase()}</div>
                                            )
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{user_details?.first_name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-100">{isStaffDecoded ? staff_decoded_details?.full_name : user_details?.first_name + " " + user_details?.last_name}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2">
                                <button onClick={() => router.push("/account-settings")} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                    <User className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-white">Profile</span>
                                </button>

                                <button onClick={() => router.push("/account-settings")} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                    <Settings className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-white">Settings</span>
                                </button>

                                <button onClick={() => router.push("/account-settings")} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                    <Bell className="h-4 w-4 text-gray-500 group-hover:text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-white">Notifications</span>
                                </button>

                                <button onClick={() => router.push("/account-settings")} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                                    <HelpCircle className="h-4 w-4 text-gray-500 group-hover:text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-white">Help & Support</span>
                                </button>

                                <hr className="my-2 border-gray-100 dark:border-gray-800" />

                                <button onClick={() => handleAuthLogout()} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-800 rounded-lg transition-colors group">
                                    <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-white group-hover:text-red-700">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardHeader;