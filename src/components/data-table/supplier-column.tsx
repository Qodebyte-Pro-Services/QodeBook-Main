import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useState } from "react";
import { SupplierLogicType } from "@/store/data/suppliers-data-view";

const SupplierColumnFooter = ({row}: {row: Row<SupplierLogicType>}) => {
    const [selectedTask, setSelectedTask] = useState<SupplierLogicType | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    
    const handleView = (task: SupplierLogicType) => {
        setSelectedTask(task);
        setIsOpen(true);
    };

    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => handleView(row.original)}>
                    View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
            </FlexibleDataTableRowActions>
            
        </>
    );
}

const supplierColumn: ColumnDef<SupplierLogicType>[] = [
    {
        accessorKey: "name",
        header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({row}) => <div>{row.getValue("name") ?? "N/A"}</div>
    },
    {
        accessorKey: "contact",
        header: ({column}) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({row}) => <div>{row.getValue("contact") ?? "N/A"}</div>
    },
    {
        accessorKey: "created_at",
        header: ({column}) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({row}) => <div>{new Date(row.getValue("created_at")).toLocaleDateString("default", {month: "long", day: "numeric", year: "numeric"})}</div>
    },
    {
        id: "actions",
        cell: ({row}) => <SupplierColumnFooter row={row as Row<SupplierLogicType>} />
    }
];

export { supplierColumn };