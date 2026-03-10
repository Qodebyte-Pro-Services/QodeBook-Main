import { Overview } from "@/components/dashboard";
import StaffContents from "@/components/dashboard/staffs/contents";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Staff management"
};

const StaffManagement = () => (
    <Overview>
        <StaffContents />
    </Overview>
);

export default StaffManagement;