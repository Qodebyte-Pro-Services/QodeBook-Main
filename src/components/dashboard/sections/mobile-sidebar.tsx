"use client";

import { Nunito_Sans } from "next/font/google";
import Image from "next/image";
import { IoIosSearch } from "react-icons/io";
import ColumnWrapper from "../column-wrapper";
import { useEffect, useState } from "react";
import { MenuTypes } from "@/models/types/shared/project-type";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IoLogOutOutline } from "react-icons/io5";
import Link from "next/link";
import { useCustomStyles, useDashboardContextHooks } from "@/hooks";
import { LiaTimesSolid } from "react-icons/lia";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineX } from "react-icons/hi";
import useSideMenuData from "@/store/data/side-menu";

const nunito_sans = Nunito_Sans({
    variable: "--font-nunito-sans",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});
const MobileSideBar = ({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) => {
    const [sideMenus, setSideMenus] = useState<Array<MenuTypes>>([]);
    const pathName = usePathname();
    const { hiddenScrollbar } = useCustomStyles();

    const { sideMenuData } = useSideMenuData();

    const { isIconView, setisMobileMenuOpen } = useDashboardContextHooks();

    useEffect(() => {
        setSideMenus(sideMenuData);
        return () => {
            setSideMenus([]);
        }
    }, [sideMenuData]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-80"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 40,
                            mass: 0.8,
                        }}
                        className="fixed top-0 left-0 w-[85%] max-w-sm h-full z-100 shadow-2xl"
                    >
                        <ColumnWrapper
                            customStyle={hiddenScrollbar}
                            className="h-full flex flex-col justify-between bg-gradient-to-br from-white via-gray-50 to-gray-100/50 dark:bg-gradient-to-br dark:from-black dark:via-black dark:to-gray-700/50 border-r border-gray-200/50"
                        >
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="h-fit w-full"
                            >
                                <div className={`w-full ${nunito_sans.className} antialiased`}>
                                    <div className="py-6 px-6">
                                        <div className="flex flex-col gap-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 h-[50px]">
                                                    <Image
                                                        width={200}
                                                        height={200}
                                                        className="h-full w-auto object-contain object-left"
                                                        src={"/images/image 790.png"}
                                                        alt={"QodeBook logo"}
                                                    />
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.05, rotate: 90 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setisMobileMenuOpen(false)}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm"
                                                >
                                                    <HiOutlineX className="text-gray-600" size={18} />
                                                </motion.button>
                                            </div>

                                            {/* Modern search input */}
                                            {/* <motion.div 
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="relative w-full"
                                            >
                                                <input 
                                                    type="text" 
                                                    className="py-3 pl-10 pr-4 w-full bg-white dark:bg-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-template-primary/20 focus:border-template-primary transition-all duration-200 shadow-sm placeholder:text-gray-400" 
                                                    placeholder="Search menu..." 
                                                />
                                                <IoIosSearch 
                                                    size={18} 
                                                    className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 dark:text-gray-600" 
                                                />
                                            </motion.div> */}

                                            {/* Navigation menu */}
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="flex flex-col gap-y-1"
                                            >
                                                {sideMenus?.map(({ id, _name, _path, activeIcon: Active, inactiveIcon: Inactive, isPhoneViewIcon: PhoneIcon, subtext }, index) => {
                                                    const isActive = _path === pathName;

                                                    if (typeof subtext !== "undefined") {
                                                        return (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.1 * index }}
                                                                whileHover={{ x: 4 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <Link onClick={onClose} href={_path} className="w-full block">
                                                                    <div data-id={id} className="flex flex-col gap-y-2 group">
                                                                        <div className={cn(
                                                                            "flex items-center rounded-xl gap-x-3 py-3 px-4 transition-all duration-200 relative overflow-hidden",
                                                                            isActive
                                                                                ? 'bg-gradient-to-r from-template-primary to-template-primary/90 text-white'
                                                                                : 'hover:bg-white hover:shadow-md group-hover:bg-white dark:hover:bg-gray-800 dark:group-hover:bg-gray-800'
                                                                        )}>
                                                                            {/* Active indicator */}
                                                                            {isActive && (
                                                                                <motion.div
                                                                                    layoutId="activeIndicator"
                                                                                    className="absolute left-0 top-0 bottom-0 w-1 bg-white dark:bg-black rounded-r-full"
                                                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                                />
                                                                            )}

                                                                            {/* Icon */}
                                                                            <div className="flex-shrink-0">
                                                                                {isActive ? (
                                                                                    <Active size={20} />
                                                                                ) : (
                                                                                    <Inactive size={20} className={isActive ? '' : 'text-gray-600 group-hover:text-template-primary transition-colors'} />
                                                                                )}
                                                                            </div>

                                                                            <div className="text-sm font-medium">{_name}</div>
                                                                        </div>
                                                                        <div className="text-xs font-normal text-gray-500 px-4 -mt-1">{subtext}</div>
                                                                    </div>
                                                                </Link>
                                                            </motion.div>
                                                        );
                                                    } else {
                                                        return (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.1 * index }}
                                                                whileHover={{ x: 4 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <Link onClick={onClose} className="w-full block" href={_path}>
                                                                    <div data-id={id} className={cn(
                                                                        "flex items-center rounded-xl gap-x-3 py-3 px-4 transition-all duration-200 relative overflow-hidden group",
                                                                        isActive
                                                                            ? 'bg-gradient-to-r from-template-primary to-template-primary/90 text-white shadow-lg shadow-template-primary/25'
                                                                            : 'hover:bg-gray-200 hover:shadow-md'
                                                                    )}>
                                                                        {isActive && (
                                                                            <motion.div
                                                                                layoutId="activeIndicator"
                                                                                className="absolute left-0 top-0 bottom-0 w-1 bg-white dark:bg-black rounded-r-full"
                                                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                            />
                                                                        )}

                                                                        {/* Icon */}
                                                                        <div className="flex-shrink-0">
                                                                            {isActive ? (
                                                                                <Active size={20} />
                                                                            ) : (
                                                                                <Active size={20} className={isActive ? '' : 'text-gray-600 group-hover:text-template-primary transition-colors'} />
                                                                            )}
                                                                        </div>

                                                                        <div className="text-sm font-medium">{_name}</div>
                                                                    </div>
                                                                </Link>
                                                            </motion.div>
                                                        );
                                                    }
                                                })}
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Logout section */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 border-t border-gray-200/50"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center w-full rounded-xl gap-x-3 py-3 px-4 hover:bg-red-50 transition-all duration-200 group"
                                >
                                    <IoLogOutOutline size={20} className="text-red-500 group-hover:text-red-600 transition-colors" />
                                    <div className="text-sm font-medium text-red-500 group-hover:text-red-600 transition-colors">Logout</div>
                                </motion.button>
                            </motion.div>
                        </ColumnWrapper>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default MobileSideBar;