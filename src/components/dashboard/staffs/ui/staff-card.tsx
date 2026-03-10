import { IconType } from "react-icons";
import { HiOutlineUserGroup } from "react-icons/hi2";

interface StaffCardSchema {
    icon: IconType;
    title: string;
    amount: number | string;
    isCurrency: boolean;
}

const StaffCard = ({icon: Icon, title = "Total Staff", amount = 0, isCurrency = false}: StaffCardSchema) => {
    return(
        <div className="w-full py-4 px-3 bg-white dark:bg-black dark:text-white rounded-md">
            <div className="flex flex-col gap-y-8">
                <div className="w-[25px] h-[25px] rounded-sm border border-gray-500 flex justify-center items-center">
                    {Icon ? <Icon size={18}/> : <HiOutlineUserGroup size={18}/>}
                </div>
                <div className="flex flex-col gap-y-1">
                    <div className="text-sm font-[500] text-auth-basic/60 dark:text-white/60">
                        {title}
                    </div>
                    <div className="text-[15px] font-[600] dark:text-white">
                        {+isCurrency
                            ? new Intl.NumberFormat("en-NG", {
                                  currency: "NGN",
                                  currencySign: "standard",
                                  style: "currency",
                              }).format(+amount)
                            : amount}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffCard;