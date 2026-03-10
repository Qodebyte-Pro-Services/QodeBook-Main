"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBusiness } from "@/hooks/useControllers";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { toast } from "sonner";
import z from "zod";

interface CreateBusinessFormProps {
    isCreateOpen: boolean;
    setIsCreateOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


const createBusinessSchema = z.object({
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
    (data) => !(data.businessType === 'others' && (!data.businessTypeOther || data.businessTypeOther.trim().length === 0)),
    {
        message: "Please specify your business type",
        path: ["businessTypeOther"]
    }
);

type CreateBusinessSchema = z.infer<typeof createBusinessSchema>;

const CreateBusinessForm = ({ isCreateOpen, setIsCreateOpen }: CreateBusinessFormProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const createBusinessMutation = useCreateBusiness();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger,
        reset
    } = useForm<CreateBusinessSchema>({
        resolver: zodResolver(createBusinessSchema),
        defaultValues: {
            businessName: '',
            businessType: '',
            businessAddress: '',
            phone: '',
            businessDocument: undefined
        }
    });

    const watchedFile = watch("businessDocument");

    useEffect(() => {
        if (watchedFile && watchedFile.length > 0) {
            const file = watchedFile[0];
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [watchedFile]);

    const onSubmit = async (data: CreateBusinessSchema) => {
        const formData = new FormData();
        const businessType = data.businessType === 'others'
            ? data.businessTypeOther || 'Other'
            : data.businessType;

        formData.append('business_name', data.businessName);
        formData.append('business_type', businessType);
        formData.append('address', data.businessAddress);
        formData.append('business_phone', data.phone);

        if (data.businessDocument && data.businessDocument.length > 0) {
            formData.append('logo', data.businessDocument[0]);
        }

        try {
            await createBusinessMutation.mutateAsync(formData, {
                onSuccess: () => {
                    toast.success("Business created successfully");
                    setIsCreateOpen(false);
                    reset();
                    setPreviewUrl(null);
                    queryClient.invalidateQueries({ queryKey: ["user-businesses"] });
                },
                onError: (error: any) => {
                    toast.error(error?.message || "Failed to create business");
                }
            });
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Business</DialogTitle>
                    <DialogDescription>
                        Enter the details below to register a new business.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                            id="businessName"
                            placeholder="e.g. Tech Solutions"
                            {...register("businessName")}
                            className={errors.businessName ? "border-red-500" : ""}
                        />
                        {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessType">Type</Label>
                            <select
                                id="businessType"
                                {...register("businessType")}
                                className={cn(
                                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.businessType ? "border-red-500" : ""
                                )}
                            >
                                <option value="">Select type</option>
                                <option value="pharmacy">Pharmacy</option>
                                <option value="gym">Gym</option>
                                <option value="others">Others</option>
                            </select>
                            {errors.businessType && <p className="text-xs text-red-500">{errors.businessType.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                placeholder="e.g. +1234567890"
                                {...register("phone")}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                        </div>
                    </div>

                    {watch('businessType') === 'others' && (
                        <div className="space-y-2">
                            <Label htmlFor="businessTypeOther">Specify Type</Label>
                            <Input
                                id="businessTypeOther"
                                placeholder="e.g. Retail Store"
                                {...register("businessTypeOther")}
                                className={errors.businessTypeOther ? "border-red-500" : ""}
                            />
                            {errors.businessTypeOther && <p className="text-xs text-red-500">{errors.businessTypeOther.message}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="businessAddress">Address</Label>
                        <Input
                            id="businessAddress"
                            placeholder="e.g. 123 Main St, City"
                            {...register("businessAddress")}
                            className={errors.businessAddress ? "border-red-500" : ""}
                        />
                        {errors.businessAddress && <p className="text-xs text-red-500">{errors.businessAddress.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Business Logo (Optional)</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="businessDocument"
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                                    errors.businessDocument ? "border-red-500 bg-red-50" : "border-gray-300"
                                )}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {previewUrl ? (
                                        <div className="relative w-24 h-24">
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-contain rounded-md"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="businessDocument"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    {...register("businessDocument")}
                                    onChange={(e) => {
                                        register("businessDocument").onChange(e);
                                        trigger("businessDocument");
                                    }}
                                />
                            </label>
                        </div>
                        {errors.businessDocument && <p className="text-xs text-red-500">{errors.businessDocument.message as string}</p>}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createBusinessMutation.isPending} className="bg-template-primary hover:bg-template-primary/90">
                            {createBusinessMutation.isPending ? (
                                <>
                                    <CgSpinner className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Business"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateBusinessForm;