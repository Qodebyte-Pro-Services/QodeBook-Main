"use client";

import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LiaTimesSolid } from "react-icons/lia";
import { ChevronDown, Users, Shield, CheckCircle, Edit } from "lucide-react";
import { PRODUCT_PERMISSIONS, STOCK_PERMISSIONS, SALES_PERMISSIONS, STAFF_PERMISSIONS, APPOINTMENT_PERMISSIONS, CUSTOMER_PERMISSIONS, REPORTS_ANALYTICS_PERMISSIONS, FINANCIAL_PERMISSIONS, BUSINESS_PERMISSIONS, INVENTORY_LOG_PERMISSIONS, SERVICE_PERMISSIONS, IMPORT_EXPORT_PERMISSIONS } from "@/models/types/constants/staff-role-constants";
import { StaffRoleObj, StaffRoleTypes } from "@/models/types/shared/handlers-type";
import { toast } from "sonner";

interface EditStaffRoleFormProps {
    businessId: string;
    created_by: string;
    roleData: StaffRoleObj & {
        permissions_count: number;
    };
    handleFormClose: () => void;
}

const EditStaffRoleForm = ({ businessId, created_by, roleData, handleFormClose }: EditStaffRoleFormProps) => {
    const { hiddenScrollbar } = useCustomStyles();
    
    const [formData, setFormData] = useState<Omit<StaffRoleTypes, 'business_id' | 'description'>>({
        role_name: roleData.role_name,
        permissions: roleData.permissions || [],
        created_by: created_by
    });
    
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const permissionCategories = [
        { name: "PRODUCT_PERMISSIONS", label: "Product Management", permissions: PRODUCT_PERMISSIONS, icon: "📦" },
        { name: "STOCK_PERMISSIONS", label: "Stock Management", permissions: STOCK_PERMISSIONS, icon: "📊" },
        { name: "SALES_PERMISSIONS", label: "Sales Management", permissions: SALES_PERMISSIONS, icon: "💰" },
        { name: "STAFF_PERMISSIONS", label: "Staff Management", permissions: STAFF_PERMISSIONS, icon: "👥" },
        { name: "APPOINTMENT_PERMISSIONS", label: "Appointments", permissions: APPOINTMENT_PERMISSIONS, icon: "📅" },
        { name: "CUSTOMER_PERMISSIONS", label: "Customer Management", permissions: CUSTOMER_PERMISSIONS, icon: "👤" },
        { name: "REPORTS_ANALYTICS_PERMISSIONS", label: "Reports & Analytics", permissions: REPORTS_ANALYTICS_PERMISSIONS, icon: "📈" },
        { name: "FINANCIAL_PERMISSIONS", label: "Financial Management", permissions: FINANCIAL_PERMISSIONS, icon: "💳" },
        { name: "BUSINESS_PERMISSIONS", label: "Business Settings", permissions: BUSINESS_PERMISSIONS, icon: "🏢" },
        { name: "INVENTORY_LOG_PERMISSIONS", label: "Inventory Logs", permissions: INVENTORY_LOG_PERMISSIONS, icon: "📋" },
        { name: "SERVICE_PERMISSIONS", label: "Service Management", permissions: SERVICE_PERMISSIONS, icon: "🔧" },
        { name: "IMPORT_EXPORT_PERMISSIONS", label: "Import/Export", permissions: IMPORT_EXPORT_PERMISSIONS, icon: "📤" }
    ];

    const containerVariant = {
        from: {
            scale: 0.1,
            opacity: 0,
            top: -100
        },
        to: {
            scale: 1,
            opacity: 1,
            top: 0
        },
        go: {
            scale: 0.1,
            opacity: 0,
            top: -100
        }
    };

    const formatPermissionName = (key: string) => {
        return key.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleInputChange = (field: keyof Omit<StaffRoleTypes, 'business_id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handlePermissionToggle = (permissionValue: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionValue)
                ? prev.permissions.filter(p => p !== permissionValue)
                : [...prev.permissions, permissionValue]
        }));
    };

    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        setIsDropdownOpen(false);
    };

    const handleSelectAllPermissions = () => {
        if (!selectedCategoryData) return;
        
        const categoryPermissions = Object.values(selectedCategoryData.permissions);
        const allSelected = categoryPermissions.every(permission => 
            formData.permissions.includes(permission)
        );
        
        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p => 
                    !categoryPermissions.includes(p)
                )
            }));
        } else {
            const newPermissions = [...formData.permissions];
            categoryPermissions.forEach(permission => {
                if (!newPermissions.includes(permission)) {
                    newPermissions.push(permission);
                }
            });
            setFormData(prev => ({
                ...prev,
                permissions: newPermissions
            }));
        }
    };

    const handleSelectAllGlobalPermissions = () => {
        const allPermissions = permissionCategories.flatMap(category => 
            Object.values(category.permissions)
        );
        
        const allSelected = allPermissions.every(permission => 
            formData.permissions.includes(permission)
        );
        
        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                permissions: []
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: [...allPermissions]
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.role_name.trim()) {
            newErrors.role_name = "Role name is required";
        }

        if (formData.permissions.length === 0) {
            newErrors.permissions = "At least one permission must be selected";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                created_by,
                business_id: parseInt(businessId),
                id: roleData.role_id
            };

            // TODO: Replace with actual update API call
            console.log('Updating staff role:', payload);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Staff Role Updated Successfully");
            await new Promise(res => setTimeout(res, 2000));
            handleFormClose();
        } catch (error) {
            console.error('Error updating staff role:', error);
            toast.error("An unexpected error occurred while updating staff role");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCategoryData = permissionCategories.find(cat => cat.name === selectedCategory);
    const selectedPermissionsCount = formData.permissions.length;
    
    // Group selected permissions by category
    const groupedSelectedPermissions = permissionCategories.reduce((acc, category) => {
        const categoryPermissions = Object.values(category.permissions).filter(permission => 
            formData.permissions.includes(permission)
        );
        if (categoryPermissions.length > 0) {
            acc[category.name] = {
                label: category.label,
                icon: category.icon,
                permissions: categoryPermissions
            };
        }
        return acc;
    }, {} as Record<string, { label: string; icon: string; permissions: string[] }>);

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                variants={containerVariant} 
                initial="from" 
                animate="to" 
                exit="go" 
                className="w-[90%] md:w-[55%] lg:w-[50%] h-fit fixed z-90 right-0 top-[3%] bg-white rounded-lg shadow-[0px_0px_0px_100vmax_rgba(0,0,0,0.2)]"
            >
                <div className="bg-gradient-to-r from-template-primary to-template-primary/80 p-6 rounded-t-lg">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Edit size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-[600]">Edit Staff Role</h2>
                                <p className="text-sm opacity-90">Modify role permissions and access levels</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleFormClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <LiaTimesSolid size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-h-[60vh] overflow-auto" style={hiddenScrollbar}>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-y-2">
                                <label className="text-sm font-[500] text-gray-700">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    className={`py-3 px-4 text-sm w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-template-primary/20 focus:border-template-primary transition-colors ${
                                        errors.role_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    value={formData.role_name} 
                                    onChange={(e) => handleInputChange('role_name', e.target.value)} 
                                    placeholder="e.g., Store Manager, Cashier, Inventory Clerk" 
                                />
                                {errors.role_name && (
                                    <span className="text-red-500 text-xs">{errors.role_name}</span>
                                )}
                            </div>

                            {/* <div className="flex flex-col gap-y-2">
                                <label className="text-sm font-[500] text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    className={`py-3 px-4 text-sm w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-template-primary/20 focus:border-template-primary transition-colors resize-none ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    rows={3}
                                    value={formData.description} 
                                    onChange={(e) => handleInputChange('description', e.target.value)} 
                                    placeholder="Describe the role responsibilities and purpose..." 
                                />
                                {errors.description && (
                                    <span className="text-red-500 text-xs">{errors.description}</span>
                                )}
                            </div> */}

                            <div className="flex flex-col gap-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-[500] text-gray-700">
                                        Permission Category <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllGlobalPermissions}
                                        className="px-3 py-1.5 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition-colors border border-green-200"
                                    >
                                        {(() => {
                                            const allPermissions = permissionCategories.flatMap(category => 
                                                Object.values(category.permissions)
                                            );
                                            return allPermissions.every(permission => 
                                                formData.permissions.includes(permission)
                                            ) ? 'Clear All' : 'Select All';
                                        })()}
                                    </button>
                                </div>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full py-3 px-4 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-template-primary/20 focus:border-template-primary transition-colors flex items-center justify-between ${
                                            errors.permissions ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                                            {selectedCategory 
                                                ? `${selectedCategoryData?.icon} ${selectedCategoryData?.label}`
                                                : 'Select a permission category'
                                            }
                                        </span>
                                        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
                                            {permissionCategories.map((category) => (
                                                <button
                                                    key={category.name}
                                                    type="button"
                                                    onClick={() => handleCategorySelect(category.name)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <span className="text-lg">{category.icon}</span>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{category.label}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {Object.keys(category.permissions).length} permissions
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.permissions && (
                                    <span className="text-red-500 text-xs">{errors.permissions}</span>
                                )}
                            </div>

                            {selectedPermissionsCount > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="text-sm text-green-700 font-medium">
                                            {selectedPermissionsCount} permission{selectedPermissionsCount !== 1 ? 's' : ''} selected across {Object.keys(groupedSelectedPermissions).length} categor{Object.keys(groupedSelectedPermissions).length !== 1 ? 'ies' : 'y'}
                                        </span>
                                    </div>
                                    
                                    {/* Selected Permissions by Category */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-[600] text-gray-700 flex items-center gap-2">
                                            <Shield size={16} />
                                            Selected Permissions by Category
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-auto" style={hiddenScrollbar}>
                                            {Object.entries(groupedSelectedPermissions).map(([categoryName, categoryData]) => (
                                                <div key={categoryName} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-base">{categoryData.icon}</span>
                                                        <span className="text-sm font-[600] text-gray-800">{categoryData.label}</span>
                                                        <span className="text-xs bg-template-primary/10 text-template-primary px-2 py-0.5 rounded-full">
                                                            {categoryData.permissions.length} permission{categoryData.permissions.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {categoryData.permissions.map((permission) => {
                                                            const permissionKey = Object.entries(permissionCategories.find(cat => cat.name === categoryName)?.permissions || {})
                                                                .find(([_, value]) => value === permission)?.[0] || permission;
                                                            return (
                                                                <span 
                                                                    key={permission}
                                                                    className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded-md"
                                                                >
                                                                    {formatPermissionName(permissionKey)}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCategory && selectedCategoryData && (
                                <div className="flex flex-col gap-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{selectedCategoryData.icon}</span>
                                            <h3 className="text-lg font-[600] text-gray-900">
                                                {selectedCategoryData.label} Permissions
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllPermissions}
                                            className="px-3 py-1.5 text-xs font-medium bg-template-primary/10 hover:bg-template-primary/20 text-template-primary rounded-md transition-colors border border-template-primary/20"
                                        >
                                            {Object.values(selectedCategoryData.permissions).every(permission => 
                                                formData.permissions.includes(permission)
                                            ) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-auto p-1" style={hiddenScrollbar}>
                                        {Object.entries(selectedCategoryData.permissions).map(([key, value]) => (
                                            <label
                                                key={key}
                                                className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer transition-colors group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(value)}
                                                    onChange={() => handlePermissionToggle(value)}
                                                    className="mt-0.5 h-4 w-4 accent-template-primary text-template-primary focus:ring-template-primary border-gray-300 rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 group-hover:text-template-primary transition-colors">
                                                        {formatPermissionName(key)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 break-words">
                                                        {value}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button 
                            onClick={handleFormClose}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 font-[550] text-sm rounded-lg cursor-pointer transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 bg-template-primary hover:bg-template-primary/90 font-[550] text-sm rounded-lg text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Edit size={16} />
                                    Update Role
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditStaffRoleForm;
