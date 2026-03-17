"use client";

import Image from "next/image";
import React from "react";
import { AuthButton } from "../ui";
import { useCustomStyles } from "@/hooks";
import { motion } from "framer-motion";

const RegistrationSuccessful = () => {
    const { customScrollbar } = useCustomStyles();

    return (
        <div className="w-[95%] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] mx-auto bg-white py-8 rounded-md mt-6 my-auto lg:mt-0">
            <div className="w-full flex flex-col gap-y-6">
                <div className="w-full h-[40px]">
                    <Image width={500} height={500} className="w-[50%] mx-auto h-full object-contain object-center" src={"/images/image 790.png"} alt="Qodebook Logo" />
                </div>
                <motion.div
                    className="relative w-32 h-32 mx-auto flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{
                        scale: 1,
                        transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                        }
                    }}
                >
                    {/* Animated circle background */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-green-100"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            transition: {
                                delay: 0.1,
                                duration: 0.5
                            }
                        }}
                    />

                    {/* Animated checkmark */}
                    <motion.svg
                        className="relative z-10 w-3/5 h-3/5"
                        viewBox="0 0 52 52"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <motion.path
                            d="M14.1 27.2l7.1 7.2 16.7-16.8"
                            stroke="#10B981"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: 1,
                                transition: {
                                    delay: 0.3,
                                    duration: 0.6,
                                    ease: "easeOut"
                                }
                            }}
                        />

                        {/* Animated circle outline */}
                        <motion.circle
                            cx="26"
                            cy="26"
                            r="24"
                            stroke="#10B981"
                            strokeWidth="4"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: 1,
                                transition: {
                                    duration: 0.8,
                                    ease: "easeInOut"
                                }
                            }}
                        />
                    </motion.svg>

                    {/* Pulsing effect */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-green-100"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{
                            scale: 1.5,
                            opacity: 0,
                            transition: {
                                repeat: Infinity,
                                repeatDelay: 2,
                                duration: 1.5,
                                ease: "easeOut"
                            }
                        }}
                    />
                </motion.div>
                <div className="max-h-[65dvh] overflow-y-auto overflow-x-hidden px-10" style={customScrollbar}>
                    <div className="w-full h-fit flex flex-col gap-y-8">
                        <div className="flex flex-col items-center gap-y-4">
                            <div className="text-[25px] text-center leading-8 md:leading-none md:text-[30px] font-[550]">Registration Successful</div>
                            <div className="text-[13px] md:text-[15px] text-center text-auth-basic/70 font-[400]">Your registration has been successful. You can now access the Dashboard.</div>
                        </div>
                        <AuthButton handleUserClick={() => location.href = "/"} className="py-2 px-4 mt-2 cursor-pointer w-full text-white text-sm font-[550] bg-template-primary rounded-sm" id="auth-dashboard-btn">Dashboard</AuthButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegistrationSuccessful;