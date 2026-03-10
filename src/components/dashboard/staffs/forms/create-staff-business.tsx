"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldAlert, Lock, Shield, User, Mail, Smartphone, Clock, LockKeyhole, AlertCircle } from "lucide-react";
import { X } from "lucide-react";
import { useStaffBusinessSettings } from "@/hooks/useControllers";

const passwordDeliveryMethods = [
  { value: "owner", label: "Owner" },
  { value: "staff", label: "Staff" },
];

const otpDeliveryMethods = [
  { value: "staff", label: "Staff" },
  { value: "owner", label: "Owner" },
];

const passwordChangePolicies = [
  { value: "request", label: "On Request" },
  { value: "self", label: "Self" },
];

const formSchema = z.object({
  branch_id: z.number().min(1, "Branch ID is required"),
  password_delivery_method: z.string({
    error: "Please select a password delivery method",
  }).refine(val => ["owner", "staff"].includes(val), {
    message: "Please select a valid delivery method"
  }),
  password_change_policy: z.string({
    error: "Please select a password change policy",
  }).refine(val => ["request", "self"].includes(val), {
    message: "Please select a valid password change policy"
  }),
  require_otp_for_login: z.boolean(),
  otp_delivery_method: z.string({
    error: "Please select an OTP delivery method",
  }).refine(val => ["staff", "owner"].includes(val), {
    message: "Please select a valid OTP delivery method"
  }),
  session_timeout_minutes: z.coerce
    .number()
    .min(15, "Minimum session timeout is 15 minutes")
    .max(1440, "Maximum session timeout is 24 hours (1440 minutes)"),
  max_login_attempts: z.coerce
    .number()
    .min(1, "Minimum 1 login attempt is required")
    .max(10, "Maximum 10 login attempts allowed"),
  lockout_duration_minutes: z.coerce
    .number()
    .min(1, "Minimum lockout duration is 1 minute")
    .max(1440, "Maximum lockout duration is 24 hours (1440 minutes)"),
});

export type FormValues = z.infer<typeof formSchema>;
export type FormValuesPayload = FormValues & {business_id: number};

interface CreateStaffBusinessFormProps {
  onClose: () => void;
  businessId: number;
  branchId: number;
}

const containerVariant = {
  from: {
    scale: 0.95,
    opacity: 0,
    y: 20
  },
  to: {
    scale: 1,
    opacity: 1,
    y: 0
  },
  go: {
    scale: 0.95,
    opacity: 0,
    y: 20
  }
};

function CreateStaffBusinessForm({ onClose, branchId, businessId }: CreateStaffBusinessFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      branch_id: 0,
      password_delivery_method: "owner",
      password_change_policy: "request",
      require_otp_for_login: true,
      otp_delivery_method: "staff",
      session_timeout_minutes: 120,
      max_login_attempts: 5,
      lockout_duration_minutes: 30,
    },
    criteriaMode: "all"
  });

  const requireOtp = form.watch("require_otp_for_login");
  const formErrors = form.formState.errors;

  const staffBusinessSettingsHandler = useStaffBusinessSettings();

  async function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      business_id: businessId,
      branch_id: branchId
    };
    
    try {
      setIsLoading(true);
      await staffBusinessSettingsHandler.mutateAsync(payload, {
        onSuccess: (data) => {
          console.log(data);
          toast.success("Staff authentication settings saved successfully");
          setTimeout(onClose, 2500);
        },
        onError: () => {
          toast.error("Failed to save settings. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        variants={containerVariant} 
        initial="from" 
        animate="to" 
        exit="go"
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-template-primary to-template-chart-store p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Shield size={24} />
                </div>
                <h2 className="text-xl font-bold">Staff Authentication Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-white/80 text-sm">
              Configure how staff members authenticate and access the system
            </p>
          </div>

          <form className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password_delivery_method" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} />
                  <span>Password Delivery</span>
                </label>
                <div className="relative">
                  <select
                    id="password_delivery_method"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors.password_delivery_method 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-template-primary/20 focus:border-template-primary'
                    }`}
                    {...form.register("password_delivery_method")}
                  >
                    {passwordDeliveryMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.password_delivery_method && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.password_delivery_method.message}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password_change_policy" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <LockKeyhole size={16} />
                  <span>Password Policy</span>
                </label>
                <div className="relative">
                  <select
                    id="password_change_policy"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors.password_change_policy 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-template-primary/20 focus:border-template-primary'
                    }`}
                    {...form.register("password_change_policy")}
                  >
                    {passwordChangePolicies.map((policy) => (
                      <option key={policy.value} value={policy.value}>
                        {policy.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.password_change_policy && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.password_change_policy.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="space-y-0.5">
                  <label htmlFor="require_otp" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ShieldAlert size={16} />
                    <span>Require OTP for Login</span>
                  </label>
                  <p className="text-sm text-gray-500">
                    An additional security layer for staff authentication
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={requireOtp}
                    onChange={(e) => form.setValue("require_otp_for_login", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-template-primary"></div>
                </label>
              </div>

              {requireOtp && (
                <div className="space-y-2 pl-6 border-l-2 border-template-primary/30">
                  <label htmlFor="otp_delivery_method" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Smartphone size={16} />
                    <span>OTP Delivery Method</span>
                  </label>
                  <div className="relative">
                    <select
                      id="otp_delivery_method"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        formErrors.otp_delivery_method 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-template-primary/20 focus:border-template-primary'
                      }`}
                      {...form.register("otp_delivery_method")}
                    >
                      {otpDeliveryMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.otp_delivery_method && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{formErrors.otp_delivery_method.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Session and Security Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock size={16} />
                <span>Session & Security Settings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="session_timeout" className="text-sm font-medium text-gray-700">
                    Session Timeout (min)
                  </label>
                  <div className="relative">
                    <input
                      id="session_timeout"
                      type="number"
                      min="15"
                      max="1440"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        formErrors.session_timeout_minutes 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-template-primary/20 focus:border-template-primary'
                      }`}
                      {...form.register("session_timeout_minutes")}
                    />
                    {formErrors.session_timeout_minutes && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{formErrors.session_timeout_minutes.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="max_attempts" className="text-sm font-medium text-gray-700">
                    Max Login Attempts
                  </label>
                  <div className="relative">
                    <input
                      id="max_attempts"
                      type="number"
                      min="1"
                      max="10"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        formErrors.max_login_attempts 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-template-primary/20 focus:border-template-primary'
                      }`}
                      {...form.register("max_login_attempts")}
                    />
                    {formErrors.max_login_attempts && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{formErrors.max_login_attempts.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lockout_duration" className="text-sm font-medium text-gray-700">
                    Lockout Duration (min)
                  </label>
                  <div className="relative">
                    <input
                      id="lockout_duration"
                      type="number"
                      min="1"
                      max="1440"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        formErrors.lockout_duration_minutes 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-template-primary/20 focus:border-template-primary'
                      }`}
                      {...form.register("lockout_duration_minutes")}
                    />
                    {formErrors.lockout_duration_minutes && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{formErrors.lockout_duration_minutes.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </form>
          {/* Footer Actions */}
            <div className="bg-gray-50 border-t border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-template-primary text-white rounded-xl font-medium hover:bg-template-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Save Security Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateStaffBusinessForm;