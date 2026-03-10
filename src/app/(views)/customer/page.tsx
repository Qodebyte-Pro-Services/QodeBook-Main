import { Overview } from "@/components/dashboard";
import CustomerContent from "@/components/dashboard/customers/content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customer Management"
};

const CustomerPage = () => (
    <Overview>
        <CustomerContent />
    </Overview>
);

export default CustomerPage;