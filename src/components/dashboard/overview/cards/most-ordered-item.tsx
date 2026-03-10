import { getFastMovingStocks } from "@/api/controllers/get/handler";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FastMovingPayload } from "@/models/types/shared/handlers-type";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoCubeOutline } from "react-icons/io5";

const PendingOrderCard = () => {

    const businessId = useMemo<number>(() => {
        if (typeof window === "undefined") return;
        const storedId = sessionStorage.getItem("selectedBusinessId");
        return storedId ? JSON.parse(storedId) : 0;
    }, []);

    const { data: fastMovingStocks, isSuccess: fastMovingStocksSuccess, error: fastMovingStocksError } = useQuery({
        queryKey: ["get-fast-moving-status", businessId],
        queryFn: () => getFastMovingStocks({ businessId }),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: false,
    });

    const fastMovingStocksData = useMemo(() => {
        if (fastMovingStocksSuccess && !fastMovingStocksError) {
            return fastMovingStocks?.fast_moving || [];
        }
        return [];
    }, [fastMovingStocks, fastMovingStocksSuccess, fastMovingStocksError]);

    return (
        <Card className="w-full dark:bg-black">
            <CardHeader>
                <CardTitle className="flex items-center gap-x-1">
                    <IoCubeOutline />
                    <div className="text-sm font-[600]">Fast Moving Stock</div>
                </CardTitle>
                <CardDescription>Top-selling item based on recent sales performance</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="w-full min-w-[580px] overflow-x-auto" style={{
                    scrollbarWidth: "none"
                }}>
                    <div className="py-2.5 px-3 bg-template-whitesmoke dark:bg-black border-b-2 border-gray-500/20 flex">
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.25] text-xs font-bold">
                                <div>Image</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Item Image</div>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.4] text-xs font-bold">
                                <div>Item/SKU</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Item / Item SKU</div>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.35] text-xs font-bold">
                                <div>Category</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Category</div>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.4] text-xs font-bold truncate">
                                <div>Unit Sold</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Unit Sold (Last 30 Days)</div>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.4] text-xs font-bold">
                                <div>Current</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Current Stock</div>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.35] text-xs font-bold">
                                <div>Threshold</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Threshold</div>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger className="flex-[0.4] text-xs font-bold truncate">
                                <div>Revenue</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                <div className="text-xs font-[550]">Revenue Generated</div>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    {fastMovingStocksData?.length ?
                        fastMovingStocksData?.map((item: FastMovingPayload, idx: number) => (
                            <div key={`fast-moving-status-${idx}`} className="py-2.5 px-3 flex">
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.25] text-xs font-bold">
                                        <div className="w-12 h-12 rounded-md bg-template-whitesmoke">
                                            <Image width={350} height={350} className="w-full h-full object-contain object-center" src={item?.image_url?.[0]?.secure_url} alt={`image-variant-${item?.variant_id}`} />
                                        </div>
                                        <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                            <div className="grid grid-cols-2 gap-3">
                                                {item?.image_url?.length > 1 ?
                                                    item?.image_url?.map((item, idx) => (
                                                        <div key={`image-variant-${item.public_id}`} className="w-12 h-12 rounded-md bg-template-whitesmoke">
                                                            <Image width={350} height={350} className="w-full h-full object-contain object-center" src={item?.secure_url} alt={`image-variant-${idx}`} />
                                                        </div>
                                                    ))
                                                    : (
                                                        <div className="w-12 h-12 rounded-md bg-template-whitesmoke">
                                                            <Image width={350} height={350} className="w-full h-full object-contain object-center" src={item.image_url?.[0].secure_url} alt={`image-variant-${item?.variant_id}`} />
                                                        </div>
                                                    )}
                                            </div>
                                        </TooltipContent>
                                    </TooltipTrigger>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.4] text-xs font-[450] truncate">
                                        <div>{item.sku}</div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                        <div className="text-xs font-[500]">{item.sku}</div>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.35] text-xs font-[450] truncate">
                                        <div>N/A</div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                        <div className="text-xs font-[500]">{item.sku + "-" + " N/A"}</div>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.4] text-xs font-[450] truncate">
                                        <div>{item.total_sold}</div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                        <div className="flex-[0.4] font-[500] text-xs">{item.total_sold} SKUs</div>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.4] text-xs font-[450] truncate">
                                        <div>{item.quantity}</div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                        <div className="flex-[0.4] font-[500] text-xs text-green-500">{item.quantity} In Stock</div>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.35] text-xs font-[450] truncate">
                                        <div>{item.threshold}</div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                        <div className="flex-[0.4] font-[500] text-xs text-orange-500">{item.threshold} Threshold</div>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-[0.35] text-xs font-[450] truncate">
                                        <div>{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "narrowSymbol" }).format(+item?.selling_price * +item?.total_sold)}</div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg text-black dark:bg-black dark:text-white">
                                        <div className="flex-[0.4] font-[500] text-xs">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "narrowSymbol" }).format(+item?.selling_price * +item?.total_sold)}</div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))
                        : (
                            <div className="text-sm font-[500] px-5 py-3">No Items Available</div>
                        )}
                </div>
            </CardContent>
            <CardFooter className="w-full">
                <div className="w-full flex items-center justify-between">
                    <div className="text-xs font-[500]">Last Updated: <span className="text-template-primary">Just Now</span></div>
                    <div className="flex items-center gap-x-1 text-template-primary">
                        <div className="text-xs font-[500]">View Dashboard Report</div>
                        <IoIosArrowRoundForward size={17} />
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export default PendingOrderCard;