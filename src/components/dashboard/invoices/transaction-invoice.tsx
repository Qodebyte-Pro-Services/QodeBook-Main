"use client";

import { CustomNaira } from "@/components/customs/Icons";
import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Printer } from "lucide-react";
import { useRef } from "react";
import { LiaTimesSolid } from "react-icons/lia";
import html2canvas from 'html2canvas';

const TransactionInvoice = () => {
    const {hiddenScrollbar} = useCustomStyles();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const transactionIdRef = useRef<HTMLDivElement | null>(null);

    const handleReceiptDownload = async () => {
        try {
            const receiptElement = document.querySelector("[data-id='receipt']") as HTMLDivElement;
            
            // Ensure the element exists
            if (!receiptElement) {
                console.error('Receipt element not found');
                return;
            }

            // Set a higher resolution for better print quality
            const scale = 2; // Increase for higher quality
            const canvas = await html2canvas(receiptElement, {
                scale: scale,
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                scrollX: 0,
                scrollY: -window.scrollY
            });

            // Create and trigger download
            const link = document.createElement('a');
            const transactionId = transactionIdRef.current?.dataset.id || 'invoice';
            
            link.download = `INV-${transactionId}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Trigger the download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error generating receipt:', error);
            // You might want to show an error message to the user here
        }
    }

    return(
        <AnimatePresence mode="popLayout">
            <motion.div initial={{opacity: 0, scale: 0.1, transition: {duration: 0.3, ease: "easeInOut", bounce: 0.4, type: "spring", bounceDamping: 10}}} animate={{opacity: 1, scale: 1, transition: {duration: 0.3, ease: "easeInOut", bounce: 0.4, type: "spring", bounceDamping: 10}}} exit={{scale: 0.1, opacity: 0, transition: {duration: 0.3, ease: "easeInOut", bounce: 0.4, type: "spring", bounceDamping: 10}}} className="fixed top-[3%] right-[3%] w-[40%] bg-white rounded-sm shadow-[0px_0px_0px_100vmax_rgba(0,0,0,0.3)] z-50">
                <div className="w-full h-full" data-id="receipt" ref={containerRef}>
                    <div className="w-full flex justify-between items-center py-3 px-3">
                        <div className="flex gap-x-3">
                            <div className="h-[25px] w-[25px] flex justify-center items-center rounded-sm bg-template-chart-store/40">
                                <CustomNaira className="text-green-500" />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <div className="text-[12px] font-[550]" ref={transactionIdRef} data-id="548578">Transaction 3627</div>
                                <div className="text-xs font-[550] text-auth-basic/50">Transaction details for 08 - 05 - 2025 at 09:15am</div>
                            </div>
                        </div>
                        <div className="w-[27px] h-[27px] bg-slate-100/40 rounded-full flex items-center justify-center">
                            <LiaTimesSolid size={16} className="pointer-events-none" />
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="max-h-[60dvh] py-5 px-2 overflow-y-auto overflow-x-hidden rounded-sm bg-slate-100/50" style={hiddenScrollbar}>
                            <div className="h-fit">
                                <div className="flex flex-col gap-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Order ID</div>
                                            <div className="text-[12px] font-[550]">1698784</div>
                                        </div>
                                        <div className="flex flex-col gap-y-1 items-end-safe">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Customer Name</div>
                                            <div className="text-[12px] font-[550]">Qodebyte</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Date & Time</div>
                                            <div className="text-[12px] font-[550]">6 May, 2025. 08:00AM</div>
                                        </div>
                                        <div className="flex flex-col gap-y-1 items-end-safe">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Category</div>
                                            <div className="text-[12px] font-[550]">Gas</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Unit</div>
                                            <div className="text-[12px] font-[550]">KG</div>
                                        </div>
                                        <div className="flex flex-col gap-y-1 items-end-safe">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Quantity</div>
                                            <div className="text-[12px] font-[550]">10.5</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Payment</div>
                                            <div className="text-[12px] font-[550]">Card</div>
                                        </div>
                                        <div className="flex flex-col gap-y-1 items-end-safe">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Amount</div>
                                            <div className="text-[12px] font-[550]">{new Intl.NumberFormat("en-NG", {currency: "NGN", currencyDisplay: "symbol", currencySign: "standard", unitDisplay: "long", style: "currency"}).format(89000)}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Sales Method</div>
                                            <div className="text-[12px] font-[550]">Online</div>
                                        </div>
                                        <div className="flex flex-col gap-y-1 items-end-safe">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Staff</div>
                                            <div className="text-[12px] font-[550]">Qodebyte Egunmeku</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-[500] text-auth-basic/40 text-sm">Status</div>
                                            <div className="text-[12px] font-[550]">Completed</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="py-3 px-3 flex flex-col gap-y-3">
                        <div className="flex jusify-between items-center">
                            <div className="text-[12px] font-[550]">Total</div>
                            <div className="text-[12px] font-[550]">{new Intl.NumberFormat("en-NG", {currency: "NGN", currencyDisplay: "symbol", currencySign: "standard", unitDisplay: "long", style: "currency"}).format(89000)}</div>
                        </div>
                        <button onClick={() => handleReceiptDownload()} className="self-end *:bg-transparent border rounded-sm border-template-primary text-template-primary py-2 px-3 flex items-center gap-x-2 cursor-pointer">
                            <Printer className="text-template-primary"size={17} />
                            <div className="text-xs font-[500]">Print Receipt</div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default TransactionInvoice;