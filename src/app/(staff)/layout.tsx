import ProtectedStaffWrapper from "@/components/providers/staff-wrapper";
import { DefaultType } from "@/models/types/shared/project-type";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Staff Login Page",
        template: "%s | Staff Login Page",
    },
    description: "Staff Login Page",
}

const ProtectedStaffLayout = ({children}: DefaultType) => {
    return(
        <ProtectedStaffWrapper>
            {children}
        </ProtectedStaffWrapper>
    )
}

export default ProtectedStaffLayout;