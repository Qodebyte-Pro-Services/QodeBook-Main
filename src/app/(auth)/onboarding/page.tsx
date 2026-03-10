import { OnBoardingForm } from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Business Onboarding"
}

const OnboardingPage = () => <OnBoardingForm />

export default OnboardingPage;