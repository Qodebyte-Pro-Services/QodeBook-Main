"use client";

import Image from "next/image";
import React, { useState } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { AuthButton } from "../ui";
import { useCustomStyles } from "@/hooks";

const SetPasswordForm = () => {
    const [isOnView, setIsOnView] = useState<boolean>(false);
    const [isConfirmOnView, setIsConfirmOnView] = useState<boolean>(false);
    const { customScrollbar } = useCustomStyles();

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

    const handleShowPassword = (e: React.MouseEvent<HTMLOrSVGElement>) => {
        const svgTag = e.currentTarget;
        const dataId = svgTag.dataset.id;
        if (dataId === "p1-btn") {
            setIsOnView(prev => !prev);
            return;
        }
        setIsConfirmOnView(prev => !prev);
    }

    return (
        <div className="w-[95%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] mx-auto bg-white py-8 rounded-md mt-6 lg:mt-0">
            <div className="w-full flex flex-col gap-y-6">
                <div className="w-full h-[70px]">
                    <Image width={500} height={500} className="w-[60%] mx-auto h-full object-contain object-center" src={"/images/image 790.png"} alt="Qodebook Logo" />
                </div>
                <div className="max-h-[65dvh] overflow-y-auto overflow-x-hidden px-10" style={customScrollbar}>
                    <div className="w-full h-fit flex flex-col gap-y-8">
                        <div className="flex flex-col gap-y-4">
                            <div className="text-[25px] leading-8 md:leading-none md:text-[30px] font-[550]">Set a password</div>
                            <div className="text-[13px] md:text-[15px] text-auth-basic/70 font-[400]">Your previous password has been reseted. Please set a new password for your account.</div>
                        </div>
                        <div className="flex flex-col gap-y-3">
                            <form action="#" className="w-full">
                                <div className="grid grid-cols-1 gap-7">
                                    <div className="w-full relative">
                                        <input onFocus={onInputFocus} onBlur={onInputBlur} type={isOnView ? "text" : "password"} name="password" id="password" className="w-full rounded-sm py-[12px] px-4 border-[1.2px] pr-[10%] focus:outline-none border-auth-basic text-sm" />
                                        <label htmlFor="password" className="absolute left-[3%] top-2/4 -translate-y-2/4 text-[14px] font-[400] transition-all duration-300 ease-in-out">Create Password</label>
                                        {!isOnView && (
                                            <IoIosEyeOff data-id="p1-btn" onClick={handleShowPassword} size={20} className="absolute top-2/4 right-[2%] -translate-y-2/4" />
                                        )}
                                        {isOnView && (
                                            <IoIosEye data-id="p1-btn" onClick={handleShowPassword} size={20} className="absolute top-2/4 right-[2%] -translate-y-2/4" />
                                        )}
                                    </div>
                                    <div className="w-full relative">
                                        <input onFocus={onInputFocus} onBlur={onInputBlur} type={isConfirmOnView ? "text" : "password"} name="confirm_password" id="confirm_password" className="w-full rounded-sm py-[12px] px-4 border-[1.2px] pr-[10%] focus:outline-none border-auth-basic text-sm" />
                                        <label htmlFor="confirm_password" className="absolute left-[3%] top-2/4 -translate-y-2/4 text-[14px] font-[400] transition-all duration-300 ease-in-out">Confirm Password</label>
                                        {!isOnView && (
                                            <IoIosEyeOff data-id="p2-btn" onClick={handleShowPassword} size={20} className="absolute top-2/4 right-[2%] -translate-y-2/4" />
                                        )}
                                        {isOnView && (
                                            <IoIosEye data-id="p2-btn" onClick={handleShowPassword} size={20} className="absolute top-2/4 right-[2%] -translate-y-2/4" />
                                        )}
                                    </div>
                                    <AuthButton className="py-2 px-4 mt-2 cursor-pointer w-full text-white text-sm font-[550] bg-template-primary rounded-sm" type="submit" id="auth-verify-btn">Verify</AuthButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SetPasswordForm;