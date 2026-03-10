"use client";
import { useCustomStyles } from "@/hooks";
import React from "react";
import { FaUserTie, FaUserCog, FaMotorcycle } from "react-icons/fa";
import { RiUserStarFill } from "react-icons/ri";

const GasStockCard = () => {
    const staffData: Array<{name: string; role: string; sales: number; orders: number; rating: number; hours: number; icon: React.ReactElement}> = [
        { 
            name: 'Chinedu', 
            role: 'Sales Rep', 
            sales: 600000, 
            orders: 110, 
            rating: 4.8,
            hours: 120,
            icon: <FaUserTie className="text-template-chart-store" />
        },
        { 
            name: 'Amaka', 
            role: 'Store Manager', 
            sales: 450000, 
            orders: 85, 
            rating: 4.6,
            hours: 115,
            icon: <FaUserCog className="text-template-chart-gas" />
        },
        { 
            name: 'Seyi', 
            role: 'Delivery', 
            sales: 300000, 
            orders: 75, 
            rating: 4.9,
            hours: 100,
            icon: <FaMotorcycle className="text-template-chart-store" />
        }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const renderRatingStars = (rating: number) => {
        return `${rating.toFixed(1)} ⭐`;
    };

    const {customScrollbar} = useCustomStyles();

    return (
        <div className="h-full w-full p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <RiUserStarFill className="text-template-chart-store" size={20} />
                        Staff Performance
                    </h3>
                    <span className="text-sm px-2 py-1 bg-indigo-50 text-template-chart-store rounded-full">
                        This Month
                    </span>
                </div>
                
                <div className="overflow-x-auto" style={customScrollbar}>
                    <table className="w-full min-w-[650px]">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                <th className="pb-2 font-medium">Staff</th>
                                <th className="pb-2 font-medium">Role</th>
                                <th className="pb-2 font-medium text-right">Sales</th>
                                <th className="pb-2 font-medium text-right">Orders</th>
                                <th className="pb-2 font-medium text-right">Rating</th>
                                <th className="pb-2 font-medium text-right">Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staffData.map((staff, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 text-sm font-medium text-gray-800 flex items-center gap-2">
                                        <span className="bg-gray-100 p-1.5 rounded-full">
                                            {staff.icon}
                                        </span>
                                        {staff.name}
                                    </td>
                                    <td className="py-3 text-sm text-gray-600">
                                        <span className={`px-2 py-0.5 rounded-full text-sm ${
                                            staff.role === 'Store Manager' ? 'bg-template-chart-gas/10 text-template-chart-gas' :
                                            staff.role === 'Sales Rep' ? 'bg-green-100 text-template-chart-store' :
                                            'bg-green-100 text-template-chart-store'
                                        }`}>
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="py-3 text-sm font-medium text-right text-gray-900">
                                        {formatCurrency(staff.sales)}
                                    </td>
                                    <td className="py-3 text-sm text-gray-600 text-right">
                                        {staff.orders}
                                    </td>
                                    <td className="py-3 text-sm font-medium text-right">
                                        <span className="text-amber-500">
                                            {renderRatingStars(staff.rating)}
                                        </span>
                                    </td>
                                    <td className="py-3 text-sm text-gray-600 text-right">
                                        {staff.hours} hrs
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="flex justify-end">
                    <button className="text-sm text-template-chart-store hover:text-template-chart-store font-medium flex items-center gap-1">
                        View All Staff
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GasStockCard;