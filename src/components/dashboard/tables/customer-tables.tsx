"use client";

import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import customerColumns from "@/components/data-table/customer-columns";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/api/controllers/get/handler";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabList } from "@/components/dashboard";
import { useCustomStyles } from "@/hooks";


type FilterType = 'all' | 'top' | 'returning' | 'walk_in';
type SortType = 'created_at' | 'name' | 'total_purchases' | 'order_count';


const CustomersTable = () => {

     const [filter, setFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('created_at');
    const [currentPage, setCurrentPage] = useState(1);
    const [indicatorStyle, setIndicatorStyle] = useState<{left: number; width: number}>({left: 0, width: 0});
    const LIMIT = 50;

    const filterLabels = ['All Customers', 'Top Customers', 'Returning', 'Walk-in'];
    const filterValues: FilterType[] = ['all', 'top', 'returning', 'walk_in'];
    const filterIndex = filterValues.indexOf(filter);


    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const id = sessionStorage.getItem("selectedBusinessId");
            return id ? JSON.parse(id) : 0;
        }
        return 0;
    }, []);

      const offset = (currentPage - 1) * LIMIT;

  const {
        data: customerData,
        isLoading: customerLoading,
        isSuccess: customerSuccess,
        isError: customerError,
        error: customerErrorData,
        refetch: customerRefetch
    } = useQuery({
        queryKey: ["get-customers", businessId, filter, sortBy, currentPage],
        queryFn: () => getCustomers({
            businessId,
            filter,
            sort_by: sortBy,
            limit: LIMIT,
            offset
        }),
        refetchOnWindowFocus: false,
        retry: false,
    });

    const customerdata = useMemo(() => {
        if (customerSuccess) {
            return customerData?.customers;
        }
        return [];
    }, [customerData, customerSuccess]);

    
    const pagination = useMemo(() => {
        if (customerSuccess && customerData?.pagination) {
            return customerData.pagination;
        }
        return null;
    }, [customerData, customerSuccess]);

    const handleFilterChange = (index: number) => {
        setFilter(filterValues[index]);
        setCurrentPage(1);
    };

    const listRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const {hiddenScrollbar} = useCustomStyles();

    useEffect(() => {
        const node = listRefs.current[filterIndex];
        const containerNode = containerRef.current;
        if (node && containerNode) {
            const nodeRect = node.getBoundingClientRect();
            const containerRect = containerNode.getBoundingClientRect();
            const padding = 8;
            setIndicatorStyle({
                left: (nodeRect.left - containerRect.left + containerNode.scrollLeft - padding / 2),
                width: nodeRect.width + padding,
            });
        }
    }, [filterIndex]);

    const handleSortChange = (newSort: SortType) => {
        setSortBy(newSort);
        setCurrentPage(1);
    };

    if (customerLoading) {
        return (
            <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <RiLoader4Line className="animate-spin h-12 w-12 text-template-primary" />
                    <p className="text-foreground/60 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (customerError) {
        const errorMessage = customerErrorData instanceof Error ? customerErrorData.message : 'Failed to load dashboard data';
        toast.error(errorMessage);
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background p-4">
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button onClick={() => customerRefetch()} className="w-full">Retry</Button>
                </div>
            </div>
        );
    }

    const filterOptions: Array<{ value: FilterType; label: string; description: string }> = [
        { value: 'all', label: 'All Customers', description: 'Show all customers' },
        { value: 'top', label: 'Top Customers', description: 'Customers with purchases' },
        { value: 'returning', label: 'Returning', description: 'Customers with 2+ orders' },
        { value: 'walk_in', label: 'Walk-in', description: 'No phone or email' },
    ];

    const sortOptions: Array<{ value: SortType; label: string }> = [
        { value: 'created_at', label: 'Newest First' },
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'total_purchases', label: 'Total Purchases' },
        { value: 'order_count', label: 'Order Count' },
    ];

    return (
        <Card className="w-full dark:bg-black">
            <div className="flex flex-col gap-y-3">
                <CardHeader>
                    <CardTitle className="text-base font-[600]">Customers</CardTitle>
                    <CardDescription className="text-xs font-[550] text-muted-foreground">Manage your customer database</CardDescription>
                </CardHeader>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-2 gap-4 ">

                        <div ref={containerRef} className="w-full h-7 lg:w-fit bg-template-whitesmoke-dim dark:bg-black/60 px-2 rounded-sm relative z-10 overflow-x-auto" style={hiddenScrollbar}>
                            <div className="min-w-[560px] flex justify-between items-center gap-x-4">
                                {filterLabels?.map((item, index) => (
                                    <TabList item={item} index={index} setlistCount={handleFilterChange} key={index} ref={el => {
                                        if (el) listRefs.current[index] = el
                                    }} />
                                ))}
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-template-primary h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" style={{left: indicatorStyle.left, width: indicatorStyle.width}} />
                        </div>

                    
                        <div className=" flex h-7 flex-col items-start lg:items-end mb-4 lg:mb-0 ">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort by
                            </label>
                            <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortType)}>
                                <SelectTrigger className="w-full md:w-30 xl:w-64">
                                    <SelectValue placeholder="Select sort option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {pagination && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Showing {((pagination.current_page - 1) * pagination.limit) + 1}-{Math.min(pagination.current_page * pagination.limit, pagination.total_records)} of {pagination.total_records} customers
                            </div>
                        )}
                    </div>
                </div>
                 <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
                    <DataTableWithNumberPagination
                        columns={customerColumns}
                        data={customerdata}
                        filterId="name"
                        placeholderText="Search by Customer Name / ID"
                        isShowCost={false}
                        isShowStock={true}
                        displayedText="Customers"
                        pagination={pagination}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </Card>
    );
}

export default CustomersTable;