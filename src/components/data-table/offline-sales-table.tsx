import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { useOfflineCustomers, useOfflineOrders } from "@/hooks/use-localforage";
import { CustomerResponse } from "@/models/types/shared/handlers-type";
import OfflineSalesInvoice from "../dashboard/sales/invoice/OfflineSalesInvoice";
import { toast } from "sonner";
import { submitOfflineOrder } from "@/api/controllers/post/orders";

export type OfflineSalesSchema = {
    branch_id: number;
    business_id: number;
    coupon: number;
    createdAt: string;
    created_by_user_id: number;
    customer_id: number;
    discount: number;
    id: string;
    items: Array<{quantity: number; total_price: number; unit_price: number; variant_id: number;}>;
    note: string;
    order_type: string;
    payments: Array<{amount: number; method: string; reference: string}>;
    staff_id?: number;
    status: string;
    taxes: number;
}

const ActionsCellHandler = ({row, onSyncSuccess}: {row: {original: OfflineSalesSchema}; onSyncSuccess?: () => void | Promise<void>}) => {
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    
    const { getOfflineCustomers} = useOfflineCustomers();

    const [offlineCustomers, setOfflineCustomers] = useState<CustomerResponse[]>([]);

  const { removeOfflineOrder } = useOfflineOrders();

    
    const businessId = useMemo(() => {
        if (typeof window === "undefined") return;
        const storeBid = sessionStorage.getItem("selectedBusinessId");
        return storeBid ? JSON.parse(storeBid) : 0;
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            (async () => {
                const offline_customers = await getOfflineCustomers(businessId);
                setOfflineCustomers(offline_customers as CustomerResponse[]);
            })();
        }
        return () => {
            isMounted = false
        };
    }, [businessId, getOfflineCustomers]);

    const invoice_details = useMemo(() => {
        const customer = offlineCustomers?.length ? offlineCustomers?.find(cs => cs?.id === +row?.original?.customer_id) : "";
        const {original: {...rest}} = row;
        if (customer && Object.keys(customer)?.length) {
            const invoiceData = {
                ...rest,
                customer_name: customer?.name || "",
                customer_email: customer?.email,
                customer_phone: customer?.phone
            };
            return invoiceData;
        }
        return {
            ...rest,
            customer_name: "Walk-In",
            customer_email: "N/A",
            customer_phone: "N/A"
        };
    }, [offlineCustomers, row]);

    const handleManualSyncing = async () => {
        if (typeof navigator === "undefined") return;
        if (!navigator.onLine) {
            toast.error("Failed To Sync Pending Orders", {description: "Please Kindly Connect to your network and try again."});
            return;
        }
        const data = row?.original;
        const orderData = data;
        setIsSyncing(true);
        try {
            toast.info(`Syncing pending order ${orderData?.id}...`);
            
            // Sync the order to backend directly
            const response = await submitOfflineOrder(orderData as unknown as Parameters<typeof submitOfflineOrder>[0]);
            const syncSucceeded = typeof response === 'boolean' ? response : response?.success;
            
            // Only remove if sync succeeded
            if (syncSucceeded) {
                await removeOfflineOrder(orderData?.id);
                
                // Call parent callback to trigger table re-render
                if (onSyncSuccess) {
                    await onSyncSuccess();
                }
                
                toast.success('Order synced successfully', {
                    description: `Order ${orderData?.id} has been synced to the server`
                });
            } else {
                toast.error('Failed to sync order', {
                    description: 'The order could not be synced. Please check your connection and try again.'
                });
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to sync orders', {
                description: 'An unexpected error occurred during sync'
            });
        } finally {
            setIsSyncing(false);
        }
    }

    
    return (
        <>  
            <FlexibleDataTableRowActions>
                <DropdownMenuItem 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsViewDetailsOpen(true);
                    }}
                >
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleManualSyncing()
                    }}
                    disabled={isSyncing}
                >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="text-red-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete logic here
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </FlexibleDataTableRowActions>
            
            {isViewDetailsOpen && (
                <>
                    <OfflineSalesInvoice
                        sale={invoice_details}
                        onClose={() => setIsViewDetailsOpen(false)}
                    />  
                    <div className="fixed inset-0 backdrop-blur-[4px] w-full h-full z-10" />
                </>
            )}
        </>
    )
};

const createOfflineSalesColumns = (onSyncSuccess?: () => void | Promise<void>): ColumnDef<OfflineSalesSchema>[] => [
    {
        accessorKey: "id",
        header: ({column}) => <DataTableColumnHeader column={column} title="Invoice No" />,
        cell: ({row}) => <div>{row.index + 1}</div>
    },
    {
        accessorKey: "createdAt",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date & Time" />,
        cell: ({row}) => <div className="text-nowrap">{new Date(row.getValue('createdAt')).toLocaleDateString("default", {month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true})}</div>
    },
    {
        accessorKey: "payments",
        header: ({column}) => <DataTableColumnHeader column={column} title="Payment" />,
        cell: ({row}) => {
            return <div className="text-nowrap">{row?.original?.payments?.length > 1 ? row?.original?.payments?.map(payment => payment?.method)?.join(", ")?.replace(/\b\w/g, char => char.toUpperCase())?.replace(/\_/g, "-") : row?.original?.payments?.[0]?.method?.replace(/\b\w/g, char => char?.toUpperCase())?.replace(/\_/g, "-")}</div>
        }
    },
    {
        accessorKey: "discount",
        header: ({column}) => <DataTableColumnHeader column={column} title="Discounts" />,
        cell: ({row}) => (
            <BadgeTwo variant={"default"}>{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", currencySign: "standard", maximumFractionDigits: 0}).format(row.getValue("discount"))}</BadgeTwo>
        )
    },
    {
        accessorKey: "amount_payments",
        header: ({column}) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({row}) => <div>{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", currencySign: "standard", maximumFractionDigits: 0}).format(row?.original?.payments?.length > 1 ? row?.original?.payments?.map(item => +item?.amount)?.reduce((prev, item) => prev += item, 0) : row?.original?.payments?.[0]?.amount)}</div>
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => {
            const variantColorId = row?.original?.status?.split(/\_/)?.length ? (row?.original?.status?.slice(0, row?.original?.status?.indexOf("_"))?.toLowerCase() === "pending" ? "processing" : "default") : "default";
            return(
                <BadgeTwo variant={variantColorId}>
                    {(row.getValue("status")as string).charAt(0).toUpperCase() + (row.getValue("status") as string).slice(1)}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({row}) => <ActionsCellHandler row={row} onSyncSuccess={onSyncSuccess} />
    }
];

export default createOfflineSalesColumns;