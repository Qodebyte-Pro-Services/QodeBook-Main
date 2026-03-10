import { VerifyOtpLoginForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login Authentication Page"
};

const VerifyOtpCode = () => <VerifyOtpLoginForm />

export default VerifyOtpCode;