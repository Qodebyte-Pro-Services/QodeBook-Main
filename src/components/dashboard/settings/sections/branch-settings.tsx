"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { useBusinessBranches, useCreateBusinessBranch } from "@/hooks/useControllers";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, User, MoreVertical, Edit, Trash, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CgSpinner } from "react-icons/cg";
import { useQueryClient } from "@tanstack/react-query";

interface BranchType {
    id: number;
    business_id: number;
    branch_name: string;
    location: string;
    branch_manager: string;
    created_at: string;
}

const BranchSettings = ({ sectionVariant, isPhoneView }: { sectionVariant: Variants; isPhoneView: boolean; }) => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newBranch, setNewBranch] = useState({
        branch_name: "",
        location: "",
        branch_manager: ""
    });

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem("selectedBusinessId") || "";
    }, []);

    const { data: branchesData, isLoading } = useBusinessBranches(businessId);
    const createBranchHandler = useCreateBusinessBranch();
    const queryClient = useQueryClient();

    const branches = useMemo(() => {
        return branchesData?.branches || [];
    }, [branchesData]);

    const handleCreateBranch = async () => {
        if (!newBranch.branch_name || !newBranch.location) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createBranchHandler.mutateAsync({
                business_id: Number(businessId),
                ...newBranch
            }, {
                onSuccess: () => {
                    toast.success("Branch created successfully");
                    setIsAddOpen(false);
                    setNewBranch({ branch_name: "", location: "", branch_manager: "" });
                    queryClient.invalidateQueries({ queryKey: ["business-branches", businessId] });
                },
                onError: (error: any) => {
                    toast.error(error?.message || "Failed to create branch");
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            key="branch-settings"
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(`w-full mt-2 space-y-4 ${isPhoneView ? 'mb-24' : ''}`)}
        >
            <Card className="dark:bg-black">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="space-y-1">
                        <CardTitle>Branch Settings</CardTitle>
                        <CardDescription>Manage your business branches and locations</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} size="sm" className="bg-template-primary hover:bg-template-primary/90 dark:text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Branch
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <CgSpinner className="w-8 h-8 animate-spin text-template-primary" />
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                            <Building2 className="w-12 h-12 mb-3 opacity-50" />
                            <p className="font-medium">No branches found</p>
                            <p className="text-sm">Add your first branch to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {branches.map((branch: BranchType) => (
                                <motion.div
                                    key={branch.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative bg-card border rounded-xl p-4 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="absolute top-3 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info("Edit functionality coming soon")}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => toast.info("Delete functionality coming soon")}>
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-template-primary/10 rounded-lg text-template-primary">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base leading-none mb-1">{branch.branch_name}</h3>
                                            <p className="text-xs text-muted-foreground">ID: {branch.id}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{branch.location}</span>
                                        </div>
                                        {branch.branch_manager && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{branch.branch_manager}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Branch</DialogTitle>
                        <DialogDescription>
                            Create a new branch for your business.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Branch Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Main Office"
                                value={newBranch.branch_name}
                                onChange={(e) => setNewBranch({ ...newBranch, branch_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. 123 Business St"
                                value={newBranch.location}
                                onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="manager">Branch Manager (Optional)</Label>
                            <Input
                                id="manager"
                                placeholder="e.g. John Doe"
                                value={newBranch.branch_manager}
                                onChange={(e) => setNewBranch({ ...newBranch, branch_manager: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBranch} disabled={createBranchHandler.isPending} className="bg-template-primary hover:bg-template-primary/90">
                            {createBranchHandler.isPending ? (
                                <>
                                    <CgSpinner className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Branch"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default BranchSettings;