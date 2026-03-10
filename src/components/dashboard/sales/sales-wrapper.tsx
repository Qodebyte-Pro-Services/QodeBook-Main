"use client";

import { useState } from "react";
import { LayoutSidebar } from "@/components/dashboard";
import SalesContent from "./content";

const SalesWrapper = () => {
    const [isPOSActive, setIsPOSActive] = useState(false);

    return (
        <div className="flex w-full h-full">
            {/* Conditionally render sidebar - hide when POS is active */}
            {!isPOSActive && (
                <div className="hidden lg:block">
                    <LayoutSidebar />
                </div>
            )}
            
            {/* Main content area - adjust width based on sidebar visibility */}
            <div className={`w-full ${!isPOSActive ? 'lg:w-[85%]' : 'lg:w-full'} mx-auto transition-all duration-300`}>
                <SalesContent
                    onPOSStateChange={setIsPOSActive} 
                />
            </div>
        </div>
    );
};

export default SalesWrapper;
