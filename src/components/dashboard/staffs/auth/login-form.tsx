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
import { toast } from "sonner";
import { AuthSiginTypes, AuthSignInResponse } from "@/models/types/shared/auth-type";
import Cookies from "js-cookie";
import { useStaffAuth } from "@/hooks/staff-controller";


type LoginFormData = AuthSiginTypes;

interface InputFieldProps {
    name: keyof LoginFormData;
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

const validateEmail = (email: string): string | true => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Please enter a valid email address";
    }
    return true;
};

const validatePassword = (password: string): string | true => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return true;
};

const StaffLoginForm = ({ id }: { id: string }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { hiddenScrollbar } = useCustomStyles();
    const passwordRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const loginMutation = useStaffAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty, isSubmitting: isFormSubmitting },
        setError,
        clearErrors,
        setValue,
        trigger
    } = useForm<LoginFormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
        },
        criteriaMode: 'all'
    });

    useEffect(() => {
        const handleTokenCheck = async () => {
            try {
                const authToken = Cookies.get("authToken");
                if (authToken) {
                    toast.success("You are already logged in");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.push("/");
                }
            } catch (err) {
                console.log(err);
            }
        }
        handleTokenCheck();
        return () => {
            handleTokenCheck();
        }
    }, []);

    const validateField = (name: keyof LoginFormData, value: any): boolean => {
        let error: string | true = true;

        switch (name) {
            case 'email':
                error = validateRequired(value, 'Email') === true ? validateEmail(value) : validateRequired(value, 'Email');
                break;
            case 'password':
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

        setValue(name as keyof LoginFormData, fieldValue as never, { shouldValidate: true });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        if (fieldValue || type === 'checkbox') {
            validateField(name as keyof LoginFormData, fieldValue);
        }
    };

    const loginField = (name: keyof LoginFormData) => {
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

    const onSubmit = async (formData: LoginFormData) => {
        const isValid = await trigger();
        if (!isValid) return;

        const payload = {
            email: formData.email,
            password: formData.password,
            business_id: +id
        }

        setIsSubmitting(true);

        try {
            await loginMutation.mutateAsync(payload, {
                onSuccess: async (data) => {
                    toast.success(data?.message || "Login Successful");
                    sessionStorage.setItem("selectedBusinessId", data?.business_id.toString());
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setIsSubmitting(false);
                    if ("requiresOtp" in data && data?.requiresOtp) {
                        router.push(`/staff/verify?id=${data?.staff_id}`);
                        return;
                    }
                    Cookies.set("authToken", data?.token || "", {
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
                    };
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
                onError: (error) => {
                    console.error('Login error:', error);
                    toast.error(error.message || 'Login failed. Please try again.');
                    setError('root', {
                        type: 'manual',
                        message: error.message || 'Login failed. Please try again.'
                    });
                    setIsSubmitting(false);
                }
            });
        } catch (err) {
            console.error('Login error:', err);
            if (err instanceof Error) toast.error(err?.message || 'Login failed. Please try again.');
            setError('root', {
                type: 'manual',
                message: err instanceof Error ? err?.message : 'Login failed. Please try again.'
            });
            setIsSubmitting(false);
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
                        alt="Gas Station Logo"
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
                            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
                            <p className="text-gray-500">Login To Access Your Travelwise Account</p>
                        </motion.div>

                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={containerVariants}>
                                <div className="md:col-span-2 w-full">
                                    <InputField
                                        name="email"
                                        label="Email"
                                        type="email"
                                        register={loginField("email")}
                                        errors={errors}
                                        isPasswordVisible={isPasswordVisible}
                                        setIsPasswordVisible={setIsPasswordVisible}
                                    />
                                </div>
                                <div className="md:col-span-2 w-full">
                                    <InputField
                                        name="password"
                                        label="Password"
                                        isPassword
                                        register={{
                                            ...loginField("password"),
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
                                        disabled={!isValid || !isDirty || isFormSubmitting}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none transition-colors ${!isValid || !isDirty || isFormSubmitting
                                            ? 'bg-template-primary/40 cursor-not-allowed'
                                            : 'bg-template-primary cursor-pointer'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RiLoader4Line className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                                User Logining...
                                            </>
                                        ) : 'Login Here'}
                                    </button>
                                </motion.div>
                            </motion.div>
                        </form>

                        <motion.div
                            className="text-center text-sm text-gray-600"
                            variants={itemVariants}
                        >
                            Don&apos;t have an account?{' '}
                            <a href="/register" className="font-medium text-template-primary">
                                Sign up
                            </a>
                        </motion.div>
                        <motion.div
                            className="text-center text-sm text-gray-600"
                            variants={itemVariants}
                        >
                            forgot password?{' '}
                            <a href="/forgot-password" className="font-medium text-template-primary">
                                forgot password
                            </a>
                        </motion.div>

                        <motion.div
                            className="relative mt-2"
                            variants={itemVariants}
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default StaffLoginForm;