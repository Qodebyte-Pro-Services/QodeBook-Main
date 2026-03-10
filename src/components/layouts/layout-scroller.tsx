import { DefaultType } from "@/models/types/shared/project-type";

const LayoutScroller = ({children}: DefaultType) => {
    return(
        <div className="w-full h-fit">
            {children}
        </div>
    );
}

export default LayoutScroller;