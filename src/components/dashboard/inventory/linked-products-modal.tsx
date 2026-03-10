"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    X, 
    Eye, 
    Trash2, 
    Package, 
    Loader2,
    ShoppingBag,
    Tag,
    Percent,
    Receipt,
    AlertCircle,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductWithCoupons, getProductWithDiscounts, getProductWithTaxes, getUserProducts } from "@/api/controllers/get/handler";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { isAxiosError } from "axios";
import { ProductResponseObj, ProductWithTaxLogic, ProductWithCouponLogic, ProductWithDiscountLogic } from "@/models/types/shared/handlers-type";
import { BadgeTwo } from "@/components/ui/badge-two";
import { useQuery } from "@tanstack/react-query";

interface LinkedProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number | string;
    itemName: string;
    itemType: "taxes" | "discounts" | "coupons";
    businessId: number;
    onSuccess?: () => void;
}

type InvoiceDataLogic = ProductWithTaxLogic | ProductWithDiscountLogic | ProductWithCouponLogic & {product_sku: string; product_description: string; product_brand: string};

export function LinkedProductsModal({
    isOpen,
    onClose,
    itemId,
    itemName,
    itemType,
    businessId,
    onSuccess
}: LinkedProductsModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<ProductResponseObj[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponseObj | null>(null);

    const {data: productTaxes, isLoading: productLoading, isSuccess: productSuccess, isError: productError} = useQuery({
        queryKey: ["get-products-with-taxes", businessId],
        queryFn: () => getProductWithTaxes({businessId}),
        enabled: businessId !== 0 && itemType === "taxes",
        refetchOnWindowFocus: false,
        retry: false
    });
    
    const {data: productCoupons, isLoading: productCLoading, isSuccess: productCSuccess, isError: productCError} = useQuery({
        queryKey: ["get-products-with-coupons", businessId],
        queryFn: () => getProductWithCoupons({businessId}),
        enabled: businessId !== 0 && itemType === "coupons",
        refetchOnWindowFocus: false,
        retry: false
    });
    
    const {data: productDiscounts, isLoading: productDLoading, isSuccess: productDSuccess, isError: productDError} = useQuery({
        queryKey: ["get-products-with-discounts", businessId],
        queryFn: () => getProductWithDiscounts({businessId}),
        enabled: businessId !== 0 && itemType === "discounts",
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

    const linkedProducts = useMemo(() => {
        let linkedData: (ProductWithTaxLogic | ProductWithCouponLogic | ProductWithDiscountLogic)[] = [];
        
        switch(itemType) {
            case "taxes":
                if (productSuccess && !productError && productTaxes?.products_with_taxes) {
                    linkedData = productTaxes.products_with_taxes.filter((item: ProductWithTaxLogic) => item.tax_id === Number(itemId));
                }
                break;
            case "coupons":
                if (productCSuccess && !productCError && productCoupons?.products_with_coupons) {
                    linkedData = productCoupons.products_with_coupons.filter((item: ProductWithCouponLogic) => item.coupon_id === Number(itemId));
                }
                break;
            case "discounts":
                if (productDSuccess && !productDError && productDiscounts?.products_with_discounts) {
                    linkedData = productDiscounts.products_with_discounts.filter((item: ProductWithDiscountLogic) => item.discount_id === Number(itemId));
                }
                break;
        }
        
        return linkedData;
    }, [itemType, productTaxes, productCoupons, productDiscounts, productSuccess, productCSuccess, productDSuccess, productError, productCError, productDError, itemId]);

    const enrichedLinkedProducts = useMemo(() => {
        return linkedProducts.map(linkedProduct => {
            const product = products.find(p => p.id === linkedProduct.product_id);
            return {
                ...linkedProduct,
                product: product
            };
        }).filter(item => item.product); // Only include products that were found
    }, [linkedProducts, products]);

    const filteredProducts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return enrichedLinkedProducts.filter(item => {
            const product = item.product;
            return (
                product?.name?.toLowerCase().includes(query) ||
                product?.brand?.toLowerCase().includes(query) ||
                product?.base_sku?.toLowerCase().includes(query) ||
                product?.category_name?.toLowerCase().includes(query)
            );
        });
    }, [enrichedLinkedProducts, searchQuery]);

    const handleUnlinkProduct = async (productId: number) => {
        setIsDeleting(productId);
        try {
            const response = await axiosInstance.delete(
                `/api/${itemType}/unlink-single/${itemId}/${productId}`,
                {
                    headers: {
                        "x-business-id": businessId
                    }
                }
            );

            if (response.status === 200 || response.status === 204) {
                toast.success(
                    <div className="flex items-center gap-2">
                        <span>Successfully unlinked {itemName} from product</span>
                    </div>
                );
                
                if (onSuccess || onClose) {
                    onSuccess?.();
                    onClose?.();
                }
            }
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to unlink product");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setIsDeleting(null);
        }
    };

    const handleViewProduct = (product: ProductResponseObj) => {
        setSelectedProduct(product);
    };

    const handleCloseProductModal = () => {
        setSelectedProduct(null);
    };

    const invoiceData = useMemo(() => {
        const neededItems = linkedProducts?.filter(item => item?.product_id === selectedProduct?.id);
        return neededItems?.map(item => ({
            product_sku: selectedProduct?.base_sku,
            product_description: selectedProduct?.description,
            product_brand: selectedProduct?.brand,
            ...item
        }));
    }, [selectedProduct, linkedProducts]) as InvoiceDataLogic[];

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
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Linked Products</h2>
                                        <p className="text-white/80 text-sm mt-1">
                                            Products linked to &quot;{itemName}&quot;
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
                                            placeholder="Search linked products by name, brand, SKU, or category..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                                        <p className="text-gray-500">Loading linked products...</p>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Package className="h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium">No linked products found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchQuery ? "Try adjusting your search" : "No products are currently linked to this item"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredProducts.map((linkedItem) => {
                                            const product = linkedItem.product;
                                            if (!product) return null;
                                            const deleting = isDeleting === product.id;
                                            
                                            return (
                                                <motion.div
                                                    key={product.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="relative group p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md bg-white transition-all duration-200"
                                                >
                                                    {/* Hover Actions */}
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                                        <button
                                                            onClick={() => handleViewProduct(product)}
                                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                            title="View Product"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUnlinkProduct(product.id)}
                                                            disabled={deleting}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                            title="Unlink Product"
                                                        >
                                                            {deleting ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Linked Badge */}
                                                    <div className="absolute top-2 left-2">
                                                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                                                            <Icon className="h-3 w-3" />
                                                            Linked
                                                        </span>
                                                    </div>

                                                    {product.image_url && product.image_url.length > 0 ? (
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
                                                            <BadgeTwo variant={product?.hasVariation ? "default" : "destructive"}>
                                                                {product?.hasVariation ? "YES" : "NO"}
                                                            </BadgeTwo>
                                                        </div>

                                                        {/* Link Details */}
                                                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                                            <div className="text-xs text-gray-600">
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    <Icon className="h-3 w-3" />
                                                                    <span className="font-medium">
                                                                        {itemType === "taxes" ? "Tax Rate" : 
                                                                         itemType === "discounts" ? "Discount" : "Coupon"}
                                                                    </span>
                                                                </div>
                                                                {itemType === "taxes" && (
                                                                    <div>
                                                                        <span>Rate: {(linkedItem as ProductWithTaxLogic).rate}%</span>
                                                                        <span className="ml-2">Type: {(linkedItem as ProductWithTaxLogic).type}</span>
                                                                    </div>
                                                                )}
                                                                {itemType === "discounts" && (
                                                                    <div>
                                                                        <span>Percentage: {(linkedItem as ProductWithDiscountLogic).percentage}%</span>
                                                                        <span className="ml-2">Amount: ₦{(linkedItem as ProductWithDiscountLogic).amount}</span>
                                                                    </div>
                                                                )}
                                                                {itemType === "coupons" && (
                                                                    <div>
                                                                        <span>Code: {(linkedItem as ProductWithCouponLogic).coupon_code}</span>
                                                                        <span className="ml-2">Percentage: {(linkedItem as ProductWithCouponLogic).discount_percentage}%</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
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
                                            Hover over products to view or unlink them
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {filteredProducts.length} linked products
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
