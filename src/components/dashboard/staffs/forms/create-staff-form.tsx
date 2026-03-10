"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, UserPlus, AlertCircle, Upload, FileText, User, Phone, Mail, MapPin, Briefcase, Calendar, Banknote, CreditCard, FileDigit, UserCheck, FileCheck, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import { useStaffCreation } from "@/hooks/useHandlers";
import { getStaffRoles, getUserDetails } from "@/api/controllers/get/handler";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StaffRoleObj } from "@/models/types/shared/handlers-type";
import Image from "next/image";

interface CreateStaffFormProps {
  onClose: () => void;
  businessId: number;
  branchId: number;
}

export interface StaffFormDataLogic {
  business_id: number;
  branch_id: number;
  full_name: string;
  contact_no: string;
  email: string;
  address: string;
  documents?: string | File | null;
  position_name: string;
  assigned_position?: string;
  gender: 'male' | 'female' | 'other';
  staff_status: 'on_job' | 'suspended' | 'terminated' | string;
  date_of_birth: string;
  state_of_origin?: string;
  emergency_contact?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | string;
  start_date: string;
  salary: number;
  bank_account_number: string;
  bank_name: string;
  national_id?: string | File | null;
  guarantor_name?: string;
  guarantor_contact?: string;
  guarantor_relationship?: string;
  guarantor_address?: string;
  photo?: string | File | null;
  payment_status?: 'paid' | 'un_paid' | 'paid_half' | string;
  last_payment_date?: string;
  staff_status_change_reason?: string;
}

export default function CreateStaffForm({ onClose, businessId, branchId }: CreateStaffFormProps) {
  const [formData, setFormData] = useState<Omit<StaffFormDataLogic, 'staff_id' | 'business_id' | 'branch_id'>>({
    full_name: "",
    contact_no: "",
    email: "",
    address: "",
    position_name: "",
    gender: "male",
    staff_status: "on_job",
    date_of_birth: "",
    state_of_origin: "",
    emergency_contact: "",
    employment_type: "full_time",
    start_date: new Date().toISOString().split('T')[0],
    salary: 0,
    bank_account_number: "",
    bank_name: "",
    national_id: null,
    guarantor_name: "",
    guarantor_contact: "",
    guarantor_relationship: "",
    guarantor_address: "",
    photo: null,
    payment_status: "paid",
    staff_status_change_reason: "",
    documents: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<"personal" | "employment" | "bank" | "guarantor">("personal");
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const staffCreateHandler = useStaffCreation();

  const { data: userDetails, isSuccess: userSuccess, isError: userError } = useQuery({
    queryKey: ["get-users"],
    queryFn: () => getUserDetails(),
    refetchOnWindowFocus: false,
    retry: false
  });

  const { data: staffRoles, isLoading: staffRolesLoading, isSuccess: staffRolesSucces, isError: staffRolesError } = useQuery({
    queryKey: ["get-staff-roles", businessId],
    queryFn: () => getStaffRoles({ businessId }),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: businessId !== 0
  });

  const staff_roles = useMemo<Array<StaffRoleObj>>(() => {
    if (staffRolesSucces && !staffRolesError) {
      return staffRoles?.roles || [];
    }
    return [];
  }, [staffRoles, staffRolesSucces, staffRolesError]);

  const staff_position_name = useMemo(() => {
    if (formData?.assigned_position) {
      return staff_roles?.find(item => item?.role_id === formData?.assigned_position)?.role_name || "";
    }
    return null;
  }, [staff_roles, formData?.assigned_position]) as string;

  const user_details = useMemo(() => {
    if (userSuccess && !userError) {
      return userDetails?.user;
    }
    return null;
  }, [userDetails, userSuccess, userError]);

  const queryClient = useQueryClient();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.contact_no.trim()) newErrors.contact_no = "Contact number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.assigned_position?.trim()) newErrors.assigned_position = "Position is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (formData.salary <= 0) newErrors.salary = "Salary must be greater than 0";

    if (!formData.bank_name.trim()) newErrors.bank_name = "Bank name is required";
    if (!formData.bank_account_number.trim()) newErrors.bank_account_number = "Account number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: keyof Pick<StaffFormDataLogic, "assigned_position" | "position_name" | "employment_type" | "gender">, value: string) => {
    if (name && value) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      setErrors(prev => {
        const newObj = { ...prev };
        delete newObj[name];
        return newObj;
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'documents') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'photo' && !file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (field === 'documents' && !file.type.includes('pdf') && !file.type.startsWith('image/')) {
      toast.error("Please upload a PDF or image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === 'photo') {
        setPhotoPreview(reader.result as string);
      } else {
        setDocumentPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      Object.assign(formData, { position_name: staff_position_name ?? "N/A", baseUrl: process.env.NEXT_PUBLIC_HOST, staff_status: formData?.staff_status || "on_job", staff_status_change_reason: "new staff added", payment_status: "un_paid" });

      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log("Filed");
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });
      formDataToSend.append('business_id', String(businessId));
      formDataToSend.append('branch_id', String(branchId));

      const server_payload = {
        business_id: businessId,
        branch_id: branchId,
        data: formDataToSend
      };

      await staffCreateHandler.mutateAsync(server_payload, {
        onSuccess(data) {
          console.log(data);
          toast.success(data?.message || "Staff Created Successfully");
          queryClient.invalidateQueries({
            queryKey: ["get-staff-list", businessId],
            refetchType: "active"
          });
          setTimeout(() => onClose?.(), 2000);
          Object.entries(Object.fromEntries(formDataToSend))?.forEach(([key, value]) => {
            setFormData(prev => ({
              ...prev,
              [key as keyof StaffFormDataLogic]: ""
            }));
          });
        },
        onError(err) {
          console.log(err);
          toast.error("Error Occurred while trying to crate staff: " + (err instanceof Error ? err?.message : "...."));
        }
      })
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariant}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <UserPlus size={24} />
                </div>
                <h2 className="text-xl font-bold">Add New Staff</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-white/80 text-sm">
              Fill in the staff details below. All fields marked with * are required.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['Personal', 'Employment', 'Bank', 'Guarantor'].map((step, index) => {
                const stepKey = step.toLowerCase() as "personal" | "employment" | "bank" | "guarantor";
                const isActive = activeSection === stepKey;
                const isCompleted =
                  (stepKey === 'personal' && activeSection !== 'personal') ||
                  (stepKey === 'employment' && !['personal', 'employment'].includes(activeSection)) ||
                  (stepKey === 'bank' && activeSection === 'guarantor');

                return (
                  <button
                    key={step}
                    onClick={() => setActiveSection(stepKey)}
                    className={`flex-1 py-4 px-2 text-center text-sm font-medium transition-colors ${isActive
                      ? 'text-green-600 border-b-2 border-green-600'
                      : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isActive
                        ? 'bg-green-100 text-green-600'
                        : isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                        }`}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      {step}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeSection === 'personal' && (
                <motion.div
                  key="personal"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="text-green-600" size={20} />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.full_name ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="Staff Name"
                        />
                        {errors.full_name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.full_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <Select value={formData?.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                        <SelectTrigger className="w-full py-5.5">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="contact_no"
                          value={formData.contact_no}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.contact_no ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="Staff Phone No."
                        />
                        {errors.contact_no && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.contact_no}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="Staff email ID"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split('T')[0]}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.date_of_birth && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.date_of_birth}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        State of Origin
                      </label>
                      <input
                        type="text"
                        name="state_of_origin"
                        value={formData.state_of_origin}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        placeholder="State Of Origin"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.address ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="Staff Address"
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Emergency Contact
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                          placeholder="Emergency Contact"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Profile Photo
                      </label>
                      <div className="relative">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                          {photoPreview ? (
                            <div className="relative w-full h-full">
                              <Image
                                width={400}
                                height={400}
                                src={photoPreview}
                                alt="Profile Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                <Upload className="h-6 w-6 text-white" />
                                <span className="text-white text-sm ml-2">Change Photo</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <User className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'photo')}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'employment' && (
                <motion.div
                  key="employment"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="text-green-600" size={20} />
                    Employment Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Position <span className="text-red-500">*</span>
                      </label>
                      {staffRolesLoading ? (
                        <Select value={formData?.assigned_position} onValueChange={(val) => handleSelectChange("assigned_position", val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Staff Roles Loading..." />
                          </SelectTrigger>
                        </Select>
                      ) : staff_roles?.length ? (
                        <Select value={formData?.assigned_position} onValueChange={(val) => handleSelectChange("assigned_position", val)}>
                          <SelectTrigger className="w-full py-5.5">
                            <SelectValue placeholder="Select Staff Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff_roles?.map((item, index) => (
                              <SelectItem key={`staff-role-${index}`} data-role-id={item?.role_id} value={item?.role_id || 'N/A'}>
                                {item?.role_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="No Staff Role Available" />
                          </SelectTrigger>
                        </Select>
                      )}
                      {errors?.assigned_position && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors?.assigned_position}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Employment Type <span className="text-red-500">*</span>
                      </label>
                      <Select value={formData?.employment_type} onValueChange={(value) => handleSelectChange('employment_type', value)}>
                        <SelectTrigger className="w-full py-5.5">
                          <SelectValue placeholder="Select Employment Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.start_date ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.start_date && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.start_date}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Salary (₦) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Banknote className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="salary"
                          value={formData.salary || ''}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.salary ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="0.00"
                        />
                        {errors.salary && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.salary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Upload Document
                      </label>
                      <div className="relative">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                          {documentPreview ? (
                            <div className="relative w-full h-full p-2">
                              <div className="w-full h-full bg-green-50 rounded-md flex flex-col items-center justify-center">
                                <FileText className="h-8 w-8 text-green-400 mb-2" />
                                <p className="text-sm text-gray-600 text-center px-2 truncate w-full">
                                  {formData.documents instanceof File ? formData.documents.name : 'Document uploaded'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Click to change</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileText className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileChange(e, 'documents')}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'bank' && (
                <motion.div
                  key="bank"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="text-green-600" size={20} />
                    Bank Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.bank_name ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="e.g., First Bank"
                        />
                        {errors.bank_name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.bank_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="bank_account_number"
                          value={formData.bank_account_number}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.bank_account_number ? 'border-red-300' : 'border-gray-300'
                            }`}
                          placeholder="e.g., 1234567890"
                        />
                        {errors.bank_account_number && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.bank_account_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        National ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileDigit className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="national_id"
                          value={(formData?.national_id as string) || ''}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                          placeholder="e.g., 12345678901"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'guarantor' && (
                <motion.div
                  key="guarantor"
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <UserCheck className="text-green-600" size={20} />
                    Guarantor Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="guarantor_name"
                          value={formData.guarantor_name || ''}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                          placeholder="Guarantor's full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contact Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="guarantor_contact"
                          value={formData.guarantor_contact || ''}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Relationship
                      </label>
                      <input
                        type="text"
                        name="guarantor_relationship"
                        value={formData.guarantor_relationship || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        placeholder="e.g., Father, Friend, etc."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <textarea
                          name="guarantor_address"
                          value={formData.guarantor_address || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                          placeholder="Guarantor's full address"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-between items-center">
              <div>
                {activeSection !== 'personal' && (
                  <button
                    type="button"
                    onClick={() => {
                      const sections: ("personal" | "employment" | "bank" | "guarantor")[] = ["personal", "employment", "bank", "guarantor"];
                      const currentIndex = sections.indexOf(activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(sections[currentIndex - 1]);
                      }
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                    disabled={isSubmitting}
                  >
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeSection !== 'guarantor' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const sections: ("personal" | "employment" | "bank" | "guarantor")[] = ["personal", "employment", "bank", "guarantor"];
                      const currentIndex = sections.indexOf(activeSection);
                      if (currentIndex < sections.length - 1) {
                        // Validate current section before proceeding
                        let isValid = true;
                        const currentSection = sections[currentIndex];

                        if (currentSection === 'personal') {
                          if (!formData.full_name.trim() || !formData.contact_no.trim() || !formData.email.trim() || !formData.address.trim() || !formData.date_of_birth) {
                            isValid = false;
                            toast.error("Please fill in all required fields in the Personal Information section");
                          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                            isValid = false;
                            toast.error("Please enter a valid email address");
                          }
                        } else if (currentSection === 'employment') {
                          if (!formData?.assigned_position?.trim() || !formData.start_date || !formData.salary) {
                            isValid = false;
                            toast.error("Please fill in all required fields in the Employment Information section");
                          }
                        } else if (currentSection === 'bank') {
                          if (!formData.bank_name.trim() || !formData.bank_account_number.trim()) {
                            isValid = false;
                            toast.error("Please fill in all required fields in the Bank Information section");
                          }
                        }

                        if (isValid) {
                          setActiveSection(sections[currentIndex + 1]);
                        }
                      }
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Staff
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}