import { DefaultType } from "@/models/types/shared/project-type";

const LayoutContainer = ({children}: DefaultType) => {
    return(
        <div className="max-w-[92rem] mx-auto">
            {children}
        </div>
    );
}

export default LayoutContainer;