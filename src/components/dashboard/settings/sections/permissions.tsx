import { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Plus, Users, Shield } from "lucide-react";
import CreateStaffRoleForm from "../forms/create-staff-role-form";
import EditStaffRoleForm from "../forms/edit-staff-role-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStaffRoles } from "@/api/controllers/get/handler";
import { StaffRoleObj } from "@/models/types/shared/handlers-type";
import { useDeleteStaffRoleHandler } from "@/hooks/useControllers";
import { toast as reactToast } from "react-toastify";
import { useCustomDeleteHandler } from "@/store/state/lib/ui-state-manager";
import { toast } from "sonner";
import CustomDeleteHandler from "../../ui/custom-delete-handler";

const PermissionSettings = ({ sectionVariant, isPhoneView, created_by = "" }: { sectionVariant: Variants; isPhoneView: boolean; created_by: string; }) => {
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [editFormProps, setEditFormProps] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
    const deleteStaffRoleMutation = useDeleteStaffRoleHandler();
    const queryClient = useQueryClient();
    const { setTitle } = useCustomDeleteHandler();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedBusinessId = sessionStorage.getItem("selectedBusinessId");
            return storedBusinessId ? JSON.parse(storedBusinessId) : 0;
        }
        return 0;
    }, []);

    const { data: staffRolesData, isLoading: staffRoleLoading, isSuccess: staffRoleSuccesss } = useQuery({
        queryKey: ['get-staff-roles', businessId],
        queryFn: () => getStaffRoles({ businessId }),
        refetchOnWindowFocus: 'always',
        retry: false,
        enabled: businessId !== 0
    });

    const [staffRoles, setStaffRoles] = useState<StaffRoleObj[]>([]);

    useEffect(() => {
        if (staffRoleSuccesss) {
            setStaffRoles(staffRolesData?.roles);
        }
        console.log(staffRolesData);
    }, [staffRolesData, staffRoleSuccesss]);

    const handleCreateRole = () => {
        setShowCreateForm(true);
    };

    const handleFormClose = () => {
        setShowCreateForm(false);
    };

    const handleEditFormClose = () => {
        setEditFormProps({ open: false, id: "" });
    };

    const handleEditForm = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id as string;
        setEditFormProps({ open: true, id });
    };

    const handleDeleteRole = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const roleId = e.currentTarget.dataset.id as string;
        const roleToDelete = staffRoles.find(r => r.role_id === roleId);
        
        if (!roleToDelete) return;

        const req_data = {
            role_id: roleId,
            business_id: businessId
        };

        setTitle(`Are you sure you want to delete the "${roleToDelete.role_name}" role? Staff assigned to this role will be reassigned to an unassigned role.`);
        
        reactToast(CustomDeleteHandler, {
            async onClose(req) {
                switch(req) {
                    case "confirm": {
                        try {
                            await deleteStaffRoleMutation.mutateAsync((req_data as {role_id: string; business_id: number}), {
                                onSuccess: async (data) => {
                                    toast.success(data?.message ?? `Role "${roleToDelete.role_name}" deleted successfully`);
                                    await queryClient.invalidateQueries({ queryKey: ['get-staff-roles', businessId], refetchType: 'active' });
                                },
                                onError: (err) => {
                                    if (err instanceof Error) {
                                        toast.error(err.message ?? "Error Occurred while Trying To Delete Role");
                                        return;
                                    }
                                    toast.error("Unexpected Error Occurred While Trying To Delete Role");
                                }
                            })
                        } catch(err) {
                            toast.error("Error Occurred While Trying To Delete Role", { description: err instanceof Error ? err.message : "Unexpected Error" });
                        }
                    }
                    break;
                    case "cancel": {
                        toast.info("Role Deletion Cancelled");
                    }
                    break;
                    default:
                        return;
                }
            }
        });
    };

    return (
        <>
            <motion.div
                key="permissions"
                variants={sectionVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
            >
                <Card className="dark:bg-black">
                    <CardHeader className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-template-primary" />
                                    Staff Roles & Permissions
                                </CardTitle>
                                <CardDescription>Create and manage staff roles with specific permissions</CardDescription>
                            </div>
                            <button
                                onClick={handleCreateRole}
                                className="flex items-center gap-2 px-4 py-2 bg-template-primary text-white text-sm font-medium rounded-lg hover:bg-template-primary/90 transition-colors"
                            >
                                <Plus size={16} />
                                Create Role
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {staffRoles.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No staff roles created</h3>
                                    <p className="text-gray-500 mb-6">Create your first staff role to manage permissions and access levels.</p>
                                    <button
                                        onClick={handleCreateRole}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-template-primary text-white font-medium rounded-lg hover:bg-template-primary/90 transition-colors"
                                    >
                                        <Plus size={18} />
                                        Create First Role
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {staffRoles.map((role) => (
                                        <div key={role.role_id} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-template-primary/10 rounded-lg">
                                                        <Shield className="h-5 w-5 text-template-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{role.role_name}</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Created {new Date(role.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-600">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 dark:text-gray-400">{role?.role_id}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-medium rounded-full">
                                                        {role.permissions.length} permissions
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button data-id={`${role.role_id}`} onClick={(e) => handleEditForm(e)} className="text-xs text-template-primary hover:text-template-primary/80 font-medium dark:text-template-primary/80 dark:hover:text-template-primary">
                                                        Edit
                                                    </button>
                                                    <button 
                                                        data-id={`${role.role_id}`} 
                                                        onClick={handleDeleteRole}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {showCreateForm && (
                <CreateStaffRoleForm
                    businessId={businessId}
                    created_by={created_by}
                    handleFormClose={handleFormClose}
                />
            )}
            {editFormProps.open && (
                <EditStaffRoleForm
                    roleData={
                        {
                            ...staffRoles?.find((role) => role.role_id! === editFormProps?.id),
                            permissions_count: staffRoles?.find((role) => role.role_id! === editFormProps?.id)?.permissions?.length || 0
                        } as StaffRoleObj & { permissions_count: number }
                    }
                    businessId={businessId}
                    created_by={created_by}
                    handleFormClose={handleEditFormClose}
                />
            )}
        </>
    );
}
export default PermissionSettings;