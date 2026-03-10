"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
];

const AppointmentForm = () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    const router = useRouter();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Calendar section */}
            <div>
                <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-400" />
                    Select Date
                </h4>
                <div className="bg-white/[0.04] rounded-xl border border-white/[0.06] p-3 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={{ before: new Date() }}
                        className="!bg-transparent text-white [&_button]:text-white/80 [&_button:hover]:bg-white/10"
                    />
                </div>

                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2 text-sm text-emerald-400"
                    >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{format(selectedDate, "EEEE, MMMM do, yyyy")}</span>
                    </motion.div>
                )}
            </div>

            {/* Time slots */}
            <div>
                <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Select Time
                </h4>
                <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                        <motion.button
                            key={time}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSelectedTime(time)}
                            className={`
                py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
                ${selectedTime === time
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                                    : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1] border border-white/[0.06]"
                                }
              `}
                        >
                            {time}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Form fields */}
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-medium text-white/50 mb-1.5 block">
                            Full Name
                        </label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/25 focus:border-emerald-500/50 h-10 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/50 mb-1.5 block">
                            Email
                        </label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/25 focus:border-emerald-500/50 h-10 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-white/50 mb-1.5 block">
                        Phone Number
                    </label>
                    <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/25 focus:border-emerald-500/50 h-10 text-sm"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-white/50 mb-1.5 block">
                        Notes (Optional)
                    </label>
                    <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Tell us about your requirements..."
                        className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/25 focus:border-emerald-500/50 min-h-[80px] text-sm resize-none"
                    />
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={!selectedDate || !selectedTime}
                onClick={async () => {
                    toast.success("System not fully built", {
                        description: "But you'll be redirected to the dashboard, in next few seconds"
                    });
                    await new Promise(res => setTimeout(res, 2000));
                    router.replace("/registration-successful");
                }}
                className={`
          w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer
          ${selectedDate && selectedTime
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl"
                        : "bg-white/[0.06] text-white/30 cursor-not-allowed"
                    }
        `}
            >
                <CalendarDays className="w-4 h-4" />
                Schedule Appointment
            </motion.button>
        </div>
    );
};

export default AppointmentForm;
