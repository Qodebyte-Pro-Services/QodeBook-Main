import { LayoutSidebar } from "@/components/dashboard";
import { LayoutStack, LayoutWrapper } from "@/components/layouts";
import { DefaultType } from "@/models/types/shared/project-type";
import ProtectedSaasWrapper from "@/components/providers/saas-wrapper";

const DashBoardLayout = ({children}: DefaultType) => {
    return(
        <ProtectedSaasWrapper>
            <LayoutWrapper>
                <LayoutStack>
                    <LayoutSidebar />
                    {children}
                </LayoutStack>
            </LayoutWrapper>
        </ProtectedSaasWrapper>
    );
}

export default DashBoardLayout;