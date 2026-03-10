import { ForgotPasswordForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Forgot Password"
};

const ForgotPassword = () => <ForgotPasswordForm />

export default ForgotPassword;