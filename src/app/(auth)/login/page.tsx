import { LoginForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auth User Login"
}

const AuthLogin = () => <LoginForm />

export default AuthLogin;