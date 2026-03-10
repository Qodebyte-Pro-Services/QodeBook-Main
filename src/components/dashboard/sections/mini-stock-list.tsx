import React, { FC } from "react";
import { LowStocks } from "@/models/types/shared/handlers-type";

interface MiniStockListLogic {
    item: LowStocks;
    onClick: ({type, payload}: {type: string; payload: boolean}) => void;
    setRestockProductId: React.Dispatch<React.SetStateAction<string>>;
}

const MiniStockList: FC<MiniStockListLogic> = ({item, onClick, setRestockProductId}) => {
    return(
        <div className="mt-2 w-full flex justify-between items-center">
            <div className="flex flex-col gap-y-1 flex-[0.6]">
                <div className="text-xs font-[600]">{item.sku}</div>
                <div className="text-[11px] font-[500] text-auth-basic/40">{new Intl.NumberFormat("en-NG", {style: "currency", currency: "NGN", minimumFractionDigits: 2}).format(+item.selling_price)}</div>
            </div>
            <div className="text-xs font-bold text-template-chart-gas flex-[0.3] shrink-0">{item.quantity || 0} QTY</div>
            <button onClick={() => {
                    onClick({type: "isOrderForm", payload: true});
                    setRestockProductId(`${item.product_id}`);
                }
            } className="px-2 py-1 rounded-sm text-white bg-template-chart-gas text-[12px] font-[550] shrink-0 cursor-pointer">Restock</button>
        </div>
    );
}

export default MiniStockList;