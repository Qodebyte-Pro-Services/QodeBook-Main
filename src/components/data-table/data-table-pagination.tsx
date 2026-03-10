"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  isShowCost?: boolean;
  isShowStock?: boolean;
  displayedText?: string;
}

export function DataTablePagination<TData>({
  table,
  isShowCost = true,
  isShowStock = true,
  displayedText = "Stocks"
}: DataTablePaginationProps<TData>) {
  // useEffect(() => {
  //   const items = table.getRowModel().rows.map(item => item.original); //! Incase i wan do changes for the table shaa 
  // }, []);
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-y-5 lg:justify-between px-2">
      <div className="flex-1 flex gap-x-3 items-center">
        {isShowStock && (
          <div className="text-[15px] md:text-[13px]">
            Total {displayedText}: {table.getRowModel().rows.length}
          </div>
        )}
        {isShowCost && (
          <div className="text-[13px]">
            Total Cost: {new Intl.NumberFormat("en-NG", {currency: "NGN", style: "currency", currencyDisplay: "symbol", unitDisplay: "long", currencySign: "standard"}).format(20000000)}
          </div>
        )}
      </div>
      <div className="flex flex-col lg:flex-row items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-[15px] font-[550] md:text-sm md:font-medium">Rows per page</p>
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
        <div className="flex w-[100px] mt-3 items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
