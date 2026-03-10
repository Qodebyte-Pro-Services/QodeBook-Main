"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    X, 
    Link2, 
    Package, 
    CheckCircle2, 
    Loader2,
    ShoppingBag,
    Tag,
    Percent,
    Receipt,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductWithCoupons, getProductWithDiscounts, getProductWithTaxes, getUserProducts } from "@/api/controllers/get/handler";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { isAxiosError } from "axios";
import { ProductResponseObj } from "@/models/types/shared/handlers-type";
import { BadgeTwo } from "@/components/ui/badge-two";
import { useQuery } from "@tanstack/react-query";

type Product = ProductResponseObj;

type ProductWithTaxesLogic = Array<{
    product_id: number;
    product_name: string;
    tax_id: number;
    tax_name: string;
    rate: string;
    type: string;
}>;


type ProductWithDiscountsLogic = Array<{
    product_id: number;
    product_name: string;
    discount_id: number;
    discount_name: string;
    percentage: string;
    amount: string;
    start_date: string;
    end_date: string;
    description: string;
}>;


type ProductWithCouponsLogic = Array<{
    product_id: number;
    product_name: string;
    coupon_id: number;
    coupon_code: string;
    description: string;
    discount_percentage: string;
    discount_amount: string;
    start_date: string;
    end_date: string
}>;

interface LinkToProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number | string;
    itemName: string;
    itemType: "taxes" | "discounts" | "coupons";
    businessId: number;
    onSuccess?: () => void;
}

export function LinkToProductModal({
    isOpen,
    onClose,
    itemId,
    itemName,
    itemType,
    businessId,
    onSuccess
}: LinkToProductModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    const [linkedProducts, setLinkedProducts] = useState<Set<number>>(new Set());

    const {data: productTaxes, isLoading: productLoading, isSuccess: productSuccess, isError: productError} = useQuery({
        queryKey: ["get-products", businessId],
        queryFn: () => getProductWithTaxes({businessId}),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });
    const {data: productCoupons, isLoading: productCLoading, isSuccess: productCSuccess, isError: productCError} = useQuery({
        queryKey: ["get-products", businessId],
        queryFn: () => getProductWithCoupons({businessId}),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });
    const {data: productDiscounts, isLoading: productDLoading, isSuccess: productDSuccess, isError: productDError} = useQuery({
        queryKey: ["get-products", businessId],
        queryFn: () => getProductWithDiscounts({businessId}),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const typeConfig = {
        taxes: { icon: Receipt, color: "green", gradient: "from-green-500 to-green-600" },
        discounts: { icon: Percent, color: "green", gradient: "from-green-500 to-green-600" },
        coupons: { icon: Tag, color: "green", gradient: "from-green-500 to-green-600" }
    };

    const config = typeConfig[itemType];
    const Icon = config.icon;

    useEffect(() => {
        if (isOpen && businessId) {
            fetchProducts();
        }
    }, [isOpen, businessId]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await getUserProducts(businessId);
            setProducts(data?.products || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };


    const productWithTaxes = useMemo<ProductWithTaxesLogic>(() => {
        if (productSuccess && !productError) {
            return productTaxes?.products_with_taxes || [];
        }
    }, [productTaxes, productSuccess, productError]);
    
    const productWithCoupons = useMemo<ProductWithCouponsLogic>(() => {
        if (productSuccess && !productError) {
            return productCoupons?.products_with_coupons || [];
        }
    }, [productCoupons, productCSuccess, productCError]);

    const productWithDiscounts = useMemo<ProductWithDiscountsLogic>(() => {
        if (productSuccess && !productError) {
            return productDiscounts?.products_with_discounts || [];
        }
    }, [productDiscounts, productDSuccess, productDError]);

    const connectedTaxProducts = useMemo(() => {
        if (isOpen && businessId && productWithTaxes?.length) {
            const productWithTaxesIds = productWithTaxes?.filter(item => item?.tax_id)?.map(item => item?.product_id);
            return productWithTaxesIds;
        }
    }, [productWithTaxes, businessId, isOpen, products]);

    const connectedDiscountProducts = useMemo(() => {
        if (isOpen && businessId && productWithDiscounts?.length) {
            const productWithDiscountsIds = productWithDiscounts?.filter(item => item?.discount_id)?.map(item => item?.product_id);
            return productWithDiscountsIds;
        }
    }, [productWithDiscounts, businessId, isOpen, products]);

    const connectedCouponProducts = useMemo(() => {
        if (isOpen && businessId && productWithCoupons?.length) {
            const productWithCouponsIds = productWithCoupons?.filter(item => item?.coupon_id)?.map(item => item?.product_id);
            return productWithCouponsIds;
        }
    }, [productWithCoupons, businessId, isOpen, products]);

    const filteredProducts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (p: Product) =>
            p.name?.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query) ||
            p.base_sku?.toLowerCase().includes(query) ||
            p.category_name?.toLowerCase().includes(query);

        switch(itemType) {
            case "taxes": {
                if (!searchQuery && connectedTaxProducts?.length === 0) return products;
                if (!searchQuery) {
                    return products.filter(p => !connectedTaxProducts?.includes(p.id));
                }
                return products.filter(p => matchesSearch(p) && !connectedTaxProducts?.includes(p.id));
            }
            case "coupons": {
                if (!searchQuery && connectedCouponProducts?.length === 0) return products;
                if (!searchQuery) {
                    return products.filter(p => !connectedCouponProducts?.includes(p.id));
                }
                return products.filter(p => matchesSearch(p) && !connectedCouponProducts?.includes(p.id));
            }
            case "discounts": {
                if (!searchQuery && connectedDiscountProducts?.length === 0) return products;
                if (!searchQuery) {
                    console.log(connectedDiscountProducts);
                    return products.filter(p => !connectedDiscountProducts?.includes(p.id));
                }
                return products.filter(p => matchesSearch(p) && !connectedDiscountProducts?.includes(p.id));
            }
            default: {
                return products;
            }
        }
    }, [products, connectedTaxProducts, connectedCouponProducts, connectedDiscountProducts, searchQuery, itemType]);
    
    useEffect(() => {
        console.log(filteredProducts);
    }, [filteredProducts]);

    const handleLinkProduct = async () => {
        if (!selectedProduct) {
            toast.error("Please select a product to link");
            return;
        }

        if (itemType.toLowerCase() === "taxes" && !selectedProduct?.taxable) {
            toast.error("Selected product is not taxable");
            return;
        }

        setIsLinking(true);
        try {
            const payload = {
                [`${itemType === "taxes" ? itemType.slice(0, -2) : itemType.slice(0, -1)}_id`]: Number(itemId),
                product_id: selectedProduct.id
            };

            const response = await axiosInstance.post(
                `/api/${itemType}/link`,
                payload,
                {
                    headers: {
                        "x-business-id": businessId
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                setLinkedProducts(prev => new Set(prev).add(selectedProduct.id));
                toast.success(
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Successfully linked {itemName} to {selectedProduct.name}</span>
                    </div>
                );
                
                setSelectedProduct(null);
                
                if (onSuccess) {
                    onSuccess();
                }
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to link product");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setIsLinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className={cn("relative h-24 bg-gradient-to-r", config.gradient)}>
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="relative h-full flex items-center justify-between px-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Link2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Link to Product</h2>
                                        <p className="text-white/80 text-sm mt-1">
                                            Link &quot;{itemName}&quot; to products in your inventory
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col h-[calc(100%-6rem)]">
                            <div className="p-6 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search products by name, brand, SKU, or category..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    {selectedProduct && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={handleLinkProduct}
                                            disabled={isLinking}
                                            className={cn(
                                                "px-6 py-3 bg-gradient-to-r text-white rounded-xl font-medium",
                                                "hover:shadow-lg transition-all duration-200",
                                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                                config.gradient
                                            )}
                                        >
                                            {isLinking ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Link2 className="h-4 w-4" />
                                                    Link Product
                                                </span>
                                            )}
                                        </motion.button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {selectedProduct && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 overflow-hidden"
                                        >
                                            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle2 className={cn("h-5 w-5", `text-${config.color}-500`)} />
                                                        <span className="font-medium text-gray-700">Selected:</span>
                                                        <span className="font-semibold">{selectedProduct.name}</span>
                                                        {selectedProduct.base_sku && (
                                                            <span className="text-sm text-gray-500">(SKU: {selectedProduct.base_sku})</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedProduct(null)}
                                                        className="text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                                        <p className="text-gray-500">Loading products...</p>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Package className="h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium">No products found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchQuery ? "Try adjusting your search" : "Add products to your inventory first"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProducts.map((product: ProductResponseObj) => {
                                            const isSelected = selectedProduct?.id === product.id;
                                            const isLinked = linkedProducts.has(product.id);
                                            
                                            return (
                                                <motion.div
                                                    key={product.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => !isLinked && setSelectedProduct(isSelected ? null : product)}
                                                    className={cn(
                                                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                                        isSelected 
                                                            ? `border-${config.color}-500 bg-${config.color}-50` 
                                                            : isLinked 
                                                            ? "border-green-500 bg-green-50 cursor-not-allowed opacity-60"
                                                            : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                                                    )}
                                                >
                                                    {/* Linked Badge */}
                                                    {isLinked && (
                                                        <div className="absolute top-2 right-2">
                                                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Linked
                                                            </span>
                                                        </div>
                                                    )}

                                                    {product.image_url ? (
                                                        <img 
                                                            src={product.image_url[0].secure_url} 
                                                            alt={product.name}
                                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                                                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                            {product.name}
                                                        </h3>
                                                        
                                                        {product.brand && (
                                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                                Brand: {product.brand}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center justify-between text-sm">
                                                            {product.base_sku && (
                                                                <span className="text-gray-400">
                                                                    SKU: {product.base_sku}
                                                                </span>
                                                            )}
                                                            {product.category_name && (
                                                                <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                                                                    {product.category_name}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-x-1 items-center">
                                                            <span className="text-gray-600">Has variants: </span>
                                                            {product.hasVariation && (
                                                                <BadgeTwo variant={product?.hasVariation ? "default" : "destructive"}>
                                                                    {product?.hasVariation ? "YES" : "NO"}
                                                                </BadgeTwo>
                                                            )}
                                                        </div>
                                                        </div>

                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className={cn(
                                                                "absolute -top-2 -right-2 p-1 rounded-full",
                                                                `bg-${config.color}-500`
                                                            )}
                                                        >
                                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>
                                            Linking {itemType} to products helps track and manage your inventory better
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {filteredProducts.length} products available
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
