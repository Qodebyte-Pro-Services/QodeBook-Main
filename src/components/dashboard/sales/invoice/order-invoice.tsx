import Image from "next/image";
import { useCallback, useRef } from "react";
import { IoIosShareAlt } from "react-icons/io";
import { LuPrinterCheck } from "react-icons/lu";
import { MdOutlineFileDownload } from "react-icons/md";
import { toast } from "sonner";
import domtoimage from "dom-to-image";

const OrderInvoice = () => {
    const receiptRef = useRef<HTMLDivElement | null>(null)
    const handleInvoiceDownload = useCallback(async () => {
        try {
            if (receiptRef.current) {
                const _url = await domtoimage.toPng(receiptRef.current);
                const link: HTMLAnchorElement = document.createElement("a");
                link.href = _url;
                link.type = "image/png";
                link.download = "receipt-"+Date.now().toString(16)+".png";
                setTimeout(() => {
                    link.click();
                    setTimeout(() => {
                        toast.success("Receipt Downloaded Successfully");
                        URL.revokeObjectURL(_url);
                        link.remove();
                    }, 500);
                }, 500);
            }
        }catch(err) {
            if (err instanceof Error) {
                toast.error("Error Occurred while trying to download image");
            }
            toast.error("Unexpected Error Occurred while trying to download image");
        }
    }, [])

    return(
        <div className="fixed inset-0 min-[520px]:top-2 min-[520px]:left-2 z-50 w-full min-[500px]:w-[450px] py-3 px-6" style={{
            background: "#ffffff"
        }}>
            <div ref={receiptRef} className="flex flex-col gap-y-2 bg-white">
                <div className="text-base text-center font-bold">Receipt</div>
                <div className="border py-2 px-4 flex flex-col gap-y-0.5 items-center" style={{
                    borderColor: "#40922c"
                }}>
                    <Image width={150} height={150} className="w-[130px] h-[45px] mx-auto object-contain object-center" src="/images/image 790.png" alt="Logo" />
                    <div className="text-sm font-[500] w-[80%] text-center">This receipt is useful for record keeping, expense tracking, and warranty or refill verification.</div>
                    <Image width={150} height={150} className="w-[130px] h-[45px] mx-auto object-contain object-center" src="/images/Isolation_Mode(1).png" alt="Receipt Barcode" />
                </div>
                <div className="max-h-[45vh] overflow-y-auto" style={{scrollbarWidth: "none"}}>
                    <div className="flex flex-col gap-y-1 py-2 border-b-2 border-dotted border-black/50">
                        <div className="text-sm font-bold">Company Details</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="w-full text-xs font-[550] text-black/50">Company Name</div>
                            <div className="text-xs font-[550] text-right">Masski Empire</div>
                            <div className="w-full text-xs font-[550] text-black/50">Contact No.</div>
                            <div className="text-xs font-[550] text-right">+234 705 674 4673</div>
                            <div className="w-full text-xs font-[550] text-black/50">Email</div>
                            <div className="text-xs font-[550] text-right truncate">salesteam@masskiempire.com</div>
                            <div className="w-full text-xs font-[550] text-black/50">Location</div>
                            <div className="text-xs font-[550] text-right">Cozyez Mall, Enugu</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1 py-2 border-b-2 border-dotted border-black/50">
                        <div className="text-sm font-bold">Sales Invoice</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="w-full text-xs font-[550] text-black/50">Sold By</div>
                            <div className="text-xs font-[550] text-right">Qodebyte Egun</div>
                            <div className="w-full text-xs font-[550] text-black/50">Receipt No.</div>
                            <div className="text-xs font-[550] text-right">48398</div>
                            <div className="w-full text-xs font-[550] text-black/50">Posted On</div>
                            <div className="text-xs font-[550] text-right">14-09-2025</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1 py-2 border-b-2 border-dotted border-black/50">
                        <div className="text-sm font-bold">Customer Details</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="w-full text-xs font-[550] text-black/50">Customer Name</div>
                            <div className="text-xs font-[550] text-right">Qodebyte Egun</div>
                            <div className="w-full text-xs font-[550] text-black/50">Customer No.</div>
                            <div className="text-xs font-[550] text-right">+234 904 674 4673</div>
                            <div className="w-full text-xs font-[550] text-black/50">Customer ID</div>
                            <div className="text-xs font-[550] text-right">TGYS-9021</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1.5 py-3">
                        <div className="text-sm font-bold">Item Details</div>
                        <div className="flex flex-col gap-y-1">
                            <div className="flex text-[11px] py-1 font-bold text-black/50 uppercase border-b-[2.5px] rounded-sm border-black/50">
                                <div className="w-[35%]">Item Name</div>
                                <div className="w-[65%] flex items-center overflow-x-auto" style={{scrollbarWidth: "none"}}>
                                    <div className="text-center flex-[0.2]">Qty</div>
                                    <div className="text-center flex-[0.35]">Price</div>
                                    <div className="text-center flex-[0.35]">Tax</div>
                                    <div className="text-right flex-[0.35]">Subtotal</div>
                                </div>
                            </div>
                            <div className="py-2 border-b border-black/60 flex text-[11px] font-[500] text-black uppercase">
                                <div className="w-[35%] truncate">Gas Cylindar</div>
                                <div className="w-[65%] flex items-center overflow-x-auto" style={{scrollbarWidth: "none"}}>
                                    <div className="text-center flex-[0.2]">1</div>
                                    <div className="text-center flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                    <div className="text-center flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                    <div className="text-right flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                </div>
                            </div>
                            <div className="py-2 border-b border-black/60 flex text-[11px] font-[500] text-black uppercase">
                                <div className="w-[35%] truncate">Gas Cylindar</div>
                                <div className="w-[65%] flex items-center overflow-x-auto" style={{scrollbarWidth: "none"}}>
                                    <div className="text-center flex-[0.2]">1</div>
                                    <div className="text-center flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                    <div className="text-center flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                    <div className="text-right flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                </div>
                            </div>
                            <div className="py-2 border-b border-black/60 flex text-[11px] font-[500] text-black uppercase">
                                <div className="w-[35%] truncate">Gas Cylindar</div>
                                <div className="w-[65%] flex items-center overflow-x-auto" style={{scrollbarWidth: "none"}}>
                                    <div className="text-center flex-[0.2]">1</div>
                                    <div className="text-center flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                    <div className="text-center flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                    <div className="text-right flex-[0.35] truncate">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", maximumFractionDigits: 0}).format(10000)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1 py-2">
                        <div className="text-sm font-bold">Summation</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="w-full text-xs font-[550] uppercase text-black/50">Cash Payment</div>
                            <div className="text-xs font-[550] text-right">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN"}).format(10000)}</div>
                            <div className="w-full text-xs font-[550] uppercase text-black/50">Invoice Balance</div>
                            <div className="text-xs font-[550] text-right">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN"}).format(10000)}</div>
                            <div className="w-full text-xs font-[550] uppercase text-black/50">Tax</div>
                            <div className="text-xs font-[550] text-right">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN"}).format(10000)}</div>
                            <div className="w-full text-xs font-[550] uppercase text-black/50">Total</div>
                            <div className="text-xs font-[550] text-right">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN"}).format(10000)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-y-2 pb-2">
                <button className="py-2 cursor-pointer px-4 font-bold rounded-lg flex items-center justify-center gap-x-3" style={{
                    color: "#ffffff",
                    backgroundColor: "#40922c"
                }}>
                    <IoIosShareAlt />
                    Share
                </button>
                <div className="flex justify-between gap-4">
                    <button className="w-full py-2 cursor-pointer px-4 font-bold border rounded-lg flex items-center justify-center gap-x-3" style={{
                        borderColor: "#40922c",
                        color: "#40922c"
                    }}>
                        <LuPrinterCheck />
                        Print
                    </button>
                    <button onClick={handleInvoiceDownload} className="w-full py-2 cursor-pointer px-4 font-bold border rounded-lg flex items-center justify-center gap-x-3" style={{
                        borderColor: "#40922c",
                        color: "#40922c"
                    }}>
                        <MdOutlineFileDownload />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderInvoice;

// Add print styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            body * {
                visibility: hidden;
            }
            #receipt-print, #receipt-print * {
                visibility: visible;
            }
            #receipt-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                max-width: 100%;
                padding: 0;
                margin: 0;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}