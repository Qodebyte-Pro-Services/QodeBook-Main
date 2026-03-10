import { IconType } from "react-icons";

const OverviewCard = ({
    id,
    amount,
    title,
    icon: Icon,
    arrowIcon: ArrowIcon,
    isPhoneViewIcon: PhoneIcon,
    isIconView,
    isSlash,
    isCurrency,
}: {id: string | number; amount?: number; title: string; icon?: IconType; arrowIcon?: IconType; isPhoneViewIcon?: IconType; isIconView?: boolean; isSlash?: {active: number; total: number;}; isCurrency?: boolean}) => {
    return (
        <div data-id={id} className="w-full py-4 px-3 bg-white dark:bg-black rounded-md">
            <div className="flex flex-col gap-y-7">
                <div className="self-start w-[25px] h-[25px] rounded-sm border border-gray-500 flex justify-center items-center">
                    {(isCurrency && !isIconView && Icon) && <Icon size={18} />}
                    {(!isCurrency && !isIconView && Icon) && <Icon size={18} />}
                    {(isCurrency && isIconView && Icon && PhoneIcon) && <PhoneIcon size={18} />}
                    {(!isCurrency && isIconView && Icon) && <Icon size={18} />}
                </div>
                <div className="flex flex-col gap-y-1">
                    <div className="text-sm font-[500] text-auth-basic/60 dark:text-slate-200/80">
                        {title}
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <div className="text-[15px] font-[600]">
                            {isCurrency
                                ? new Intl.NumberFormat("en-NG", {
                                      currency: "NGN",
                                      currencySign: "standard",
                                      style: "currency",
                                  }).format(+amount!)
                                : (isSlash ? `${isSlash.active}/${isSlash.total}` : amount)}
                        </div>
                        {ArrowIcon && (
                            <div
                                className={`self-start px-0.5 rounded-full scale-90 text-green-500 border border-green-500`}>
                                <ArrowIcon className="inline-block font-bold" size={18} />
                                <span className="text-[12.5px] font-[600]">
                                    {Math.min(0, amount!/100)}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;