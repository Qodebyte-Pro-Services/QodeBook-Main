"use client";

import { OrderTask } from "@/store/data/order-data";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useSelectedRowStore } from "@/store/selected-row-store";
import { useMemo, useState } from "react";
import { SupplyOrderInvoice } from "../dashboard/invoices/order-invoice";
import { toast } from "sonner";
import EditOrderForm from "@/components/dashboard/inventory/forms/edit-order-form";
import UpdateOrderStatusForm from "@/components/dashboard/inventory/forms/update-order-status-form";


const OrderActionsCell = ({ row }: { row: {original: OrderTask} }) => {
  const { setSelectedOrder } = useSelectedRowStore();
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [showEditOrderForm, setShowEditOrderForm] = useState<boolean>(false);
  const [showUpdateStatusForm, setShowUpdateStatusForm] = useState<boolean>(false);

  const business_id = useMemo(() => {
    if (typeof window !== "undefined") {
      const id = sessionStorage?.getItem("selectedBusinessId");
      return id ? JSON.parse(id) : 0;
    }
  }, []);
  
  const handleSaveOrder = async (updatedOrder: OrderTask) => {
    try {
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };
  
  return (
    <>
      <FlexibleDataTableRowActions>
        <DropdownMenuItem onClick={() => {
          setShowInvoice(true);
          setSelectedOrder(row.original);
        }}>
          View
        </DropdownMenuItem>
        {["awaiting_payment", "paid"]?.includes(row?.original?.supply_status) ? (
          <>
            <DropdownMenuItem onClick={() => {
              setShowEditOrderForm(true);
              setSelectedOrder(row.original);
            }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setShowUpdateStatusForm(true);
              setSelectedOrder(row.original);
            }}>
              Update Status
            </DropdownMenuItem>
          </>
        ) : null}
        {!["paid"]?.includes(row?.original?.supply_status.toLowerCase()) ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this order?')) {
                  try {
                    toast.success("Order deleted successfully");
                  } catch (error) {
                    console.error("Error deleting order:", error);
                    toast.error("Failed to delete order");
                  }
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </FlexibleDataTableRowActions>
      
      {showInvoice && (
        <SupplyOrderInvoice 
          isOpen={showInvoice} 
          onClose={() => setShowInvoice(false)} 
          orderId={`${row.original.id}`} 
        />
      )}

      {showEditOrderForm && (
        <EditOrderForm
          isOpen={showEditOrderForm}
          onClose={() => setShowEditOrderForm(false)}
          business_id={business_id || 0}
          order={row.original}
          onSave={handleSaveOrder}
        />
      )}

      {showUpdateStatusForm && (
        <UpdateOrderStatusForm
          isOpen={showUpdateStatusForm}
          onClose={() => setShowUpdateStatusForm(false)}
          order={row.original}
        />
      )}
    </>
  );
};

const columns: ColumnDef<OrderTask>[] = [
  {
    accessorKey: "id",
    header: ({column}) => <DataTableColumnHeader column={column} title="Order ID" />,
    cell: ({row}) => <div>{row.index + 1}</div>
  },
  {
    accessorKey: "supplier_name",
    header: ({column}) => <DataTableColumnHeader column={column} title="Supplier" />,
    cell: ({row}) => <div className="text-nowrap">{row.getValue("supplier_name") ?? "N/A"}</div>
  },
  {
    accessorKey: "supply_order_date",
    header: ({column}) => <DataTableColumnHeader column={column} title="Order Date" />,
    cell: ({row}) => <div className="text-nowrap">{new Date(row.getValue("supply_order_date")).toLocaleDateString("default", {month: "long", day: "numeric", year: "numeric"})}</div>
  },
  {
    accessorKey: "expected_delivery_date",
    header: ({column}) => <DataTableColumnHeader column={column} title="Expected Delivery Date" />,
    cell: ({row}) => <div className="text-nowrap">{new Date(row.getValue("expected_delivery_date")).toLocaleDateString("default", {month: "long", day: "numeric", year: "numeric"})}</div>
  },
  {
    accessorKey: "supply_status",
    header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({row}) => {
      const statusValue = row.getValue("supply_status");
      const statusColor = statusValue === "awaiting_payment" ? "processing" : 
                         (statusValue === "paid" ? "default" : 
                         (statusValue === "delivered" ? "default" : "destructive"));
      return (
        <BadgeTwo className="text-nowrap" variant={statusColor}>
          {statusValue === "awaiting_payment" ? "Awaiting Payment" : 
           statusValue === "paid" ? "Paid" : 
           statusValue === "delivered" ? "Delivered" : "Canceled"}
        </BadgeTwo>
      );
    }
  },
  {
    id: "actions",
    cell: ({row}) => <OrderActionsCell row={row} />
  }
];

export { columns };