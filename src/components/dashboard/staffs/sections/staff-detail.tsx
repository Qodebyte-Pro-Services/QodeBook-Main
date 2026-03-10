"use client";

import React, { useRef, useState, useEffect, useMemo} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toast as reactToast } from "react-toastify";
import { PiCaretDoubleLeft, PiCaretLeftBold } from "react-icons/pi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTable } from "../../tables";
import { Edit2Icon, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStaffById, getStaffDocs } from "@/api/controllers/get/handler";
import { StaffResponseLogic } from "@/models/types/shared/handlers-type";
import { CgSpinner } from "react-icons/cg";
import { useDeleteUserAccount, useStaffDeleteDocHandler, useStaffDocsHandler, useStaffShiftHandler, useStaffUpdateShiftHandler } from "@/hooks/useControllers";
import { useCustomDeleteHandler } from "@/store/state/lib/ui-state-manager";
import { BadgeTwo } from "@/components/ui/badge-two";
import Image from "next/image";
import { FaRegEye, FaRegEyeSlash, FaCheck, FaTimes, FaFilePdf, FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { TabList } from "../..";
import { useCustomStyles } from "@/hooks";
import {AnimatePresence, motion} from "framer-motion";
import { useUpdateStaffListform } from "@/hooks/useHandlers";
import CustomToastUI from "../../ui/custom-toast-ui";
import { TbTrash } from "react-icons/tb";
import EditStaffForm from "../forms/edit-staff-form";
import CreateStaffShiftForm, { StaffShiftPayload } from "../forms/create-staff-shift";
import StaffShifts from "./staff-shifts";
import StaffSubcharge from "./staff-subcharge";
import { StaffPaymentDetail } from "./staff-payment-detail";
import StaffSalaryTable from "../../tables/staff-salary-table";


type StaffDocsReponse = {
    total: number;
    page: number;
    limit: number;
    staff_docs: Array<{
        id: string;
        business_id: number;
        staff_id: string;
        document_name: string;
        file: string;
        created_at: string;
    }>
}

const StaffDetails = ({view}: {view: Array<string>}) => {
    const [showStaffShiftForm, setShowStaffShiftForm] = useState<boolean>(false);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [listCount, setlistCount] = useState<number>(() => {
        if (typeof window === "undefined") return 0;
        const stored_listcount = localStorage.getItem("staff-detail-listcount");
        return stored_listcount ? JSON.parse(stored_listcount) : 0;
    });

    const tabs = useMemo<Array<string>>(() => ["Summary", "Shifts", "Subcharges", "Payment History"], []);

    const [showDocument, setShowDocument] = useState<boolean>(false);
    const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);
    const [docs, setDocs] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const [showEditStaffForm, setShowEditStaffForm] = useState<boolean>(false);

    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {hiddenScrollbar} = useCustomStyles();

    const deleteUserHandler = useDeleteUserAccount();
    const updateStaffStatusHandler = useUpdateStaffListform();
    const router = useRouter();

    const {setTitle} = useCustomDeleteHandler();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            return businessId ? JSON.parse(businessId) : null;
        }
        return 0;
    }, []);

    const [id, full_name] = useMemo(() => view, [view]);

    const docsUploadHandler = useStaffDocsHandler();
    const deleteStaffDocHandler = useStaffDeleteDocHandler();
    const staffShiftHandler = useStaffShiftHandler();

    const queryClient = useQueryClient();

    const {data: staffDetials, isLoading: staffLoading, isSuccess: staffSuccess, isError: staffError, refetch: staffRefetch, ...rest} = useQuery({
        queryKey: ["get-staff-record", businessId],
        queryFn: () => getStaffById(id, businessId),
        refetchOnWindowFocus: false,
        retry: false,
        enabled: businessId !== 0
    });

    const staff_details = useMemo(() => {
        if (staffSuccess && !staffError) {
            return staffDetials?.staff || {};
        }
        return {}
    }, [staffDetials, staffSuccess, staffError]) as StaffResponseLogic;

    useEffect(() => {
        const lists = Array.isArray(staff_details?.document) ? (staff_details?.document as Array<{url: string; public_id: string; type: string;}>) : [];
        const _docs = lists?.map(list => list?.url);
        setDocs(_docs);
    }, [staff_details?.document]);

    const docs_payload = useMemo(() => {
        if (typeof window === "undefined") return;
        if (staff_details && Object.values(staff_details)?.filter(Boolean)?.length) {
            const data = {
                staff_id: staff_details?.staff_id,
                business_id: staff_details?.business_id
            };
            const searchParams = new URLSearchParams();
            Object.entries(data)
            ?.filter(([key, value]) => typeof value === "string" ? value.trim() : value !== 0)
            ?.forEach(([key, value]) => searchParams.append(key, String(value)));
            return {
                business_id: staff_details?.business_id,
                queryData: searchParams?.toString()
            }
        }
    }, [staff_details]) as {business_id: number; queryData: string};

    const {data: staffDocs, isSuccess: staffDocsSuccess, isError: staffDocsError} = useQuery({
        queryKey: ["get-staff-docs", businessId],
        queryFn: () => getStaffDocs(docs_payload),
        enabled: businessId !== 0 && Object.values(docs_payload || {})?.filter(Boolean)?.length > 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const staff_docs = useMemo(() => {
        if (staffDocsSuccess && !staffDocsError) {
            return staffDocs;
        }
    }, [staffDocs, staffDocsSuccess, staffDocsError]) as StaffDocsReponse;

    useEffect(() => {
        if (staff_docs?.staff_docs?.length) {
            const doc_files = staff_docs?.staff_docs?.map(item => item?.file);
            setDocs(doc_files);
        }
    }, [staff_docs]);

    const docsIds = useMemo(() => {
        if (staff_docs?.staff_docs?.length) {
            const ids = staff_docs?.staff_docs?.map(item => item?.id);
            return ids;
        }
    }, [staff_docs]);

    const handleOpenFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;
        setPendingFile(file);
        const url = URL.createObjectURL(file);
        setPendingPreviewUrl(url);
    };

    const resetPending = () => {
        if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
        setPendingFile(null);
        setPendingPreviewUrl(null);
        setIsUploading(false);
        setUploadProgress(0);
    };

    const handleConfirmUpload = async () => {
        if (!pendingFile) return;
        setIsUploading(true);
        setUploadProgress(10);
        const timer = setInterval(() => {
            setUploadProgress((p) => {
                const next = Math.min(p + Math.random() * 20, 95);
                return next;
            });
        }, 300);

        const data = {
            business_id: staff_details?.business_id,
            staff_id: staff_details?.staff_id,
            file: pendingFile,
            document_name: pendingFile?.name
        }
        try {
            const formdata = new FormData();
            Object.entries(data)?.forEach(([key, value]) => {
                if (value instanceof File) {
                    formdata.append("file", value);
                }else {
                    formdata.append(key, String(value));
                }
            });

            const doc_payload = {
                business_id: staff_details?.business_id,
                data: formdata
            };
            docsUploadHandler.mutateAsync(doc_payload, {
                onSuccess(data) {
                    toast.success(data?.message || "Staff Document Uploaded Successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["get-staff-list", businessId],
                        refetchType: "active"
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["get-staff-docs", businessId],
                        refetchType: "active"
                    });
                    setUploadProgress(100);
                    if (pendingPreviewUrl) setDocs((d) => [pendingPreviewUrl, ...d]);
                    setTimeout(() => {
                        resetPending();
                    }, 400);
                },
                onError(err) {
                    toast.error(err?.message || "Staff Document Failed To Upload");
                    setTimeout(() => {
                        resetPending?.();
                    }, 400);
                }
            });
        } catch (err) {
            console.log(err);
            setIsUploading(false);
        } finally {
            clearInterval(timer);
        }
    };

    const handleViewDoc = (url: string) => {
        setActiveDocUrl(url);
        setShowDocument(true);
    };

    const handleCloseViewer = () => {
        setShowDocument(false);
        setActiveDocUrl(null);
    };

    const handleDownload = async (url: string) => {
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `document-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            toast.error("Failed to download document");
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        let isMounted = true;
        if (isMounted) {
            const node = tabRefs.current[listCount || 0];
            const containerNode = containerRef.current;
            if (node && containerNode) {
                const nodeRect = node?.getBoundingClientRect();
                const containerRect = containerNode?.getBoundingClientRect();
                const padding = 8;
                setIndicatorStyle({
                    left: (nodeRect?.left - containerRect?.left + containerNode?.scrollLeft - padding / 2),
                    width: nodeRect?.width + padding,
                });
            }
            localStorage.setItem("staff-detail-listcount", JSON.stringify(listCount));
        }
        return () => {
            isMounted = false;
        }
    }, [listCount]);

    useEffect(() => {
        setTitle("Staff");
    }, [setTitle]);

    const handleUpdateStaffStatus = async (type: string) => {
        switch(type) {
            case "terminate": {
                reactToast(({closeToast}) => (
                    <CustomToastUI
                        closeToast={closeToast}
                        onConfirm={async () => {
                            const formdata = new FormData();
                            formdata?.append("staff_status", "terminated");
                            const data = {
                                id: staff_details?.staff_id,
                                businessId: staff_details?.business_id,
                                data: formdata
                            };
                            try {
                                await updateStaffStatusHandler.mutateAsync(data, {
                                    onSuccess(data) {
                                        toast?.success(data?.message || "Staff Status Updated Successfully");
                                    },
                                    onError(err) {
                                        toast.error(err?.message || "Unexpected Error Ocurred While Terminating Staff Status");
                                    }
                                })
                            }catch(err) {
                                if (err instanceof Error) {
                                    toast?.error(err?.message || "Error occurred while trying to terminate staff status");
                                    return;
                                }
                                toast?.error("Unexpected error occurred while trying to terminate staff status");
                            }
                        }}
                        title={"Terminate staff status?"}
                        btnText={"Terminate"}
                    />
                ))               
            }
            break;
            default: {
                reactToast(({closeToast}) => (
                    <CustomToastUI
                        closeToast={closeToast}
                        onConfirm={async () => {
                            const formdata = new FormData();
                            formdata?.append("staff_status", "suspended");
                            const data = {
                                id: staff_details?.staff_id,
                                businessId: staff_details?.business_id,
                                data: formdata
                            };
                            try {
                                await updateStaffStatusHandler.mutateAsync(data, {
                                    onSuccess(data) {
                                        toast?.success(data?.message || "Staff Suspended Successfully");
                                    },
                                    onError(err) {
                                        toast.error(err?.message || "Unexpected Error Ocurred While Suspending Staff Status");
                                    }
                                })
                            }catch(err) {
                                if (err instanceof Error) {
                                    toast?.error(err?.message || "Error occurred while trying to suspend staff status");
                                    return;
                                }
                                toast?.error("Unexpected error occurred while trying to suspend staff status");
                            }
                        }}
                        title={"Suspend staff status?"}
                        btnText={"Suspend"}
                    />
                ))
            }
                   
                break;
        }
    }

    const handleDeleteDoc = (e: React.MouseEvent<HTMLElement | HTMLOrSVGElement>) => {
        const docId = e.currentTarget?.dataset?.docId;
        reactToast(({closeToast}) => (
            <CustomToastUI
                closeToast={closeToast}
                onConfirm={async () => {
                    const payload = {
                        id: docId || "",
                        business_id: staff_details?.business_id
                    };
                    try {
                        await deleteStaffDocHandler.mutateAsync(payload, {
                            onSuccess(data) {
                                toast.success(data?.message || "Document Deleted Successfully", {
                                    description: `Staff Document With An ID ${payload?.id} Deleted`
                                });
                                queryClient.invalidateQueries({
                                    queryKey: ["get-staff-docs", staff_details?.business_id],
                                    refetchType: "active"
                                });
                            },
                            onError(err) {
                                toast.error(err?.message || "Error Occurred while trying to delete staff document");
                            }
                        });
                    }catch(err) {
                        console.log(err);
                        if (err instanceof Error) {
                            toast.error(err?.message || "Error Occurred while deleting staff document");
                            return;
                        }
                        toast.error("Unexpected error Occurred while deleting staff document");
                    }
                }}
                onCancel={() => toast.info("Staff Document Still Intact")}
                title="Delete Staff Document?"
                btnText="delete document"
            />
        ))
    }

    const handleShiftSubmit = async (payload: StaffShiftPayload) => {
        try {
            await staffShiftHandler.mutateAsync(payload, {
                onSuccess(data) {
                    toast?.success(data?.message || "Staff Shift Created Successfully", {description: `Shift for ${payload?.fullname} has been created Successfully`});
                    queryClient.invalidateQueries({
                        queryKey:["get-staff-shifts", payload?.business_id],
                        refetchType: "active"
                    });
                    setTimeout(setShowStaffShiftForm, 2000, false);
                },
                onError(err) {
                    toast.error(err?.message || "Error Occurred while trying to create staff shift");
                }
            });
        }catch(err) {
            if (err instanceof Error) {
                toast.error(err?.message || "Error Occurred While Trying To Create Staff Shift");
                return;
            }
            toast.info("Unexpected Error Occurred While Trying To Create Staff Shift");
        }
    }

    const handleDeleteUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const userId = button.dataset.id;

        const req_data = {};

        if (userId && businessId) {
            Object.assign(req_data, {userId, businessId: +businessId});
        }

        reactToast(({closeToast}) => (
            <CustomToastUI
                closeToast={closeToast}
                onConfirm={async () => {
                    try {
                        await deleteUserHandler.mutateAsync((req_data as {userId: string; businessId: number}), {
                            onSuccess: async (data) => {
                                toast.success(data?.messsage ?? "User Account Deleted Successfully");
                                router.replace("/staff");
                            },
                            onError: (err) => {
                                if (err instanceof Error) {
                                    toast.error(err.message ?? "Error Occurred while Trying To Delete User");
                                    return;
                                }
                                toast.error("Unexpected Error Occurred While Trying To Delete User");
                            }
                        })
                    }catch(err) {
                        console.log(err);
                        toast.error("Error Occurred While Trying To Delete User");
                    }
                }}
                onCancel={() => {
                    toast.info("User Account Not Deleted");
                }}
                title={"Delete Staff Account?"}
                btnText="Delete"
            />
        ))
    }

    if (staffLoading || rest?.isRefetching) {
        return(
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex items-center gap-x-2">
                    <CgSpinner className="animate-spin" size={22} />
                    <div className="text-base font-[550]">Loading...</div>
                </div>
            </div>
        )
    }

    if (staffError || rest?.isRefetchError) {
        return(
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex items-center gap-x-2">
                    <button onClick={() => staffRefetch()} className="px-4 py-1.5 rounded-sm bg-template-primary text-white">Try Again</button>
                    <button onClick={() => history.back()} className="px-4 py-1.5 rounded-sm bg-template-whitesmoke text-black border border-white/60">Go Back</button>
                </div>
            </div>
        )
    }

    return(
        <div className="flex flex-col gap-y-5">
            {/* Dashboard Header Section o */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Staff Summary</div>
                <button className="bg-template-primary cursor-pointer flex items-center gap-x-2 font-semibold text-white rounded-md py-2 px-4 text-sm" onClick={() => setShowEditStaffForm(true)}>
                    <Edit2Icon size={13} />
                    <span>
                        Edit Staff information
                    </span>
                </button>
            </div>
            <div className="flex items-center gap-x-3">
                <div onClick={() => history.back()} className="flex items-center gap-x-1">
                    <PiCaretLeftBold size={15} />
                    <span className="text-black/60 dark:text-white/60 font-[550] text-[13px]">Staff Management</span>
                </div>
                <div className="flex items-center gap-x-2">
                    <PiCaretDoubleLeft size={14} />
                    <span className="text-black dark:text-white font-[550] text-[13px]">Staff Summary</span>
                </div>
            </div>
            <div ref={containerRef} className="w-full sm:w-fit bg-template-whitesmoke-dim dark:bg-black rounded-sm relative z-10 overflow-x-auto px-2 sm:px-0" style={hiddenScrollbar}>
                <div className="flex items-center gap-x-7">
                    {tabs.map((item, index) => (
                        <TabList item={item} index={index} setlistCount={setlistCount} key={index} color={listCount === index ? 'text-white' : ''} ref={el => {
                            if (el) tabRefs.current[index] = el
                        }} />
                    ))}
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 bg-template-chart-store h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{left: indicatorStyle.left, width: indicatorStyle.width || tabRefs.current?.[listCount || 0]?.getBoundingClientRect().width}} />
            </div>
            {listCount === 0 && (
                <>
                    <Card className="dark:bg-black">
                        <CardHeader>
                            <CardTitle>Staff Summary</CardTitle>
                        </CardHeader>
                        <CardHeader className="flex items-center gap-x-2">
                            {staff_details?.photo ? (
                                <div className="w-10 h-10 rounded-full">
                                    <Image width={400} height={400} src={staff_details?.photo} alt={staff_details?.full_name} className="w-full h-full object-cover rounded-full aspect-video object-top" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-template-whitesmoke dark:bg-dark flex justify-center items-center">
                                    <span className="text-base font-[600]">{(staff_details?.full_name)?.match(/\b[A-Za-z]/g)?.join("").toUpperCase()}</span>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <div className="text-xs font-bold">{staff_details?.full_name}</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50">{staff_details?.email}</div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-6 gap-5">
                            {/* <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Staff ID</div>
                                <div className="text-[10.5px] text-black/50 font-bold">{staff_details?.staff_id}</div>
                            </div> */}
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Contact Info</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.contact_no ?? "N/A"}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Role</div>
                                <BadgeTwo className="self-start" variant={"default"}>
                                    {staff_details?.position_name}
                                </BadgeTwo>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Hired Date</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{new Date(staff_details?.created_at ?? Date.now().toLocaleString()).toLocaleString("default", {month: "short", day: "2-digit", year: "numeric"})}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Staff Address</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.address ?? "N/A"}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Emergency Contact</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.emergency_contact ?? "N/A"}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Guarantor Name</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.guarantor_name ?? "N/A"}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Guarantor Contact</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.guarantor_contact ?? "N/A"}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Guarantor Address</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.guarantor_address ?? "N/A"}</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[13px] font-[550]">Guarantor Relationship</div>
                                <div className="text-[10.5px] text-black/50 dark:text-white/50 font-bold">{staff_details?.guarantor_relationship ?? "N/A"}</div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Here i go add the table */}
                    <Card className="pt-3 pb-10 dark:bg-black">
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="text-xs text-gray-500/50 font-[550]">Identification</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div onClick={handleOpenFilePicker} className="group cursor-pointer h-44 rounded-md border-2 border-dashed flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-50 dark:via-gray-800 dark:from-gray-800 dark:to-gray-800 to-gray-100/50 hover:border-template-primary/60 transition relative">
                                        <FaCloudUploadAlt className="text-template-primary/90" size={28} />
                                        <div className="text-xs font-[550] mt-2">Upload document</div>
                                        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                                    </div>

                                    {pendingPreviewUrl && (
                                        <motion.div initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} transition={{ease: "easeInOut", duration: 0.25}} className="relative h-44 rounded-md border overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <FaFilePdf className="text-red-500" size={40} />
                                            </div>
                                            <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                                                {!isUploading && (
                                                    <>
                                                        <button onClick={resetPending} className="p-1.5 rounded-full bg-white shadow border text-red-500"><FaTimes size={14} /></button>
                                                        <button onClick={handleConfirmUpload} className="p-1.5 rounded-full bg-template-primary text-white shadow"><FaCheck size={14} /></button>
                                                    </>
                                                )}
                                            </div>
                                            {isUploading && (
                                                <div className="absolute inset-x-0 bottom-0 p-3">
                                                    <div className="w-full h-2 bg-gray-200 rounded">
                                                        <div className="h-2 bg-template-primary rounded" style={{width: `${uploadProgress}%`}} />
                                                    </div>
                                                    <div className="text-[10px] text-black/60 mt-1 font-[550]">Uploading... {Math.round(uploadProgress)}%</div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {docs?.map((url, idx) => (
                                        <motion.div key={url + idx} initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} className="relative h-44 rounded-md border overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center">
                                                <FaFilePdf className="text-red-500" size={36} />
                                                <div className="text-[11px] text-black/60 dark:text-white/60 mt-1 px-2 line-clamp-1">{url?.split("/").pop()}</div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-t">
                                                <button onClick={() => handleViewDoc(url)} className="flex items-center gap-1 text-xs font-[600] text-template-primary"><FaRegEye size={14} /> View</button>
                                                <button onClick={() => handleDownload(url)} className="flex items-center gap-1 text-xs font-[600] text-black/70 dark:text-white/70"><FaDownload size={14} /> Download</button>
                                            </div>
                                            <TbTrash data-doc-id={docsIds?.[idx]} size={22} onClick={handleDeleteDoc} className="absolute top-[3%] right-[2%] text-red-500 cursor-pointer z-20" />
                                        </motion.div>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {showDocument && activeDocUrl && (
                                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-black/60 dark:bg-gray-800/60 backdrop-blur-sm" onClick={handleCloseViewer} />
                                            <motion.div initial={{scale: 0.98}} animate={{scale: 1}} exit={{scale: 0.98}} transition={{type: "spring", stiffness: 260, damping: 26}} className="relative z-10 w-[95%] max-w-4xl h-[75vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                                                <button onClick={handleCloseViewer} className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-gray-800 shadow text-black/70 dark:text-white/70 z-20"><FaRegEyeSlash size={16} /></button>
                                                <iframe allowFullScreen src={activeDocUrl} className="w-full h-full" />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="px-4 py-3 dark:bg-black">
                        <CardHeader>
                            <CardTitle>Contract Details</CardTitle>
                        </CardHeader>
                        <CardContent className="w-full border-2 border-dotted border-red-500 rounded-md py-2 space-y-4 px-4">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-">
                                    <div className="text-xs font-[550]">Suspend Employee</div>
                                    <div className="text-[10px] font-[550] text-black/50">Suspend Employee from job for a given time</div>
                                </div>
                                <button onClick={() => handleUpdateStaffStatus("suspend")} data-id={staff_details?.staff_id || view?.[0]} className="px-8 py-1.5 rounded-md border text-sm border-red-500 cursor-pointer text-red-500">
                                    <span>Suspend</span>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-">
                                    <div className="text-xs font-[550]">Terminate Employee</div>
                                    <div className="text-[10px] font-[550] text-black/50">Terminate employment contract with employee</div>
                                </div>
                                <button onClick={() => handleUpdateStaffStatus("terminate")} data-id={staff_details?.staff_id || view?.[0]} className="px-8 py-1.5 rounded-md border text-sm border-red-500 cursor-pointer text-red-500">
                                    <span>Terminate</span>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-">
                                    <div className="text-xs font-[550]">Delete Customer Data</div>
                                    <div className="text-[10px] font-[550] text-black/50">Remove all data related to employee. Once you take this action, no going BACK.</div>
                                </div>
                                <button onClick={handleDeleteUser} data-id={staff_details?.staff_id || view?.[0]} className="flex items-center gap-x-2 px-8 py-1.5 text-sm rounded-md bg-red-500 cursor-pointer text-white">
                                    <Trash2 size={15} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>  
                </>
            )}
            {listCount === 1 && (
                <>
                    <div className="flex justify-end">
                        <button onClick={() => setShowStaffShiftForm(true)} className="flex items-center gap-x-2 py-2 px-4 rounded-md font-[550] bg-template-primary text-white text-sm">
                            <span>Add New Shift</span>
                        </button>
                    </div>
                    <StaffShifts
                        staffId={staff_details?.staff_id || ""}
                        businessId={staff_details?.business_id}
                    />
                </>
            )}
            {listCount === 2 && (    
                <StaffSubcharge
                    staff_details={staff_details}
                />
            )}
            {listCount === 3 && (
                <div className="flex flex-col gap-y-3">
                    <StaffPaymentDetail
                        staff={staff_details}
                    />
                    <StaffSalaryTable
                        staffId={staff_details?.staff_id || ""}
                    />
                </div>
            )}
            {showEditStaffForm && Object.keys(staff_details)?.length && (
                <EditStaffForm
                    branchId={staff_details?.branch_id}
                    businessId={staff_details?.business_id}
                    staffList={staff_details}
                    onClose={() => setShowEditStaffForm(false)}
                />
            )}
            {showStaffShiftForm && (
                <CreateStaffShiftForm
                    initialValues={staff_details}
                    onClose={() => setShowStaffShiftForm(false)}
                    onSubmit={handleShiftSubmit}
                />
            )}
        </div>
    );
}


export default StaffDetails;