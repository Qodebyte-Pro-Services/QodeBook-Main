import { VerifyCodeForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Verification Page"
};

const VerifyCode = () => <VerifyCodeForm />

export default VerifyCode;