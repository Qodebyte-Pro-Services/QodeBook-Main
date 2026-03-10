"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-template-primary/35 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-template-blue/35 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl w-full text-center z-10"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1, type: "spring", stiffness: 100 }}
                    className="relative w-full rounded-lg aspect-square max-w-[400px] h-[230px] md:h-[350px] overflow-hidden mx-auto mb-8 drop-shadow-2xl"
                >
                    <Image
                        src="/images/404-illustration.png"
                        alt="404 Error - Page Not Found"
                        fill
                        className="w-full h-full object-cover object-center mix-blend-screen rounded-lg"
                        priority
                    />
                </motion.div>

                <div className="space-y-1">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-7xl font-black text-template-primary tracking-tighter"
                    >
                        404
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-foreground">Lost in the pipeline?</h2>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            The page you&apos;re looking for seems to have leaked out of our system or hasn&apos;t been installed yet.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 mt-5 md:mt-10"
                >
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-3 bg-template-primary hover:bg-template-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-lg active:scale-95 group"
                    >
                        <Home size={18} />
                        Back to Dashboard
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1 }}
                    className="text-xs font-medium uppercase tracking-[0.2em] mt-16 text-muted-foreground"
                >
                    Gas Management System
                </motion.p>
            </motion.div>
        </div>
    );
}

export default NotFound;