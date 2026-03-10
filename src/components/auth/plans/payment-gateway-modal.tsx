"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Landmark, ArrowRight, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { PlanData } from "./plan-card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentGatewayModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: PlanData | null;
}

const gateways = [
    {
        id: "stripe",
        name: "Stripe",
        description: "Credit/Debit Cards",
        icon: CreditCard,
        color: "from-indigo-500 to-purple-600",
        shadowColor: "shadow-indigo-500/20",
    },
    {
        id: "paypal",
        name: "PayPal",
        description: "PayPal Account",
        icon: ShieldCheck,
        color: "from-blue-500 to-cyan-500",
        shadowColor: "shadow-blue-500/20",
    },
    {
        id: "flutterwave",
        name: "Flutterwave",
        description: "African Payments",
        icon: Landmark,
        color: "from-orange-500 to-yellow-500",
        shadowColor: "shadow-orange-500/20",
    },
    {
        id: "bank",
        name: "Bank Transfer",
        description: "Direct Transfer",
        icon: Landmark,
        color: "from-emerald-500 to-teal-500",
        shadowColor: "shadow-emerald-500/20",
    },
];

const PaymentGatewayModal = ({
    open,
    onOpenChange,
    plan,
}: PaymentGatewayModalProps) => {
    const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={true}
                className="sm:max-w-lg bg-white/20 backdrop-blur-2xl border-white/[0.08] text-white p-0 overflow-hidden"
            >
                <div
                    className={`h-1.5 w-full bg-gradient-to-r ${plan?.gradient || "from-green-500 to-emerald-500"}`}
                />

                <div className="p-6 pt-2">
                    <DialogHeader className="mb-5 pb-0">
                        <DialogTitle className="text-xl font-bold text-white">
                            Choose Payment Method
                        </DialogTitle>
                        <DialogDescription className="text-white/50 text-sm">
                            {plan && (
                                <span className="flex items-center gap-2 mt-1">
                                    <span className="font-medium text-white/70">
                                        {plan.name} Plan
                                    </span>
                                    <span className="text-white/30">•</span>
                                    <span className="font-bold text-white/90">
                                        {plan.price}
                                        <span className="font-normal text-white/40">
                                            /{plan.period}
                                        </span>
                                    </span>
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <AnimatePresence>
                            {gateways.map((gw, i) => {
                                const GwIcon = gw.icon;
                                const isSelected = selectedGateway === gw.id;

                                return (
                                    <motion.button
                                        key={gw.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setSelectedGateway(gw.id)}
                                        className={`
                      relative p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer
                      ${isSelected
                                                ? `border-white/25 bg-gradient-to-r from-white/[0.1] via-white/40 to-white/10 ${gw.shadowColor} shadow-lg`
                                                : "border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.12]"
                                            }
                    `}
                                    >
                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <motion.div
                                                layoutId="gateway-selected"
                                                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gw.color} opacity-[0.08]`}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}

                                        <div className="relative z-10">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${gw.color} shadow-md`}
                                            >
                                                <GwIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-white mb-0.5">
                                                {gw.name}
                                            </h4>
                                            <p className="text-xs text-white/40">{gw.description}</p>
                                        </div>

                                        {/* Check mark */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br ${gw.color} flex items-center justify-center`}
                                            >
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Proceed button */}
                    <motion.button
                        whileHover={{ scale: selectedGateway ? 1.01 : 1 }}
                        whileTap={{ scale: selectedGateway ? 0.99 : 1 }}
                        disabled={!selectedGateway}
                        onClick={async () => {
                            toast.success("System not fully built", {
                                description: "But you'll be redirected to the dashboard, in next few seconds"
                            });
                            await new Promise(res => setTimeout(res, 2000));
                            router.replace("/registration-successful");
                        }}
                        className={`
              w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer
              ${selectedGateway
                                ? `bg-gradient-to-r ${plan?.gradient || "from-green-500 to-emerald-500"} text-white shadow-lg hover:shadow-xl`
                                : "bg-white/[0.06] text-white/30 cursor-not-allowed"
                            }
            `}
                    >
                        Proceed to Payment
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    {/* Security note */}
                    <p className="text-center text-xs text-white/30 mt-4 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Secured with 256-bit SSL encryption
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentGatewayModal;
