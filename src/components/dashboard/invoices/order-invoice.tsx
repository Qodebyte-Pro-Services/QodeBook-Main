"use client";

import { getBusinessBranches, getSupplyOrdersById, userBusinessesHandler } from "@/api/controllers/get/handler";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCustomStyles } from "@/hooks";
import { X as XIcon, FileText, Printer, Download, Building, Calendar, Truck } from "lucide-react";
import { BadgeTwo } from "@/components/ui/badge-two";
import Cookies from "js-cookie";

interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
  address?: string;
}

interface Variant {
  id: number;
  sku?: string;
  name?: string;
  product?: {
    name: string;
  };
}

interface SupplyOrderItem {
  id: number;
  variant_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  variant?: Variant;
}

interface SupplyOrder {
  id: number;
  supplier_id: number;
  expected_delivery_date: string;
  supply_order_date: string;
  supply_status: string;
  created_at: string;
  supplier?: Supplier;
  items?: SupplyOrderItem[];
}

type SupplyOrderLogic = {
  supply_order: {
    id: number;
    supplier_id: number;
    business_id: number;
    expected_delivery_date: string;
    supply_order_date: string;
    supply_status: string;
    created_at: string;
    supplier_name: string;
    supplier_contact: string;
  },
  items: Array<
    {
      id: number;
      supply_order_id: number;
      variant_id: number;
      quantity: number;
      cost_price: string;
      sku: string;
      product_name: string;
    }
  >;
}

interface SupplyOrderInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function SupplyOrderInvoice({ isOpen, onClose, orderId }: SupplyOrderInvoiceProps) {
  const { hiddenScrollbar } = useCustomStyles();

  const businessId = useMemo(() => {
    if (typeof window === "undefined") return;
    const selectedBusinessId = sessionStorage?.getItem("selectedBusinessId");
    return selectedBusinessId ? JSON.parse(selectedBusinessId) : 0;
  }, []);

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["get-order-supply", businessId, orderId],
    queryFn: () => getSupplyOrdersById({ businessId, orderId }),
    enabled: businessId !== 0,
    refetchOnWindowFocus: false,
    retry: false
  });

  const { data: businessDetails, isLoading: businessLoading, error: businessError, refetch: businessRefetch, isSuccess: businessSuccess } = useQuery({
    queryKey: ["get-business-details"],
    queryFn: userBusinessesHandler,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always'
  });

  const business_details = useMemo(() => {
    if (!businessError && businessSuccess) {
      return businessDetails?.businesses || [];
    }
    return null;
  }, [businessDetails, businessError, businessSuccess]);

  const order = useMemo(() => {
    if (isSuccess && !isError) {
      return data
    }
    return null;
  }, [isSuccess, isError]) as SupplyOrderLogic;

  useEffect(() => {
    if (isSuccess && !isError) {
      console.log(data);
    }
  }, [data, isSuccess, isError]);

  const handlePrint = () => {
    window.print();
  };

  const leavePage = () => {
    onClose();
  }

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log("Download PDF functionality to be implemented");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status?.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((total, item) => total + (item.quantity * +item.cost_price), 0);
  };

  const adminEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return Cookies.get("_email") ?? "";
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      {/* Backdrop */}
      <DialogContent showCloseButton={false} className="min-w-4xl h-[95vh] overflow-y-auto p-0" style={hiddenScrollbar}>
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-full flex flex-col"
        >
          {/* Invoice Content */}
          {/* Header */}
          <div className="bg-gradient-to-r from-template-primary via-template-primary/90 to-template-primary/80 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            <div className="relative flex items-start justify-between text-white">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText size={32} className="text-white" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Supply Order Invoice</DialogTitle>
                  <div className="text-white/90 text-sm font-medium">Order #{order?.supply_order?.id ?? orderId}</div>
                  <div className="text-white/75 text-xs mt-1">Generated on {new Date().toLocaleString()}</div>
                </DialogHeader>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 bg-white/10 rounded-md hover:bg-white/20 transition"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-template-primary bg-white rounded-md hover:bg-gray-100 transition"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={leavePage}
                  className="p-2.5 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <XIcon size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoice details...</p>
            </div>
          )}

          {/* Invoice Content */}
          {!isLoading && order && (
            <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-gray-50/30" style={hiddenScrollbar}>
              {/* Company and Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Company Info */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                      <Building size={16} className="text-template-primary" />
                      From
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900">{business_details?.[0]?.business_name}</p>
                      <p>{business_details?.[0]?.address}</p>
                      {/* <p>{business_details?.[0]?.city}, {business_details?.[0]?.state} {business_details?.[0]?.zip}</p> */}
                      <p>{adminEmail ?? "company@example.com"}</p>
                      <p>{business_details?.[0]?.business_phone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Supplier Info */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                      <Truck size={16} className="text-template-primary" />
                      Supplier
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900">Supplier&apos;s Name: {order?.supply_order?.supplier_name}</p>
                      <a className="no-underline" href={`tel:${order?.supply_order?.supplier_contact}`}>Contact: {order?.supply_order?.supplier_contact}</a>
                      {/* <p>Email: N/A</p>
                      <p>Address: N/A</p> */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Details */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-2"><Calendar size={14} /> Order Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(order?.supply_order?.supply_order_date).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-gray-600">Expected Delivery</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(order?.supply_order?.expected_delivery_date).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-gray-600">Status</p>
                    <div className="mt-1">
                      <BadgeTwo className={`text-xs px-2.5 py-1 font-semibold`} variant={["paid", "delivered"]?.includes(order?.supply_order?.supply_status?.toLowerCase()) ? "default" : "processing"}>
                        {order?.supply_order?.supply_status?.replace(/\_/, " ")?.replace(/\b\w/g, char => char?.toUpperCase())}
                      </BadgeTwo>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-gray-600">Created</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(order?.supply_order?.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">SKU/Variant</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Unit Cost</th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order?.items?.map((item, index) => (
                      <tr key={item?.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item?.product_name || 'Product'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item?.sku || `Variant ${item.variant_id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item?.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">₦{(+item?.cost_price).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">₦{(+item?.cost_price * item?.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Total Amount:</td>
                      <td className="px-6 py-4 text-sm font-extrabold text-gray-900 text-right">₦{calculateTotal().toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border-l-4 border-template-primary text-sm text-gray-700">
                      Thank you for your business. Please ensure delivery by the expected date.
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border-l-4 border-template-primary text-sm text-gray-700">
                      Payment due upon delivery. Late payments may incur additional fees.
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Footer */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
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
                    <p className="text-xs text-gray-500 mb-1">Order ID: #{order?.supply_order?.id}</p>
                    <p className="text-xs text-gray-400 mt-2">Generated at {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}