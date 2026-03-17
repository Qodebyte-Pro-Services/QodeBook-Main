"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { AuthButton } from "../ui";
import { resendOtpCode } from "@/api/auth.verify-otp";
import { useCustomStyles } from "@/hooks";
import { RxCaretLeft, RxReload } from "react-icons/rx";
import { toast } from "sonner";
import { userVerification } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { AuthOtpResponse } from "@/models/types/shared/auth-type";
import Cookies from "js-cookie";

const OTP_RESEND_DELAY = 30;

const VerifyOtpLoginForm = () => {
    const { customScrollbar } = useCustomStyles();
    const otpInputRef = useRef<HTMLInputElement | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(OTP_RESEND_DELAY);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const otpCodeMutationHandler = userVerification();
    const { id } = useParams();
    const router = useRouter();

    const userEmail = Cookies.get("_email") ?? "";

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const onInputFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
        const inputTag = e.currentTarget;
        const labelTag = inputTag.nextElementSibling as HTMLLabelElement | null;
        if (!inputTag.value.trim()) {
            labelTag?.classList.add("-translate-y-[170%]", "text-[12px]!", "bg-white", "px-2");
        }
    }

    const onInputBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
        const inputTag = e.currentTarget;
        const labelTag = inputTag.nextElementSibling as HTMLLabelElement | null;
        if (!inputTag.value.trim()) {
            labelTag?.classList.remove("-translate-y-[170%]", "text-[12px]!", "bg-white", "px-2");
            return;
        }
        labelTag?.classList.add("-translate-y-[170%]", "text-[12px]!", "bg-white", "px-2");
    }

    const handleUserVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpInput = otpInputRef.current as HTMLInputElement;
        const otpCode = otpInput.value.trim();

        if (!otpCode) {
            toast.error("Please enter the verification code");
            return;
        }

        if (!/^\d+$/.test(otpCode)) {
            toast.error("Please enter a valid numeric code");
            return;
        }

        if (otpCode.length < 6) {
            toast.error("Verification code must be at least 6 digits");
            return;
        }

        setIsSubmitting(true);

        try {
            await otpCodeMutationHandler.mutateAsync(
                {
                    otp: otpCode,
                    user_id: id as string,
                    purpose: "reset"
                },
                {
                    onSuccess: async (data) => {
                        const { message, token } = data as AuthOtpResponse;
                        toast.success(message);

                        Cookies.set("authToken", token, {
                            expires: 1,
                            sameSite: "strict",
                            secure: process.env.NEXT_PUBLIC_NODE_ENV === "prod",
                        });

                        await new Promise(resolve => setTimeout(resolve, 1000));
                        router.replace("/reset-password");
                    },
                    onError: (error: Error) => {
                        console.error('Verification error:', error);
                        toast.error(error.message || 'Verification failed. Please try again.');
                    },
                }
            );
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error("An unexpected error occurred. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0 || isResending) return;

        setIsResending(true);
        try {
            await resendOtpCode({
                email: userEmail as string,
                purpose: "reset"
            });
            toast.success("New verification code sent successfully!");
            setResendTimer(OTP_RESEND_DELAY);
        } catch (error) {
            console.error('Resend error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
            toast.error(errorMessage);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="w-[95%] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] mx-auto bg-white py-8 rounded-md mt-7 lg:mt-0">
            <div className="w-full flex flex-col gap-y-6">
                <div className="w-full h-[70px]">
                    <Image width={500} height={500} className="w-[60%] mx-auto h-full object-contain object-center" src={"/images/image 790.png"} alt="Qodebook Logo" />
                </div>
                <div className="max-h-[65dvh] overflow-y-auto overflow-x-hidden px-10" style={customScrollbar}>
                    <div className="w-full h-fit flex flex-col gap-y-6">
                        <AuthButton className="bg-transparent flex gap-x-1 items-center text-sm font-[500] cursor-pointer" id="back-to-login">
                            <RxCaretLeft size={26} />
                            <div>Back To Login</div>
                        </AuthButton>
                        <div className="flex flex-col gap-y-2">
                            <div className="text-[25px] leading-8 md:leading-none md:text-[30px] font-[550]">Verify Code</div>
                            <div className="text-[13px] md:text-[15px] text-auth-basic/70 font-[400]">An authentication code has been sent to your email account</div>
                        </div>
                        <div className="flex flex-col gap-y-3">
                            <form action="#" className="w-full" onSubmit={handleUserVerification}>
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="w-full flex flex-col gap-y-1">
                                        <div className="w-full relative">
                                            <input
                                                onFocus={onInputFocus}
                                                onBlur={onInputBlur}
                                                type="text"
                                                ref={otpInputRef}
                                                name="otp-code"
                                                id="otp-code"
                                                className="w-full rounded-sm py-[12px] px-4 border-[1.2px] focus:outline-none border-auth-basic text-sm"
                                                inputMode="numeric"
                                                pattern="\d*"
                                                maxLength={6}
                                                disabled={isSubmitting}
                                                aria-describedby="otp-help"
                                            />
                                            <label htmlFor="otp-code" className="absolute left-[3%] top-2/4 -translate-y-2/4 text-[13.5px] font-[400] transition-all duration-300 ease-in-out">
                                                Authentication Code
                                            </label>
                                        </div>
                                        <p id="otp-help" className="text-xs text-gray-500 mt-1">
                                            Enter the 6-digit code sent to your email
                                        </p>
                                        <div className="text-[13px] font-[400] flex items-center gap-1">
                                            Didn&apos;t receive a code?
                                            <button
                                                type="button"
                                                onClick={handleResendCode}
                                                disabled={resendTimer > 0 || isResending}
                                                className={`${resendTimer > 0 || isResending ? 'text-gray-400 cursor-not-allowed' : 'text-template-primary cursor-pointer'} flex items-center gap-1`}
                                            >
                                                {isResending ? (
                                                    <>
                                                        <RxReload className="animate-spin" size={14} />
                                                        Sending...
                                                    </>
                                                ) : resendTimer > 0 ? (
                                                    `Resend in ${resendTimer}s`
                                                ) : (
                                                    'Resend Code'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <AuthButton
                                        className={`py-2 px-4 mt-4 w-full text-white text-sm font-[550] rounded-sm ${isSubmitting
                                            ? 'bg-template-primary/70 cursor-not-allowed'
                                            : 'bg-template-primary cursor-pointer'
                                            }`}
                                        type="submit"
                                        id="auth-verify-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Verifying...' : 'Verify'}
                                    </AuthButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtpLoginForm;