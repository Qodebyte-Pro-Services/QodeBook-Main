import { RegistrationSuccessful } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Completed User Profile"
};

const SuccessfulRegistration = () => <RegistrationSuccessful />

export default SuccessfulRegistration;