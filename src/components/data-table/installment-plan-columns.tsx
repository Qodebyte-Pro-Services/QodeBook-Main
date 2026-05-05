import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { BadgeTwo } from "../ui/badge-two";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useState } from "react";
import { InstallmentPlanType } from "@/store/data/sales-table-data";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { completeInstallment } from "@/api/controllers/post/installment-handler";
import InstallmentPaymentsModal from "@/components/dashboard/sales/installment-payments-modal";

const ActionsCellHandler = ({ row }: { row: { original: InstallmentPlanType } }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const executeComplete = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Finalizing installment plan and updating stock...");
        try {
            const businessId = sessionStorage.getItem("selectedBusinessId");
            if (!businessId) throw new Error("Business ID not found");
            
            await completeInstallment({
                plan_id: row.original.id,
                business_id: JSON.parse(businessId)
            });
            toast.success("Installment plan completed successfully!", {
                id: toastId,
                description: "Inventory stock has been updated accordingly."
            });
            queryClient.invalidateQueries({ queryKey: ["get-business-installment-plans"] });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to complete installment plan";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        if (Number(row.original.remaining_balance) > 0) {
            toast.error("Cannot complete plan. Balance must be fully paid.");
            return;
        }

        toast.info("Finalize Installment Plan?", {
            description: "This will complete the sale and deduct current stock. This action is irreversible.",
            action: {
                label: "Complete Plan",
                onClick: () => executeComplete()
            },
            cancel: {
                label: "Cancel",
                onClick: () => {}
            }
        });
    };

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsPaymentsModalOpen(true);
                    }}
                >
                    View Payments
                </DropdownMenuItem>
                {row.original.status.toLowerCase() !== 'completed' && Number(row.original.remaining_balance) <= 0 && (
                    <DropdownMenuItem
                        className="text-green-600 font-medium"
                        disabled={isLoading}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleComplete();
                        }}
                    >
                        {isLoading ? "Completing..." : "Complete Plan"}
                    </DropdownMenuItem>
                )}
            </FlexibleDataTableRowActions>

            {isPaymentsModalOpen && (
                <InstallmentPaymentsModal 
                    planId={row.original.id} 
                    isOpen={isPaymentsModalOpen} 
                    onClose={() => setIsPaymentsModalOpen(false)} 
                />
            )}
        </>
    );
};

const installmentPlanColumns: ColumnDef<InstallmentPlanType>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Plan ID" />,
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
        accessorKey: "payment_frequency",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Frequency" />,
        cell: ({ row }) => <div className="capitalize">{row.getValue("payment_frequency")}</div>
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
        cell: ({ row }) => <div>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(row.getValue("total_amount")))}</div>
    },
    {
        accessorKey: "remaining_balance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => <div className={Number(row.getValue("remaining_balance")) > 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(row.getValue("remaining_balance")))}</div>
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variantColorId = status === "completed" ? "default" : status === "active" ? "processing" : "destructive";
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

export default installmentPlanColumns;
