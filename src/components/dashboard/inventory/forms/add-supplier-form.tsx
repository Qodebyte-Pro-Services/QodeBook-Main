"use client";

import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";

const CreateCategoryForm = ({businessId, handleFormClose}: {businessId: string, handleFormClose: () => void}) => {
    const {hiddenScrollbar} = useCustomStyles();
    const [attributeName, setAttributeName] = useState<string>("");

    const containerVariant = {
        from: {
            scale: 0.1,
            opacity: 0,
            top: -100
        },
        to: {
            scale: 1,
            opacity: 1,
            top: 0
        },
        go: {
            scale: 0.1,
            opacity: 0,
            top: -100
        }
    }

    
    return(
        <AnimatePresence mode="wait">
            <motion.div variants={containerVariant} initial="from" animate="to" exit="go" className="w-[90%] md:w-[45%] h-fit fixed z-50 right-0 top-[5%] bg-white p-10 shadow-[0px_0px_0px_100vmax_rgba(0,0,0,0.2)]">
                <div className="flex flex-col gap-y-8">
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-[24px] font-[600]">Add Supplier</div>
                            <div className="h-8 w-8 rounded-full bg-slate-100/40 flex justify-center items-center">
                                <LiaTimesSolid size={20} onClick={handleFormClose} />
                            </div>
                        </div>
                        <div className="text-sm font-[550] text-gray-500">Enter supplier details to keep track of your vendors and streamline purchasing.</div>
                    </div>
                    <div className="max-h-[50vh] md:max-h-[65vh] h-full overflow-auto" style={hiddenScrollbar}>
                        <div className="h-fit">
                            <div className="flex flex-col gap-y-2">
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-[500]">Supplier Name</div>
                                    <input type="text" className="py-2 pl-4 text-sm pr-3 w-full border border-gray-500 rounded-sm focus:outline-none" value={attributeName} onChange={(e) => setAttributeName(e.currentTarget.value)} placeholder="Eg. Color" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-[500]">Contact Person</div>
                                    <input type="text" className="py-2 pl-4 text-sm pr-3 w-full border border-gray-500 rounded-sm focus:outline-none" value={attributeName} onChange={(e) => setAttributeName(e.currentTarget.value)} placeholder="Eg. Color" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-[500]">Contact Number</div>
                                    <input type="text" className="py-2 pl-4 text-sm pr-3 w-full border border-gray-500 rounded-sm focus:outline-none" value={attributeName} onChange={(e) => setAttributeName(e.currentTarget.value)} placeholder="Eg. Color" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-[500]">Contact Email</div>
                                    <input type="text" className="py-2 pl-4 text-sm pr-3 w-full border border-gray-500 rounded-sm focus:outline-none" value={attributeName} onChange={(e) => setAttributeName(e.currentTarget.value)} placeholder="Eg. Color" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-[500]">Address</div>
                                    <input type="text" className="py-2 pl-4 text-sm pr-3 w-full border border-gray-500 rounded-sm focus:outline-none" value={attributeName} onChange={(e) => setAttributeName(e.currentTarget.value)} placeholder="Eg. Color" />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button className="w-full py-2 px-3 bg-slate-100/90 font-[550] text-sm rounded-md cursor-pointer">Cancel</button>
                                    <button className="w-full py-2 px-3 bg-template-primary font-[550] text-sm rounded-md text-slate-100 cursor-pointer">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default CreateCategoryForm;