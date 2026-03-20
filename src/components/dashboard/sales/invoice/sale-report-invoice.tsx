"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CreditCard, Package, DollarSign, FileText } from 'lucide-react';
import { SalesReportLogic } from '@/models/types/shared/handlers-type';
import { useSalesReportData } from '@/store/sale-data';
import { useQuery } from '@tanstack/react-query';
import { getSalesReport, userBusinessHandler } from '@/api/controllers/get/handler';
import Image from 'next/image';
import jsPDF from 'jspdf';
import * as htmlToImage from "html-to-image";
import { useSalesReport } from '@/hooks/use-localforage';
import { SalesReportQueryLogic } from '@/lib/storage-utils';

const SalesInvoiceSystem = ({ id }: { id: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [queryString, setQueryString] = useState<string>("");

  const { searchKey, salesReport } = useSalesReportData();
  const { getSalesReportData } = useSalesReport();

  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (): Promise<void> => {
    const content = contentRef.current;
    if (!content) return;

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    try {
      // Convert the HTML element to an image
      const dataUrl = await htmlToImage.toPng(content, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });

      // Load image and get proportions
      const img = document.createElement("img");
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const imgWidth = pageWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // Add first page
      pdf.addImage(img, "PNG", 0, position, imgWidth, imgHeight);
      addPageNumber(pdf, pageNumber, pageWidth, pageHeight);
      heightLeft -= pageHeight;

      // Add remaining pages if content exceeds one page
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(img, "PNG", 0, position, imgWidth, imgHeight);
        addPageNumber(pdf, pageNumber, pageWidth, pageHeight);
        heightLeft -= pageHeight;
      }

      const invoiceId = `receipt-${Date.now()}.pdf`;

      pdf.save(invoiceId);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Helper to draw page numbers
  const addPageNumber = (
    pdf: jsPDF,
    pageNumber: number,
    pageWidth: number,
    pageHeight: number
  ): void => {
    pdf.setFontSize(10);
    pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 20, {
      align: "center",
    });
  };

  const businessId = useMemo(() => {
    if (typeof window === "undefined") return;
    const storedId = sessionStorage?.getItem("selectedBusinessId");
    return storedId ? JSON.parse(storedId) : 0;
  }, []);

  const branchId = useMemo(() => {
    if (typeof window === "undefined") return;
    const storedId = sessionStorage?.getItem("selectedBranchId");
    return storedId ? JSON.parse(storedId) : 0;
  }, []);

  const { data: businessData, isLoading: businessLoading, isSuccess: businessSuccess, isError: businessError } = useQuery({
    queryKey: ["get-user-business", businessId],
    queryFn: () => userBusinessHandler(`${businessId}`),
    enabled: businessId !== 0,
    refetchOnWindowFocus: 'always'
  });

  const businessDetails = useMemo(() => {
    if (businessSuccess && !businessError) {
      return businessData?.business;
    }
    return {};
  }, [businessSuccess, businessData, businessError])

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (isMounted) {
          const _data = await getSalesReportData(businessId);
          console.log(_data);
          const selectedItem = _data?.find(item => item?.mapId === id);
          const { query_data } = selectedItem as SalesReportQueryLogic;
          if (query_data?.has(id)) {
            setQueryString(query_data?.get(id) as string);
            return;
          }
          setQueryString("");
        }
      } catch (err) {
        console.log("Error Occurred While Trying To Fetch Sales Queries: ", err);
        setQueryString("");
      }
    })();
    return () => {
      isMounted = false;
    }
  }, [id, businessId, getSalesReportData]);

  const salesReportData = useMemo(() => {
    if (queryString && businessId && branchId) {
      return {
        url: `/api/finance/sales-report?${queryString}`,
        businessId: +businessId,
        branchId: +branchId
      }
    }
  }, [queryString, businessId, branchId]) as { url: string; businessId: number; branchId: number };

  const { data: sales_reports, isSuccess: sales_success, isError: sales_error } = useQuery({
    queryKey: ["get-sales-report", businessId, branchId],
    queryFn: () => getSalesReport(salesReportData),
    refetchOnWindowFocus: false,
    retry: 3
  });

  const data = useMemo(() => {
    if (sales_success && !sales_error) {
      return sales_reports || {};
    }
    return {};
  }, [sales_success, sales_error, sales_reports]) as SalesReportLogic;

  const currentOrder = data?.order_details?.[currentPage - 1];
  const totalPages = data?.order_details?.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    return `₦${parseFloat(amount)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div ref={contentRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="border-b-4 border-green-600 bg-white p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-start gap-4">
                {/* Company Logo Placeholder */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  {businessDetails?.logo_url ? (
                    <Image className="w-full h-full object-cover object-center aspect-video" width={200} height={200} src={`${businessDetails?.logo_url}`} alt="Logo" />
                  ) : (
                    <span className="text-white font-bold text-2xl">YC</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{businessDetails?.business_name}</h2>
                  <p className="text-gray-600 text-sm">{businessDetails?.address}</p>
                  <p className="text-gray-600 text-sm">Phone: {businessDetails?.business_phone}</p>
                  <p className="text-gray-600 text-sm">Email: N/A</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
                  <p className="text-xs text-gray-600 font-medium">Invoice Number</p>
                  <p className="text-xl font-bold text-green-600">#{currentOrder?.id || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-300 pb-2">Invoice Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(currentOrder?.created_at || new Date()?.toISOString())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-gray-900">{currentOrder?.id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{currentOrder?.order_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                      {currentOrder?.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 border-b border-gray-300 pb-2">Bill To</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-1">Customer #{currentOrder?.customer_id || 'Guest'}</p>
                    <p className="text-gray-600">Branch ID: {currentOrder?.branch_id}</p>
                    <p className="text-gray-600">Business ID: {currentOrder?.business_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product SKU</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrder?.items?.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item?.variant_sku}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-center font-medium">{item?.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">{formatCurrency(item?.unit_price)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item?.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-96 bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(currentOrder?.subtotal)}</span>
                  </div>
                  {parseFloat(currentOrder?.discount_total) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(currentOrder?.discount_total)}</span>
                    </div>
                  )}
                  {parseFloat(currentOrder?.coupon_total) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(currentOrder?.coupon_total)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(currentOrder?.tax_total)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(currentOrder?.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {currentOrder?.note && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Note:</p>
                    <p className="text-sm text-gray-600">{currentOrder?.note}</p>
                  </div>
                </div>
                <button onClick={() => generatePDF()} className="py-2 px-4 font-semibold bg-template-chart-store rounded-md cursor-pointer text-white">Download</button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t">
            <p className="text-xs text-gray-500 text-center">Thank you for your business!</p>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 text-green-600"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Invoice</span>
            <span className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold text-sm">
              {currentPage}
            </span>
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 text-green-600"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data?.summary?.total_orders?.toString() || "0"}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data?.summary?.total_sales?.toString() || "0")}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Gross Profit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data?.summary?.gross_profit?.toString() || "0")}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesInvoiceSystem;