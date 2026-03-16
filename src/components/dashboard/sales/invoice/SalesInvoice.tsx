"use client";

import Image from "next/image";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { IoIosShareAlt, IoMdPrint } from "react-icons/io";
import { MdOutlineFileDownload, MdOutlineImage } from "react-icons/md";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SalesSchema } from "@/store/data/sales-table-data";
import * as htmlToImage from "html-to-image";
import { useQuery } from "@tanstack/react-query";
import { getBusinessBranches, getSalesById, userBusinessHandler } from "@/api/controllers/get/handler";
import { SalesItemsLogic } from "@/models/types/shared/handlers-type";

interface SalesInvoiceProps {
  sale: SalesSchema;
  onClose?: () => void;
  onPrint?: () => void;
}

const SalesInvoice = ({ sale, onClose, onPrint }: SalesInvoiceProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const businessId = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const selectedBusinessId = sessionStorage.getItem("selectedBusinessId");
    return selectedBusinessId ? +selectedBusinessId : 0;
  }, []);

  const { data: businessDetails, isLoading: businessLoading, isSuccess: businessSuccess, isError: businessError } = useQuery({
    queryKey: ["get-business-details", businessId],
    queryFn: () => userBusinessHandler(`${businessId}`),
    enabled: businessId > 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: false
  });

  const business_details = useMemo(() => {
    if (businessSuccess && !businessError) {
      console.log(businessDetails);
      return businessDetails?.business;
    }
    return null
  }, [businessDetails, businessSuccess, businessError]);

  const resetActiveAction = useCallback(() => {
    setActiveAction(null);
    setIsProcessing(false);
  }, []);

  const handleDownload = useCallback(
    async (type: "pdf" | "image" = "pdf") => {
      if (!receiptRef.current) return false;

      const toastId = toast.loading(`Generating ${type.toUpperCase()}...`);

      try {
        const element = receiptRef.current;

        const dataUrl = await htmlToImage.toPng(element, {
          cacheBust: true,
          backgroundColor: "#ffffff",
          pixelRatio: 2, // higher quality image
        });

        if (type === "image") {
          const link = document.createElement("a");
          link.download = `receipt-${sale?.id}-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          toast.success("Receipt downloaded as image", { id: toastId });
        } else {
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [210, 297], // A4
          });

          // Load image
          const img = document.createElement("img");
          img.src = dataUrl;

          await new Promise((resolve) => (img.onload = resolve));

          const pageWidth = pdf.internal.pageSize.getWidth() - 20;
          const imgHeight = (img.height * pageWidth) / img.width;
          const pageHeight = pdf.internal.pageSize.getHeight() - 20;

          pdf.addImage(img, "PNG", 10, 10, pageWidth, imgHeight);

          // Handle long receipts (multi-page)
          let heightLeft = imgHeight - pageHeight;
          let position = -pageHeight + 10;

          while (heightLeft > 0) {
            pdf.addPage();
            pdf.addImage(img, "PNG", 10, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
          }

          pdf.save(`receipt-${sale?.id}-${Date.now()}.pdf`);
          toast.success("Receipt downloaded as PDF", { id: toastId });
        }

        return true;
      } catch (error) {
        console.error("Error generating receipt:", error);
        toast.error("Failed to generate receipt", { id: toastId });
        return false;
      }
    },
    [sale?.id]
  );

  const handlePrint = useCallback(async () => {
    try {
      if (onPrint) {
        onPrint?.();
      } else if (typeof window !== 'undefined') {
        // Create a print-specific stylesheet
        const printStyle = document.createElement('style');
        printStyle.textContent = `
            @media print {
              body * {
                visibility: hidden;
              }
              #receipt-print, #receipt-print * {
                visibility: visible !important;
              }
              #receipt-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
              }
            }
          `;

        // Add the stylesheet to the document
        document.head.appendChild(printStyle);

        // Trigger the print dialog
        window.print();

        setTimeout(() => {
          document.head.removeChild(printStyle);
        }, 1000);
      }
      return true;
    } catch (error) {
      console.error('Error during printing:', error);
      toast.error('Failed to open print dialog');
      return false;
    }
  }, [onPrint]);

  const { data: sales_data, isSuccess: sales_success, isError: sales_error } = useQuery({
    queryKey: ["sales", sale?.id],
    queryFn: () => getSalesById({ orderId: sale?.id, businessId: sale?.business_id }),
    enabled: "id" in sale && sale.id !== 0,
    refetchOnWindowFocus: false,
    retry: false
  });


  const sales_items = useMemo(() => {
    if (sales_success && !sales_error) {
      return sales_data?.items || [];
    }
    return [];
  }, [sales_success, sales_data, sales_error]) as SalesItemsLogic[];

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MM-yyyy HH:mm');
  };

  const getPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return 'Cash';
      case 'card': return 'Card Payment';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  const handleAction = useCallback(async (action: 'print' | 'pdf' | 'image' | 'share') => {
    if (isProcessing) return;

    setActiveAction(action);
    setIsProcessing(true);

    try {
      switch (action) {
        case 'print':
          await handlePrint();
          break;
        case 'pdf':
          await handleDownload('pdf');
          break;
        case 'image':
          await handleDownload('image');
          break;
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Failed to ${action} receipt`);
    } finally {
      resetActiveAction();
    }
  }, [isProcessing, handlePrint, handleDownload, resetActiveAction]);



  // Calculate totals
  const subtotal = parseFloat(sale?.subtotal) || 0;
  const taxTotal = parseFloat(sale?.tax_total) || 0;
  const discountTotal = parseFloat(sale?.discount_total) || 0;
  const total = parseFloat(sale?.total_amount) || 0;
  const totalPaid = parseFloat(sale?.total_amount) || 0;
  const balance = total - totalPaid;

  return (
    <div
      className="fixed inset-0 min-[520px]:top-0 min-[520px]:left-1/2 min-[520px]:-translate-x-1/2 print:left-0 print:-translate-x-0 z-50 w-full min-[500px]:w-[450px] py-3 px-6 bg-white dark:bg-black print:p-0 print:w-auto print:h-auto print:relative print:inset-auto"
      id="receipt-print"
    >
      <div ref={receiptRef} className="flex flex-col gap-y-2 bg-white dark:bg-black p-4 print:p-2">
        {/* Header */}
        <div className="text-center">
          <div className="text-base font-bold">RECEIPT</div>
          <div onClick={onClose} className="text-xs text-gray-500 dark:text-white/50">#{new Date(sale?.created_at)?.getTime()?.toString(16) + "-" + sale?.id}</div>
        </div>

        {/* Logo and Barcode */}
        <div className="border py-1 px-4 flex flex-col gap-y-0.5 items-center my-2 dark:border-white/50" style={{ borderColor: "#40922c" }}>
          <Image
            width={1000}
            height={1000}
            className="w-[250px] h-[50px] print:w-[160px] print:h-[35px] mx-auto object-contain object-center"
            src={business_details?.logo_url || "/images/image 790.png"}
            alt="Logo"
          />
          <div className="text-xs text-center text-gray-600 dark:text-white/50 mt-1">
            {sale?.branch_name || 'QodeBook Sass'}
          </div>
          <div className="text-[10px] text-center text-gray-500 dark:text-white/50 mt-1">
            {sale?.shipping_address || 'Thank you for your business!'}
          </div>
          <Image
            width={150}
            height={150}
            className="w-[110px] h-[28px] print:w-[160px] print:h-[35px] mx-auto object-contain object-center mt-2"
            src="/images/Isolation_Mode(1).png"
            alt="Receipt Barcode"
          />
        </div>

        {/* Order Details */}
        <div className="max-h-[60vh] overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {/* Order Info */}
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-white/80 border-b border-gray-200 dark:border-white/50 pb-1 mb-1">ORDER DETAILS</div>
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <div className="text-gray-500">Date:</div>
              <div className="text-right">{new Date(`${sale?.created_at}`)?.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</div>
              <div className="text-gray-500">Order Type:</div>
              <div className="text-right capitalize">{sale?.order_type?.replace(/\-/g, " ")?.replace(/\b\w/g, char => char?.toUpperCase()) || 'Retail'}</div>
              <div className="text-gray-500">Status:</div>
              <div className="text-right capitalize">{sale?.status || 'Completed'}</div>
            </div>
          </div>

          {/* Customer Info */}
          {sale.customer_name && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-700 dark:text-white/80 border-b border-gray-200 dark:border-white/50 pb-1 mb-1">CUSTOMER</div>
              <div className="grid grid-cols-2 gap-y-1 text-xs">
                <div className="text-gray-500">Name:</div>
                <div className="text-right">{sale?.customer_name}</div>
                {sale?.customer_phone && (
                  <>
                    <div className="text-gray-500">Phone:</div>
                    <div className="text-right">{sale?.customer_phone}</div>
                  </>
                )}
                {sale?.customer_email && (
                  <>
                    <div className="text-gray-500">Email:</div>
                    <div className="text-right truncate">{sale?.customer_email}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-white/80 border-b border-gray-200 dark:border-white/50 pb-1 mb-1">ITEMS</div>
            <div className="text-[11px] border-b border-gray-200 dark:border-white/80 pb-1 mb-1 font-semibold flex">
              <div className="w-[40%]">Item</div>
              <div className="w-[15%] text-center">Qty</div>
              <div className="w-[22.5%] text-right">Price</div>
              <div className="w-[22.5%] text-right">Total</div>
            </div>
            {sales_items?.length ? sales_items?.map((item, index) => (
              <div key={`${item.id}-${index}`} className="text-[11px] py-1 border-b border-gray-100 dark:border-white/80 flex">
                <div className="w-[40%] pr-1">
                  <div className="font-medium">{item.variant_name}</div>
                  {item.attributes?.length > 0 && (
                    <div className="text-[10px] text-gray-500 dark:text-white/80">
                      {item.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                    </div>
                  )}
                </div>
                <div className="w-[15%] text-center self-center">{item.quantity}</div>
                <div className="w-[22.5%] text-right self-center">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN"
                  }).format(parseFloat(item.unit_price))}
                </div>
                <div className="w-[22.5%] text-right self-center font-medium">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN"
                  }).format(parseFloat(item.total_price))}
                </div>
              </div>
            )) : (
              <div className="text-xs font-[500]">No Invoice Items Record Detected</div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="mb-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-white/80 border-b border-gray-200 dark:border-white/80 pb-1 mb-1">PAYMENT SUMMARY</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN"
                  }).format(subtotal)}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>
                    -{new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN"
                    }).format(discountTotal)}
                  </span>
                </div>
              )}

              {taxTotal > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({((+sale?.tax_total * 100) / +sale?.total_amount).toFixed(2)}%):</span>
                  <span>
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN"
                    }).format(taxTotal)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-white/80 pt-1 mt-1 font-semibold">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN"
                    }).format(total)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              {Array.isArray(sale?.payments) ? sale?.payments.map((payment, index) => (
                <div key={index} className="text-xs mt-2 pt-2 border-t border-gray-100 dark:border-white/80">
                  <div className="flex justify-between">
                    <span className="capitalize">{getPaymentMethod(payment.method)}:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN"
                      }).format(parseFloat(payment.amount))}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right">
                    Ref: {payment.reference || 'N/A'}
                  </div>
                </div>
              )) : sale?.payment_method || "N/A"}

              {balance > 0 ? (
                <div className="text-xs mt-1 text-right text-amber-600">
                  Balance Due: {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN"
                  }).format(balance)}
                </div>
              ) : balance < 0 ? (
                <div className="text-xs mt-1 text-right text-green-600">
                  Change: {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN"
                  }).format(-balance)}
                </div>
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-500 mt-4 pt-2 border-t border-gray-200 dark:border-white/80">
            <div>Thank you for your business!</div>
            <div className="mt-1">Generated on {format(new Date(), 'dd MMM yyyy HH:mm')}</div>
            <div className="text-[9px] mt-2">
              For any inquiries, please contact our support team
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 print:hidden">
            <div className="grid grid-cols-2 gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAction('print')}
                      disabled={isProcessing}
                      variant="outline"
                      className="h-11 gap-2 text-sm font-medium"
                    >
                      {isProcessing && activeAction === 'print' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IoMdPrint className="h-5 w-5" />
                      )}
                      <span>Print</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print receipt</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAction('image')}
                      disabled={isProcessing}
                      variant="outline"
                      className="h-11 gap-2 text-sm font-medium"
                    >
                      {isProcessing && activeAction === 'image' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MdOutlineImage className="h-5 w-5" />
                      )}
                      <span>Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download as Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="h-11 text-sm font-medium mt-2"
              disabled={isProcessing}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SalesInvoice;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      @page {
        margin: 0;
        size: auto;
      }
      
      body * {
        visibility: hidden;
      }
      
      #receipt-print, #receipt-print * {
        visibility: visible;
        padding: 3px 5px;
        font-size: 15px;
      }
      
      #receipt-print {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        max-width: 100%;
        padding: 10px;
        margin: 0;
        box-shadow: none;
      }
      
      .print\:hidden {
        display: none !important;
      }
      
      button {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}