import { useMemo, useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  AlertCircle, 
  Check, 
  X,
  Copy,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  User,
  Calendar,
  Upload,
  FileText,
  X as XIcon,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { getStaffSubcharges } from '@/api/controllers/get/handler';
import { StaffSubchargeResponse } from './staff-subcharge';
import { useCustomStyles } from '@/hooks';
import { useStaffSalaryHandler } from '@/hooks/useControllers';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Qrcode from "qrcode";

// Date formatting utility
const formatDate = (date: Date | string, formatStr: string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  
  if (formatStr === 'MMM d') return `${month} ${day}`;
  if (formatStr === 'MMM d, yyyy') return `${month} ${day}, ${year}`;
  return d.toLocaleDateString();
};

const generateQRCode = async (data: string) => {
  let canvas;
  try {
    canvas = await Qrcode.toDataURL(data);
  }catch(err) {
    if (err instanceof Error) {
      console.log(err);
      return;
    }
    return;
  }
  console.log(canvas);
  return canvas;
};

// API Response Interface
interface StaffApiResponse {
  staff_id: string;
  business_id: number;
  full_name: string;
  email: string;
  contact_no: string;
  position_name: string;
  salary: string;
  bank_account_number: string;
  bank_name: string;
  photo?: string;
  payment_status: 'paid' | 'unpaid' | 'pending' | string;
  last_payment_date?: string;
  employment_type: string;
  start_date: string;
}


interface StaffPaymentDetailProps {
  staff: StaffApiResponse;
  className?: string;
}

export function StaffPaymentDetail({
  staff,
  className,
}: StaffPaymentDetailProps) {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {hiddenScrollbar} = useCustomStyles();

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // State for receipt upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [previewQrcode, setPreviewQrcode] = useState<Base64URLString | string>("")

  // Handle file drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const staffSalaryHandler = useStaffSalaryHandler();

  const handleApprove = async () => {
    setIsUploadModalOpen(true);
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      staff_id: staff?.staff_id,
      business_id: staff?.business_id,
      amountToBePaid: netPay,
      description: description || "",
      payment_method: paymentMethod,
      receipt: file
    };
    const formdata = new FormData();
    try {
      setIsProcessing(true);
      Object.entries(data)?.forEach(([k,v]) => {
        if (v instanceof File) {
          formdata.append(k, v);
          return;
        }
        formdata.append(k, String(v));
      });
      const payload = {
        business_id: staff?.business_id,
        data: formdata
      };
      await staffSalaryHandler.mutateAsync(payload, {
        onSuccess(data) {
          toast.success(`${staff?.full_name} Salary Paid Successfully`, {description: data?.message || "Staff will be notified shortly"});
          setIsUploadModalOpen(false);
          setFile(null);
          setDescription('');
        }
      })
      // Show success message
    } catch (error) {
      console.error('Error submitting receipt:', error);
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsProcessing(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const {data: subcharges, isSuccess: subchargeSuccess, isError: subchargeError} = useQuery({
    queryKey: ["get-staff-subchargees", staff?.business_id],
    queryFn: () => getStaffSubcharges({staff_id: staff?.staff_id, businessId: staff?.business_id}),
    enabled: staff?.business_id !== 0  && staff?.staff_id !== "",
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: false
  });

  const subcharge_data = useMemo(() => {
    if (subchargeSuccess && !subchargeError) {
        return subcharges?.staff_subcharges;
    }
    return [];
  }, [subcharges, subchargeSuccess, subchargeError]) as StaffSubchargeResponse[];

  const subchargeTotal = useMemo(() => {
    return subcharge_data?.length ? subcharge_data?.reduce((prev, s) => prev += parseFloat(s?.sub_charge_amt), 0) : 0;
  }, [subcharge_data]);

  const baseSalary = useMemo(() => {
    return parseFloat(staff?.salary);
  }, [staff]);
  const bonus = 0;
  const netPay = useMemo(() => {
    return baseSalary - subchargeTotal;
  }, [baseSalary, subchargeTotal]);


  const status = staff.payment_status === 'paid' ? 'approved' : 
                 staff.payment_status === 'unpaid' ? 'declined' : 'pending';

  const qrCodeData = useMemo(() => {
    if (Object.keys(staff)?.length) {
      return `Bank Name: ${staff.bank_name}\nAccount no.: ${staff.bank_account_number}\nAmount: ${netPay}`;
    }
    return '';
  }, [staff, netPay]);

  useEffect(() => {
    (async() => {
      try {
        const url = await generateQRCode(qrCodeData);
        setPreviewQrcode(url);
      }catch(err) {
        console.log(err);
      }
    })();
  }, [qrCodeData]);

  return (
    <>
      <Card className={cn("overflow-hidden border-0 shadow-lg dark:bg-black", className)}>
        {/* Status Banner */}
        <div className={cn(
          "h-2",
          status === 'approved' && "bg-gradient-to-r from-green-500 to-emerald-500",
          status === 'pending' && "bg-gradient-to-r from-amber-500 to-orange-500",
          status === 'declined' && "bg-gradient-to-r from-red-500 to-rose-500"
        )} />

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {staff.photo ? (
                  <img 
                    src={staff.photo} 
                    alt={staff.full_name}
                    className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full dark:border-gray-700"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                    {staff.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {staff.position_name} • {staff.employment_type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDate(staff?.start_date, 'MMM d')} - {formatDate(staff?.last_payment_date ? staff?.last_payment_date : new Date()?.toISOString(), 'MMM d, yyyy')}
                </span>
                <Badge
                  variant={
                    status === 'approved' 
                      ? 'default' 
                      : status === 'declined' 
                      ? 'destructive' 
                      : 'secondary'
                  }
                  className="ml-2"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              {staff.last_payment_date && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Last paid: {formatDate(staff.last_payment_date, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Net Pay Badge */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Pay</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                ₦{netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Payment Breakdown Card */}
          <Card className="overflow-hidden border border-gray-200 dark:bg-black dark:border-gray-800">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
                <DollarSign className="w-4 h-4" />
                Payment Breakdown
              </h4>
            </div>
            
            <div className="p-4 space-y-3">
              {/* Base Salary */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Base Salary</p>
                    {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                      {calculation.hoursWorked && calculation.hourlyRate 
                        ? `${calculation.hoursWorked} hrs × $${calculation.hourlyRate}/hr`
                        : 'Monthly salary'
                      }
                    </p> */}
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  ₦{baseSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Bonus */}
              {bonus > 0 && (
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Bonus</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Performance incentive</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    +₦{bonus.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Tax Deduction */}
              {subchargeTotal > 0 && (
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Staff Subcharges</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Withheld</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -₦{subchargeTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Other Deductions */}
              {/* {otherDeductions > 0 && (
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div> */}
                      {/* <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {calculation.deductionDescription || 'Other Deductions'}
                      </p> */}
                      {/* <p className="text-xs text-gray-500 dark:text-gray-400">Additional charges</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    -₦{otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )} */}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 bg-gradient-to-r from-green-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3">
                <span className="text-base font-bold text-gray-900 dark:text-gray-50">Total Net Pay</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₦{netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-50">{staff.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{staff.contact_no}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {staff?.payment_status !== 'paid' && (
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={isProcessing}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button 
                onClick={() => setShowBankDetails(true)}
                variant="outline"
                disabled={isProcessing}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Bank Details
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </div>
          )}

          {staff?.payment_status === "paid" && (
            <Button 
              onClick={() => setShowBankDetails(true)}
              variant="outline"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Bank Details
            </Button>
          )}
        </div>
      </Card>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-white/10 backdrop-blur-sm"
          onClick={() => setShowBankDetails(false)}
        >
          <Card 
            className="w-full max-w-md border-0 shadow-2xl dark:bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Bank Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBankDetails(false)}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Staff Info */}
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {staff.photo ? (
                  <img 
                    src={staff.photo} 
                    alt={staff.full_name}
                    className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full dark:border-gray-700"
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{staff.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{staff.position_name}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-3 bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl">
                <div className="text-center">
                  <img
                    src={previewQrcode}
                    alt="Payment QR Code" 
                    className="w-35 h-35 mx-auto rounded-lg"
                  />
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Scan to get bank details
                  </p>
                </div>
              </div>

              {/* Bank Information */}
              <div style={hiddenScrollbar} className="max-h-[30vh] space-y-3 overflow-y-auto">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                        {staff.bank_name}
                        </p>
                    </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Account Name</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                        {staff.full_name}
                        </p>
                    </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                        {staff.bank_account_number}
                        </p>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopy(staff.bank_account_number, 'account')}
                        className="text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                        {copiedField === 'account' ? (
                        <CheckCircle2 className="w-5 h-5" />
                        ) : (
                        <Copy className="w-5 h-5" />
                        )}
                    </Button>
                    </div>
                </div>

                {/* Amount to Pay */}
                <div className="p-4 text-center border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount to Transfer</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ₦{netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {staff?.payment_status !== "paid" && (
                    <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="w-full text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                    {isProcessing ? 'Processing...' : (
                        <>
                        <Check className="w-4 h-4 mr-2" />
                        Confirm Payment
                        </>
                    )}
                    </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Receipt Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-green-600 to-green-500 p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Upload Payment Receipt</h3>
                    <p className="text-sm text-green-100">For {staff.full_name}&apos;s payment</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <XIcon className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitReceipt} className="p-6 space-y-6">
                {/* File Upload Area */}
                <div>
                  <Label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Receipt File
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                      isDragging 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                        : "border-gray-300 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="receipt"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    
                    {file ? (
                      <div className="relative">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg inline-block">
                          <FileText className="w-10 h-10 text-green-500 mx-auto" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full inline-block">
                          <Upload className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="mt-3 text-sm text-gray-900 dark:text-white">
                          <span className="font-medium text-green-600 dark:text-green-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, or PDF (max. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method*
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className='w-full py-2.5'>
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any notes about this payment..."
                    className="w-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!file || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Confirm & Submit'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}