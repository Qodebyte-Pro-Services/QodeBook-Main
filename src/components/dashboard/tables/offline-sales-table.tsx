"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import offlineSalesColumn, { OfflineSalesSchema } from "@/components/data-table/offline-sales-table";

const OfflineSalesTable = ({sales}: {sales: OfflineSalesSchema[]}) => {

  return (
    <Card>
        <div className="flex flex-col gap-y-3">
            <CardHeader>
                <CardTitle className="text-base font-[600]">Sales</CardTitle>
                <CardDescription className="text-xs font-[550] text-muted-foreground">All pending, processing, in transit and canceled orders.</CardDescription>
            </CardHeader>
            <div className="px-4 py-5 bg-white rounded-sm">
                <DataTableWithNumberPagination columns={offlineSalesColumn} data={sales} filterId="id" placeholderText="Search by Order Name / ID" isShowCost={false} isShowStock={true} displayedText="Pending Orders" />
            </div>
        </div>
    </Card>
  );
}

export default OfflineSalesTable;