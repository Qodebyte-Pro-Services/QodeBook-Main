'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, TrendingUp, Package, DollarSign } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { userBusinessHandler } from '@/api/controllers/get/handler';
import { toast } from 'sonner';

interface SalesReportDetailsProps {
  id: string;
}

export default function SalesReportDetails({ id }: SalesReportDetailsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get report data from localStorage
  const reportData = useMemo(() => {
    if (typeof window === "undefined") return null;
    
    try {
      const storedData = localStorage.getItem(id);
      return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
      console.error('Failed to retrieve report from localStorage:', e);
      return null;
    }
  }, [id]);
  
  const reportDataExists = !!reportData && !!reportData.summary;

  // Get business details
  const businessId = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const storedId = sessionStorage?.getItem("selectedBusinessId");
    return storedId ? JSON.parse(storedId) : 0;
  }, []);

  const { data: businessData, isSuccess: businessSuccess } = useQuery({
    queryKey: ["get-user-business", businessId],
    queryFn: () => userBusinessHandler(`${businessId}`),
    enabled: businessId !== 0,
  });

  const businessDetails = useMemo(() => {
    if (businessSuccess && businessData?.business) {
      return businessData.business;
    }
    return {};
  }, [businessSuccess, businessData]);

  // No need for fallback since we're using localStorage directly
  const finalReportData = reportData;
  const finalReportDataExists = reportDataExists;

  // Calculate summary stats
  const summary = useMemo(() => {
    const orders = finalReportData?.order_details || [];
    return {
      totalOrders: finalReportData?.summary?.total_orders || 0,
      totalSales: parseFloat(finalReportData?.summary?.total_sales || '0'),
      totalTax: parseFloat(finalReportData?.summary?.total_tax || '0'),
      totalDiscount: parseFloat(finalReportData?.summary?.total_discount || '0'),
      subtotal: parseFloat(finalReportData?.summary?.subtotal || '0'),
      grossProfit: finalReportData?.summary?.gross_profit || 0,
      totalCogs: finalReportData?.summary?.total_cogs || 0,
      averageOrderValue: orders.length > 0 ? parseFloat(finalReportData?.summary?.total_sales || '0') / orders.length : 0,
    };
  }, [finalReportData]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const orders = finalReportData?.order_details || [];
    const startIdx = (currentPage - 1) * itemsPerPage;
    return orders.slice(startIdx, startIdx + itemsPerPage);
  }, [finalReportData, currentPage]);

  const totalPages = Math.ceil(((finalReportData?.order_details || []).length) / itemsPerPage);

  const formatCurrency = (value: string | number) => {
    return `₦${parseFloat(String(value)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReport = () => {
    if (!finalReportDataExists) return;
    
    const reportWindow = window.open('', '_blank', 'width=1400,height=900');
    if (!reportWindow) return;

    const orders = finalReportData?.order_details || [];
    const totalItems = orders.reduce((sum: number, order: typeof orders[number]) => sum + (order.items?.length || 0), 0);

    const paymentBreakdown = (finalReportData?.payment_methods || []).reduce((acc: Record<string, { count: number; amount: number }>, pm: typeof finalReportData.payment_methods[number]) => {
      acc[pm.method] = {
        count: pm.orders_count,
        amount: parseFloat(String(pm.total_amount))
      };
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report - ${finalReportData?.period || 'Report'}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; }
            
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #f1f1f1; }
            ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #555; }
            
            .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease; }
            
            .badge { display: inline-flex; align-items: center; border-radius: 9999px; font-weight: 500; font-size: 0.75rem; padding: 0.25rem 0.75rem; }
            .badge-green { background-color: #d1fae5; color: #065f46; }
            .badge-blue { background-color: #dbeafe; color: #1e40af; }
            .badge-yellow { background-color: #fef3c7; color: #92400e; }
            .badge-purple { background-color: #ede9fe; color: #5b21b6; }
            .badge-gray { background-color: #f3f4f6; color: #374151; }
            
            .table-header { background-color: #111827; color: white; }
            .table-row:nth-child(even) { background-color: #f9fafb; }
            .table-row:hover { background-color: #f3f4f6; }
            
            .btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 0.375rem; font-weight: 500; padding: 0.5rem 1rem; transition: all 0.2s; cursor: pointer; border: 1px solid transparent; }
            .btn-primary { background-color: #111827; color: white; }
            .btn-primary:hover { background-color: #1f2937; }
            .btn-outline { background-color: transparent; border: 1px solid #d1d5db; color: #374151; }
            .btn-outline:hover { background-color: #f9fafb; }
            .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
            
            @media print {
              .no-print { display: none !important; }
              body { font-size: 12pt; }
            }
          </style>
        </head>
        <body class="bg-gray-50 p-4 md:p-6 lg:p-8">
          <div class="space-y-6">
            <!-- Business & Branch Header -->
            <div class="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg p-6 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Left - Logo & Business Info -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                      ${businessDetails?.logo_url ? `<img src="${businessDetails.logo_url}" alt="business" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">` : businessDetails?.business_name?.substring(0, 2).toUpperCase() || 'BM'}
                    </div>
                    <div class="flex-1">
                      <div class="text-2xl font-bold text-gray-900">${businessDetails?.business_name || 'N/A'}</div>
                      <p class="text-sm text-gray-600 capitalize mt-1">${businessDetails?.business_type || 'N/A'}</p>
                      <p class="text-xs text-gray-500 mt-2">Established: ${businessDetails?.created_at ? new Date(businessDetails.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <!-- Middle - Contact Info -->
                <div class="flex flex-col justify-center gap-3">
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                    <p class="text-sm font-medium text-gray-900 mt-1">${businessDetails?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p class="text-sm font-medium text-gray-900 mt-1">${businessDetails?.business_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Report Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Sales Report - ${finalReportData?.period || 'Report'}</h1>
                <div class="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                  <span><i class="fas fa-calendar-alt mr-1"></i> ${new Date().toLocaleDateString()}</span>
                  <span>|</span>
                  <span><i class="fas fa-cube mr-1"></i> ${orders.length} orders</span>
                  <span>|</span>
                  <span><i class="fas fa-boxes mr-1"></i> ${totalItems} items</span>
                </div>
              </div>
              
              <div class="flex items-center gap-3 no-print">
                <button class="btn btn-outline" onclick="window.print()">
                  <i class="fas fa-print mr-2"></i> Print
                </button>
                <button class="btn btn-primary" onclick="window.close()">
                  <i class="fas fa-times mr-2"></i> Close
                </button>
              </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="stats-grid">
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">Total Sales</div>
                    <div class="text-xl font-bold text-gray-900">₦${summary.totalSales.toFixed(2)}</div>
                  </div>
                  <div class="bg-green-100 p-2 rounded-lg">
                    <i class="fas fa-dollar-sign text-green-600 text-lg"></i>
                  </div>
                </div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">Total Orders</div>
                    <div class="text-xl font-bold text-gray-900">${summary.totalOrders}</div>
                  </div>
                  <div class="bg-blue-100 p-2 rounded-lg">
                    <i class="fas fa-shopping-cart text-blue-600 text-lg"></i>
                  </div>
                </div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">Gross Profit</div>
                    <div class="text-xl font-bold text-gray-900">₦${summary.grossProfit.toFixed(2)}</div>
                  </div>
                  <div class="bg-purple-100 p-2 rounded-lg">
                    <i class="fas fa-chart-line text-purple-600 text-lg"></i>
                  </div>
                </div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-gray-500">Avg Order Value</div>
                    <div class="text-xl font-bold text-gray-900">₦${summary.averageOrderValue.toFixed(2)}</div>
                  </div>
                  <div class="bg-yellow-100 p-2 rounded-lg">
                    <i class="fas fa-balance-scale text-yellow-600 text-lg"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Detailed Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-medium text-gray-900">Subtotal</div>
                  <i class="fas fa-receipt text-gray-400"></i>
                </div>
                <div class="text-lg font-bold text-gray-900">₦${summary.subtotal.toFixed(2)}</div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-medium text-gray-900">Total Tax</div>
                  <i class="fas fa-percent text-gray-400"></i>
                </div>
                <div class="text-lg font-bold text-gray-900">₦${summary.totalTax.toFixed(2)}</div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-medium text-gray-900">Total Discount</div>
                  <i class="fas fa-tag text-gray-400"></i>
                </div>
                <div class="text-lg font-bold text-red-600">-₦${summary.totalDiscount.toFixed(2)}</div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-medium text-gray-900">COGS</div>
                  <i class="fas fa-boxes text-gray-400"></i>
                </div>
                <div class="text-lg font-bold text-gray-900">₦${summary.totalCogs.toFixed(2)}</div>
              </div>
              
              <div class="card-hover bg-white rounded-lg border border-gray-200 p-4 shadow-sm col-span-2">
                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-medium text-gray-900">Payment Methods</div>
                  <i class="fas fa-credit-card text-gray-400"></i>
                </div>
                <div class="flex flex-wrap gap-2">
                  ${Object.entries(paymentBreakdown as Record<string, { count: number; amount: number }>).map(([method, data]) => `
                    <span class="badge badge-green">${method.toUpperCase()}: ${data.count} (₦${data.amount.toFixed(2)})</span>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <!-- Orders Table -->
            <div class="card-hover bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-bold text-gray-900">Order Details</h2>
                    <p class="text-sm text-gray-600">${orders.length} orders in this report</p>
                  </div>
                </div>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    ${orders.length > 0 ? (orders as typeof orders).map((order: typeof orders[number]) => `
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">#${order.id}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${formatDate(order.created_at)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <span class="badge badge-gray">${order.items?.length || 0} items</span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <span class="capitalize">${order.order_type}</span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₦${parseFloat(String(order.subtotal)).toFixed(2)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₦${parseFloat(String(order.tax_total)).toFixed(2)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₦${parseFloat(String(order.total_amount)).toFixed(2)}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">
                          <span class="badge badge-green capitalize">${order.status}</span>
                        </td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                          <i class="fas fa-inbox text-3xl mb-2 block text-gray-300"></i>
                          No orders found
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
              
              <div class="p-4 border-t border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between text-sm text-gray-600">
                  <div>Showing ${orders.length > 0 ? 'all' : '0'} orders</div>
                  <div class="flex items-center gap-2">
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Product Breakdown -->
            ${reportData?.product_breakdown && reportData?.product_breakdown.length > 0 ? `
              <div class="card-hover bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-gray-200">
                  <h2 class="text-lg font-bold text-gray-900">Product Breakdown</h2>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      ${(reportData?.product_breakdown || []).map((product: typeof reportData.product_breakdown[number]) => `
                        <tr class="hover:bg-gray-50 transition-colors">
                          <td class="px-4 py-3 text-sm text-gray-900">${product.variant_sku}</td>
                          <td class="px-4 py-3 text-sm text-gray-900">${product.total_qty}</td>
                          <td class="px-4 py-3 text-sm font-bold text-gray-900">₦${parseFloat(String(product.total_sales)).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
            
            <!-- Footer -->
            <div class="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <div class="flex flex-col items-center gap-2">
                <div>Report generated by ${businessDetails?.business_name || 'Your Business'}</div>
                <div class="text-xs mt-2">© ${new Date().getFullYear()} Powered By Primelabs. All rights reserved.</div>
              </div>
            </div>
          </div>
          
          <script>
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
              }
            });
          </script>
        </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  const handleDownloadReport = () => {
    if (!reportDataExists) return;
    
    const orders = reportData?.order_details || [];
    const reportContent = {
      period: reportData?.period,
      summary: reportData?.summary,
      orders: orders.map((order: typeof orders[number]) => ({
        id: order.id,
        date: order.created_at,
        itemCount: order.items?.length,
        type: order.order_type,
        subtotal: order.subtotal,
        tax: order.tax_total,
        total: order.total_amount,
        status: order.status,
      })),
      paymentMethods: reportData?.payment_methods,
      productBreakdown: reportData?.product_breakdown,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${reportData?.period || 'export'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully');
  };

  if (!finalReportDataExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Report Not Found</CardTitle>
            <CardDescription>The sales report data could not be loaded</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Please go back and try again. Make sure to:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Generate a new report with the Report Generator</li>
              <li>Click the Eye button immediately after generating</li>
              <li>Do not refresh the page before viewing the report</li>
            </ul>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
   
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Logo & Business Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                  {businessDetails?.logo_url ? (
                    <img src={businessDetails.logo_url} alt="business" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    businessDetails?.business_name?.substring(0, 2).toUpperCase() || 'BM'
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{businessDetails?.business_name || 'N/A'}</h2>
                  <p className="text-sm text-gray-600 capitalize mt-1">{businessDetails?.business_type || 'N/A'}</p>
                 
                </div>
              </div>
            </div>


            <div className="flex flex-col justify-center gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{businessDetails?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{businessDetails?.business_phone || 'N/A'}</p>
              </div>
            </div>

          
          </div>
        </CardContent>
      </Card>
   
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{finalReportData?.period || 'Sales'} Report</h1>
          <p className="text-gray-600 mt-1">Complete sales analysis and details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleViewReport}>
            <Eye className="h-4 w-4 mr-2" />
            View Report
          </Button>
          <Button onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.totalSales)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.grossProfit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.averageOrderValue)}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Subtotal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.subtotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalTax)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">-{formatCurrency(summary.totalDiscount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">COGS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalCogs)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>{finalReportData?.order_details?.length || 0} orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  (paginatedOrders as typeof paginatedOrders).map((order: typeof paginatedOrders[number]) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                      <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.items?.length || 0} items</Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{order.order_type}</TableCell>
                      <TableCell className="text-sm">{formatCurrency(order.subtotal)}</TableCell>
                      <TableCell className="text-sm">{formatCurrency(order.tax_total)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

 
      {finalReportData?.payment_methods && finalReportData?.payment_methods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalReportData?.payment_methods.map((method: typeof finalReportData.payment_methods[number]) => (
                <div key={method.method} className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500 capitalize">{method.method}</p>
                  <p className="text-2xl font-bold mt-1">{method.orders_count}</p>
                  <p className="text-sm text-gray-600 mt-2">{formatCurrency(method.total_amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    
      {reportData?.product_breakdown && reportData?.product_breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(reportData?.product_breakdown || []).map((product: typeof reportData.product_breakdown[number]) => (
                    <TableRow key={product.variant_id}>
                      <TableCell className="font-mono text-sm">{product.variant_sku}</TableCell>
                      <TableCell className="font-bold">{product.total_qty}</TableCell>
                      <TableCell>{formatCurrency(product.total_sales)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
