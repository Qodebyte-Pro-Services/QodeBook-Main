"use client";

import { useCustomStyles } from "@/hooks";
import { DefaultType } from "@/models/types/shared/project-type";
import Image from "next/image";

const AuthWrapper = ({ className, children }: DefaultType & { className: string }) => {
    const { hiddenScrollbar } = useCustomStyles();
    return (
        <div className={`w-screen min-h-screen overflow-y-auto overflow-x-hidden relative z-10 flex justify-center lg:items-center ${className}`} style={hiddenScrollbar}>
            <div className="absolute inset-0 -z-10 w-full h-full backdrop-blur-[10px]" />
            <div className="absolute -z-15 inset-0 w-full h-full">
                <Image className="w-full h-full object-center object-cover" src={"/images/image 791.png"} alt="Gas Station Image" width={1300} height={1300} />
            </div>
            {children}
        </div>
    );
}

export default AuthWrapper;