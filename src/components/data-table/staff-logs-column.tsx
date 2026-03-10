import { StaffLogsResponse } from "@/models/types/shared/handlers-type";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { FlexibleDataTableRowActions } from "./flexible-data-row-actions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import {
    User,
    ShieldCheck,
    Monitor,
    MapPin,
    Clock,
    Globe,
    ExternalLink,
    Activity,
    LogOut,
    LogIn,
    Fingerprint
} from "lucide-react";
import { Separator } from "../ui/separator";
import { BadgeTwo } from "../ui/badge-two";

const StaffActionLog = ({ rowData }: { rowData: StaffLogsResponse }) => {
    const [isView, setIsView] = useState<boolean>(false);
    return (
        <>
            <FlexibleDataTableRowActions>
                <DropdownMenuItem onClick={() => setIsView(true)}>View</DropdownMenuItem>
            </FlexibleDataTableRowActions>
            {isView && (
                <Dialog open={isView} onOpenChange={setIsView}>
                    <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                        <DialogHeader className="p-6 pb-4 bg-linear-to-r from-primary/10 via-primary/5 to-background border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 ml-1 rounded-xl bg-primary/10 text-primary">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold tracking-tight">Staff Session Log</DialogTitle>
                                    <DialogDescription className="text-sm font-medium opacity-80">Detailed activity report for this login session</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Left Section: User & Session Profile */}
                            <div className="p-6 border-b md:border-b-0 md:border-r bg-muted/30">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-muted-foreground/70">
                                            <User className="w-3.5 h-3.5" /> Staff Profile
                                        </h4>
                                        <div className="p-4 bg-background border rounded-xl shadow-sm space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-base font-bold text-foreground leading-tight">{rowData?.full_name}</div>
                                                    <div className="text-xs font-medium text-muted-foreground mt-0.5">{rowData?.position_name}</div>
                                                </div>
                                                <BadgeTwo variant={rowData?.success ? "default" : "destructive"} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                    {rowData?.success ? "Active" : "Failed"}
                                                </BadgeTwo>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-muted-foreground/70">
                                            <LogIn className="w-3.5 h-3.5" /> Access Point
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-background border shadow-xs"><Fingerprint className="w-4 h-4 text-primary/70" /></div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">IP Address</div>
                                                    <div className="text-sm font-semibold font-mono">{rowData?.ip_address}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-background border shadow-xs"><Globe className="w-4 h-4 text-primary/70" /></div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Location</div>
                                                    <div className="text-sm font-semibold">{rowData?.city}, {rowData?.country}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Technical Details & Timing */}
                            <div className="p-6 space-y-6 bg-background">
                                <div>
                                    <h4 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-muted-foreground/70">
                                        <Clock className="w-3.5 h-3.5" /> Timeline
                                    </h4>
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                                        <div className="relative">
                                            <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm ring-4 ring-emerald-500/10"></div>
                                            <div>
                                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Logged In</div>
                                                <div className="text-sm font-bold text-foreground">
                                                    {new Date(rowData?.login_time)?.toLocaleString("default", {
                                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-slate-400 border-2 border-background shadow-sm ring-4 ring-slate-400/10"></div>
                                            <div>
                                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Logged Out</div>
                                                <div className="text-sm font-bold text-foreground">
                                                    {rowData?.logout_time ? new Date(rowData?.logout_time)?.toLocaleString("default", {
                                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true
                                                    }) : '--:--'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-muted-foreground/10" />

                                <div>
                                    <h4 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-muted-foreground/70">
                                        <Monitor className="w-3.5 h-3.5" /> Environment
                                    </h4>
                                    <div className="p-4 rounded-xl bg-muted/20 border border-muted/30">
                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight mb-2">Browser / Agent</div>
                                        <div className="text-xs font-medium text-foreground leading-relaxed break-words bg-background/50 p-2 rounded-lg border border-dashed hover:border-primary/30 transition-colors">
                                            {rowData?.user_agent}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

const staffLogColumns: ColumnDef<StaffLogsResponse>[] = [
    {
        accessorKey: "full_name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Full name" />,
        cell: ({ row }) => <div className="text-nowrap">{row?.original?.full_name}</div>
    },
    {
        accessorKey: "ip_address",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ip Address" />,
        cell: ({ row }) => <div className="text-nowrap">{row?.original?.ip_address}</div>
    },
    {
        accessorKey: "login_time",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Login time" />,
        cell: ({ row }) => <div className="text-nowrap">{new Date(row?.original?.login_time)?.toLocaleString("default", { hour12: true, hour: "2-digit", minute: "2-digit" })}</div>
    },
    {
        accessorKey: "city-country",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
        cell: ({ row }) => <div className="text-nowrap">{row?.original?.city + ", " + row?.original?.country}</div>
    },
    {
        accessorKey: "login_out",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Logout time" />,
        cell: ({ row }) => <div>{new Date(row?.original?.logout_time)?.toLocaleString("default", { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
    },
    {
        accessorKey: "success",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const variant = row?.original?.success ? "default" : "destructive";
            const statusText = row?.original?.success ? "Successful" : "Failed";
            return (
                <BadgeTwo variant={variant}>
                    {statusText}
                </BadgeTwo>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <StaffActionLog rowData={row?.original} />
    }
];


export default staffLogColumns;