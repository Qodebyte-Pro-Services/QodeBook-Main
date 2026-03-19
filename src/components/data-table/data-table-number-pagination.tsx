"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  isShowCost?: boolean;
  isShowStock?: boolean;
  displayedText?: string;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_records: number;
    limit: number;
    offset: number;
  };
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function DataTableNumberPagination<TData>({
  table,
  isShowCost = true,
  isShowStock = true,
  displayedText = "Stocks",
  pagination,
  currentPage,
  onPageChange
}: DataTablePaginationProps<TData>) {
  const [totalCost, setTotalCost] = useState<number>(0);
  useEffect(() => {
    const items = table.getRowModel().rows.map(item => item.original);
    const totalCost = items.reduce((acc:number, item: any) => acc + item?.amount || 0, 0);
    setTotalCost(totalCost);
  }, [table?.getRowModel()?.rows]);
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center px-2">
      <div className="flex-1 w-full flex gap-x-3 items-center">
        {isShowStock && (
          <div className="text-[13px]">
            Total {displayedText}: {table.getRowModel().rows.length}
          </div>
        )}
        {isShowCost && (
          <div className="text-[13px]">
            Total Cost: {new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", currencyDisplay: "symbol", unitDisplay: "long", currencySign: "standard"}).format(totalCost || 0)}
          </div>
        )}
      </div>
      <div className="flex-1 w-full">
        <Pagination className="flex justify-center sm:justify-end">
          <PaginationContent>
            <PaginationItem className="mr-4">
              <Button
                variant="ghost"
                className="w-[30px] h-[30px] flex justify-center items-center border border-gray-500/30 rounded-sm"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Previous page</span>
                <ChevronLeft className="text-auth-basic/40" />
              </Button>
            </PaginationItem>

                      {pagination ? (
           
              Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <React.Fragment key={i}>
                    {i === 2 && pagination.total_pages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        color={currentPage === pageNum ? 'var(--color-template-chart-store/40)' : ''}
                        onClick={() => onPageChange?.(pageNum)}
                        className="cursor-pointer active:bg-template-chart-store/40 rounded-sm"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })
            ) : (
             
              Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                return (
                  <React.Fragment key={i}>
                    {i === 2 && table.getPageCount() > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        isActive={table.getState().pagination.pageIndex === (i + 1)}
                        color={table.getState().pagination.pageIndex === (i + 1) ? 'var(--color-template-chart-store/40)' : ''}
                        onClick={() => table.setPageIndex(i + 1)}
                        className="cursor-pointer active:bg-template-chart-store/40 rounded-sm"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })
            )}
            <PaginationItem className="ml-4">
              <Button
                variant="ghost"
                className="w-[30px] h-[30px] flex justify-center items-center border border-gray-500/30 rounded-sm"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Next page</span>
                <ChevronRight className="text-auth-basic/40" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="flex-1 w-full flex flex-col lg:flex-row justify-end-safe items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Show per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
