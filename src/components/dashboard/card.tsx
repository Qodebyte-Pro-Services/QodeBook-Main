import { ArrowDown, ArrowUp } from "lucide-react";
import { IconType } from "react-icons";

export type ProductViewCardType = {
    id: string | number;
    name: string;
    amount: number;
    isCurrency: boolean;
    quantity: number;
    unit?: string;
}

const Card = ({data, icon: Icon}: {data: ProductViewCardType, icon: IconType}) => {
    return (
        <div data-id={`${data?.id}`} className="w-full py-4 px-3 bg-white dark:bg-black rounded-md">
            <div className="flex flex-col gap-y-7">
                <div className="self-start w-[25px] h-[25px] rounded-sm border border-gray-500 flex justify-center items-center">
                    <Icon size={18}/>
                </div>
                <div className="flex flex-col gap-y-1">
                    <div className="text-sm font-[500] text-auth-basic/60 dark:text-white/80">
                        {data?.name}
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <div className="text-[15px] font-[600]">
                            {+data?.isCurrency
                                ? new Intl.NumberFormat("en-NG", {
                                      currency: "NGN",
                                      currencySign: "standard",
                                      style: "currency",
                                  }).format(+data?.amount || 0)
                                : (data?.amount || 0) + ` ${data?.unit}`}
                        </div>
                        {data?.isCurrency && ((((data?.amount || 0) / ((data?.amount || 0) / 2)) * 0.01) ? (
                            <div
                                className={`self-start px-0.5 rounded-full border-1 border-template-chart-store text-template-chart-store scale-90`}>
                                <ArrowUp className="inline-block font-bold" size={18} />
                                <span className="text-[12.5px] font-[600]">
                                    {(((data?.amount || 0) / ((data?.amount || 0) / 2)) * 0.1)}%
                                </span>
                            </div>
                        ) : <div
                                className={`self-start px-0.5 rounded-full border-1 border-red-500 text-red-500 scale-90`}>
                                <ArrowDown className="inline-block font-bold" size={18} />
                                <span className="text-[12.5px] font-[600]">
                                    {(((data?.amount || 0) / ((data?.amount || 0) / 2)) * 0.1) || 0}%
                                </span>
                            </div>)}
                        {data?.unit ? data?.unit.toLowerCase() === "skus" && (
                            <div className="flex items-center gap-x-1">
                                <div className="text-[14px] font-[500]">Indicator:</div>
                                <div className={`w-3 h-3 rounded-full animate-pulse ${data?.name.toLowerCase().replace(/\s/g, "_") === "low_stock" ? 'bg-yellow-500' : data?.name.toLowerCase().replace(/\s/g, "_") === "out_of_stock" ? 'bg-template-card-attempts' : 'bg-template-card-accessories'}`} />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;