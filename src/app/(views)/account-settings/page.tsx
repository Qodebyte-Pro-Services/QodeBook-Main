import { Overview } from "@/components/dashboard";
import SettingContents from "@/components/dashboard/settings/content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `User Account Settings`
};

const AccountSettings = () => (
    <Overview>
        <SettingContents />
    </Overview>
);

export default AccountSettings;