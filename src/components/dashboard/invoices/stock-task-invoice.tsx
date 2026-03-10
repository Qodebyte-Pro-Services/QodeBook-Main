"use client";

import { StockTask } from "@/store/data/stock-management-data";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useCustomStyles } from "@/hooks";
import { XIcon, FileText, TrendingUp, TrendingDown, Calendar, User, Building, Hash, Package, ClipboardList } from "lucide-react";
import React from "react";

interface StockTaskInvoiceProps {
  stockTask: StockTask | null;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

function StockTaskInvoice({ stockTask, open, onOpenChange }: StockTaskInvoiceProps) {
  const { hiddenScrollbar } = useCustomStyles();

  if (!stockTask) return null;

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "adjustment":
        return "text-template-chart-store bg-template-chart-store/10";
      case "restock":
        return "text-template-blue bg-template-blue/10";
      default:
        return "text-template-chart-gas bg-template-chart-gas/10";
    }
  };

  const getReasonVariant = (reason: string) => {
    return reason.toLowerCase() === "increase" ? "default" : "destructive";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-4xl h-[95vh] overflow-y-auto p-0" style={hiddenScrollbar}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-full flex flex-col"
        >
          {/* Modern Invoice Header */}
          <div className="bg-gradient-to-r from-template-primary via-template-primary/90 to-template-primary/80 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText size={32} className="text-white" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Stock Movement Invoice</DialogTitle>
                  <DialogDescription className="text-white/90 text-sm font-medium">
                    Transaction Reference: STK-{String(stockTask.id).padStart(6, '0')}
                  </DialogDescription>
                  <DialogDescription className="text-white/75 text-xs mt-1">
                    Generated on {format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="p-2.5 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
              >
                <XIcon size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`px-8 py-4 border-b-2 ${stockTask.quantity >= 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <div className="flex items-center gap-3">
              {stockTask.quantity >= 0 ? (
                <TrendingUp size={20} className="text-emerald-600" />
              ) : (
                <TrendingDown size={20} className="text-red-600" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {stockTask.quantity >= 0 ? 'Stock Increase' : 'Stock Decrease'} •
                  <span className="font-bold">
                    {stockTask.quantity >= 0 ? '+' : ''}{Math.abs(stockTask.quantity)} units
                  </span>
                </p>
                <p className="text-xs opacity-75">
                  {stockTask.type.charAt(0).toUpperCase() + stockTask.type.slice(1)} operation recorded
                </p>
              </div>
              <Badge className={`text-xs px-3 py-1.5 font-semibold ${getTypeColor(stockTask.type)}`}>
                {stockTask.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-gray-50/30" style={hiddenScrollbar}>
            <div className="w-full space-y-8">

              {/* Transaction Overview */}
              <div className="grid grid-cols-1 gap-6">
                {/* Product Information Card */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-template-primary/10 rounded-lg">
                        <Package size={20} className="text-template-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Product Information</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Product SKU</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {stockTask.sku || "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Quantity Impact</span>
                        <div className="flex items-center gap-2">
                          {stockTask.quantity >= 0 ? (
                            <TrendingUp size={16} className="text-emerald-600" />
                          ) : (
                            <TrendingDown size={16} className="text-red-600" />
                          )}
                          <span className={`font-bold text-lg ${stockTask.quantity >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {stockTask.quantity >= 0 ? '+' : ''}{stockTask.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Operation Type</span>
                        <Badge className={`${getTypeColor(stockTask.type)} font-medium`}>
                          {stockTask.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Details Card */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ClipboardList size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Calendar size={14} />
                          Date & Time
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(stockTask.created_at), "MMM dd, yyyy")}
                          <br />
                          <span className="text-xs text-gray-500">
                            {format(new Date(stockTask.created_at), "h:mm a")}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <User size={14} />
                          Recorded By
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {stockTask.recorded_by_name ?? "System"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Building size={14} />
                          Branch ID
                        </span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          #{stockTask.branch_id}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason Section */}
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Hash size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Operation Reason</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={getReasonVariant(stockTask.reason)}
                      className="text-sm px-4 py-2 font-semibold"
                    >
                      {stockTask.reason.toUpperCase()}
                    </Badge>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <span className="text-sm text-gray-600">
                      {stockTask.reason.toLowerCase() === 'increase' ? 'Stock replenishment' : 'Stock reduction'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              {stockTask.note && (
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border-l-4 border-template-primary">
                      <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                        {stockTask.note}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Invoice Footer */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-template-primary/10 rounded-lg">
                      <FileText size={18} className="text-template-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Invoice Reference</p>
                      <p className="text-xs text-gray-500">System generated document</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Business ID: #{stockTask.business_id}</p>
                    <p className="text-xs text-gray-500">Task ID: #{stockTask.id}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Generated at {format(new Date(), "h:mm a 'on' MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default StockTaskInvoice;