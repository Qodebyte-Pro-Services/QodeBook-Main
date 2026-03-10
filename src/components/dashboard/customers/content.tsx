"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect, useMemo} from "react";
import { useDashboardContextHooks } from "@/hooks";
import { LoginAttemptsTable} from "../tables";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationCard } from "../ui";
import { MobileNavbar, MobileSideBar } from "../sections";
import { BusinessModalCard } from "../modal";
import { GoPlus } from "react-icons/go";
import CustomerForm from "./forms/add-customer-form";
import CustomersTable from "../tables/customer-tables";

const CustomerContent = () => {
    const [listCount, setlistCount] = useState<number>(0);
    const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);

    const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);

    const {isNotifierOpen, setIsNotifier, isMobileMenuOpen, isPhoneView } = useDashboardContextHooks();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : null;
        }
        return 0;
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem("customer-listcount");
            if (stored !== null) {
                setlistCount(JSON.parse(stored));
            }
        }
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("customer-listcount", JSON.stringify(listCount));
        }
    }, [listCount]);

    const sectionVariant: Variants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            transition: { 
                duration: 0.3, 
                ease: [0.32, 0.72, 0, 1] 
            } 
        },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.4, 
                ease: [0.32, 0.72, 0, 1],
                staggerChildren: 0.05
            } 
        },
        exit: { 
            opacity: 0,
            y: -20,
            transition: { 
                duration: 0.25, 
                ease: [0.32, 0.72, 0, 1] 
            } 
        }
    };

    return(
        <div className="flex flex-col gap-y-5">
            {/* Dashboard Header Section o */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Customer Management</div>
                <button onClick={() => setShowCustomerForm(true)} className="flex items-center gap-x-3 py-2 px-4 rounded-md font-[550] bg-template-primary text-white text-sm">
                    <GoPlus size={25} />
                    <span>Add Customer</span>
                </button>
            </div>
            <AnimatePresence mode="wait">
                {listCount === 0 && (
                    <motion.div 
                        key="sales"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <CustomersTable />
                    </motion.div>
                )}
                {listCount === 3 && (
                    <motion.div 
                        key="login-attempts"
                        variants={sectionVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
                    >
                        <LoginAttemptsTable />
                    </motion.div>
                )}
            </AnimatePresence>
            {isNotifierOpen && <NotificationCard setIsOpen={setIsNotifier} />}
            {/* <TransactionInvoice /> */}
            {isMobileMenuOpen && (
                <MobileSideBar isOpen={isMobileMenuOpen} />
            )}
            <MobileNavbar />
            {showBusinessModal && (
                <BusinessModalCard onClose={() => setShowBusinessModal(false)} />
            )}
            {showCustomerForm && (
                <CustomerForm business_id={businessId} handleFormClose={() => setShowCustomerForm(false)} />
            )}
        </div>
    );
}

export default CustomerContent;