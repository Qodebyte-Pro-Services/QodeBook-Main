"use client";

import { useCustomStyles } from "@/hooks";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
import { PiMinus, PiPlus } from "react-icons/pi";

const AddToOrderForm = () => {
    const {hiddenScrollbar} = useCustomStyles();
    return(
        <div className="fixed top-0 right-0 w-[40%] py-3 z-50 bg-white">
            <div className="flex flex-col gap-y-5">
                <div className="flex items-center justify-between px-4">
                    <div className="text-[20px] font-bold">Add Order</div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <FaTimes size={17} />
                    </div>
                </div>
                <div className="w-[90%] text-sm font-[500] text-black/40 px-4">Create a new order by selecting a product, entering the quantity and assigning customers.</div>
                <div className="max-h-[75dvh] h-full overflow-y-auto overflow-x-hidden px-4" style={hiddenScrollbar}>
                    <div className="h-fit flex flex-col gap-y-5">
                        {Array.from({length: 4}).map((_,index) => (
                            <div key={`add-to-order-${index}`} className="w-full grid grid-cols-[70%_30%]">
                                <div className="w-full grid grid-cols-[35%_65%] gap-4">
                                    <div className="w-full h-18 bg-template-whitesmoke rounded-sm">
                                        <Image className="w-full h-full object-contain object-center aspect-video" width={100} height={100} src="/images/products/mini/image 788.png" alt="Mini Product image" />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <div className="text-sm font-[550]">Gas Cylinder</div>
                                        <div className="flex flex-col gap-y-0.5">
                                            <div className="text-xs text-black/40">Price</div>
                                            <div className="text-sm font-[550]">{new Intl.NumberFormat("en-NG", {currency: "NGN", currencyDisplay: "symbol", currencySign: "standard", style: "currency"}).format(150000)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full flex items-center gap-x-4">
                                    <div className="w-full flex items-center gap-x-1">
                                        <div className="w-6 h-6 flex items-center justify-center rounded-sm bg-template-whitesmoke">
                                            <PiMinus size={15} />
                                        </div>
                                        <input className="border border-input py-1 focus:outline-none text-center rounded-sm w-15" defaultValue={"3"} type="text" />
                                        <div className="w-6 h-6 flex items-center justify-center rounded-sm bg-template-primary">
                                            <PiPlus size={15} />
                                        </div>
                                    </div>
                                    <Trash2 className="shrink-0 cursor-pointer" size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-y-1">
                        <div className="text-sm font-[500]">Note</div>
                        <textarea rows={3} className="px-4 py-3 text-sm font-[500] resize-y border border-input focus:outline-none rounded-sm"></textarea>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex flex-col gap-y-1">
                            <div className="text-base font-[500] text-black/40">Total</div>
                            <div className="text-base font-bold">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", currencyDisplay: "symbol", currencySign: "standard", maximumFractionDigits: 0}).format(4000000)}</div>
                        </div>
                        <button className="py-2 px-4 rounded-sm text-white bg-template-primary cursor-pointer">Add To Order</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddToOrderForm;