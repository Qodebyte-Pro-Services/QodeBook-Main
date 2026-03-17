/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
"use client";

import Image from "next/image";
import React, { memo, useEffect, useRef, useState } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { RiFacebookCircleFill, RiLoader4Line } from "react-icons/ri";
import { motion, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCustomStyles } from "@/hooks";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useAuth";
import { GoogleSignInButton } from ".";
import { toast } from "sonner";
import { AuthResponse } from "@/models/types/shared/auth-type";
import Cookies from "js-cookie";


type RegisterFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
};

interface InputFieldProps {
    name: keyof RegisterFormData;
    label: string;
    type?: string;
    isPassword?: boolean;
    isConfirmPassword?: boolean;
    register: any;
    passwordRef?: React.ForwardedRef<HTMLInputElement>;
    errors: any;
    isPasswordVisible: boolean;
    isConfirmPasswordVisible: boolean;
    setIsPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setIsConfirmPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputField = memo(({
    name,
    label,
    type = 'text',
    isPassword = false,
    isConfirmPassword = false,
    register,
    errors,
    isPasswordVisible,
    isConfirmPasswordVisible,
    passwordRef,
    setIsPasswordVisible,
    setIsConfirmPasswordVisible
}: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const showPassword = isPassword ? isPasswordVisible : isConfirmPasswordVisible;
    const setShowPassword = isPassword ? setIsPasswordVisible : setIsConfirmPasswordVisible;

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
                type={isPassword || isConfirmPassword ? (showPassword ? 'text' : 'password') : type}
                className={`w-full rounded-lg pt-4 pb-1 px-4 border border-gray-500 text-[14px] focus:outline-none transition-all ${errors[name] ? 'border-red-500 focus:border-red-500' : ''
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
            {(isPassword || isConfirmPassword) && (
                <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? (
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
    if (password.length < 5) return "Password must be at least 5 characters";
    return true;
};

const validateConfirmPassword = (confirmPassword: string, password: string): string | true => {
    if (!confirmPassword) return "Confirm password is required";
    if (confirmPassword !== password) return "Passwords don't match";
    return true;
};

const validateTerms = (terms: boolean): string | true => {
    if (!terms) return "You must accept the terms and conditions";
    return true;
};


const RegisterForm = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { hiddenScrollbar } = useCustomStyles();

    const passwordRef = useRef<HTMLInputElement>(null);
    const [statusBar, setStatusBar] = useState({
        isUppercase: false,
        isLowercase: false,
        isNumber: false,
        isSymbol: false,
        isLengthValid: false,
        isValue: false
    });

    const handlePasswordStrength = (value: string) => {
        setStatusBar({
            isUppercase: /[A-Z]/.test(value),
            isLowercase: /[a-z]/.test(value),
            isNumber: /[0-9]/.test(value),
            isSymbol: /[^A-Za-z0-9]/.test(value),
            isLengthValid: value.length >= 8,
            isValue: value.length > 0
        });
    };

    const router = useRouter();
    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty, isSubmitting: isFormSubmitting },
        setError,
        clearErrors,
        setValue,
        getValues,
        trigger
    } = useForm<RegisterFormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            terms: false
        },
        criteriaMode: 'all'
    });

    const validateField = (name: keyof RegisterFormData, value: any): boolean => {
        let error: string | true = true;

        switch (name) {
            case 'firstName':
            case 'lastName':
                error = validateRequired(value, name === 'firstName' ? 'First name' : 'Last name');
                break;
            case 'email':
                error = validateRequired(value, 'Email') === true ? validateEmail(value) : validateRequired(value, 'Email');
                break;
            case 'phone':
                error = validateRequired(value, 'Phone number');
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(value, getValues('password'));
                break;
            case 'terms':
                error = validateTerms(value);
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

        setValue(name as keyof RegisterFormData, fieldValue as never, { shouldValidate: true });

        if (name === 'password') {
            handlePasswordStrength(value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        if (fieldValue || type === 'checkbox') {
            validateField(name as keyof RegisterFormData, fieldValue);
        }
    };

    const registerField = (name: keyof RegisterFormData) => {
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

    const onSubmit = async (formData: RegisterFormData) => {
        const isValid = await trigger();
        if (!isValid) return;

        if (formData.password !== formData.confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: 'Passwords do not match'
            });
            return;
        }

        if (!formData.terms) {
            setError('terms', {
                type: 'manual',
                message: 'You must accept the terms and conditions'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await registerMutation.mutateAsync({
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                is_social_media: false
            }, {
                onSuccess: async (data) => {
                    const { message, user_id, user_email } = data as AuthResponse;
                    toast.success(message);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.push(`/verify-code/${user_id}`);
                    Cookies.set("_email", user_email, {
                        expires: 1,
                        secure: true,
                        sameSite: "strict"
                    });
                    setIsSubmitting(false);
                },
                onError: (error) => {
                    console.error('Registration error:', error);
                    setIsSubmitting(false);
                    toast.error(error.message || 'Registration failed. Please try again.');
                    setError('root', {
                        type: 'manual',
                        message: error.message || 'Registration failed. Please try again.'
                    });
                }
            });
        } catch (err) {
            console.error('Registration error:', err);
            if (err instanceof Error) toast.error(err?.message || 'Registration failed. Please try again.');
            setError('root', {
                type: 'manual',
                message: err instanceof Error ? err?.message : 'Registration failed. Please try again.'
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
                            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                            <p className="text-gray-500">Join us today and start your journey</p>
                        </motion.div>

                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={containerVariants}>
                                <InputField
                                    name="firstName"
                                    label="First Name"
                                    register={registerField("firstName")}
                                    errors={errors}
                                    isPasswordVisible={isPasswordVisible}
                                    isConfirmPasswordVisible={isConfirmPasswordVisible}
                                    setIsPasswordVisible={setIsPasswordVisible}
                                    setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
                                />
                                <InputField
                                    name="lastName"
                                    label="Last Name"
                                    register={registerField("lastName")}
                                    errors={errors}
                                    isPasswordVisible={isPasswordVisible}
                                    isConfirmPasswordVisible={isConfirmPasswordVisible}
                                    setIsPasswordVisible={setIsPasswordVisible}
                                    setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
                                />
                                <InputField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    register={registerField("email")}
                                    errors={errors}
                                    isPasswordVisible={isPasswordVisible}
                                    isConfirmPasswordVisible={isConfirmPasswordVisible}
                                    setIsPasswordVisible={setIsPasswordVisible}
                                    setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
                                />
                                <InputField
                                    name="phone"
                                    label="Phone Number"
                                    type="tel"
                                    register={registerField("phone")}
                                    errors={errors}
                                    isPasswordVisible={isPasswordVisible}
                                    isConfirmPasswordVisible={isConfirmPasswordVisible}
                                    setIsPasswordVisible={setIsPasswordVisible}
                                    setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
                                />
                                <div className="md:col-span-2 flex flex-col">
                                    <InputField
                                        name="password"
                                        label="Password"
                                        isPassword
                                        register={{
                                            ...registerField("password"),
                                            ref: (ref: HTMLInputElement) => {
                                                if (ref) {
                                                    passwordRef.current = ref;
                                                }
                                            }
                                        }}
                                        passwordRef={passwordRef}
                                        errors={errors}
                                        isPasswordVisible={isPasswordVisible}
                                        isConfirmPasswordVisible={isConfirmPasswordVisible}
                                        setIsPasswordVisible={setIsPasswordVisible}
                                        setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
                                    />
                                    {statusBar.isValue && (
                                        <div className="mt-2 text-xs space-y-1">
                                            <p className={statusBar.isLengthValid ? 'text-green-600' : 'text-gray-500'}>
                                                - At least 8 characters
                                            </p>
                                            <p className={statusBar.isUppercase ? 'text-green-600' : 'text-gray-500'}>
                                                - At least one uppercase letter
                                            </p>
                                            <p className={statusBar.isLowercase ? 'text-green-600' : 'text-gray-500'}>
                                                - At least one lowercase letter
                                            </p>
                                            <p className={statusBar.isNumber ? 'text-green-600' : 'text-gray-500'}>
                                                - At least one number
                                            </p>
                                            <p className={statusBar.isSymbol ? 'text-green-600' : 'text-gray-500'}>
                                                - At least one symbol
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <InputField
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type="password"
                                        isConfirmPassword
                                        register={registerField("confirmPassword")}
                                        errors={errors}
                                        isPasswordVisible={isPasswordVisible}
                                        isConfirmPasswordVisible={isConfirmPasswordVisible}
                                        setIsPasswordVisible={setIsPasswordVisible}
                                        setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
                                    />
                                </div>
                                <div className="flex flex-col lg:col-span-2 w-full">
                                    <motion.div
                                        className="w-full flex items-start gap-x-3 mt-2"
                                        variants={itemVariants}
                                    >
                                        <div className="flex items-start h-5">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                style={{ accentColor: "var(--color-template-primary)" }}
                                                className="h-4 w-4 rounded border-gray-300 text-template-primary focus:ring-blue-500 mt-1"
                                                {...registerField('terms')}
                                            />
                                        </div>
                                        <label htmlFor="terms" className="text-sm text-gray-600">
                                            I agree to the{' '}
                                            <a href="#" className="text-template-primary font-medium">Terms</a>{' '}
                                            and{' '}
                                            <a href="#" className="text-template-primary font-medium">Privacy Policy</a>
                                        </label>
                                    </motion.div>
                                    {errors.terms && (
                                        <p className="text-[11px] text-red-600">
                                            {errors.terms.message as string}
                                        </p>
                                    )}
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
                                                Creating Account...
                                            </>
                                        ) : 'Create Account'}
                                    </button>
                                </motion.div>
                            </motion.div>
                        </form>

                        <motion.div
                            className="text-center text-sm text-gray-600"
                            variants={itemVariants}
                        >
                            Already have an account?{' '}
                            <a href="#" className="font-medium text-template-primary">
                                Sign in
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

                        <motion.div
                            className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3"
                            variants={itemVariants}
                        >
                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <RiFacebookCircleFill className="h-5 w-5 text-template-primary" />
                                <span className="ml-2">Signup with facebook</span>
                            </button>
                            <div className="w-full">
                                <GoogleSignInButton path="/onboarding" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterForm;