"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { useMemo } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterId?: string | "item";
  placeholderText ?: string;}

export function DataTableToolbar<TData>({ table, filterId, placeholderText }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  
  const filtering_tabs = useMemo(() => {
    if (!filterId) {
      const rowTabs = table?.getRowModel()?.rows?.map(item => item?.original);
      console.log(rowTabs);
    }
  }, [filterId, table]);

  return (
    <div className="flex items-center gap-x-3 justify-between">
      <div className="flex flex-1 items-center space-x-2 relative z-10">
        {typeof filterId !== "undefined" && filterId && table.getColumn(`${filterId}`) && (
          <Input
            placeholder={placeholderText}
            value={(table.getColumn(`${filterId}`)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(`${filterId}`)?.setFilterValue(event.target.value)
            }
            className="h-8 focus:outline-none"
          />
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
