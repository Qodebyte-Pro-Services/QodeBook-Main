import { RegisterForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auth User Registration"
};

const AuthRegister = () => <RegisterForm />

export default AuthRegister;