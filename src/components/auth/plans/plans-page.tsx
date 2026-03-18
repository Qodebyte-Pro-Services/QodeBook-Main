"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PlanCard, { type PlanData } from "./plan-card";
import PaymentGatewayModal from "./payment-gateway-modal";
import EnterpriseModal from "./enterprise-modal";

const plansData: PlanData[] = [
    {
        id: "basic",
        name: "Basic",
        price: 35000,
        period: "month",
        description: "Small shops and single-location businesses",
        icon: "zap",
        gradient: "bg-gradient-to-br from-emerald-500 to-green-600",
        accentColor: "emerald",
        features: [
            { text: "Single branch (1 store location)", included: true },
            { text: "POS sales & receipt printing", included: true },
            { text: "Inventory management", included: true },
            { text: "Customer management", included: true },
            { text: "Basic sales reports (daily, monthly)", included: true },
            { text: "Staff accounts (limited)", included: true },
            { text: "Cloud backup", included: true },
            { text: "Email support", included: true },
            { text: "No multi-branch support", included: false },
            { text: "Limited users", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: 50000,
        period: "month",
        description: "For growing businesses with multiple branches",
        icon: "crown",
        gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
        accentColor: "amber",
        popular: true,
        features: [
            { text: "Multiple branches (multi-location support)", included: true },
            { text: "Centralized dashboard for all branches", included: true },
            { text: "Advanced sales & inventory analytics", included: true },
            { text: "Unlimited staff accounts", included: true },
            { text: "Branch-level reporting & performance comparison", included: true },
            { text: "Cloud sync & real-time updates", included: true },
            { text: "Export reports (Excel, PDF)", included: true },
            { text: "Priority email & chat support", included: true },
            { text: "SLA & priority enterprise support", included: false },
        ],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        period: "quote",
        description: "Large companies, franchises, and custom deployments",
        icon: "building",
        gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
        accentColor: "violet",
        features: [
            { text: "Unlimited branches and users", included: true },
            { text: "Custom features & modules", included: true },
            { text: "Dedicated account manager", included: true },
            { text: "API integrations (accounting, ERP, CRM)", included: true },
            { text: "Custom analytics & reporting dashboards", included: true },
            { text: "Private cloud or on-premise deployment options", included: true },
            { text: "SLA & priority enterprise support", included: true },
            { text: "Custom billing and invoicing", included: true },
        ],
    },
];

const PlansPage = () => {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

    const handlePlanSelect = (plan: PlanData) => {
        if (plan.id === "enterprise") {
            setEnterpriseModalOpen(true);
        } else {
            setSelectedPlan(plan);
            setPaymentModalOpen(true);
        }
    };

    return (
        <div className="w-full h-screen  overflow-y-auto scrollbar-hide overflow-x-hidden">
            <div className="h-fit py-8 md:py-12 px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10 md:mb-14"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.10] border border-white/[0.1] mb-4"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                            Choose Your Plan
                        </span>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
                        QodeBook{" "}
                        <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                            Pricing
                        </span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-900 max-w-lg mx-auto leading-relaxed">
                        Start with the plan that fits your business. Upgrade anytime as you
                        scale.
                    </p>
                </motion.div>

                {/* Plans grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
                    {plansData.map((plan, index) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            index={index}
                            onSelect={handlePlanSelect}
                        />
                    ))}
                </div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-xs text-gray-900 mt-8 md:mt-12"
                >
                    All plans include a 14-day free trial • No credit card required •
                    Cancel anytime
                </motion.p>

                {/* Modals */}
                <PaymentGatewayModal
                    open={paymentModalOpen}
                    onOpenChange={setPaymentModalOpen}
                    plan={selectedPlan}
                />
                <EnterpriseModal
                    open={enterpriseModalOpen}
                    onOpenChange={setEnterpriseModalOpen}
                />
            </div>
        </div>
    );
};

export default PlansPage;
