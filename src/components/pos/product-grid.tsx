/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserProducts, getProductCategories, getVariantsByBusiness } from "@/api/controllers/get/handler";
import { ProductResponseObj, CategoryPayload, ProductVariantResponseObject } from "@/models/types/shared/handlers-type";
import Image from "next/image";
import { PiPlusBold, PiShoppingCartBold, PiSpinnerGapBold } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { useViewTransaction } from "@/store/state/lib/pos-state-manager";

interface ProductGridProps {
    businessId: number;
    searchQuery: string;
    onAddToCart: (variant: ProductVariantResponseObject) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    businessId,
    searchQuery,
    onAddToCart
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const { setView } = useViewTransaction();

    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ["get-categories", businessId],
        queryFn: () => getProductCategories(businessId),
        enabled: businessId > 0,
    });

    const { data: variantsData, isLoading: variantsLoading } = useQuery({
        queryKey: ["get-business-variants", businessId],
        queryFn: () => getVariantsByBusiness(`${businessId}`),
        enabled: businessId > 0,
    });

    const categories = useMemo(() => {
        if (!categoriesData) return [];
        if (Array.isArray(categoriesData)) return categoriesData;
        if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
            return categoriesData.categories;
        }
        return [];
    }, [categoriesData]);

    const variants = useMemo(() => {
        if (!variantsData) return [];
        if (Array.isArray(variantsData)) return variantsData;
        if (variantsData.variants && Array.isArray(variantsData.variants)) {
            return variantsData.variants;
        }
        return [];
    }, [variantsData]);

    const filteredVariants = useMemo(() => {
        return variants.filter((v: ProductVariantResponseObject) => {
            const matchesSearch = v.sku.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === "all" ||
                (v as any)?.product_id === Number(selectedCategory)

            return matchesSearch && matchesCategory;
        });
    }, [variants, searchQuery, selectedCategory]);

    if (variantsLoading || categoriesLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <PiSpinnerGapBold className="animate-spin text-template-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Categories Bar */}
            <div className="flex flex-col">
                <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            selectedCategory === "all"
                                ? "bg-template-primary text-white shadow-md shadow-template-primary/20"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                        )}
                    >
                        All Products
                    </button>
                    {categories.map((cat: CategoryPayload) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                selectedCategory === cat.id
                                    ? "bg-template-primary text-white shadow-md shadow-template-primary/20"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="self-end flex items-center gap-x-2 px-2">
                    <button onClick={() => setView("sales")} className="px-3 py-1 rounded-sm font-[550] cursor-pointer active:scale-95 transition-all duration-100 ease-in-out font-template text-white bg-template-primary text-[11px]">View Transactions</button>
                    <button onClick={() => setView("pending")} className="px-3 py-1 rounded-sm font-[550] cursor-pointer active:scale-95 transition-all duration-100 ease-in-out font-template text-[11px] bg-gray-500/50">Pending Transactions</button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredVariants.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredVariants.map((variant: ProductVariantResponseObject) => (
                            <div
                                key={variant.id}
                                onClick={() => onAddToCart(variant)}
                                className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all cursor-pointer relative flex flex-col"
                            >
                                <div className="aspect-square rounded-lg bg-gray-50 mb-3 overflow-hidden relative">
                                    <Image
                                        src={variant.image_url?.[0]?.secure_url || "/placeholder-product.png"}
                                        alt={variant.sku}
                                        fill
                                        className="object-cover object-center aspect-video rounded-lg p-4 group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {variant.quantity <= (variant.threshold || 5) && (
                                        <span className="absolute top-2 right-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">
                                            Low Stock: {variant.quantity}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 px-3">
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                                        {variant.sku}
                                    </h3>
                                    <p className="text-template-primary font-bold text-base">
                                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(+variant.selling_price)}
                                    </p>
                                </div>

                                <div className="mt-3 px-3 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-full bg-template-primary text-white py-2 rounded-xl cursor-pointer text-xs font-bold flex items-center justify-center gap-2">
                                        <PiPlusBold size={14} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <PiShoppingCartBold size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                        <p className="text-gray-500 max-w-xs">
                            We couldn&apos;t find any products matching your search or category filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductGrid;
