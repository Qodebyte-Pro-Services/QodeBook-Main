import { DefaultType } from "@/models/types/shared/project-type";

const AuthContainer = ({children}: DefaultType) => {
    return(
        <div className="w-full md:h-fit container mx-auto">
            {children}
        </div>
    );
}

export default AuthContainer;