"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStaffShifts } from "@/api/controllers/get/handler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffShiftResponse } from "@/models/types/shared/handlers-type";
import { CgSpinner } from "react-icons/cg";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BadgeTwo } from "@/components/ui/badge-two";
import { FiClock, FiCalendar, FiMoreHorizontal } from "react-icons/fi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import EditStaffShiftForm from "../forms/edit-staff-shifts";
import { useDeleteStaffShift, useStaffUpdateShiftHandler } from "@/hooks/useControllers";
import { toast as reactToast } from "react-toastify";
import CustomToastUI from "../../ui/custom-toast-ui";

interface StaffShiftsProps {
  staffId: string;
  businessId: number;
  showEdit?: React.Dispatch<React.SetStateAction<boolean>>;
  onViewShift?: (shift: StaffShiftResponse) => void;
  onEditShift?: (shift: StaffShiftResponse) => void;
  onDeleteShift?: (shift: StaffShiftResponse) => void;
}

const dayOrder: Array<keyof NonNullable<StaffShiftResponse["working_hours"]>> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const CR_INDEX = 9;

const StaffShifts: React.FC<StaffShiftsProps> = ({ staffId, businessId, onViewShift, onEditShift, onDeleteShift, showEdit }) => {
  const [previewShift, setPreviewShift] = useState<StaffShiftResponse | null>(null);

  const [staffShifts, setStaffShifts] = useState<StaffShiftResponse | null>(null);

  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState<number>(1);

  const deleteStaffShiftHandler = useDeleteStaffShift();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["get-staff-shifts", businessId, staffId],
    queryFn: () => getStaffShifts(businessId, staffId),
    enabled: businessId !== 0 && !!staffId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const shifts: StaffShiftResponse[] = useMemo(() => {
    const raw = data as Record<"staff_shifts", Array<StaffShiftResponse>>;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as StaffShiftResponse[];
    if (Array.isArray(raw?.staff_shifts)) return raw.staff_shifts as StaffShiftResponse[];
    return [];
  }, [data]);

  const shifts_data = useMemo(() => {
    if (shifts?.length <= 0) return [];
    const paginated_no = Math.round(shifts?.length / 9).toString()?.split(".").length ? Math.round(shifts?.length / 9) + 1 : Math.round(shifts?.length / 9);
    const shiftsdata = shifts?.slice((currentIndex - 1) * CR_INDEX, currentIndex * CR_INDEX) as StaffShiftResponse[];
    return {
      data: shiftsdata,
      pagIndex: paginated_no
    }
  }, [shifts, currentIndex]) as {data: StaffShiftResponse[]; pagIndex: number};

  const updateStaffShiftHandler = useStaffUpdateShiftHandler();

  const handleEditStaffShift = async (payload: Omit<StaffShiftResponse, "created_at">) => {
    try {
      await updateStaffShiftHandler.mutateAsync(payload, {
        onSuccess(data) {
          toast.success(data?.message || "Staff Shift Updated Successfully");
          queryClient.invalidateQueries({
            queryKey: ["get-staff-shifts", payload?.business_id],
            refetchType: 'active'
          });
          setTimeout(setStaffShifts, 1500, null);
        },
        onError(err) {
          toast.error(err?.message || "Error Occurred while trying to update staff shift");
          setTimeout(setStaffShifts, 2000, null);
        }
      })
    }catch(err) {
      if (err instanceof Error) {
        console.log(err);
        toast.error(err?.message || "Error Occurred While Trying To Update Staff Shift");
        return;
      }
      toast.info("Unexpected error occurred while trying to update staff shift");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-64">
        <div className="flex items-center gap-x-2">
          <CgSpinner className="animate-spin" size={22} />
          <div className="text-sm font-[550]">Loading shifts...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-3 p-6">
        <div className="text-sm font-[600]">Failed to load shifts</div>
        <button onClick={() => refetch()} className="px-4 py-1.5 rounded-sm bg-template-primary text-white text-xs font-[600]">
          Retry
        </button>
      </div>
    );
  }

  const handleView = (shift: StaffShiftResponse) => {
    if (onViewShift) return onViewShift(shift);
    setPreviewShift(shift);
  };
  const handleEdit = (shift: StaffShiftResponse) => {
    setStaffShifts(shift);
  };
  const handleDelete = (shift: StaffShiftResponse) => {
    reactToast(({closeToast}) => (
      <CustomToastUI
        closeToast={closeToast}
        onConfirm={async () => {
            const payload = Object.assign({}, {business_id: shift?.business_id, shift_id: shift?.shift_id})
            try {
              await deleteStaffShiftHandler.mutateAsync(payload, {
                onSuccess(data) {
                  console.log(data);
                  toast.success(data?.message || "Staff Shift Deleted Successfully");
                  queryClient.invalidateQueries({
                    queryKey: ["get-staff-shifts", businessId],
                    refetchType: "active"
                  });
                },
                onError(err) {
                  toast.error(err?.message || "Error occurred while trying to delete staff shift");
                  console.log(err);
                }
              });
            }catch(err) {
              if (err instanceof Error) {
                toast.error(err?.message || "Error occurred while trying to delete staff shift");
                return;
              }
              toast.info("Unexpected Error Occurred while trying to delete user");
            }
        }}
        onCancel={() => toast.info("Staff Shifts Card Still Intact")}
        title="Delete Staff Shift?"
        btnText="Delete Shift"
      />
    ));
  };

  return (
    <>
      <Card className="pt-3 dark:bg-black">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-[600]">Staff Shifts</CardTitle>
            <div className="text-xs text-muted-foreground font-[550]">View and manage {shifts?.length || 0} shift(s)</div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => refetch()} variant="secondary" className="text-xs font-[600]">Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {shifts_data?.data.length === 0 ? (
            <div className="flex items-center justify-center w-full h-48 border rounded-md bg-white dark:bg-gray-800">
              <div className="text-sm text-black/60 dark:text-white/60 font-[550]">No shifts yet</div>
            </div>
          ) : (
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {!isRefetching ? shifts_data?.data.map((shift) => {
                  const hours = shift.working_hours || {};
                  const days = shift.work_days || Object.keys(hours || {});
                  return (
                    <motion.div key={shift.shift_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border bg-white dark:bg-[#121212] shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-template-primary to-template-primary/50 dark:from-template-primary/50 dark:to-template-primary/10">
                        <div className="text-sm text-white font-[700] line-clamp-1">{shift.fullname}</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-md hover:bg-black/5 transition">
                              <FiMoreHorizontal />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleView(shift)}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(shift)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(shift)} className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {dayOrder
                            .filter((d) => days?.includes(d))
                            .map((d) => (
                              <BadgeTwo key={d as string} variant="default" className="text-[10px]">{String(d).slice(0, 3)}</BadgeTwo>
                            ))}
                        </div>
                        <div className="space-y-2">
                          {dayOrder
                            .filter((d) => !!(hours)[d])
                            .map((d) => {
                              const time = (hours)[d];
                              return (
                                <div key={d as string} className="flex items-center justify-between text-[11px] font-[600] bg-gray-50 dark:bg-black rounded px-2 py-1">
                                  <div className="flex items-center gap-1 text-black/70 dark:text-white/70">
                                    <FiClock size={12} />
                                    <span className="uppercase">{String(d).slice(0, 3)}</span>
                                  </div>
                                  <div className="text-black/70 dark:text-white/70">
                                    {time?.start} - {time?.end}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-black/60 dark:text-white/60 font-[600]">
                          <div className="flex items-center gap-1">
                            <FiCalendar size={12} />
                            <span>Created</span>
                          </div>
                          <div>{new Date(shift.created_at).toLocaleString("default", { month: "short", day: "2-digit", year: "numeric" })}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }) : Array.from({length: 6})?.map((_, idx) => (
                  <Skeleton key={`staff-shifts-${idx}`} className="w-full h-[280px]" />
                ))}
              </div>
              {shifts_data?.pagIndex ? (
                <div className="flex items-center gap-x-2 self-center">
                 {Array.from({length: shifts_data?.pagIndex})?.map((_,idx) => (
                    <div key={`shift-paginatio-index-${idx}`} className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md ont-[550] ${currentIndex === idx + 1 ? 'bg-template-primary text-white' : 'border border-template-primary text-template-primary'}`} onClick={() => setCurrentIndex(idx + 1)}>{idx + 1}</div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>

        <AnimatePresence>
          {previewShift && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewShift(null)} />
              <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="relative z-10 w-[95%] max-w-2xl bg-white dark:bg-[#121212] rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="text-sm font-[700]">Shift Details</div>
                  <button onClick={() => setPreviewShift(null)} className="text-xs font-[700] px-2 py-1 rounded bg-black/5">Close</button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs font-[700]">{previewShift.fullname}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {dayOrder.map((d) => {
                      const time = (previewShift.working_hours)?.[d];
                      if (!time) return null;
                      return (
                        <div key={d as string} className="flex items-center justify-between text-[12px] bg-gray-50 dark:bg-black rounded px-2 py-1 font-[600]">
                          <span className="uppercase">{String(d).slice(0, 3)}</span>
                          <span>{time.start} - {time.end}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-black/60 dark:text-white/60 font-[600]">
                    <div className="flex items-center gap-1">
                      <FiCalendar size={12} />
                      <span>Created</span>
                    </div>
                    <div>{new Date(previewShift.created_at).toLocaleString("default", { month: "short", day: "2-digit", year: "numeric" })}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      {staffShifts && (
        <EditStaffShiftForm
          initialValues={staffShifts}
          onClose={() => setStaffShifts(null)}
          onSubmit={handleEditStaffShift}
        />
      )}
    </>
  );
};

export default StaffShifts;
