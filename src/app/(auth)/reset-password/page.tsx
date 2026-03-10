import { ResetPasswordForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Auth Reset Password"
}

const ResetPassword = () => <ResetPasswordForm />

export default ResetPassword;