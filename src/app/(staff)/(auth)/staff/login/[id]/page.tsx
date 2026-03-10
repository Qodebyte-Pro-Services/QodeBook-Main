import StaffLoginForm from "@/components/dashboard/staffs/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auth Staff Login"
}

const AuthStaffLogin = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return (
        <div className="w-full h-screen relative bg-gray-100 flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                <img
                    className="w-full h-full object-cover"
                    src="/images/image 791.png"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full">
                <StaffLoginForm id={id} />
            </div>
        </div>
    )
}

export default AuthStaffLogin;