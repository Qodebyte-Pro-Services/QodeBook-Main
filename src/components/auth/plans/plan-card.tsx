"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2 } from "lucide-react";

interface PlanFeature {
    text: string;
    included: boolean;
}

export interface PlanData {
    id: string;
    name: string;
    price: number | string;
    period: string;
    description: string;
    features: PlanFeature[];
    popular?: boolean;
    icon: "zap" | "crown" | "building";
    gradient: string;
    accentColor: string;
}

interface PlanCardProps {
    plan: PlanData;
    index: number;
    onSelect: (plan: PlanData) => void;
}

const iconMap = {
    zap: Zap,
    crown: Crown,
    building: Building2,
};

const PlanCard = ({ plan, index, onSelect }: PlanCardProps) => {
    const Icon = iconMap[plan.icon];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative group"
        >
            {/* Popular badge */}
            {plan.popular && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/30 tracking-wide uppercase">
                        Most Popular
                    </div>
                </motion.div>
            )}

            {/* Card */}
            <div
                className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500
          ${plan.popular
                        ? "border-amber-500/40 shadow-xl shadow-amber-500/10 bg-white/[0.12] backdrop-blur-2xl"
                        : "border-white/[0.08] shadow-lg bg-white/[0.07] backdrop-blur-xl hover:border-white/20"
                    }
        `}
            >
                <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${plan.gradient}`}
                    style={{ filter: "blur(80px)" }}
                />

                <div className="relative p-7 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                        <div
                            className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${plan.gradient} shadow-lg`}
                        >
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            <p className="text-xs text-white/50">{plan.description}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-white tracking-tight">
                                {(plan.price as number)?.toLocaleString("default", { style: "currency", currency: "NGN", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm text-white/40 font-medium">
                                /{plan.period}
                            </span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-6" />

                    <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15 + i * 0.05 + 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${feature.included
                                        ? `${plan.gradient} shadow-sm`
                                        : "bg-white/[0.06]"
                                        }`}
                                >
                                    <Check
                                        className={`w-3 h-3 ${feature.included ? "text-white" : "text-white/20"
                                            }`}
                                    />
                                </div>
                                <span
                                    className={`text-sm ${feature.included ? "text-white/80" : "text-white/30 line-through"
                                        }`}
                                >
                                    {feature.text}
                                </span>
                            </motion.li>
                        ))}
                    </ul>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(plan)}
                        className={`
              w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer
              ${plan.popular
                                ? `${plan.gradient} text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30`
                                : "bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/[0.08] hover:border-white/20"
                            }
            `}
                    >
                        {plan.id === "enterprise" ? "Contact Sales" : "Get Started"}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default PlanCard;
