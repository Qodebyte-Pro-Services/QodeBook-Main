import { AuthContainer, AuthScroller, AuthWrapper } from "@/components/auth/wrapper";
import { DefaultType } from "@/models/types/shared/project-type";
import {Poppins} from "next/font/google";

const poppins = Poppins({
    variable: "--font-poppins",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
    style: "normal",
    subsets: ["latin"]
});

const AuthLayout = ({children}: DefaultType) => {
    return(
        <AuthWrapper className={`${poppins.variable} ${poppins.className} antialiased`}>
            <AuthScroller>
                <AuthContainer>
                    {children}
                </AuthContainer>
            </AuthScroller>
        </AuthWrapper>
    );   
}

export default AuthLayout;