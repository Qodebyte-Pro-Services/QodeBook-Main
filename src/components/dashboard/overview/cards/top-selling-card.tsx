import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { PiChartLineUp } from "react-icons/pi";

const AccessoriesInStockCard = ({topSaledProducts}: {topSaledProducts: (Array<{name: string; units_sold: string; total_sales: string}> | [])}) => {
    const salesData = useMemo(() => {
        if (topSaledProducts?.length <= 0) return [];
        const data = topSaledProducts?.map(item => ({
            product: item?.name || "",
            units: item?.units_sold || "",
            revenue: +item?.total_sales || 0
        }));
        return data?.length > 10 ? data?.slice(0, 8) : data;
    }, [topSaledProducts]);

    const router = useRouter();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="w-full h-full p-4 bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <PiChartLineUp className="text-template-chart-store" size={20} />
                        Sales Overview
                    </h3>
                    <span className="text-sm px-2 py-1 bg-green-50 dark:bg-green-500 text-green-800 dark:text-green-200 rounded-full">
                        This Month
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
                                <th className="pb-2 font-medium">Product</th>
                                <th className="pb-2 font-medium text-right">Units Sold</th>
                                <th className="pb-2 font-medium text-right">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {salesData?.length ? salesData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700">
                                    <td className="py-3 text-xs font-medium text-gray-800 dark:text-white">{item.product}</td>
                                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400 text-right">{item.units.toLocaleString()}</td>
                                    <td className="py-3 text-xs font-medium text-right text-gray-900 dark:text-white">
                                        {formatCurrency(item.revenue)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3}>No Sales Data</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-200 dark:border-gray-700">
                                <td className="pt-3 text-xs font-semibold text-gray-900 dark:text-white">Total</td>
                                <td className="pt-3 text-xs font-semibold text-gray-900 dark:text-white text-right">
                                    {salesData.reduce((sum, item) => sum + +item.units, 0).toLocaleString()}
                                </td>
                                <td className="pt-3 text-xs font-semibold text-gray-900 dark:text-white text-right">
                                    {formatCurrency(salesData.reduce((sum, item) => sum + item.revenue, 0))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div className="flex justify-end">
                    <button onClick={() => router.push("/sales")} className="text-xs text-template-chart-store hover:text-template-primary font-medium flex items-center gap-1">
                        View Detailed Report
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccessoriesInStockCard;