import { NotificationPageComponent } from "@/components/dashboard/sections";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notifications",
};

const NotificationPage = () => {
    return (
        <div className="w-full h-screen overflow-hidden">
            <NotificationPageComponent />
        </div>
    );
};

export default NotificationPage;
