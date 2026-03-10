"use client";

import { MenuTypes } from "@/models/types/shared/project-type";
import { BiSolidDashboard } from "react-icons/bi";
import { PiShoppingCartSimple, PiShoppingCartSimpleFill } from "react-icons/pi";
import { LuLayoutDashboard, LuChartNoAxesCombined } from "react-icons/lu";
import { HiMiniUsers } from "react-icons/hi2";
import { CustomNaira, CustomTrendingUp, CustomUserAccount } from "@/components/customs/Icons";
import { TbCurrencyNaira } from "react-icons/tb";
import { AiFillFileExclamation } from "react-icons/ai";
import { LuFileChartLine } from "react-icons/lu";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi2";
import { useMemo, useState, useEffect } from "react";


const useSideMenuData = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const currentThemeStatus = localStorage.getItem("system-theme");
        if (currentThemeStatus) {
            setIsDarkMode(JSON.parse(currentThemeStatus));
        }
    }, []);

    const sideMenuData = useMemo<Array<MenuTypes>>(() => {
       return [
            {
                id: 1,
                _name: "Dashboard",
                _path: "/",
                activeIcon: BiSolidDashboard,
                inactiveIcon: LuLayoutDashboard,
                isPhoneViewIcon: LuLayoutDashboard,
                subtext: "Management"
            },
            {
                id: 2,
                _name: "Inventory",
                _path: "/inventory",
                activeIcon: PiShoppingCartSimpleFill,
                inactiveIcon: PiShoppingCartSimple,
                isPhoneViewIcon: PiShoppingCartSimple,
            },
            {
                id: 3,
                _name: "Sales & Orders",
                _path: "/sales",
                activeIcon: LuChartNoAxesCombined,
                inactiveIcon: !isDarkMode ? CustomTrendingUp : LuChartNoAxesCombined,
                isPhoneViewIcon: LuChartNoAxesCombined
            },
            {
                id: 4,
                _name: "Customers",
                _path: "/customer",
                activeIcon: HiMiniUsers,
                inactiveIcon: !isDarkMode ? CustomUserAccount : HiOutlineUsers,
                isPhoneViewIcon: HiOutlineUsers
            },
            {
                id: 5,
                _name: "Finances",
                _path: "/finances",
                activeIcon: TbCurrencyNaira,
                inactiveIcon: !isDarkMode ? CustomNaira : TbCurrencyNaira,
                isPhoneViewIcon: TbCurrencyNaira
            },
            {
                id: 6,
                _name: "Staff",
                _path: "/staff",
                activeIcon: HiMiniUsers,
                inactiveIcon: !isDarkMode ? HiOutlineUsers : HiMiniUsers,
                isPhoneViewIcon: HiOutlineUsers,
                subtext: "Others"
            },
            {
                id: 7,
                _name: "Reports",
                _path: "/reports",
                activeIcon: AiFillFileExclamation,
                inactiveIcon: LuFileChartLine,
                isPhoneViewIcon: LuFileChartLine
            },
            {
                id: 8,
                _name: "Settings",
                _path: "/account-settings",
                activeIcon: IoSettingsSharp,
                inactiveIcon: IoSettingsOutline,
                isPhoneViewIcon: IoSettingsOutline
            }
        ]
    }, [isDarkMode]);

    return {
        sideMenuData
    }
}

export default useSideMenuData;