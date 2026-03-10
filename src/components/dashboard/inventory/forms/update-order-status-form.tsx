"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { OrderTask } from "@/store/data/order-data";
import { useUpdateSupplyOrderStatus } from "@/hooks/useControllers";
import { useQueries, useQueryClient } from "@tanstack/react-query";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: OrderTask;
  onSave?: (updated: OrderTask) => Promise<void> | void;
}

const UpdateOrderStatusForm: React.FC<Props> = ({ isOpen, onClose, order}) => {
  const [status, setStatus] = useState<string>((order as any)?.supply_status || "awaiting_payment");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const previousStatus = useMemo<string>(() => {
    return (order as OrderTask)?.supply_status || "awaiting_payment";
  }, [order]);

  const businessId = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const storedId = sessionStorage.getItem("selectedBusinessId");
    return storedId ? JSON.parse(storedId) : 0;
  }, []);

  const updateStatusOrderHandler = useUpdateSupplyOrderStatus();
  const queryClient = useQueryClient();

  const containerVariant = useMemo(
    () => ({
      from: { scale: 0.95, opacity: 0, y: 20 },
      to: { scale: 1, opacity: 1, y: 0 },
      go: { scale: 0.95, opacity: 0, y: 20 },
    }),
    []
  );

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!status) {
      setError("Status is required");
      return;
    }else if (["awaiting_payment"].includes(previousStatus?.replace(/\s/g, "_").toLowerCase()) && !(status.toLowerCase() in {"cancelled": true, "paid": true})) {
      setError("Invalid Approach, Order not yet Paid!");
      toast.error("Failed To Update Status", {description: "Kindly Pay For The Order To Continue"});
      return;
    }
    setError("");
    try {
      setIsSubmitting(true);
      const updated: OrderTask = { ...order, supply_status: status as string } as OrderTask;
      const request_data = {
        supply_order_id: updated?.id,
        supply_status: updated?.supply_status,
        business_id: +businessId
      }
      await updateStatusOrderHandler.mutateAsync(request_data, {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["get-supply-orders", businessId],
            refetchType: "active"
          });
          toast.success(data?.message || "Supply Order Status Updated Successfully");
        },
      });
      toast.success("Status updated");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error && err.message) || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariant}
        initial="from"
        animate="to"
        exit="go"
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                <h2 className="text-xl font-bold">Update Order Status</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-white/80 text-sm">Set the current status of this order.</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <Select value={status} onValueChange={(v) => { setStatus(v); if (error) setError(""); }}>
                <SelectTrigger className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                }`}>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {error && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-template-primary text-white hover:bg-template-primary/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateOrderStatusForm;
