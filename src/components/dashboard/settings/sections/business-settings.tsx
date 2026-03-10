"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Variants, motion } from "framer-motion";
import { useUserBusinesses } from "@/hooks/useControllers";
import { useMemo, useState } from "react";
import { Building2, MapPin, Phone, Calendar, Edit, MoreVertical, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CgSpinner } from "react-icons/cg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BadgeTwo } from "@/components/ui/badge-two";
import CreateBusinessForm from "../forms/create-business-form";

interface BusinessType {
    id: number;
    user_id: number;
    business_name: string;
    business_type: string;
    address: string;
    business_phone: string;
    logo_url: string;
    created_at: string;
}

const BusinessSettings = ({ sectionVariant, isPhoneView }: { sectionVariant: Variants; isPhoneView: boolean; }) => {
    const { data: businessesData, isLoading } = useUserBusinesses();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const businesses = useMemo(() => {
        return businessesData?.businesses || [];
    }, [businessesData]);

    return (
        <motion.div
            key="business-settings"
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(`w-full mt-2 space-y-4 ${isPhoneView ? 'mb-24' : ''}`)}
        >
            <Card className="dark:bg-black">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="space-y-1">
                        <CardTitle>Business Settings</CardTitle>
                        <CardDescription>Manage your business profile and details</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} size="sm" className="bg-template-primary hover:bg-template-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Business
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <CgSpinner className="w-8 h-8 animate-spin text-template-primary" />
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed dark:bg-black">
                            <Building2 className="w-12 h-12 mb-3 opacity-50" />
                            <p className="font-medium">No businesses found</p>
                            <p className="text-sm mt-1">Create your first business to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {businesses.map((business: BusinessType) => (
                                <motion.div
                                    key={business.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative bg-card border rounded-xl p-5 hover:shadow-md transition-all duration-200 dark:bg-black"
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
                                                    Edit Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar className="h-14 w-14 border-2 border-border">
                                            <AvatarImage src={business.logo_url} alt={business.business_name} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                                {business.business_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{business.business_name}</h3>
                                            <BadgeTwo variant="default" className="mt-1 text-xs font-normal capitalize">
                                                {business.business_type}
                                            </BadgeTwo>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-2.5">
                                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                                            <span className="leading-snug">{business.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                                            <span>{business.business_phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 pt-2 border-t mt-3">
                                            <Calendar className="w-4 h-4 shrink-0 text-primary/70" />
                                            <span className="text-xs">Joined {format(new Date(business.created_at), "MMMM d, yyyy")}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateBusinessForm isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} />
        </motion.div>
    );
}

export default BusinessSettings;