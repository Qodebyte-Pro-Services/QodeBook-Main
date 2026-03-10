"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { RiLoader4Line } from "react-icons/ri";
import { toast } from "sonner";
import { X, ShoppingCart, AlertCircle, Plus, Minus, Calendar, FolderPlus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BulkOrderType, SingleProductType } from "@/models/types/shared/handlers-type";
import { useOrderHandler, useProductHandler, useProductOrderHandler } from "@/hooks/useHandlers";
import { getUserProducts, getVariantsByProductId, getSuppliersByBusinessId } from "@/api/controllers/get/handler";
import { createOrderFormHandler } from "@/api/controllers/post/product-handler";
import SuppliersForm from "./suppliers-form";

interface OrderItem {
    id: string;
    productId: number;
    productName: string;
    variantId?: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    note?: string;
}

interface FormData {
    supplier: string;
    orderDate: string;
    expectedDeliveryDate: string;
    items: OrderItem[];
}

interface FormErrors {
    supplier?: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    items?: string;
}

interface Supplier {
    id: string;
    name: string;
    contact: string;
}

interface ProductVariant {
    id: string;
    attributes: Record<string, string>;
    price: string;
    costPrice?: string;
    quantity: string;
    sku: string;
    weight: string;
}

interface AttributesType {
    name: string;
    value: string;
    value_id: number;
    attribute_id: number;
}

interface ProductVariantType {
    id: number;
    product_id: number;
    attributes?: AttributesType[];
    cost_price: string;
    selling_price: string;
    quantity: number;
    threshold: number;
    sku: string;
    image_url: string[];
    expiry_date: string;
    created_at: string;
    updated_at: string;
    barcode: string;
    barcode_image_url: string | null;
}

const CreateOrderForm = ({handleFormClose, business_id, product_id}: {handleFormClose: () => void; business_id: number; product_id?: string;}) => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        supplier: "",
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: "",
        items: []
    });
    
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [selectedVariant, setSelectedVariant] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<{itemId: string, field: string, currentValue: string | number, title: string} | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");
    const [showSupplierForm, setShowSupplierForm] = useState<boolean>(false);
    const [newSupplier, setNewSupplier] = useState<{name: string, contact: string}>({name: "", contact: ""});
    
    const [products, setProducts] = useState<SingleProductType[]>([]);
    const [selectedProductVariants, setSelectedProductVariants] = useState<ProductVariantType[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    // const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
    

    const {data: suppliersData, isLoading: isSupplierLoading, isSuccess: isSupplierSuccess, isError: isSupplierError} = useQuery({
        queryKey: ["get-suppliers", business_id],
        queryFn: () => getSuppliersByBusinessId(business_id),
        enabled: business_id !== 0,
        retry: false,
        refetchOnWindowFocus: false
    });

    const {data: productsData, isLoading: isProductsLoading, isSuccess: isProductsSuccess, isError: isProductsError} = useQuery({
        queryKey: ["get-products", business_id],
        queryFn: () => getUserProducts(business_id),
        enabled: business_id !== 0,
        retry: false,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if (isSupplierSuccess && !isSupplierError) {
            const supplier_details = suppliersData?.suppliers || [];
            setSuppliers(supplier_details);
        }
    }, [suppliersData, isSupplierSuccess, isSupplierError]);

    useEffect(() => {
        if (isProductsSuccess && !isProductsError) {
            const product_details = productsData?.products || [];
            setProducts(product_details);
        }
    }, [productsData, isProductsSuccess, isProductsError]);

    const createOrderMutation = useProductOrderHandler();

    const selectedProductHasVariations = selectedProduct && products.find(p => p.id.toString() === selectedProduct)?.hasVariation;

    // Fetch variants using useQuery
    const { data: variantsData, isLoading: loadingVariants, error: variantsError } = useQuery({
        queryKey: ['productVariants', selectedProduct, business_id],
        queryFn: () => getVariantsByProductId({
            productId: selectedProduct!,
            businessId: +business_id
        }),
        enabled: !!(selectedProduct && business_id && selectedProductHasVariations),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Update selected product variants when data changes
    useEffect(() => {
        if (selectedProductHasVariations && variantsData) {
            setSelectedProductVariants(variantsData?.variants || []);
        } else {
            setSelectedProductVariants([]);
        }
    }, [variantsData, selectedProductHasVariations]);

    // Handle variants error
    useEffect(() => {
        if (variantsError) {
            console.error('Error fetching variants:', variantsError);
            toast.error('Failed to fetch product variants');
            setSelectedProductVariants([]);
        }
    }, [variantsError]);

    useEffect(() => {
        if (product_id) {
            setSelectedProduct(`${product_id}`);
        }
    }, [product_id]);

    const validateInputs = (name: string, value: string): string => {
        switch(name) {
            case "supplier":
                return !value.trim() ? "Supplier is required" : "";
            case "orderDate":
                return !value.trim() ? "Order date is required" : "";
            case "expectedDeliveryDate":
                return !value.trim() ? "Expected delivery date is required" : "";
            case "contact":
                return !value.trim() ? "Contact is required" : "";
            default:
                return "";
        }
    }

    const handleInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name as keyof FormData]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    }

    const handleProductChange = (productId: string) => {
        setSelectedProduct(productId);
        // Reset variant selection when product changes
        setSelectedVariant("");
    }

    const handleVariantChange = (variantId: string) => {
        setSelectedVariant(variantId);
    }

    const addItemToOrder = () => {
        if (!selectedProduct) {
            toast.error("Please select a product");
            return;
        }

        const product = products.find(p => p.id.toString() === selectedProduct);
        if (!product) {
            toast.error("Selected product not found");
            return;
        }

        // Check if product has variations and variant is selected
        if (product.hasVariation && !selectedVariant) {
            toast.error("Please select a product variant");
            return;
        }

        let unitPrice = 0;
        let variantName = "";
        
        if (product.hasVariation && selectedVariant) {
            const variant = selectedProductVariants.find(v => v.id.toString() === selectedVariant);
            if (variant) {
                unitPrice = parseFloat(variant.selling_price);
                // Create variant name from attributes
                if (variant.attributes && variant.attributes.length > 0) {
                    variantName = variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(" - ");
                } else {
                    variantName = variant.sku || `Variant ${variant.id}`;
                }
            }
        } else {
            // For products without variations, set price to 0 (will need to be entered manually)
            // Since SingleProductType doesn't have a price field, we'll let user enter it
            unitPrice = 0;
        }

        const newItem: OrderItem = {
            id: Date.now().toString(), // Simple ID generation
            productId: product.id,
            productName: product.name,
            variantId: selectedVariant || undefined,
            variantName: variantName || undefined,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            // note?: ""
        };

        // Add item to form data
        if (product.hasVariation && selectedVariant) {
            setFormData(prev => {
                if (prev?.items?.some(p => p.variantId === selectedVariant)) {
                    toast.info("Product Already Added", {
                        description: `${product?.name} is already exisiting in the cart`
                    });
                    return prev;
                }
                return {
                    ...prev,
                    items: [...prev.items, newItem]
                }
            });
        }else {
            setFormData(prev => {
                if (prev?.items?.some(p => p.productId === product?.id)) {
                    toast.info("Product Already Added", {
                        description: `${product?.name} is already exisiting in the cart`
                    });
                    return prev;
                }
                return {
                    ...prev,
                    items: [...prev.items, newItem]
                }
            });
        }

        // Reset selections
        setSelectedProduct("");
        setSelectedVariant("");
        setQuantity(1);

        toast.success("Item added to order");
    }

    const updateItemQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
            return;
        }

        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => 
                item.id === itemId 
                    ? { 
                        ...item, 
                        quantity: newQuantity, 
                        totalPrice: item.unitPrice * newQuantity 
                    }
                    : item
            )
        }));
    };

    const removeItem = (itemId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
        toast.success("Item removed from order");
    };

    const getTotalOrderValue = (): number => {
        return formData.items.reduce((total, item) => total + item.totalPrice, 0);
    };

    const startEditing = (itemId: string, field: string, currentValue: string | number, title: string) => {
        setEditingItem({ itemId, field, currentValue, title });
        setEditingValue(currentValue.toString());
        setShowEditModal(true);
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setEditingValue("");
        setShowEditModal(false);
    };

    const saveEdit = () => {
        if (!editingItem) return;

        const { itemId, field } = editingItem;
        let newValue: string | number = editingValue;

        // Parse numeric fields
        if (field === 'quantity' || field === 'unitPrice') {
            const numValue = parseFloat(editingValue);
            if (isNaN(numValue) || numValue <= 0) {
                toast.error(`Please enter a valid ${field === 'quantity' ? 'quantity' : 'unit price'}`);
                return;
            }
            newValue = numValue;
        }

        // Update the item
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item };
                    
                    if (field === 'productName') {
                        updatedItem.productName = newValue as string;
                    } else if (field === 'variantName') {
                        updatedItem.variantName = newValue as string;
                    } else if (field === 'quantity') {
                        updatedItem.quantity = newValue as number;
                        updatedItem.totalPrice = updatedItem.unitPrice * (newValue as number);
                    } else if (field === 'unitPrice') {
                        updatedItem.unitPrice = newValue as number;
                        updatedItem.totalPrice = (newValue as number) * updatedItem.quantity;
                    } else if (field === 'note') {
                        updatedItem.note = newValue as string;
                    }
                    
                    return updatedItem;
                }
                return item;
            })
        }));

        cancelEditing();
        toast.success("Item updated successfully");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const validatedForm = (): boolean => {
        const errorTree: FormErrors = {};
        let isValid = false;

        Object.keys(formData)?.forEach(item => {
            if (typeof item !== "number") {
                errorTree[item as keyof FormErrors] = validateInputs(item, `${formData[item as keyof FormData]}`) ?? `${item} Is Required`;
                if (!errorTree[item as keyof FormErrors]) {
                    isValid = true;
                }
            }
        })

        setErrors(errorTree);
        return isValid;
    }

    const queryClient = useQueryClient();

    // const handleAddSupplier = async () => {
    //     if (!newSupplier.name.trim() || !newSupplier.contact.trim()) {
    //         toast.error("Please fill in all supplier fields");
    //         return;
    //     }

    //     const supplierId = (suppliers.length + 1).toString();
    //     const supplierToAdd = {
    //         id: supplierId,
    //         name: newSupplier.name.trim(),
    //         contact: newSupplier.contact.trim()
    //     };

    //     setSuppliers(prev => [...prev, supplierToAdd]);
    //     setFormData(prev => ({ ...prev, supplier: supplierId }));
    //     setNewSupplier({ name: "", contact: "" });
    //     setShowSupplierForm(false);
    //     toast.success("Supplier added successfully!");
    // };

    const handleSupplier = async () => {
        if (!validatedForm()) return;
        const formdata = {...formData, business_id};
        setIsSubmitting(true);
        try {
            
        }catch(err) {
            console.log(err);
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating Supplier");
        }finally {
            setIsSubmitting(false);
        }
    }

    const handleCreateOrder = async () => {
        // Validate form first
        if (!validatedForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Check if there are items in the order
        if (formData.items.length === 0) {
            toast.error("Please add at least one item to the order");
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform form data to match ProductOrderTypeTwo
            const orderPayload = {
                variants: formData.items.map(item => ({
                    variant_id: parseInt(item.variantId || '0'),
                    quantity: item.quantity,
                    cost_price: item.unitPrice,
                })),
                // note: formData.items.map(item => item.note || '').join('; ').trim() || '',
                supplier_id: parseInt(formData.supplier),
                expected_delivery_date: formData.expectedDeliveryDate,
                supply_order_date: formData.orderDate,
                supply_status: 'awaiting_payment',
                business_id: business_id
            };

            await createOrderMutation.mutateAsync(orderPayload, {
                onSuccess: (data) => {
                    queryClient.invalidateQueries({
                        queryKey: ["get-orders", business_id],
                        refetchType: "active"
                    });
                    toast.success(data?.message || "Orders created successfully!");
                },
                onError: (err) => {
                    console.log(err);
                    toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating order");
                }
            });
            
            // Reset form
            setFormData({
                supplier: "",
                orderDate: new Date().toISOString().split('T')[0],
                expectedDeliveryDate: "",
                items: []
            });
            
            // Close the form
            handleFormClose();
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['get-orders', business_id], refetchType: "active" });
            
        } catch (err) {
            console.log(err);
            toast.error((err instanceof Error && err?.message) ?? "An unexpected error occurred while creating order");
        } finally {
            setIsSubmitting(false);
        }
    }

    const containerVariant = {
        from: {
            scale: 0.95,
            opacity: 0,
            y: 20
        },
        to: {
            scale: 1,
            opacity: 1,
            y: 0
        },
        go: {
            scale: 0.95,
            opacity: 0,
            y: 20
        }
    }

    return(
        <AnimatePresence mode="wait">
            <motion.div 
                variants={containerVariant} 
                initial="from" 
                animate="to" 
                exit="go"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <ShoppingCart size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Create New Order</h2>
                            </div>
                            <button 
                                onClick={handleFormClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-white/80 text-sm">
                            Initiate a new order by selecting items, specifying quantities, and assigning customer or supplier details.
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Order Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Supplier */}
                                <div className="space-y-2">
                                    <label htmlFor="supplier" className="text-sm font-semibold text-gray-700">
                                        Supplier *
                                    </label>
                                    <div className="relative">
                                        <div className="flex gap-2">
                                            <Select 
                                                value={`${formData.supplier}`} 
                                                onValueChange={(value) => {
                                                    setFormData(prev => ({ ...prev, supplier: value }));
                                                    if (errors.supplier) {
                                                        setErrors(prev => ({ ...prev, supplier: undefined }));
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                    errors.supplier 
                                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                        : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                }`}>
                                                    <SelectValue placeholder="Select Supplier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {suppliers?.length ?
                                                    suppliers.map(supplier => (
                                                        <SelectItem key={`order-form-suppliers-${supplier.id}`} value={`${supplier.id.toString()}`} className="hover:bg-template-chart-store hover:text-white">
                                                            {supplier.name}
                                                        </SelectItem>
                                                    )) : (
                                                        <SelectValue className="text-xs font-[500]" placeholder="No Available Supplier" />
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <button
                                                type="button"
                                                onClick={() => setShowSupplierForm(true)}
                                                className="px-3 py-3 bg-template-primary text-white rounded-xl hover:bg-template-primary/90 transition-colors flex items-center justify-center"
                                                title="Add New Supplier"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {/* Supplier Form Data Error */}
                                        {errors.supplier && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{errors.supplier}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Date */}
                                <div className="space-y-2">
                                    <label htmlFor="orderDate" className="text-sm font-semibold text-gray-700">
                                        Order Date *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            id="orderDate"
                                            name="orderDate"
                                            value={formData.orderDate} 
                                            onChange={handleInputs}
                                            className={`w-full px-4 py-2 border border-input rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                errors.orderDate 
                                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                    : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                            }`}
                                        />
                                        {errors.orderDate && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{errors.orderDate}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expected Delivery Date */}
                                <div className="space-y-2">
                                    <label htmlFor="expectedDeliveryDate" className="text-sm font-semibold text-gray-700">
                                        Expected Delivery Date *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            id="expectedDeliveryDate"
                                            name="expectedDeliveryDate"
                                            value={formData.expectedDeliveryDate} 
                                            onChange={handleInputs}
                                            className={`w-full px-4 py-2 border border-input rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                errors.expectedDeliveryDate 
                                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                                    : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                            }`}
                                        />
                                        {errors.expectedDeliveryDate && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{errors.expectedDeliveryDate}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Products Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Products</h3>
                                
                                {/* Product Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    {/* Product Dropdown */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Product
                                        </label>
                                        <Select 
                                            value={selectedProduct}
                                            onValueChange={handleProductChange}
                                        >
                                            <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-template-chart-store/20 focus:border-template-chart-store">
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(product => (
                                                    <SelectItem key={product.id} value={product.id.toString()} className="hover:bg-template-chart-store hover:text-white">
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Variant Dropdown */}
                                    {selectedProduct && products.find(p => p.id.toString() === selectedProduct)?.hasVariation && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Variant {loadingVariants && <span className="text-xs text-gray-500">(Loading...)</span>}
                                            </label>
                                            <Select 
                                                value={selectedVariant}
                                                onValueChange={handleVariantChange}
                                                disabled={loadingVariants}
                                            >
                                                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-template-chart-store/20 focus:border-template-chart-store disabled:opacity-50">
                                                    <SelectValue placeholder={loadingVariants ? "Loading variants..." : "Select Variant"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedProductVariants.map((variant: ProductVariantType) => (
                                                        <SelectItem key={variant.id} value={variant.id.toString()} className="hover:bg-template-chart-store hover:text-white">
                                                            {(variant.attributes && variant.attributes.length > 0) 
                                                                ? variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(' / ')
                                                                : variant.sku || `Variant ${variant.id}`
                                                            }
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Quantity */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Quantity
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-xl">
                                            <button 
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-center min-w-[40px]"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input 
                                                type="number" 
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full md:w-[60%] px-4 py-2 text-center border-0 focus:outline-none"
                                                min="1"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-center min-w-[40px]"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Add Button */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            &nbsp;
                                        </label>
                                        <button 
                                            type="button"
                                            onClick={addItemToOrder}
                                            disabled={!selectedProduct || (products.find(p => p.id.toString() === selectedProduct)?.hasVariation && !selectedVariant) || loadingVariants}
                                            className="w-full px-4 py-2 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Add Item
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items Table */}
                                {formData.items.length > 0 && (
                                    <div className="mt-6">
                                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">Product</th>
                                                        <th scope="col" className="px-6 py-3">Quantity Ordered</th>
                                                        {/* <th scope="col" className="px-6 py-3">Note</th> */}
                                                        <th scope="col" className="px-6 py-3">Unit Price</th>
                                                        <th scope="col" className="px-6 py-3">Subtotal</th>
                                                        <th scope="col" className="px-6 py-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.items.map((item) => (
                                                        <tr key={item.id} className="bg-white border-b">
                                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                                <div>
                                                                    <div 
                                                                        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border-2 border-transparent hover:border-gray-200"
                                                                        onClick={() => startEditing(item.id, 'productName', item.productName, 'Edit Product Name')}
                                                                    >
                                                                        {item.productName}
                                                                    </div>
                                                                    {item.variantName && (
                                                                        <div 
                                                                            className="text-sm text-gray-500 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border-2 border-transparent hover:border-gray-200"
                                                                            onClick={() => startEditing(item.id, 'variantName', `${item.variantName}`, 'Edit Variant Name')}
                                                                        >
                                                                            {item.variantName}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                                        className="p-2 text-template-primary hover:bg-gray-100 rounded transition-colors"
                                                                    >
                                                                        <Minus size={16} />
                                                                    </button>
                                                                    <div 
                                                                        className="w-12 text-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border-2 border-transparent hover:border-gray-200"
                                                                        onClick={() => startEditing(item.id, 'quantity', item.quantity, 'Edit Quantity')}
                                                                    >
                                                                        {item.quantity}
                                                                    </div>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                                        className="p-2 text-template-primary hover:bg-gray-100 rounded transition-colors"
                                                                    >
                                                                        <Plus size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            {/* <td className="px-6 py-4">
                                                                <div 
                                                                    className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border-2 border-transparent hover:border-gray-200 min-h-[24px]"
                                                                    onClick={() => startEditing(item.id, 'note', item.note || '', 'Add Note')}
                                                                >
                                                                    {item.note || <span className="text-gray-400 italic">Click to add note</span>}
                                                                </div>
                                                            </td> */}
                                                            <td className="px-6 py-4">
                                                                <div 
                                                                    className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border-2 border-transparent hover:border-gray-200"
                                                                    onClick={() => startEditing(item.id, 'unitPrice', item.unitPrice, 'Edit Unit Price')}
                                                                >
                                                                    ₦{item.unitPrice.toLocaleString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">₦{item.totalPrice.toLocaleString()}</td>
                                                            <td className="px-6 py-4">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-50">
                            
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-4 font-semibold text-right">Total (₦)</td>
                                                        <td className="px-6 py-4 font-bold">₦{getTotalOrderValue().toLocaleString()}</td>
                                                        <td className="px-6 py-4"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        {errors.items && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{errors.items}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Supplier Form Modal */}
                    {showSupplierForm && (
                        <SuppliersForm business_id={business_id} handleFormClose={() => setShowSupplierForm(false)} />
                    )}

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-1 lg:gap-3">
                            <button 
                                onClick={handleFormClose}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateOrder}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RiLoader4Line className="animate-spin" size={16} />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={16} />
                                        <span>Save Order</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Edit Modal */}
                {showEditModal && editingItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={cancelEditing}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{editingItem.title}</h3>
                                    <button 
                                        onClick={cancelEditing}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-gray-700">
                                        {editingItem.field === 'productName' ? 'Product Name' :
                                         editingItem.field === 'variantName' ? 'Variant Name' :
                                         editingItem.field === 'quantity' ? 'Quantity' :
                                         editingItem.field === 'unitPrice' ? 'Unit Price (₦)' : 'Value'}
                                    </label>
                                    
                                    {editingItem.field === 'quantity' || editingItem.field === 'unitPrice' ? (
                                        <input
                                            type="number"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-template-chart-store/20 focus:border-template-chart-store"
                                            min={editingItem.field === 'quantity' ? "1" : "0"}
                                            step={editingItem.field === 'unitPrice' ? "0.01" : "1"}
                                            autoFocus
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-template-chart-store/20 focus:border-template-chart-store"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveEdit}
                                    className="px-6 py-2 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export default CreateOrderForm;