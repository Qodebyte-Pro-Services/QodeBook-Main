import { DefaultType } from "@/models/types/shared/project-type";

const ColumnStack = ({children}: DefaultType) => {
    return(
        <div className="w-full h-full flex">
            {children}
        </div>
    );
}

export default ColumnStack;