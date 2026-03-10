"use client";

import { useCustomStyles } from "@/hooks";
import { useUserBusinesses } from "@/hooks/useControllers";
import { useEffect, useState, useTransition } from "react";
import { RiBuilding2Line, RiMapPinLine, RiPhoneLine, RiCalendarLine, RiSearchLine, RiCheckLine, RiArrowRightLine, RiAddLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CreateBusinessForm from "../settings/forms/create-business-form";

type BusinessNameTypes = {
    address: string;
    business_type: string;
    business_name: string;
    business_phone: string;
    created_at: string;
    logo_url: string;
    id: number;
    user_id: number;
}

interface BusinessCardIdProps {
    onClose?: () => void;
    onCreateBusiness?: () => void;
}

const BusinessCardId = ({ onClose, onCreateBusiness }: BusinessCardIdProps) => {
    const propsData = useUserBusinesses();
    const [business_data, setBusinessData] = useState<Array<BusinessNameTypes>>([]);
    const [filteredData, setFilteredData] = useState<Array<BusinessNameTypes>>([]);
    const [isTransiting, startTransition] = useTransition();
    const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [hoveredBusiness, setHoveredBusiness] = useState<number | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const businesses = propsData?.data?.businesses ?? [];
            setBusinessData(businesses);
            setFilteredData(businesses);
        });
        return () => {
            setBusinessData([]);
            setFilteredData([]);
        };
    }, [propsData?.data]);

    // Filter businesses based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(business_data);
        } else {
            const filtered = business_data.filter(business =>
                business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                business.business_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                business.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchQuery, business_data]);

    const { hiddenScrollbar } = useCustomStyles();

    const getUserFirstName = (name: string) => {
        const businessNames = name.split(" ");
        let firstLetterGrabber = "";
        if (businessNames.length > 1) {
            for (let i = 0; i < businessNames.length; i++) {
                firstLetterGrabber += businessNames[i].charAt(0);
            }
        } else {
            firstLetterGrabber = businessNames[0].charAt(0);
        }
        return firstLetterGrabber;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const handleBusinessSelect = (businessId: number) => {
        // Set the selected business for visual feedback only
        setSelectedBusiness(businessId);
    }

    const handleContinue = async () => {
        if (selectedBusiness) {
            // Store the business ID in sessionStorage
            sessionStorage.setItem('selectedBusinessId', selectedBusiness.toString());
            await new Promise(res => setTimeout(res, 500));
            window.location.reload();
            // Close the modal
            if (onClose) {
                onClose();
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-full z-50 h-full bg-black/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-3xl max-h-[90vh] sm:max-h-[100vh] overflow-hidden bg-white dark:bg-black rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-xl mx-2 sm:mx-0"
            >
                <div className="bg-gradient-to-br from-template-primary via-template-chart-store to-template-card-accessories text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 dark:bg-black/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 dark:bg-black/5 rounded-full translate-y-6 -translate-x-6 sm:translate-y-12 sm:-translate-x-12"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 bg-white/20 dark:bg-black/20 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/20 dark:border-gray-800/20">
                                <RiBuilding2Line size={24} className="sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Select Your Business</h2>
                                <p className="text-white/80 dark:text-white/80 text-sm sm:text-base">Choose from your available businesses to continue</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        {business_data.length > 2 && (
                            <div className="relative">
                                <RiSearchLine className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/60 dark:text-white/60" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search businesses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-sm sm:text-base"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] sm:max-h-[55vh] overflow-y-auto" style={hiddenScrollbar}>
                    <AnimatePresence mode="wait">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {isTransiting ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 dark:bg-black/5"
                                >
                                    <div className="relative mb-4 sm:mb-6">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-template-primary to-template-chart-store animate-spin">
                                            <div className="absolute inset-1.5 sm:inset-2 bg-white dark:bg-black rounded-full flex items-center justify-center">
                                                <RiBuilding2Line className="text-template-primary" size={20} />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-4 border-template-primary/20 animate-ping"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-white mb-2">Loading your businesses</p>
                                        <p className="text-gray-500 text-sm sm:text-base text-center px-4 dark:text-white/60">Please wait while we fetch your business information...</p>
                                    </div>
                                </motion.div>
                            ) : filteredData.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <RiBuilding2Line className="text-xl sm:text-2xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-white mb-2">
                                        {business_data.length === 0 ? 'No Businesses Found' : 'No Results Found'}
                                    </h3>
                                    <p className="text-gray-500 text-sm sm:text-base mb-6 dark:text-white/60">
                                        {business_data.length === 0
                                            ? "You haven't created any businesses yet. Get started by creating your first business."
                                            : `No businesses match "${searchQuery}". Try a different search term.`
                                        }
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        {business_data.length === 0 ? (
                                            <button
                                                onClick={() => setIsCreateOpen(true)}
                                                className="group px-6 py-3 bg-gradient-to-r from-template-primary to-template-chart-store text-white dark:text-black rounded-xl font-semibold hover:shadow-xl hover:shadow-template-primary/30 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center text-sm sm:text-base"
                                            >
                                                <RiAddLine className="group-hover:rotate-90 transition-transform duration-300" size={18} />
                                                Create Your First Business
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="px-4 py-2 bg-template-primary text-white dark:text-black rounded-lg hover:bg-template-primary/90 transition-colors text-sm sm:text-base"
                                                >
                                                    Clear Search
                                                </button>
                                                {onCreateBusiness && (
                                                    <button
                                                        onClick={onCreateBusiness}
                                                        className="px-4 py-2 bg-gray-600 text-white dark:text-black rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base flex items-center gap-2"
                                                    >
                                                        <RiAddLine size={16} />
                                                        Create New Business
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-3 sm:space-y-4"
                                >
                                    {filteredData.map((business, index) => (
                                        <motion.div
                                            key={business.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-[1.01] sm:hover:scale-[1.02] ${selectedBusiness === business.id
                                                ? 'border-template-primary bg-gradient-to-br from-template-primary/10 to-template-chart-store/10 shadow-xl shadow-template-primary/20'
                                                : 'border-gray-200 hover:border-template-primary/30 bg-white dark:bg-black hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50'
                                                }`}
                                            onClick={() => handleBusinessSelect(business.id)}
                                            onMouseEnter={() => setHoveredBusiness(business.id)}
                                            onMouseLeave={() => setHoveredBusiness(null)}
                                        >
                                            <div className="p-4 sm:p-5 lg:p-6">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    {/* Logo/Avatar */}
                                                    <div className="flex-shrink-0">
                                                        {business.logo_url ? (
                                                            <Image
                                                                width={100}
                                                                height={100}
                                                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border-2 border-gray-100 group-hover:border-template-primary/30 transition-all duration-300"
                                                                src={business.logo_url}
                                                                alt={`${business.business_name} logo`}
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-gradient-to-br from-template-primary to-template-chart-store rounded-xl sm:rounded-2xl text-white font-bold text-lg sm:text-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                                                                {getUserFirstName(business.business_name)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-template-primary transition-colors duration-300 pr-2">
                                                                {business.business_name}
                                                            </h3>
                                                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-template-primary/20 to-template-chart-store/20 text-template-primary border border-template-primary/20 whitespace-nowrap">
                                                                {business.business_type}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1.5 sm:space-y-2">
                                                            {business.address && (
                                                                <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                                                                    <RiMapPinLine className="text-template-primary/60 flex-shrink-0" size={14} />
                                                                    <span className="truncate">{business.address}</span>
                                                                </div>
                                                            )}
                                                            {business.business_phone && (
                                                                <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                                                                    <RiPhoneLine className="text-template-primary/60 flex-shrink-0" size={14} />
                                                                    <span>{business.business_phone}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                                                                <RiCalendarLine className="text-template-primary/40 flex-shrink-0" size={14} />
                                                                <span>Created {formatDate(business.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedBusiness === business.id
                                                        ? 'border-template-primary bg-template-primary shadow-lg'
                                                        : 'border-gray-300 dark:border-gray-700 group-hover:border-template-primary/50'
                                                        }`}>
                                                        {selectedBusiness === business.id && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                                                            >
                                                                <RiCheckLine className="text-white" size={12} />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`absolute inset-0 bg-gradient-to-r from-template-primary/5 to-template-chart-store/5 opacity-0 group-hover:opacity-100 transition-all duration-500 ${hoveredBusiness === business.id ? 'opacity-100' : ''
                                                }`}></div>

                                            {/* Animated border */}
                                            <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${selectedBusiness === business.id
                                                ? 'ring-2 ring-template-primary/30 ring-offset-2'
                                                : ''
                                                }`}></div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </AnimatePresence>
                </div>
                {filteredData.length > 0 && !isTransiting && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-gray-50/50 dark:to-gray-800/50 backdrop-blur-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 rounded-full bg-template-primary animate-pulse"></div>
                                <p className="text-gray-600 font-medium text-sm sm:text-base">
                                    {filteredData.length} of {business_data.length} business{business_data.length !== 1 ? 'es' : ''}
                                    {searchQuery && ` matching "${searchQuery}"`}
                                </p>
                            </div>
                            <button
                                className={`group px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center ${selectedBusiness !== null
                                    ? 'bg-gradient-to-r from-template-primary to-template-chart-store text-white dark:text-white hover:shadow-xl hover:shadow-template-primary/30 transform hover:scale-105'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={selectedBusiness === null}
                                onClick={handleContinue}
                            >
                                Continue
                                <RiArrowRightLine className={`transition-transform duration-300 ${selectedBusiness !== null ? 'group-hover:translate-x-1' : ''
                                    }`} size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
                <CreateBusinessForm isCreateOpen={isCreateOpen} setIsCreateOpen={setIsCreateOpen} />
            </motion.div>
        </motion.div>
    );
}

export default BusinessCardId;