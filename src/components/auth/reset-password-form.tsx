/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
"use client";

import Image from "next/image";
import React, { memo, useEffect, useRef, useState } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { RiLoader4Line } from "react-icons/ri";
import { motion, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCustomStyles } from "@/hooks";
import { useRouter } from "next/navigation";
import { userResetpasswordController } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ResetPasswordResponse, ResetPasswordTypes } from "@/models/types/shared/auth-type";


type ResetPasswordData = ResetPasswordTypes;

interface InputFieldProps {
    name: keyof ResetPasswordData;
    label: string;
    type?: string;
    isPassword?: boolean;
    isConfirmPassword?: boolean;
    register: any;
    passwordRef?: React.ForwardedRef<HTMLInputElement>;
    errors: any;
    isPasswordVisible: boolean;
    setIsPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputField = memo(({
    name,
    label,
    type = 'text',
    isPassword = false,
    register,
    errors,
    isPasswordVisible,
    passwordRef,
    setIsPasswordVisible,
}: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (errors[name]) {
            delete errors[name];
        }
        const { value } = e.target;
        setHasValue(!!value);
        register.onChange(e);

        if (value.trim() !== '') {
            register.onBlur(e);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (register.onFocus) register.onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (register.onBlur) register.onBlur(e);
    };

    useEffect(() => {
        const input = document.getElementById(name) as HTMLInputElement;
        if (input) {
            setHasValue(!!input.value);

            const handleAnimationStart = () => {
                setHasValue(!!input.value);
            };

            input.addEventListener('animationstart', handleAnimationStart);
            return () => {
                input.removeEventListener('animationstart', handleAnimationStart);
            };
        }
    }, [name]);

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
            className="w-full relative"
            variants={itemVariants}
        >
            <input
                {...register}
                id={name}
                ref={passwordRef}
                type={isPassword ? (isPasswordVisible ? 'text' : 'password') : type}
                className={`w-full rounded-lg pt-4 pb-1 px-4 border border-gray-500 text-[14px] focus:outline-none transition-all ${errors[name] ? 'border-red-500' : ''
                    }`}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete={isPassword ? 'new-password' : 'off'}
            />
            <label
                htmlFor={name}
                className={`absolute left-4 text-sm transition-all duration-200 pointer-events-none ${isFocused || hasValue
                    ? 'top-[-18%] text-xs bg-white px-1'
                    : 'top-1/2 -translate-y-1/2 text-gray-500'
                    }`}
            >
                {label}
            </label>
            {(isPassword) && (
                <button
                    type="button"
                    onClick={() => setIsPasswordVisible(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                >
                    {isPasswordVisible ? (
                        <IoIosEyeOff size={20} />
                    ) : (
                        <IoIosEye size={20} />
                    )}
                </button>
            )}
        </motion.div>
    );
});

const validateRequired = (value: string, fieldName: string): string | true => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    return true;
};

const validatePassword = (password: string): string | true => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return true;
};

const ResetPasswordForm = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { hiddenScrollbar } = useCustomStyles();

    const passwordRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const resetMutation = userResetpasswordController();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty, isSubmitting: isFormSubmitting },
        setError,
        clearErrors,
        setValue,
        reset,
        trigger
    } = useForm<ResetPasswordData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            newPassword: '',
        },
        criteriaMode: 'all'
    });

    const validateField = (name: keyof ResetPasswordData, value: any): boolean => {
        let error: string | true = true;

        switch (name) {
            case 'newPassword':
                error = validatePassword(value);
                break;
        }

        if (error !== true) {
            setError(name, { type: 'manual', message: error });
            return false;
        }

        clearErrors(name);
        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setValue(name as keyof ResetPasswordData, fieldValue as never, { shouldValidate: true });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        if (fieldValue || type === 'checkbox') {
            validateField(name as keyof ResetPasswordData, fieldValue);
        }
    };

    const loginField = (name: keyof ResetPasswordData) => {
        const field = register(name, {
            onChange: handleInputChange,
            onBlur: handleBlur,
            validate: (value: any) => validateField(name, value)
        });

        return {
            ...field,
            name,
            'aria-invalid': Boolean(errors[name])
        };
    };

    const onSubmit = async (formData: ResetPasswordData) => {
        const isValid = await trigger();
        if (!isValid) return;

        setIsSubmitting(true);

        try {
            await resetMutation.mutateAsync({
                newPassword: formData.newPassword,
            }, {
                onSuccess: async (data) => {
                    const { message } = data as ResetPasswordResponse;
                    toast.success(message);
                    reset();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.push(`/login`);
                    setIsSubmitting(false);
                },
                onError: (error) => {
                    console.error('Login error:', error);
                    reset();
                    toast.error(error.message || 'Login failed. Please try again.');
                    setError('root', {
                        type: 'manual',
                        message: error.message || 'Login failed. Please try again.'
                    });
                    setIsSubmitting(false);
                }
            });
        } catch (err) {
            console.error('Reset error:', err);
            if (err instanceof Error) toast.error(err?.message || 'Reset failed. Please try again.');
            setError('root', {
                type: 'manual',
                message: err instanceof Error ? err?.message : 'Reset failed. Please try again.'
            });
            setIsSubmitting(false);
        }


        setIsSubmitting(false);
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
            className="w-[95%] sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[45%] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-7 lg:mt-0 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
                        <motion.div className="flex flex-col gap-y-2" variants={itemVariants}>
                            <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
                            <p className="text-gray-500">Enter the registered email address, the correct otp code and the new password to reset your password.</p>
                        </motion.div>

                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={containerVariants}>
                                <div className="md:col-span-2 w-full">
                                    <InputField
                                        name="newPassword"
                                        label="Password"
                                        isPassword
                                        register={{
                                            ...loginField("newPassword"),
                                            ref: (ref: HTMLInputElement) => {
                                                if (ref) {
                                                    passwordRef.current = ref;
                                                }
                                            }
                                        }}
                                        passwordRef={passwordRef}
                                        errors={errors}
                                        isPasswordVisible={isPasswordVisible}
                                        setIsPasswordVisible={setIsPasswordVisible}
                                    />
                                </div>

                                <motion.div
                                    className="lg:col-span-2 pt-2"
                                    variants={itemVariants}
                                >
                                    <button
                                        type="submit"
                                        disabled={(!isValid || !isDirty) && isFormSubmitting}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none transition-colors ${(!isValid || !isDirty) && isFormSubmitting
                                            ? 'bg-template-primary/40 cursor-not-allowed'
                                            : 'bg-template-primary cursor-pointer'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RiLoader4Line className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                                Resetting Password...
                                            </>
                                        ) : 'Reset Password'}
                                    </button>
                                </motion.div>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ResetPasswordForm;