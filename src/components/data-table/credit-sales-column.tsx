import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useState } from "react";
import { CreditAccountType } from "@/store/data/sales-table-data";
import { toast } from "sonner";
import { settleCreditAccount } from "@/api/controllers/put/handlers";
import { useQueryClient } from "@tanstack/react-query";

const ActionsCellHandler = ({ row }: { row: { original: CreditAccountType } }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const executeSettle = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Settling account...");
        try {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            if (!businessId) throw new Error("Business ID not found");
            
            await settleCreditAccount({
                id: `${row.original.id}`,
                businessId: JSON.parse(businessId)
            });
            toast.success("Account settled successfully!", { id: toastId });
            queryClient.invalidateQueries({ queryKey: ["get-business-credit-accounts"] });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to settle account";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettle = async () => {
        toast.info("Settle Account?", {
            description: "Are you sure you want to settle this installment account?",
            action: {
                label: "Settle Now",
                onClick: () => executeSettle()
            },
            cancel: {
                label: "Cancel",
                onClick: () => {}
            }
        });
    };

    return (
        <FlexibleDataTableRowActions>
            <DropdownMenuItem
                onClick={(e) => {
                    e.stopPropagation();
                    // Implement View Details if needed, or link to order
                    toast.info("View Details feature coming soon");
                }}
            >
                View Details
            </DropdownMenuItem>
            {row.original.credit_type === 'installment' && row.original.status !== 'settled' && (
                <DropdownMenuItem
                    className="text-green-600"
                    disabled={isLoading}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSettle();
                    }}
                >
                    {isLoading ? "Settling..." : "Settle Account"}
                </DropdownMenuItem>
            )}
        </FlexibleDataTableRowActions>
    );
};

const creditSalesColumn: ColumnDef<CreditAccountType>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => <div>{row.original.id}</div>
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => <div className="text-nowrap">{new Date(row.getValue('created_at')).toLocaleDateString("default", { month: "short", day: "2-digit", year: "numeric" })}</div>
    },
    {
        accessorKey: "customer_name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => <div className="text-nowrap">{row.getValue("customer_name") ?? "Walk In"}</div>
    },
    {
        accessorKey: "credit_type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => <div className="capitalize">{row.getValue("credit_type")}</div>
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
        cell: ({ row }) => <div>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(row.getValue("total_amount")))}</div>
    },
    {
        accessorKey: "amount_paid",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
        cell: ({ row }) => <div className="text-green-600">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(row.getValue("amount_paid")))}</div>
    },
    {
        accessorKey: "balance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => <div className="text-red-500 font-medium">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(row.getValue("balance")))}</div>
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variantColorId = status === "settled" ? "default" : "destructive";
            return (
                <BadgeTwo variant={variantColorId}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCellHandler row={row} />
    }
];

export default creditSalesColumn;
