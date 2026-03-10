import { DefaultType } from "@/models/types/shared/project-type";

type ColumnWrapperTypes = DefaultType & {
    className?: string;
    customStyle: React.CSSProperties
}

const ColumnWrapper = ({children, className, customStyle}: ColumnWrapperTypes) => {
    return(
        <div className={`h-full overflow-y-auto overflow-x-hidden ${className}`} style={customStyle}>
            {children}
        </div>
    );
}

export default ColumnWrapper;