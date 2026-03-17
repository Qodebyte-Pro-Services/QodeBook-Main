"use client";

import React, { useRef, useState, ClipboardEvent, KeyboardEvent, ChangeEvent, useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { RiLoader4Line } from "react-icons/ri";
import { useCustomStyles } from "@/hooks";
import { toast } from "sonner";
import { useResendOtpAuth, useVerifyOtpAuth } from "@/hooks/staff-controller";
import { CgSpinnerAlt } from "react-icons/cg";
import Cookies from "js-cookie";

// Define strict types for the component
interface VerifyCodeContentProps {
    id: string;
}

const VerifyCodeContent: React.FC<VerifyCodeContentProps> = ({ id }) => {
    const router = useRouter();
    const [staffId] = useState<string>(() => id);
    const { hiddenScrollbar } = useCustomStyles();

    const [isResendOtpLoading, setIsResendOtpLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(30);

    // State for the 6-digit code
    const [code, setCode] = useState<string[]>(new Array(6).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const verifyHandler = useVerifyOtpAuth();
    const resendOtpHandler = useResendOtpAuth();

    // Refs to manage input focus
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus the first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newCode = [...code];
        // Allow only the last entered character if multiple are somehow entered (though maxLength handles this mostly)
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        // Move to next input if value is entered
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }

        // Trigger generic "submit" or validation if all fields filled? 
        // For now, user clicks button.
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0 && inputRefs.current[index - 1]) {
            // If backspace pressed on empty field, move to previous
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        let timer = 10;
        let interval: NodeJS.Timeout;
        if (isResendOtpLoading) {
            interval = setInterval(() => {
                timer--;
                if (timer === 0) {
                    clearInterval(interval);
                    setIsResendOtpLoading(false);
                }
            }, 1000);
        }
        return () => {
            clearInterval(interval);
            setIsResendOtpLoading(false);
        }
    }, [isResendOtpLoading]);

    const businessId = useMemo(() => {
        return sessionStorage.getItem("selectedBusinessId") ? +(sessionStorage.getItem("selectedBusinessId") as string) : 0;
    }, []);

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        if (!pastedData) return;

        // Extract first 6 digits
        const pastedCode = pastedData.replace(/\D/g, "").slice(0, 6).split("");

        const newCode = [...code];
        pastedCode.forEach((digit, i) => {
            newCode[i] = digit;
        });
        setCode(newCode);

        // Focus the input after the last pasted digit
        const nextIndex = Math.min(pastedCode.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleResendOtp = async () => {
        if (!id && !id?.trim()) {
            toast.error("Staff ID not detected");
            return;
        }
        const resendPayload = {
            staff_id: id,
            business_id: businessId,
            purpose: "login"
        }
        setIsResendOtpLoading(true);
        try {
            await resendOtpHandler.mutateAsync(resendPayload, {
                onSuccess(data) {
                    toast.success(data?.message || "OTP Resent Successfully");
                },
                onError(err) {
                    if (err instanceof Error) {
                        throw new Error(err.message || "Failed To Resend OTP");
                    }
                    throw new Error("Unexpected error occurred, Failed To Resend OTP");
                }
            });
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message || "Failed To Resend OTP");
                return;
            }
            toast.error("Failed To Resend OTP", {
                description: "Unexpected error occurred while trying to resend OTP. Please try again later."
            });
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            toast.error("Please enter the complete 6-digit code.");
            return;
        }

        const payload = {
            staff_id: staffId ? staffId : "",
            business_id: businessId,
            otp: fullCode,
            purpose: "login"
        }

        setIsSubmitting(true);

        try {
            await verifyHandler.mutateAsync(payload, {
                onSuccess(data) {
                    setIsSubmitting(false);
                    toast.success(data?.message || "Verification Successful");
                    Cookies.set("authToken", data?.token, {
                        expires: 1
                    });
                    Cookies.set("authActiveUser", "Staff", {
                        expires: 1
                    });
                    Cookies.set("authStaffId", data?.staff?.staff_id, {
                        expires: 1
                    });
                    const { role, permissions, full_name, email } = data?.staff;
                    const staffRoles = {
                        role,
                        permissions
                    }
                    const staff_details = {
                        full_name,
                        email
                    }
                    Cookies.set("staff_roles", JSON.stringify(staffRoles), {
                        expires: 1
                    });
                    Cookies.set("staff_details", JSON.stringify(staff_details), {
                        expires: 1
                    });
                    sessionStorage.setItem("selectedBusinessId", data?.staff?.business_id);
                    sessionStorage.setItem("selectedBranchId", data?.staff?.branch_id);
                    if (permissions.includes("create_sale") || permissions.includes("_sale") || permissions.includes("_sales")) {
                        router.push("/pos");
                        return;
                    }

                    router.push("/");
                },
                onError(err) {
                    console.log(err);
                    setIsSubmitting(false);
                    if (err instanceof Error) {
                        throw new Error(err.message || "Failed To Verify OTP");
                    }
                    throw new Error("Unexpected error occurred, Failed To Verify OTP");
                }
            });
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message || "Failed To Verify OTP");
                return;
            }
            toast.error("Failed To Verify OTP", {
                description: "Unexpected error occurred while trying to verify OTP. Please try again later."
            });
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    return (
        <motion.div
            className="w-[95%] my-auto h-fit sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[45%] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-7 lg:mt-0"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
            <div className="w-full flex flex-col gap-y-6 p-8">
                <motion.div
                    className="w-full h-[80px]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Image
                        width={500}
                        height={500}
                        className="w-[60%] mx-auto h-full object-contain object-center"
                        src={"/images/image 790.png"}
                        alt="Qodebook Logo"
                        priority
                    />
                </motion.div>

                <div className="max-h-[65dvh] overflow-y-auto overflow-x-hidden" style={hiddenScrollbar}>
                    <motion.div
                        className="w-full h-fit flex flex-col gap-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div className="flex flex-col gap-y-2 text-center" variants={itemVariants}>
                            <h1 className="text-3xl font-bold text-gray-800">Verification</h1>
                            <p className="text-gray-500">
                                Enter the 6-digit code sent to your email to verify your identity.
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="w-full space-y-8 mt-4">
                            <motion.div
                                className="flex justify-between items-center gap-2 sm:gap-4"
                                variants={containerVariants}
                            >
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-template-primary transition-all duration-200
                                            ${digit ? "border-template-primary bg-blue-50" : "border-gray-300 bg-white"}
                                        `}
                                    />
                                ))}
                            </motion.div>

                            <motion.div
                                className="pt-4"
                                variants={itemVariants}
                            >
                                <button
                                    type="submit"
                                    disabled={isSubmitting || code.some(d => !d)}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none transition-all ${isSubmitting || code.some(d => !d)
                                        ? 'bg-template-primary/60 cursor-not-allowed'
                                        : 'bg-template-primary hover:bg-template-primary/90 cursor-pointer shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RiLoader4Line className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                            Verifying...
                                        </>
                                    ) : 'Verify Code'}
                                </button>
                            </motion.div>
                        </form>

                        <motion.div
                            className="text-center text-sm text-gray-600 mt-4"
                            variants={itemVariants}
                        >
                            Didn&apos;t receive the code?{' '}
                            <button
                                type="button"
                                className="font-medium text-template-primary flex items-center gap-x-1 hover:underline focus:outline-none"
                                onClick={() => handleResendOtp()}
                            >
                                {isResendOtpLoading ? (
                                    <>
                                        <CgSpinnerAlt size={16} className="animate-spin" />
                                        Resending...
                                    </>
                                ) : 'Resend Code'}
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default VerifyCodeContent;