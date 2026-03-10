import { CustomBuilding } from "@/components/customs/Icons";
import { cn } from "@/lib/utils";
import { NotificationPropsType } from "../ui/notification-card";

const NotificationList = ({ className, id, data }: { className: string, id?: string, data: NotificationPropsType }) => {
    return (
        <div data-test-id={`${id}`} className={cn(`w-full px-2 py-2 rounded-sm hover:bg-template-chart-store/30 ${className}`)}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-2">
                    <div className="h-[35px] w-[35px] flex justify-center items-center bg-template-primary rounded-sm">
                        <CustomBuilding size={22} color="#ffffff" />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <div className="text-sm font-[550]">{data?.notification_type?.split("_")?.join(" ")?.replace(/\b\w/g, l => l.toUpperCase())}</div>
                        <div className="text-xs font-[550] text-auth-basic/50">{data?.message}</div>
                    </div>
                </div>
                <div className="flex flex-col gap-y-2 items-end">
                    <div className="text-xs text-auth-basic/50 font-[550]">{new Date(data?.created_at).toLocaleDateString("default", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true
                    })}</div>
                    <div className="w-1 h-1 rounded-full bg-template-primary" />
                </div>
            </div>
        </div>
    );
}

export default NotificationList;