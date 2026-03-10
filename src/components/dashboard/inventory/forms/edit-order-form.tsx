"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { X, ShoppingCart, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getSuppliersByBusinessId, getUserProducts, getVariantsByProductId, getOrderStockById } from "@/api/controllers/get/handler";
import { OrderTask } from "@/store/data/order-data";
import { SingleProductType } from "@/models/types/shared/handlers-type";
import { useUpdateStockSupplyOrder } from "@/hooks/useControllers";

type Supplier = {
  id: string;
  name: string;
  contact?: string;
};

// Mirror the structure used in create-order-form.tsx
interface ProductVariantType {
  id: number;
  product_id: number;
  attributes?: Array<{
    name: string;
    value: string;
    value_id: number;
    attribute_id: number;
  }>;
  cost_price: string;
  selling_price: string;
  quantity: number;
  threshold: number;
  sku: string;
  image_url: string[];
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  barcode: string;
  barcode_image_url: string | null;
}

type EditOrderFormProps = {
  isOpen: boolean;
  onClose: () => void;
  business_id: number;
  order: OrderTask;
  onSave?: (updated: OrderTask) => Promise<void> | void;
};

type FormErrors = {
  supplier?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
};

type OrderItem = {
  id: string; // local id for table rendering
  productId?: number;
  productName: string;
  variantId?: number;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  sku?: string;
};

export type EditOrderLogic = {
  business_id: number;
  supply_order_id: number;
  expected_delivery_date: string;
  supplier_id: number;
  variants: Array<{variant_id: number; quantity: number; cost_price: string}>;
};

const EditOrderForm: React.FC<EditOrderFormProps> = ({ isOpen, onClose, business_id, order, onSave }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplier: "",
    orderDate: "",
    expectedDeliveryDate: "",
    supply_status: "awaiting_payment" as string,
  });

  // Items state (existing + newly added)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Add-item controls
  const [products, setProducts] = useState<SingleProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedProductVariants, setSelectedProductVariants] = useState<ProductVariantType[]>([]);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);

  const queryClient = useQueryClient();


  const { data: suppliersData, isSuccess: isSupplierSuccess, isError: isSupplierError } = useQuery({
    queryKey: ["get-suppliers", business_id],
    queryFn: () => getSuppliersByBusinessId(business_id),
    enabled: !!business_id && isOpen,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch products for add-item dropdown
  const { data: productsData, isSuccess: isProductsSuccess, isError: isProductsError } = useQuery({
    queryKey: ["get-products", business_id],
    queryFn: () => getUserProducts(business_id),
    enabled: !!business_id && isOpen,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch existing order items for this supply order
  const { data: orderDetails, isSuccess: hasOrderDetails } = useQuery({
    queryKey: ["get-order-stock-by-id", order?.id, business_id],
    queryFn: () => getOrderStockById({ id: `${order?.id}`, businessId: `${business_id}` }),
    enabled: !!order?.id && !!business_id && isOpen,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateSupplyOrderHandler = useUpdateStockSupplyOrder();

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

  // Initialize order items from API
  useEffect(() => {
    try {
      if (hasOrderDetails && orderDetails?.items) {
        const mapped: OrderItem[] = (orderDetails.items as Array<{ id: number; variant_id: number; quantity: number; cost_price: string; sku: string }>).map((it) => ({
          id: `${it.id}`,
          productName: it?.sku ? `SKU: ${it.sku}` : "Item",
          variantId: it.variant_id,
          quantity: it.quantity,
          unitPrice: parseFloat(it.cost_price || "0") || 0,
          totalPrice: (parseFloat(it.cost_price || "0") || 0) * it.quantity,
          sku: it.sku,
        }));
        setOrderItems(mapped);
      }
    } catch (e) {
      console.log(e);
    }
  }, [hasOrderDetails, orderDetails]);

  // Prefill values when opening
  useEffect(() => {
    if (!order) return;
    const toISODate = (d: string | Date | undefined) => {
      if (!d) return "";
      const dateObj = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(dateObj.getTime())) return "";
      return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    };

    setFormData({
      supplier: (order as any).supplier_id?.toString?.() || "",
      orderDate: toISODate((order as any).supply_order_date) || "",
      expectedDeliveryDate: toISODate((order as any).expected_delivery_date) || "",
      supply_status: (order as any).supply_status || "awaiting_payment",
    });
  }, [order, isOpen]);

  const validate = () => {
    const e: FormErrors = {};
    if (!formData.supplier) e.supplier = "Supplier is required";
    if (!formData.orderDate) e.orderDate = "Order date is required";
    if (!formData.expectedDeliveryDate) e.expectedDeliveryDate = "Expected delivery date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    try {
      setIsSubmitting(true);
      const updated: OrderTask = {
        ...order,
        supply_order_date: formData.orderDate,
        expected_delivery_date: formData.expectedDeliveryDate,
        supply_status: formData.supply_status as any,
        ...(formData.supplier ? { supplier_id: Number(formData.supplier) } : {}),
      } as any;

      if (orderItems?.length <= 0) {
        toast.error("Order Items Cannot be Empty");
        return;
      } 

      const variantItems = [...orderItems];

      const variants = variantItems?.map((item) => ({
          variant_id: item?.variantId ? item?.variantId : 0,
          quantity: item?.quantity,
          cost_price: `${item?.unitPrice}` 
      }));

      const formdata_structure = Object.assign({}, {business_id: +business_id, supply_order_id: order?.id, expected_delivery_date: updated?.expected_delivery_date, supplier_id: updated?.supplier_id ? +updated?.supplier_id : 0, variants});
      await updateSupplyOrderHandler?.mutateAsync(formdata_structure, {
        onSuccess(data) {
          queryClient?.invalidateQueries({
            queryKey: ["get-orders", business_id],
            refetchType: "active"
          })
          toast.success("Order Updated Successfully");
          onClose();
        },
        onError(err) {
          if (err instanceof Error) {
            toast.error(err?.message ?? "Error Occurred while trying to update order form");
            return;
          }
          toast.error("Failed to update the order form");
        }
      })
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error && err.message) || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariant = useMemo(
    () => ({
      from: { scale: 0.95, opacity: 0, y: 20 },
      to: { scale: 1, opacity: 1, y: 0 },
      go: { scale: 0.95, opacity: 0, y: 20 },
    }),
    []
  );

  // Derived helpers
  const selectedProductHasVariations = selectedProduct && products.find((p) => p.id.toString() === selectedProduct)?.hasVariation;

  // Load variants when product changes
  const { data: variantsData } = useQuery({
    queryKey: ["productVariants", selectedProduct, business_id],
    queryFn: () => getVariantsByProductId({ productId: selectedProduct!, businessId: business_id }),
    enabled: !!(selectedProduct && business_id && selectedProductHasVariations && isOpen),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (selectedProductHasVariations && variantsData) {
      setSelectedProductVariants(variantsData?.variants || []);
    } else {
      setSelectedProductVariants([]);
    }
  }, [variantsData, selectedProductHasVariations]);

  // Item operations
  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Item removed from order");
      return;
    }
    setOrderItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: newQuantity, totalPrice: it.unitPrice * newQuantity } : it))
    );
  };

  const removeItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
    toast.success("Item removed from order");
  };

  const addItemToOrder = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const product = products.find((p) => p.id.toString() === selectedProduct);
    if (!product) {
      toast.error("Selected product not found");
      return;
    }

    if (product.hasVariation && !selectedVariant) {
      toast.error("Please select a product variant");
      return;
    }

    let unitPrice = 0;
    let variantName = "";
    let variantIdNumber: number | undefined = undefined;

    if (product.hasVariation && selectedVariant) {
      const variant = selectedProductVariants.find((v) => v.id.toString() === selectedVariant);
      if (variant) {
        unitPrice = parseFloat(variant.selling_price ?? "0") || 0;
        variantIdNumber = variant.id;
        variantName = (variant.attributes && variant.attributes.length > 0)
          ? variant.attributes.map((a) => `${a.name}: ${a.value}`).join(" - ")
          : variant.sku || `Variant ${variant.id}`;
      }
    }

    const newItem: OrderItem = {
      id: `${Date.now()}`,
      productId: product.id,
      productName: product.name,
      variantId: variantIdNumber,
      variantName: variantName || undefined,
      quantity: quantityToAdd,
      unitPrice,
      totalPrice: unitPrice * quantityToAdd,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setSelectedProduct("");
    setSelectedVariant("");
    setQuantityToAdd(1);
    toast.success("Item added to order");
  };

  // Inline editing modal (mirrors create-order-form behavior)
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<{ itemId: string; field: string; currentValue: string | number; title: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

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

    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(editingValue);
      if (isNaN(numValue) || numValue <= 0) {
        toast.error(`Please enter a valid ${field === "quantity" ? "quantity" : "unit price"}`);
        return;
      }
      newValue = numValue;
    }

    setOrderItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const updated = { ...it } as OrderItem;
        if (field === "productName") updated.productName = newValue as string;
        if (field === "variantName") updated.variantName = newValue as string;
        if (field === "quantity") {
          updated.quantity = newValue as number;
          updated.totalPrice = updated.unitPrice * updated.quantity;
        }
        if (field === "unitPrice") {
          updated.unitPrice = newValue as number;
          updated.totalPrice = updated.unitPrice * updated.quantity;
        }
        if (field === "note") updated.note = newValue as string;
        return updated;
      })
    );

    cancelEditing();
    toast.success("Item updated successfully");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  if (!isOpen) return null;

  return (
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
                <h2 className="text-xl font-bold">Edit Order</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-white/80 text-sm">Update order details and save your changes.</p>
          </div>

          {/* Content */}
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
                    <Select
                      value={`${formData.supplier}`}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, supplier: value }));
                        if (errors.supplier) setErrors((prev) => ({ ...prev, supplier: undefined }));
                      }}
                    >
                      <SelectTrigger
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.supplier
                            ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                            : "border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store"
                        }`}
                      >
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.length ? (
                          suppliers.map((s) => (
                            <SelectItem key={`edit-order-supplier-${s.id}`} value={`${s.id}`} className="hover:bg-template-chart-store hover:text-white">
                              {s.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no_suppliers">
                            No available suppliers
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                      onChange={(e) => setFormData((p) => ({ ...p, orderDate: e.target.value }))}
                      className={`w-full px-4 py-2 border border-input rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.orderDate
                          ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store"
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
                      onChange={(e) => setFormData((p) => ({ ...p, expectedDeliveryDate: e.target.value }))}
                      className={`w-full px-4 py-2 border border-input rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.expectedDeliveryDate
                          ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store"
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

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <Select
                    disabled
                    value={formData.supply_status}
                    onValueChange={(v) => setFormData((p) => ({ ...p, supply_status: v }))}
                  >
                    <SelectTrigger className="w-full px-4 py-3 cursor-not-allowed border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Items Section */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Add Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Product</label>
                    <Select value={selectedProduct} onValueChange={(v) => { setSelectedProduct(v); setSelectedVariant(""); }}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.length ? (
                          products.map((p, idx) => (
                            <SelectItem key={`order-prd-variant-${idx}`} value={`${p.id}`}>{p.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no_products">No products</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Variant</label>
                    <Select value={selectedVariant} onValueChange={(v) => setSelectedVariant(v)} disabled={!selectedProductHasVariations}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder={selectedProductHasVariations ? "Select variant" : "No variants"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProductVariants?.length ? (
                          selectedProductVariants.map((v, idx) => (
                            <SelectItem key={`variant-prd-${idx}`} value={`${v.id}`}>
                              {v.attributes && v.attributes.length
                                ? v.attributes.map((a) => `${a.name}: ${a.value}`).join(" - ")
                                : v.sku}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no_variants">No variants</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Quantity</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button type="button" onClick={() => setQuantityToAdd((q) => Math.max(1, q - 1))} className="px-3 py-2 rounded border">-</button>
                      <input type="number" className="w-20 px-3 py-2 rounded border" value={quantityToAdd} min={1} onChange={(e) => setQuantityToAdd(Math.max(1, parseInt(e.target.value || "1")))} />
                      <button type="button" onClick={() => setQuantityToAdd((q) => q + 1)} className="px-3 py-2 rounded border">+</button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={addItemToOrder} className="w-full px-4 py-2 rounded-xl bg-template-primary text-white hover:bg-template-primary/90">Add Item</button>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              {orderItems.length > 0 && (
                <div className="mt-2">
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Product</th>
                          <th scope="col" className="px-6 py-3">Quantity Ordered</th>
                          <th scope="col" className="px-6 py-3">Unit Price</th>
                          <th scope="col" className="px-6 py-3">Subtotal</th>
                          <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => (
                          <tr key={`order-item-${item.id}`} className="bg-white border-b">
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
                                {!item.variantName && item.sku && (
                                  <div className="text-sm text-gray-500">{item.sku}</div>
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
                                  -
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
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded border-2 border-transparent hover:border-gray-200"
                                onClick={() => startEditing(item.id, 'unitPrice', item.unitPrice, 'Edit Unit Price')}
                              >
                                {item.unitPrice.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4">{item.totalPrice.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-template-primary text-white hover:bg-template-primary/90 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Editing Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h4 className="font-semibold mb-3">{editingItem.title}</h4>
            <input
              autoFocus
              className="w-full px-3 py-2 border rounded-lg"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded-lg border" onClick={cancelEditing}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-template-primary text-white" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditOrderForm;


