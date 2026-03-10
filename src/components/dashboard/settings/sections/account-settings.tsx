"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CiUser, CiEdit, CiLock, CiMail, CiPhone, CiUser as CiUserIcon } from 'react-icons/ci';
import { FiEye, FiEyeOff, FiCheck, FiUpload, FiX } from 'react-icons/fi';
import { Loader } from 'lucide-react';
import { AuthMeResponseTypes } from '@/models/types/shared/handlers-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useUpdateAuthUserProfile } from '@/hooks/useAuth';
import Cookies from 'js-cookie';
import { useIsStaffActive } from '@/store/state/lib/ui-state-manager';


interface IAccountSettings {
  sectionVariant: Variants;
  isPhoneView: boolean;
  user_details: AuthMeResponseTypes;
  user_loading: boolean;
}

interface IFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string | File;
}

const AccountSettings = ({
  sectionVariant,
  isPhoneView,
  user_details,
  user_loading,
}: IAccountSettings) => {
  const [formData, setFormData] = useState<IFormData>({
    first_name: user_details?.first_name || '',
    last_name: user_details?.last_name || '',
    email: user_details?.email || '',
    phone: user_details?.phone || '',
    profile_image: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfileHandler = useUpdateAuthUserProfile();

  const { setIsStaff } = useIsStaffActive();

  const businessId = useMemo(() => {
    if (typeof window === "undefined") return;
    const storeId = sessionStorage.getItem("selectedBusinessId");
    return storeId ? +storeId : 0;
  }, []);

  const activeuser = useMemo(() => Cookies.get("authActiveUser")?.toLowerCase() || "user", []);

  useEffect(() => {
    setIsStaff(activeuser);
  }, [activeuser, setIsStaff]);

  useEffect(() => {
    if (user_details) {
      setFormData({
        first_name: user_details.first_name || '',
        last_name: user_details.last_name || '',
        email: user_details.email || '',
        phone: user_details.phone || '',
        profile_image: '',
      });
    }
  }, [user_details]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.info("File too large", {
          description: "Please select an image smaller than 10MB",
        });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formdata = new FormData();
    Object.entries(formData)?.forEach(([key, value]) => {
      if (value instanceof File) {
        formdata.append(key, value);
      } else {
        formdata.append(key, String(value));
      }
    });
    try {
      const response = await updateProfileHandler.mutateAsync({ data: formdata, businessId: businessId || 0 });
      console.log(response);
      if (response?.success) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSaving(false);
        setIsEditing(false);
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      toast.info("New passwords do not match", {
        description: "Please ensure that the new passwords match",
      });
      return;
    }
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    });
    setIsSaving(false);
    toast.success("Password updated", {
      description: "Your password has been updated successfully",
    });
  };

  if (user_loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-template-primary" />
      </div>
    );
  }

  return (
    <motion.div
      key="profile"
      variants={sectionVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''} dark:bg-black space-y-6`)}
    >
      {/* Profile Section */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-black">
        <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-500 dark:via-green-500 dark:to-green-100" />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</CardTitle>
              <CardDescription>Manage your personal information and account details</CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeuser === "user") {
                    setIsEditing(true)
                  }
                  if (activeuser === "staff") {
                    toast.info("You are not authorized to edit profile", {
                      description: "Please contact your administrator",
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <CiEdit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-white shadow-lg overflow-hidden dark:bg-black">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : user_details?.profile_image ? (
                    <img
                      src={`${user_details.profile_image}`}
                      alt={user_details.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-100 flex items-center justify-center">
                      <CiUserIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="avatar"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FiUpload className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user_details?.first_name} {user_details?.last_name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <CiMail className="w-4 h-4" />
                  {user_details?.email}
                </p>
                {user_details?.phone && (
                  <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                    <CiPhone className="w-4 h-4" />
                    {user_details.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-white">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700 dark:text-white' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-white">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700 dark:text-white' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700 dark:text-white' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-white">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-gray-700 dark:text-white' : ''}
                />
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200"
                >
                  <Button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-template-primary hover:text-template-primary">
                    {isSaving ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      setFormData({
                        first_name: user_details?.first_name || '',
                        last_name: user_details?.last_name || '',
                        email: user_details?.email || '',
                        phone: user_details?.phone || '',
                        profile_image: '',
                      });
                      setAvatarPreview(null);
                    }}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      {activeuser === "user" && (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-black">
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-500 dark:from-green-500 dark:via-green-500 dark:to-green-100" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-100 dark:text-green-600">
                <CiLock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-sm font-medium text-gray-700 dark:text-white">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      name="current_password"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-white"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    >
                      {showPassword.current ? (
                        <FiEyeOff className="w-4 h-4" />
                      ) : (
                        <FiEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-sm font-medium text-gray-700 dark:text-white">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        name="new_password"
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-white"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                      >
                        {showPassword.new ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm_new_password"
                      className="text-sm font-medium text-gray-700 dark:text-white"
                    >
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm_new_password"
                        name="confirm_new_password"
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordData.confirm_new_password}
                        onChange={handlePasswordChange}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-white"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      >
                        {showPassword.confirm ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_new_password: '',
                    })
                  }
                  disabled={
                    isSaving ||
                    (!passwordData.current_password &&
                      !passwordData.new_password &&
                      !passwordData.confirm_new_password)
                  }
                >
                  Clear
                </Button>
                <Button className='bg-template-primary hover:text-template-primary' type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AccountSettings;