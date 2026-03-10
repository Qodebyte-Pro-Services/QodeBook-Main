import { FaTimes } from "react-icons/fa";

const MakePaymentForm = () => {
    return(
        <div className="fixed top-0 right-0 w-[40%] py-3 z-50 bg-white">
            <div className="flex flex-col gap-y-10">
                <div className="flex flex-col gap-y-2 px-4">
                    <div className="flex items-center justify-between px-4">
                        <div className="text-[20px] font-bold">Make payment</div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            <FaTimes size={20} />
                        </div>
                    </div>
                    <div className="w-[90%] text-sm font-[500] text-black/40 px-4">How would you like to pay?</div>
                </div>
                <div className="flex flex-col gap-y-8">
                    <div className="flex flex-col gap-y-3">
                        <div className="py-2 px-4 border-b border-template-whitesmoke-dim">
                            <div className="flex items-center gap-x-4">
                                <input className="accent-template-primary" type="checkbox" />
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-base font-[550]">Cash</div>
                                    <div className="text-sm font-[500] text-black/50">Pay securely and conveniently with your cash</div>
                                </div>
                            </div>
                        </div>
                        <div className="py-2 px-4 border-b border-template-whitesmoke-dim">
                            <div className="flex items-center gap-x-4">
                                <input className="accent-template-primary" type="checkbox" />
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-base font-[550]">Credit Card</div>
                                    <div className="text-sm font-[500] text-black/50">Pay securely and conveniently with your card</div>
                                </div>
                            </div>
                        </div>
                        <div className="py-2 px-4 border-b border-template-whitesmoke-dim">
                            <div className="flex items-center gap-x-4">
                                <input className="accent-template-primary" type="checkbox" />
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-base font-[550]">Bank Transfer</div>
                                    <div className="text-sm font-[500] text-black/50">Select bank transfer to make your payment directly from your bank account</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full px-4">
                        <button className="py-2 w-full text-white bg-template-primary rounded-sm font-[550] cursor-pointer">Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MakePaymentForm;