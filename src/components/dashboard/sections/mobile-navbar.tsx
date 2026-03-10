"use client";

import { LuChartNoAxesCombined } from "react-icons/lu";
import { useDashboardContextHooks } from "@/hooks";
import { CgMenuLeft } from "react-icons/cg";
import { HiMiniUsers } from "react-icons/hi2";
import { IoSettingsSharp } from "react-icons/io5";
import { PiShoppingCartFill } from "react-icons/pi";
import { useRouter } from "next/navigation";

const MobileNavbar = () => {
    const {setisMobileMenuOpen} = useDashboardContextHooks();
    const router = useRouter();
    return(
        <div className="block md:hidden fixed bottom-0 left-0 w-full py-2 px-3 bg-white dark:bg-black z-50">
            <div className="flex justify-center items-center">
                <div onClick={() => router.push("/inventory")} className="w-full flex flex-col gap-y-1 items-center cursor-pointer">
                    <PiShoppingCartFill size={20} className="text-template-primary" />
                    <div className="text-xs font-[500]">Inventory</div>
                </div>
                <div onClick={() => router.push("/sales")} className="w-full flex flex-col gap-y-1 items-center cursor-pointer">
                    <LuChartNoAxesCombined size={20} className="text-template-primary" />
                    <div className="text-xs font-[500]">Sales</div>
                </div>
                <div className="w-full flex justify-center">
                    <div className="w-[45px] -translate-y-[40%] h-[45px] rounded-full flex justify-center items-center bg-template-primary text-white cursor-pointer" style={{boxShadow: "0px 0px 0px 3px var(--color-template-whitesmoke)"}}>
                        <CgMenuLeft onClick={() => setisMobileMenuOpen(prev => !prev)} size={25} />
                    </div>
                </div>
                <div onClick={() => router.push("/customer")} className="w-full flex flex-col gap-y-1 items-center cursor-pointer">
                    <HiMiniUsers size={20} className="text-template-primary" />
                    <div className="text-xs font-[500]">Customers</div>
                </div>
                <div onClick={() => router.push("/account-settings")} className="w-full flex flex-col gap-y-1 items-center cursor-pointer">
                    <IoSettingsSharp size={20} className="text-template-primary" />
                    <div className="text-xs font-[500]">Settings</div>
                </div>
            </div>
        </div>
    );
}

export default MobileNavbar;