"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 text-center"
            >
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-4 bg-red-50 rounded-2xl">
                        <ShieldAlert className="w-16 h-16 text-red-500" />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-slate-900 mb-2"
                >
                    Access Denied
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-500 mb-8"
                >
                    You don&apos;t have the required permissions to access this page. Please contact your administrator if you believe this is an error.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-3"
                >
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-template-primary text-white rounded-xl font-semibold hover:bg-template-primary/80 transition-all active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 pt-6 border-t border-slate-100"
                >
                    <p className="text-xs text-slate-400">
                        Error Code: 403 Forbidden
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
