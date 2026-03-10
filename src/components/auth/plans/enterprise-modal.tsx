"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone,
    Mail,
    MapPin,
    Globe,
    CalendarDays,
    MessageSquare,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import AppointmentForm from "./appointment-form";
import { FaWhatsapp } from "react-icons/fa6";

interface EnterpriseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const tabs = [
    { id: "contact", label: "Contact", icon: MessageSquare },
    { id: "appointment", label: "Appointment", icon: CalendarDays },
];

const contactInfo = [
    {
        icon: Phone,
        label: "Phone",
        value: "+(234) 9134 697 313",
        href: "tel:+2349134697313",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: Mail,
        label: "Email",
        value: "enterprise@gasmanager.com",
        href: "mailto:enterprise@gasmanager.com",
        color: "from-purple-500 to-pink-500",
    },
    {
        icon: MapPin,
        label: "Address",
        value: "123 Business District, Coyez Mall, Enugu, Nigeria",
        href: "#",
        color: "from-orange-500 to-red-500",
    },
    {
        icon: FaWhatsapp,
        label: "Whatsapp",
        value: "Enterprise Support Team",
        href: "https://wa.me/2349134697313",
        color: "from-emerald-500 to-teal-500",
    },
];

const EnterpriseModal = ({ open, onOpenChange }: EnterpriseModalProps) => {
    const [activeTab, setActiveTab] = useState("contact");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={true}
                className="sm:max-w-[580px] bg-white/20 backdrop-blur-2xl border-white/[0.08] text-white p-0 overflow-hidden max-h-[90vh]"
            >
                <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

                <div className="p-6 pt-2 overflow-y-auto max-h-[calc(90vh-1.5rem)]">
                    <DialogHeader className="mb-4 pb-0">
                        <DialogTitle className="text-xl font-bold text-white">
                            Enterprise Solutions
                        </DialogTitle>
                        <DialogDescription className="text-white/50 text-sm">
                            Get in touch with our team for custom pricing and solutions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-5">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    relative flex-1 py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer
                    ${activeTab === tab.id
                                            ? "text-white"
                                            : "text-white/40 hover:text-white/60"
                                        }
                  `}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="enterprise-tab-indicator"
                                            className="absolute inset-0 bg-white/[0.1] rounded-lg border border-white/[0.08]"
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <TabIcon className="w-4 h-4" />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "contact" ? (
                            <motion.div
                                key="contact"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-xl border border-white/[0.06] p-5 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <span className="text-lg font-black text-white">G</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">
                                                Gas Manager Inc.
                                            </h3>
                                            <p className="text-xs text-white/40">
                                                Enterprise Solutions Division
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/50 leading-relaxed mb-1">
                                        Our enterprise team provides tailored solutions for
                                        large-scale gas management operations. Get dedicated support,
                                        custom integrations, and priority SLAs.
                                    </p>
                                </div>

                                <div className="space-y-2.5">
                                    {contactInfo.map((item, i) => {
                                        const ContactIcon = item.icon;
                                        return (
                                            <motion.a
                                                key={item.label}
                                                href={item.href}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group cursor-pointer"
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} shadow-md flex-shrink-0`}
                                                >
                                                    <ContactIcon className="w-4.5 h-4.5 text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-white/40 mb-0.5">
                                                        {item.label}
                                                    </p>
                                                    <p className="text-sm text-white/80 font-medium group-hover:text-white transition-colors truncate">
                                                        {item.value}
                                                    </p>
                                                </div>
                                            </motion.a>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <p className="text-xs text-white/40 mb-1">Working Hours</p>
                                    <p className="text-sm text-white/70 font-medium">
                                        Monday – Friday, 9:00 AM – 6:00 PM EST
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="appointment"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <AppointmentForm />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EnterpriseModal;
