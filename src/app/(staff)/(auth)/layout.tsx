import StaffAuthLayout from "@/components/layouts/staff/auth/staff-authlayout";
import { DefaultType } from "@/models/types/shared/project-type";
import { Inter } from "next/font/google";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    weight: ['400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
});

const AuthStaffLayout = ({ children }: DefaultType) => {
    return (
        <StaffAuthLayout className={`${inter.variable} ${inter.className} ${inter.style.fontFamily} flex items-center justify-center`}>
            {children}
        </StaffAuthLayout>
    );
}

export default AuthStaffLayout;