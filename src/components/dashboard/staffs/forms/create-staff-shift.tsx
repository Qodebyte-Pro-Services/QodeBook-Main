"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { X, CalendarClock, Clock } from "lucide-react";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type TimeRange = { start: string; end: string };

type WorkingHours = Partial<Record<DayKey, TimeRange>>;

export type StaffShiftPayload = {
  staff_id: string;
  business_id: number;
  fullname: string;
  working_hours: WorkingHours;
  work_days: DayKey[];
};

type Props = {
  initialValues?: Partial<Omit<StaffShiftPayload, "fullname"> & {full_name: string}>;
  onSubmit?: (data: StaffShiftPayload) => void | Promise<void>;
  onClose?: () => void;
  submitLabel?: string;
};

const DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CreateStaffShiftForm({
  initialValues,
  onSubmit,
  onClose,
  submitLabel = "Save Shift",
}: Props) {
  const [staffId, setStaffId] = useState(initialValues?.staff_id ?? "");
  const [businessId, setBusinessId] = useState(
    initialValues?.business_id ?? ("" as unknown as number)
  );
  const [fullname, setFullname] = useState(initialValues?.full_name ?? "");

  const initialWorkDays = useMemo<DayKey[]>(() => {
    if (initialValues?.work_days && initialValues.work_days.length) {
      return initialValues.work_days as DayKey[];
    }
    if (initialValues?.working_hours) {
      return Object.keys(initialValues.working_hours) as DayKey[];
    }
    return [];
  }, [initialValues]);

  const [selectedDays, setSelectedDays] = useState<DayKey[]>(initialWorkDays);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(() => {
    const base: WorkingHours = {};
    if (initialValues?.working_hours) {
      return { ...initialValues.working_hours } as WorkingHours;
    }
    return base;
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const containerVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
  };

  function toggleDay(day: DayKey) {
    setSelectedDays((prev) => {
      const exists = prev.includes(day);
      const next = exists ? prev.filter((d) => d !== day) : [...prev, day];
      if (!exists && !workingHours[day]) {
        setWorkingHours((wh) => ({ ...wh, [day]: { start: "09:00", end: "17:00" } }));
      }
      if (exists) {
        setWorkingHours((wh) => {
          const { [day]: _, ...rest } = wh;
          return rest;
        });
      }
      return next;
    });
  }

  function updateTime(day: DayKey, key: keyof TimeRange, value: string) {
    setWorkingHours((wh) => ({
      ...wh,
      [day]: { ...(wh[day] ?? { start: "", end: "" }), [key]: value },
    }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!staffId?.trim()) nextErrors.staff_id = "Required";
    if (businessId === undefined || businessId === null || !businessId)
      nextErrors.business_id = "Required";
    if (!fullname?.trim()) nextErrors.fullname = "Required";
    if (!selectedDays.length) nextErrors.work_days = "Select at least one day";
    selectedDays.forEach((d) => {
      const r = workingHours[d];
      if (!r?.start || !r?.end) nextErrors[`working_hours.${d}`] = "Start and end times required";
      if (r?.start && r?.end && r.start >= r.end)
        nextErrors[`working_hours.${d}`] = "End time must be after start";
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload: StaffShiftPayload = {
      staff_id: staffId.trim(),
      business_id: Number(businessId),
      fullname: fullname.trim(),
      working_hours: selectedDays.reduce((acc, d) => {
        if (workingHours[d]) acc[d] = workingHours[d] as TimeRange;
        return acc;
      }, {} as WorkingHours),
      work_days: [...selectedDays],
    };
    try {
      setSubmitting(true);
      await onSubmit?.(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariant}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-gradient-to-r from-template-primary/90 via-template-primary to-template-primary/80 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-2">
                  <CalendarClock size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Create Staff Shift</h2>
                  <p className="text-xs/5 opacity-90">Configure working days and hours</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-60"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm hidden font-medium text-gray-700">Staff ID</label>
              <input
                type="hidden"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. staff-111"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-template-primary/30 transition focus:ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm hidden font-medium text-gray-700">Business ID</label>
              <input
                type="hidden"
                value={businessId as number}
                onChange={(e) => setBusinessId(Number(e.target.value))}
                placeholder="e.g. 1"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                readOnly
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
              />
              {errors.fullname && (
                <p className="text-xs text-red-600">{errors.fullname}</p>
              )}
            </div>
          </div>

            <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Working Days</h3>
                <p className="text-xs text-gray-500">Select days and set time ranges</p>
              </div>
              {errors.work_days && (
                <p className="text-xs font-medium text-red-600">{errors.work_days}</p>
              )}
            </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DAYS.map((day) => {
                const active = selectedDays.includes(day);
                const times = workingHours[day];
                return (
                  <div
                    key={day}
                    className={`rounded-lg border p-3 transition ${
                      active ? "border-template-primary/50 bg-template-primary/5" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                          active
                            ? "border-template-primary bg-template-primary text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {titleCase(day)}
                        </span>
                        <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
                          {active ? "Selected" : "Tap to select"}
                        </span>
                      </button>

                      {errors[`working_hours.${day}`] && (
                        <span className="text-[11px] text-red-600">
                          {errors[`working_hours.${day}`]}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 items-center gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Start</label>
                        <input
                          type="time"
                          value={times?.start ?? ""}
                          onChange={(e) => updateTime(day, "start", e.target.value)}
                          disabled={!active}
                          className="w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-xs outline-none ring-template-primary/30 transition focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">End</label>
                        <input
                          type="time"
                          value={times?.end ?? ""}
                          onChange={(e) => updateTime(day, "end", e.target.value)}
                          disabled={!active}
                          className="w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-xs outline-none ring-template-primary/30 transition focus:ring disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t bg-gray-50 px-6 py-4">
          <div className="text-xs text-gray-500">
            {selectedDays.length ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span>Selected:</span>
                {selectedDays
                  .slice()
                  .sort()
                  .map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-template-primary/10 px-2 py-0.5 text-[11px] font-medium text-template-primary"
                    >
                      {titleCase(d)} {workingHours[d]?.start}–{workingHours[d]?.end}
                    </span>
                  ))}
              </div>
            ) : (
              <span>No days selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex shrink-0 items-center rounded-md bg-template-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  </AnimatePresence>
);
}
