"use client";

import { getSalesReport, getStaffByBusinessId } from "@/api/controllers/get/handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Eye, Share2, Loader } from "lucide-react";
import React, { useEffect, useMemo, useReducer, useState, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SalesItemsLogic, SalesReportLogic } from "@/models/types/shared/handlers-type";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSalesReportData } from "@/store/sale-data";
import { useRouter } from "next/navigation";
import { useSalesReport } from "@/hooks/use-localforage";
import { SalesReportQueryLogic } from "@/lib/storage-utils";

type StateTypes = {
    business_id: number;
    branch_id: number;
    date_filter: string;
    start_date: string;
    end_date: string;
    summary: string;
    cashier: string;
    details: string;
    payment_methods: string;
    product_breakdown: string;
    page: number;
    pageSize: number;
}

type ActionType = {
    type: string;
    values: Record<string, string | number>;
}

const reducer = (state: StateTypes, action: ActionType): StateTypes => {
    switch (action.type) {
        case "filter":
            const { ...rest } = action.values;
            return { ...state, ...rest };
        default:
            return state;
    }
}

const SalesReport = () => {
    const [state, dispatch] = useReducer(reducer, {
        business_id: 0,
        branch_id: 0,
        date_filter: "",
        start_date: "",
        end_date: "",
        summary: "",
        details: "",
        cashier: "",
        payment_methods: "",
        product_breakdown: "",
        page: 1,
        pageSize: 10,
    });

    const [reportType, setReportType] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [format, setFormat] = useState<string>('json');
    const [includeSummary, setIncludeSummary] = useState<boolean>(true);
    const [includeDetails, setIncludeDetails] = useState<boolean>(true);
    const [includePaymentMethod, setIncludePaymentMethod] = useState<boolean>(true);
    const [includeProductBreakdown, setIncludeProductBreakdown] = useState<boolean>(true);
    const [cashier, setCashier] = useState<string>("");
    const [reportsQueryData, setReportsQueryData] = useState<SalesReportQueryLogic[]>([]);

    const [isGenerated, setIsGenerated] = useState<boolean>(false);

    const [queryData, setQueryData] = useState<Record<string, string>>({});
    const [queryStrings, setQueryString] = useState<string>("");
    const [mapKey, setMapKey] = useState<string>("");

    const router = useRouter();

    const { updateSalesReport, deleteSalesReport, clearSalesReport } = useSalesReport();

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem('selectedBusinessId');
            return storedId ? JSON.parse(storedId) : 0;
        }
    }, []);

    const branchId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem('selectedBranchId');
            return storedId ? JSON.parse(storedId) : 0;
        }
    }, []);


    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };


    const calculateDateRange = (type: string) => {
        const today = new Date();
        const endDate = formatDate(today);
        let startDate = endDate;

        switch (type) {
            case 'day':

                startDate = endDate;
                break;
            case 'week':

                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 6);
                startDate = formatDate(weekAgo);
                break;
            case 'month':

                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 29);
                startDate = formatDate(monthAgo);
                break;
            case 'year':

                const yearAgo = new Date(today);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                startDate = formatDate(yearAgo);
                break;
            default:
                break;
        }

        return { startDate, endDate };
    };

    useEffect(() => {
        if (reportType) {
            const { startDate: newStart, endDate: newEnd } = calculateDateRange(reportType);
            setStartDate(newStart);
            setEndDate(newEnd);
        }
    }, [reportType]);

    // Function to get period key based on order date and report type
    const getPeriodKey = (dateString: string, type: string): { key: string; label: string } => {
        const date = new Date(dateString);

        switch (type) {
            case 'day':
                return {
                    key: date.toISOString().split('T')[0],
                    label: date.toISOString().split('T')[0]
                };
            case 'week':
                // Get the week number
                const tempDate = new Date(date);
                const firstDayOfYear = new Date(tempDate.getFullYear(), 0, 1);
                const pastDaysOfYear = (tempDate.getTime() - firstDayOfYear.getTime()) / 86400000;
                const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

                // Get week start date
                const weekStart = new Date(date);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                return {
                    key: `${tempDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`,
                    label: `Week ${weekNum} (${formatDate(weekStart)} - ${formatDate(weekEnd)})`
                };
            case 'month':
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                return {
                    key: `${year}-${month}`,
                    label: monthName
                };
            case 'year':
                const yr = date.getFullYear();
                return {
                    key: `${yr}`,
                    label: `${yr}`
                };
            default:
                return { key: dateString, label: dateString };
        }
    };

    // Function to group report data by period
    const groupReportDataByPeriod = (reportData: SalesReportLogic, type: string) => {
        if (!reportData?.order_details || reportData.order_details.length === 0) {
            return [];
        }

        type PeriodData = SalesReportQueryLogic & {
            period_label: string;
        };

        const grouped = new Map<string, PeriodData>();

        // Group orders by period
        reportData.order_details.forEach((order: { created_at: string;[key: string]: unknown }) => {
            const { key, label } = getPeriodKey(order.created_at, type);

            if (!grouped.has(key)) {
                grouped.set(key, {
                    start_date: key,
                    end_date: key,
                    period_label: label,
                    report_type: type,
                    format: queryData?.format || 'JSON',
                    business_id: +(queryData?.business_id || 0),
                    mapId: mapKey,
                    generated_at: new Date().toLocaleDateString("default", {
                        month: "short",
                        day: "2-digit",
                        year: "2-digit",
                        minute: "2-digit",
                        hour: "2-digit",
                    }),
                    query_data: new Map([[mapKey, queryStrings]]),
                    updatedAt: Date.now()
                } as unknown as PeriodData);
            }
        });

        // Convert map to array and sort by period key
        const sortedArray = Array.from(grouped.values());
        return sortedArray.sort((a, b) => {
            const dateA = a?.start_date || '';
            const dateB = b?.start_date || '';
            return String(dateA).localeCompare(String(dateB));
        });
    };

    const generateQuery = () => {
        const queryData = {
            business_id: state.business_id || businessId,
            branch_id: state.branch_id || branchId,
            cashier: state.cashier,
            date_filter: reportType,
            start_date: startDate,
            end_date: endDate,
            summary: includeSummary ? "true" : "false",
            details: includeDetails ? "true" : "false",
            payment_methods: includePaymentMethod ? "true" : "false",
            product_breakdown: includeProductBreakdown ? "true" : "false",
            page: state.page,
            pageSize: state.pageSize,
            format: format
        };

        const filteredQuery = Object.entries(queryData)
            .filter(([key, value]) => value !== "" && value !== null && value !== undefined && value !== "all")
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const searchParams = new URLSearchParams();
        Object.entries(filteredQuery).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });

        const params = searchParams.toString();
        setQueryData(Object.fromEntries(searchParams.entries()));
        return params;
    };


    const handleGenerateReport = () => {
        dispatch({
            type: "filter",
            values: {
                business_id: businessId,
                branch_id: branchId,
                date_filter: reportType,
                start_date: startDate,
                cashier,
                end_date: endDate,
                summary: includeSummary ? "true" : "false",
                details: includeDetails ? "true" : "false",
                payment_methods: includePaymentMethod ? "true" : "false",
                product_breakdown: includeProductBreakdown ? "true" : "false"
            }
        });

        const queryString = generateQuery();
        setQueryString(queryString);
        setIsGenerated(prev => !prev);
    };

    const salesReportData = useMemo(() => {
        if (queryStrings && businessId && branchId) {
            return {
                url: `/api/finance/sales-report?${queryStrings}`,
                businessId: +businessId,
                branchId: +branchId
            }
        }
    }, [queryStrings, businessId, branchId]) as { url: string; businessId: number; branchId: number };

    const { data: reportData, isSuccess: salesReportSuccess, isError: salesReportError, isPending: isLoadingReport } = useQuery({
        queryKey: ["get-sales-report", queryData, businessId, branchId],
        queryFn: () => getSalesReport(salesReportData),
        enabled: (typeof queryData !== "undefined") && businessId !== 0 && branchId !== 0,
        refetchOnWindowFocus: true,
        retry: false
    });

    const salesReportOrder = useMemo(() => {
        if (salesReportSuccess && !salesReportError) {
            return reportData || {};
        }
        return {};
    }, [reportData, salesReportSuccess, salesReportError]) as SalesReportLogic;

    useEffect(() => {
        if (salesReportOrder) {
           
            const reportKey = `sales_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
      
            if (typeof window !== "undefined") {
                localStorage.setItem(reportKey, JSON.stringify(salesReportOrder));
            }
            
            setMapKey(reportKey);
        }
    }, [salesReportOrder, queryStrings]);

    const handleViewReport = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const mapKey = e.currentTarget?.dataset?.uid || '';
        router.push(`/sales/${mapKey}`);
    }, [router]);

    const { data: staffData, isSuccess: staffSuccess, isError: staffError } = useQuery({
        queryKey: ["get-staff-by-business-id", businessId],
        queryFn: () => getStaffByBusinessId(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: true,
        retry: false
    });
    const cashiers = useMemo(() => {
        if (staffSuccess && !staffError) {
            return staffData?.staff || [];
        }
        return [];
    }, [staffData, staffSuccess, staffError]) as Array<{ staff_id: string; full_name: string;[key: string]: unknown }>;




    useEffect(() => {
        if (!queryStrings || !mapKey || !queryData) return;

        const queryDataValues = Object.values(queryData);
        if (queryDataValues.length === 0) return;

        // If we have the actual report data with order details, group by period
        if (salesReportOrder && salesReportOrder.order_details && salesReportOrder.order_details.length > 0) {
            const groupedData = groupReportDataByPeriod(salesReportOrder, queryData?.date_filter || '');
            if (groupedData.length > 0) {
                setReportsQueryData(groupedData);
                return;
            }
        }

        // If no order details, show empty state instead of fallback row
        setReportsQueryData([]);
    }, [queryStrings, mapKey, queryData, salesReportOrder]);

    // useEffect(() => {
    //     if (!reportsQueryData?.length) return;

    //     const saveReports = async (): Promise<void> => {
    //         try {
    //             await updateSalesReport(businessId, reportsQueryData);
    //         } catch (err) {
    //             console.error("Failed to update sales reports:", err);
    //             toast?.error("Failed to save sales reports");
    //         }
    //     };

    //     const timer = setTimeout(async () => {
    //         await saveReports(); 
    //     }, 500);

    //     return () => {
    //         clearTimeout(timer);
    //     };
    // }, [reportsQueryData, updateSalesReport, businessId]);

    // useEffect(() => {
    //     let isMounted = true;
    //     (async () => {
    //         try {
    //             const data = await getSalesReportData(businessId);
    //             if (!isMounted) return;
    //             const reports_data = data?.reduce((prev, item) => {
    //                 const existingIndex = prev?.findIndex(prevItem => prevItem?.generated_at === item?.generated_at);
    //                 if (existingIndex >= 0) {
    //                     const updated = [...(prev || [])];
    //                     updated[existingIndex] = {...updated?.[existingIndex], ...item};
    //                     return updated;
    //                 }
    //                 const updated = [...(prev || []), item];
    //                 return updated;
    //             }, [] as Array<SalesReportQueryLogic>);
    //             setReportsQueryData(reports_data);
    //         }catch(err) {
    //             console.log(err);
    //         }
    //     })();
    //     return () => {
    //         isMounted = false;
    //     }
    // }, [businessId, getSalesReportData]);


    return (
        <div className="flex flex-col gap-y-5 px-2 sm:px-4 lg:px-0">
            <Card className="dark:bg-black">
                <CardHeader>
                    <CardTitle>Sales Report Filter</CardTitle>
                    <CardDescription>Manage And Generate Sales Report and Also Filter Based On the Options Provided.</CardDescription>
                </CardHeader>
                <div className="flex flex-col gap-y-2">
                    <CardHeader className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-y-0.5">
                            <CardTitle className="text-[14.5px]">Report type</CardTitle>
                            <Select value={reportType} onValueChange={(val) => setReportType(val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Daily Sales</SelectItem>
                                    <SelectItem value="week">Weekly Sales</SelectItem>
                                    <SelectItem value="month">Monthly Sales</SelectItem>
                                    <SelectItem value="year">Yearly Sales</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-y-0.5">
                            <CardTitle className="text-[14.5px]">Start Date</CardTitle>
                            <input value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} type="date" max={`${new Date().toISOString().split("T")[0]}`} className="w-full py-1.5 rounded-[0.5vmax] px-2 border border-gray-500/30" />
                        </div>
                        <div className="flex flex-col gap-y-0.5">
                            <CardTitle className="text-[14.5px]">End Date</CardTitle>
                            <input value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} type="date" max={`${new Date().toISOString().split("T")[0]}`} className="w-full py-1.5 rounded-[0.5vmax] px-2 border border-gray-500/30" />
                        </div>
                        <div className="flex flex-col gap-y-0.5">
                            <CardTitle className="text-[14.5px]">Format</CardTitle>
                            <Select disabled value={format} onValueChange={(val) => setFormat(val)}>
                                <SelectTrigger className="w-full cursor-not-allowed">
                                    <SelectValue placeholder="Select Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-y-0.5">
                            <CardTitle className="text-[14.5px]">Select Cashier</CardTitle>
                            <Select value={cashier} onValueChange={(staff_id) => setCashier(staff_id)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Cashier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Cashier</SelectItem>
                                    {cashiers?.map((cashier) => (
                                        <SelectItem key={`cashier-staff-id-${cashier?.staff_id}`} value={`${cashier?.staff_id}`}>{cashier?.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <div className="flex flex-col gap-y-0.5">
                        <CardHeader>
                            <CardTitle className="text-[14.5px]">Include in Report</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div className="flex items-center gap-x-2">
                                <Switch checked={includeSummary} onCheckedChange={(e) => setIncludeSummary(e)} />
                                <div className="text-sm font-[500]">Summary</div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Switch checked={includeDetails} onCheckedChange={(e) => setIncludeDetails(e)} />
                                <div className="text-sm font-[500]">Details</div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Switch checked={includePaymentMethod} onCheckedChange={(e) => setIncludePaymentMethod(e)} />
                                <div className="text-sm font-[500]">Payment Method</div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Switch checked={includeProductBreakdown} onCheckedChange={(e) => setIncludeProductBreakdown(e)} />
                                <div className="text-sm font-[500]">Product Breakdown</div>
                            </div>

                            <button
                                onClick={handleGenerateReport}
                                disabled={isLoadingReport}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2"
                            >
                                {isLoadingReport ? (
                                    <Loader size={18} className="animate-spin" />
                                ) : (
                                    <FileText size={18} />
                                )}
                                {isLoadingReport ? 'Generating...' : 'Generate Report'}
                            </button>
                        </CardContent>
                    </div>
                </div>
            </Card>
            <Card className="py-6 dark:bg-black">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-0">
                    <div className="w-full flex flex-col gap-y-1.5">
                        <CardTitle>Reports History</CardTitle>
                        <CardDescription>Previously Generated Reports</CardDescription>
                    </div>
                    <div className="w-full max-w-md relative">
                        <input
                            type="text"
                            placeholder="Search by transaction ID"
                            className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-gray-500/30 focus:outline-none placeholder:text-sm"
                        />
                        <Search size={20} className="text-gray-500/40 font-bold absolute left-2 top-1/2 -translate-y-1/2" />
                    </div>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date Range</TableHead>
                                    <TableHead>Report Type</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportsQueryData?.length ? reportsQueryData?.map((sr, idx) => (
                                    <TableRow key={`sales-report-${idx}`}>
                                        <TableCell>
                                            {(() => {
                                                const item = sr as Record<string, unknown>;
                                                if (item && typeof item === 'object' && 'period_label' in item && typeof item.period_label === 'string') {
                                                    return item.period_label;
                                                }
                                                return sr?.start_date && sr?.end_date
                                                    ? `${String(sr?.start_date)} - ${String(sr?.end_date)}`
                                                    : 'Custom Range';
                                            })()}
                                        </TableCell>
                                        <TableCell className="capitalize">{sr?.report_type || 'Custom'}</TableCell>
                                        <TableCell>{sr?.start_date || 'N/A'}</TableCell>
                                        <TableCell>{sr?.end_date || 'N/A'}</TableCell>
                                        <TableCell className="uppercase">{sr?.format || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                data-uid={sr?.mapId}
                                                                className="h-8 w-8"
                                                                onClick={handleViewReport}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View Report</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={async () => {
                                                                    try {
                                                                        if (navigator.share) {
                                                                            await navigator.share({
                                                                                title: 'Sales Report',
                                                                                text: 'Check out this sales report',
                                                                                url: window.location.href,
                                                                            });
                                                                        } else {
                                                                            await navigator.clipboard.writeText(window.location.href);
                                                                            toast.success('Link copied to clipboard');
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error sharing:', error);
                                                                        toast.error('Failed to share');
                                                                    }
                                                                }}
                                                            >
                                                                <Share2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Share Report</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No reports generated. Please Kindly Refresh Your Page And Try Again
                                        </TableCell>
                                    </TableRow>
                                )
                                }
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SalesReport;