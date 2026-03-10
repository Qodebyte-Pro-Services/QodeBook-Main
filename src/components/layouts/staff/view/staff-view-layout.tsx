"use client";

import { DefaultType } from "@/models/types/shared/project-type";
import { useCustomStyles } from "@/hooks";

const StaffViewLayout = ({children}: DefaultType) => {
    const {hiddenScrollbar} = useCustomStyles();
    return(
        <div className="w-screen h-screen overflow-y-auto overflow-x-hidden" style={hiddenScrollbar}>
            <div className="max-w-[92vw] mx-auto">
                {children}
            </div>
        </div>
    );
}

export default StaffViewLayout;