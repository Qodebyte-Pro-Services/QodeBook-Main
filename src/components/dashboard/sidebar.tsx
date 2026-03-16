"use client";

import { Nunito_Sans } from "next/font/google";
import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import ColumnWrapper from "./column-wrapper";
import { useEffect, useMemo, useState } from "react";
import { MenuTypes } from "@/models/types/shared/project-type";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IoLogOutOutline } from "react-icons/io5";
import Link from "next/link";
import { useCustomStyles } from "@/hooks";
import { useUserBusinesses } from "@/hooks/useControllers";
import useSideMenuData from "@/store/data/side-menu";
import Cookies from "js-cookie";
import { PiShoppingBagFill } from "react-icons/pi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { includes } from "zod";

const nunito_sans = Nunito_Sans({
    variable: "--font-nunito-sans",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});
const DashboardSidebar = () => {
    const [sideMenus, setSideMenus] = useState<Array<MenuTypes>>([]);
    const pathName = usePathname();
    const { hiddenScrollbar } = useCustomStyles();

    const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(false);

    const { data, isSuccess, isError } = useUserBusinesses();
    const { sideMenuData } = useSideMenuData();

    const businessImage = useMemo(() => {
        if (isSuccess && !isError) {
            return data?.businesses?.[0]?.logo_url;
        }
    }, [isSuccess, isError, data]);

    useEffect(() => {
        setSideMenus(sideMenuData);
        return () => setSideMenus([]);
    }, [sideMenuData]);

    useEffect(() => {
        if (typeof window === "undefined") {
            setIsStaffLoggedIn(false);
            return;
        }
        const activeUser = Cookies.get("authActiveUser");
        if (activeUser?.toLowerCase() === "staff") {
            setIsStaffLoggedIn(true);
        } else {
            setIsStaffLoggedIn(false);
        }
    }, []);

    const isAvalidJson = (value: string) => {
        try {
            const res = JSON.parse(value);
            return typeof res === "object" || Array.isArray(res) ? true : false;
        } catch {
            return false;
        }
    }

    useEffect(() => {
        const required_permissions = ["view_analytics", "view_sales_overview", "view_sales_report"];
        const staff_permissions = Cookies.get("staff_roles");
        const has_required_permissions = isAvalidJson(staff_permissions) && required_permissions?.every((permission: string) => (JSON.parse(staff_permissions) as { role: string; permissions: Array<string> })?.permissions.includes(permission));
        if (isStaffLoggedIn) {
            setSideMenus((prev) => [...prev?.filter((item) => (item?._path !== "/sales" && !has_required_permissions)), { id: prev?.length + 1, _name: "POS", _path: "/pos", activeIcon: AiOutlineShoppingCart, inactiveIcon: AiOutlineShoppingCart }]);
        }
        return () => {
            setSideMenus(sideMenuData);
        }
    }, [isStaffLoggedIn, sideMenuData]);

    return (
        <ColumnWrapper customStyle={hiddenScrollbar} className="hidden lg:flex w-[24%] max-w-[25dvw] flex-col justify-between">
            <div className="h-fit w-full">
                <div className={`w-full ${nunito_sans.className} antialiased`}>
                    <div className="py-2 px-8">
                        <div className="flex flex-col justify-between">
                            <div className="flex flex-col gap-y-5">
                                <div className="w-full h-[80px]">
                                    <Image width={200} height={200} className="w-full mx-auto h-full object-contain object-center aspect-square" src={`${businessImage || "/images/image 790.png"}`} alt={"QodeBook logo"} />
                                </div>
                                {/* <div className="relative w-full">
                                    <input type="text" className="py-2 pl-8 pr-3 w-full border border-gray-500 rounded-sm" placeholder="Search" />
                                    <IoIosSearch size={20} className="absolute top-2/4 text-auth-basic/70 -translate-y-2/4 left-[2%] cursor-pointer" />
                                </div> */}
                                <div className="flex flex-col gap-y-2">
                                    {sideMenus?.map(({ id, _name, _path, activeIcon: Active, inactiveIcon: Inactive, subtext }, index) => {
                                        if (typeof subtext !== "undefined") {
                                            return (
                                                <Link key={index} href={_path} className="w-full">
                                                    <div data-id={id} className="flex flex-col gap-y-1">
                                                        <div className={cn(`flex items-center ${(_path === pathName) ? 'bg-template-primary text-white' : ''} rounded-sm gap-x-3 py-2 px-3`)}>
                                                            {(_path === pathName) && <Active size={18} />}
                                                            {(_path !== pathName) && <Inactive size={18} />}
                                                            <div className="text-sm font-[500]">{_name}</div>
                                                        </div>
                                                        <div className="text-[13px] font-[400] text-auth-basic/70">{subtext}</div>
                                                    </div>
                                                </Link>
                                            );
                                        } else {
                                            return (
                                                <Link key={index} className="w-full" href={_path}>
                                                    <div data-id={id} className={`flex items-center ${(_path === (pathName.startsWith("/product-view") ? "/inventory" : pathName)) ? 'bg-template-primary text-white' : ''} rounded-sm gap-x-3 py-2 px-3`}>
                                                        {(_path === (pathName.startsWith("/product-view") ? "/inventory" : pathName)) && <Active size={18} />}
                                                        {(_path !== (pathName.startsWith("/product-view") ? "/inventory" : pathName)) && <Inactive size={18} />}
                                                        <div className="text-sm font-[500]">{_name}</div>
                                                    </div>
                                                </Link>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center rounded-sm gap-x-3 py-2 px-11 cursor-pointer">
                <IoLogOutOutline size={20} className="text-red-500" />
                <div className="text-base font-[500] text-red-500">Logout</div>
            </div>
        </ColumnWrapper>
    );
}

export default DashboardSidebar;