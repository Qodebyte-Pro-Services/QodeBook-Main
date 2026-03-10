import { VerifyOtpResetForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Verification Page"
};

const VerifyPasswordPage = () => <VerifyOtpResetForm />

export default VerifyPasswordPage;