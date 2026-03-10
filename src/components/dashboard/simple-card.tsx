import { ArrowUp } from "lucide-react";
import { IconType } from "react-icons";

type ProductViewCardType = {
    id: string;
    name: string;
    amount: number;
    isCurrency: boolean;
    quantity: number;
}

const Card = ({data, icon: Icon}: {data: ProductViewCardType, icon: IconType}) => {
    return (
        <div data-id={`${data?.id}`} className="w-full py-4 px-3 bg-white rounded-md">
            <div className="flex flex-col gap-y-7">
                <div className="self-start w-[25px] h-[25px] rounded-sm border border-gray-500 flex justify-center items-center">
                    <Icon size={18}/>
                </div>
                <div className="flex flex-col gap-y-1">
                    <div className="text-sm font-[500] text-auth-basic/60">
                        {data?.name}
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <div className="text-[15px] font-[600]">
                            {+data?.isCurrency
                                ? new Intl.NumberFormat("en-NG", {
                                      currency: "NGN",
                                      currencySign: "standard",
                                      style: "currency",
                                  }).format(+data?.amount)
                                : data?.amount}
                        </div>
                        {(+data?.quantity) ? (
                            <div
                                className={`self-start px-0.5 rounded-full border-1 border-template-chart-store text-template-chart-store scale-90`}>
                                <ArrowUp className="inline-block font-bold" size={18} />
                                <span className="text-[12.5px] font-[600]">
                                    {data?.quantity}%
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
