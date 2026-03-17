/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
"use client";

import Image from "next/image";
import React, { memo, useEffect, useRef, useState } from "react";
import { IoIosAlert } from "react-icons/io";
import { RiLoader4Line } from "react-icons/ri";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomStyles } from "@/hooks";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

// const validateFile = (file: File) => {
//   const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
//   const MAX_FILE_SIZE = 5 * 1024 * 1024;

//   if (!file) return 'File is required';
//   if (file.size > MAX_FILE_SIZE) return 'File size must be less than 5MB';
//   if (!SUPPORTED_TYPES.includes(file.type)) {
//     return 'Only .jpg, .jpeg, .png, .webp and .gif files are supported';
//   }
//   return null;
// };

// interface OnboardingFormData {
//   businessName: string;
//   businessType: string;
//   businessTypeOther?: string;
//   phone: string;
//   businessAddress: string;
//   businessDocument?: FileList;
// }

type FormData = {
  businessName: string;
  businessType: string;
  businessTypeOther?: string;
  phone: string;
  businessAddress: string;
  businessDocument?: FileList;
};

const onboardingSchema = z.object({
  businessName: z.string().trim().min(1, { message: "Business Name Is Required" }),
  businessType: z.string().trim().min(1, { message: "Business Type Is Required" }),
  businessTypeOther: z.string().optional(),
  phone: z.string().min(1, { message: "Phone Number Is Required" }),
  businessAddress: z.string().min(1, { message: "Business Address Is Required" }),
  businessDocument: z.any()
    .transform((val) => {
      return val instanceof FileList ? val : undefined;
    })
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        if (!file) return true;

        const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) return false;
        if (!SUPPORTED_TYPES.includes(file.type)) {
          return false;
        }
        return true;
      },
      {
        message: "File must be an image (JPEG, PNG, WebP, GIF) and less than 5MB",
        path: ["businessDocument"]
      }
    )
}).refine(
  (data) => !(data.businessType === 'Others' && (!data.businessTypeOther || data.businessTypeOther.trim().length === 0)),
  {
    message: "Please specify your business type",
    path: ["businessTypeOther"]
  }
);

type OnboardingSchema = z.infer<typeof onboardingSchema>;

interface InputFieldProps {
  name: keyof z.infer<typeof onboardingSchema>;
  label: string;
  type?: string;
  register: any;
  errors: any;
  className?: string;
  onChange?: () => void;
}

const InputField = memo(({
  name,
  label,
  type = 'text',
  className,
  register,
  errors,
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
      className={`w-full relative ${className}`}
      variants={itemVariants}
    >
      <div className="relative">
        <input
          {...register(name, {
            onChange: handleChange,
            onBlur: handleBlur
          })}
          id={name}
          type={type}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full rounded-lg py-3 px-4 border border-gray-300 text-[14px] focus:outline-none transition-all peer ${errors[name] ? 'border-red-500 focus:border-red-500' : 'focus:border-template-primary'
            }`}
        />
        <label
          htmlFor={name}
          className={`absolute left-4 transition-all duration-200 transform ${isFocused || hasValue
              ? '-top-2.5 left-3 text-xs bg-white px-1 text-template-primary'
              : 'top-3 text-gray-400'
            } pointer-events-none`}
        >
          {label}
        </label>
      </div>
      <AnimatePresence>
        {errors[name] && (
          <ErrorMessage message={String(errors[name]?.message)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

interface FileUploadProps {
  name: string;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  trigger: any;
}

const FileUpload = memo(({ name, register, errors, watch, setValue, trigger }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchedFile = watch(name)?.[0];

  useEffect(() => {
    if (watchedFile) {
      setFile(watchedFile);
    }
  }, [watchedFile]);

  useEffect(() => {
    setIsClient(true);

    if (file && isClient) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file, isClient]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const newFile = e.dataTransfer.files[0];
      setFile(newFile);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(newFile);
      setValue(name, dataTransfer.files);
      trigger(name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const newFile = e.target.files[0];
      setFile(newFile);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(newFile);
      setValue(name, dataTransfer.files);
      trigger(name);
    }
  };

  return (
    <motion.div
      className="w-full relative"
      variants={{
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
      }}
    >
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${errors[name]
            ? 'border-red-500 bg-red-50'
            : dragActive
              ? 'border-template-primary bg-template-primary/20'
              : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input
          {...register(name)}
          ref={(e) => {
            register(name).ref(e);
            if (e) fileInputRef.current = e;
          }}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx"
        />

        {previewUrl && file ? (
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4 overflow-hidden rounded-lg">
              {file?.type?.startsWith('image/') ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500">{file?.name || 'Document'}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">Click or drag to change file</p>
          </div>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 mb-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-template-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WEBP, GIF up to 5MB
            </p>
          </>
        )}
      </div>
      <AnimatePresence>
        {errors[name] && (
          <ErrorMessage message={String(errors[name]?.message)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.p
    className="text-red-500 text-[11px] mt-1 flex items-center gap-1"
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
  >
    <IoIosAlert className="inline" /> {message}
  </motion.p>
);

const OnboardingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { hiddenScrollbar } = useCustomStyles();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    formState: { }
  } = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      businessName: '',
      businessType: '',
      businessAddress: '',
      phone: '',
      businessDocument: undefined
    }
  });

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (!token) {
      toast.error('Authentication required. Please register first.');
      router.replace('/register');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RiLoader4Line className="animate-spin h-8 w-8 text-template-primary" />
      </div>
    );
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      const businessType = formData.businessType === 'Others'
        ? formData.businessTypeOther || 'Other'
        : formData.businessType;

      formDataToSend.append('business_name', formData.businessName);
      formDataToSend.append('business_type', businessType);
      formDataToSend.append('address', formData.businessAddress);
      formDataToSend.append('business_phone', formData.phone);

      if (formData.businessDocument && formData.businessDocument instanceof FileList && formData.businessDocument.length > 0) {
        formDataToSend.append('logo', formData.businessDocument[0]);
      }
      const abortController = new AbortController();

      setTimeout(() => {
        abortController.abort();
      }, 30_000);

      abortController.signal.addEventListener("abort", () => {
        toast.error("Request timed out, Please Try Again later");
      });

      const response = await axiosInstance.post('/api/business/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        signal: abortController.signal
      });

      const data = response.data;
      toast.success(data.message);

      router.replace("/plans");

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create business profile');
    } finally {
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
      className="w-[95%] h-fit my-auto sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[45%] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-7 lg:mt-0"
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
            className="w-full h-fit flex flex-col gap-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex flex-col gap-y-2" variants={itemVariants}>
              <h1 className="text-3xl font-bold text-gray-800">Let&apos;s Set Up Your Business</h1>
              <p className="text-gray-500">Join us today and start your journey</p>
            </motion.div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={containerVariants}>
                <InputField
                  name="businessName"
                  label="Business Name"
                  type="text"
                  register={register}
                  errors={errors}
                  onChange={() => trigger()}
                />
                <select
                  {...register('businessType')}
                  className={`w-full px-4 py-2.5 border rounded-md focus:outline-none transition-colors ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={(e) => {
                    register('businessType').onChange(e);
                    trigger('businessType');
                  }}
                >
                  <option value="">Select business type</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="gym">Gym</option>
                  <option value="others">Others</option>
                </select>
                {watch('businessType') === 'others' && (
                  <div className="lg:col-span-2 mt-2">
                    <InputField
                      className="w-full"
                      name="businessTypeOther"
                      label="Please specify"
                      type="text"
                      register={register}
                      errors={errors}
                      onChange={() => {
                        trigger('businessType');
                        trigger('businessTypeOther');
                      }}
                    />
                  </div>
                )}
                {errors.businessType && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessType.message as string}</p>
                )}
                <InputField
                  className="lg:col-span-2"
                  name="phone"
                  label="Phone"
                  type="tel"
                  register={register}
                  errors={errors}
                  onChange={() => trigger()}
                />
                <InputField
                  className="lg:col-span-2"
                  name="businessAddress"
                  label="Business Address"
                  type="text"
                  register={register}
                  errors={errors}
                  onChange={() => trigger()}
                />

                <motion.div
                  className="lg:col-span-2"
                  variants={itemVariants}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Document
                  </label>
                  <FileUpload
                    name="businessDocument"
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    trigger={trigger}
                  />
                </motion.div>

                <motion.div
                  className="lg:col-span-2 pt-2"
                  variants={itemVariants}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting
                        ? 'bg-template-primary/30 cursor-not-allowed'
                        : 'bg-template-primary hover:bg-template-primary/90'
                      } focus:outline-none transition-colors`}
                  >
                    {isSubmitting ? (
                      <>
                        <RiLoader4Line className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                        Completing Registration...
                      </>
                    ) : 'Complete Registration'}
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

export default OnboardingForm;