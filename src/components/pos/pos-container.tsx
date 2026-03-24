/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import POSHeader from "./pos-header";
import ProductGrid from "./product-grid";
import CartSidebar from "./cart-sidebar";
import { usePOSLogic } from "@/hooks/use-pos-logic";
import { OrderConfirmation } from "@/components/dashboard/sales/ui";
import OrderInvoice from "@/components/dashboard/sales/invoice/OrderInvoice";
import OfflineSalesInvoice from "@/components/dashboard/sales/invoice/OfflineSalesInvoice";
import CustomerForm from "@/components/dashboard/customers/forms/add-customer-form";
import OrderSettingsModal from "./order-settings-modal";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DraftsModal from "./drafts-modal";
import { useViewTransaction } from "@/store/state/lib/pos-state-manager";
import PosStaffSalesTable from "../dashboard/tables/pos-staff-sale-table";
import PosStaffPendingSaleTable from "../dashboard/tables/pos-staff-pending-sale-table";
import Cookies from "js-cookie";
import { useStaffBusinessData, useUserBusinesses } from "@/hooks/useControllers";
// No icons needed for the completion modal anymore

const POSContainer: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showOrderSettings, setShowOrderSettings] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isDraftsOpen, setIsDraftsOpen] = useState(false);

    const { view } = useViewTransaction();

    const {
        businessId,
        selectedVariants,
        customers,
        selectedCustomer,
        storeType,
        subtotal,
        tax,
        total,
        discountAmount,
        couponAmount,
        showOrderConfirmation,
        setShowOrderConfirmation,
        pendingOrderData,
        invoiceData,
        setInvoiceData,
        offlineInvoiceData,
        setOfflineInvoiceData,
        drafts,
        pendingOrders,
        isOnline,
        handlers
    } = usePOSLogic();

    const isStaff = React.useMemo(() => {
        if (typeof window === "undefined") return false;
        return Cookies.get("authActiveUser")?.toLowerCase() === "staff";
    }, []);

    const { staffdata, isStaffSuccess, isStaffError } = useStaffBusinessData(isStaff, `${businessId}`);
    const { data: userBusinessesData, isSuccess: userBusinessSuccess, isError: userBusinessError } = useUserBusinesses();

    React.useEffect(() => {
        if (typeof window === "undefined" || !businessId) return;
        
        if (isStaff && isStaffSuccess && !isStaffError && staffdata?.business) {
            localStorage.setItem(`business_details_${businessId}`, JSON.stringify({
                name: staffdata.business.name,
                logo_url: staffdata.business.logo_url
            }));
        } else if (!isStaff && userBusinessSuccess && !userBusinessError && userBusinessesData?.businesses) {
            const business = userBusinessesData.businesses.find((b: {id: number | string; [key: string]: unknown}) => b.id === businessId) || userBusinessesData.businesses[0];
            if (business) {
                localStorage.setItem(`business_details_${businessId}`, JSON.stringify({
                    name: business.name,
                    logo_url: business.logo_url
                }));
            }
        }
    }, [isStaff, isStaffSuccess, isStaffError, staffdata, userBusinessSuccess, userBusinessError, userBusinessesData, businessId]);

    return (
        <AnimatePresence mode="wait">
            {view === "pos" ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={"pos-staff-container"}
                    transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 20 }}
                    className="flex flex-col h-screen overflow-hidden bg-gray-50">
                    <POSHeader
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        cartCount={selectedVariants.length}
                        onCartToggle={() => setIsCartOpen(true)}
                        isOnline={isOnline}
                    />

                    <div className="flex-1 flex overflow-hidden">
                        {/* Main Content: Product Grid */}
                        <ProductGrid
                            businessId={businessId}
                            searchQuery={searchQuery}
                            onAddToCart={handlers.handleSelectedVariant}
                        />

                        {/* Sidebar: Cart & Checkout (Desktop) */}
                        <div className="hidden lg:block">
                            <CartSidebar
                                items={selectedVariants as any}
                                customers={customers}
                                selectedCustomer={selectedCustomer}
                                storeType={storeType}
                                subtotal={subtotal}
                                tax={tax}
                                discount={discountAmount}
                                couponAmount={couponAmount}
                                total={total}
                                isSettingsOpen={isSettingsOpen}
                                setIsSettingsOpen={setIsSettingsOpen}
                                onUpdateQuantity={handlers.handleQuantityChange}
                                onRemoveItem={handlers.handleRemoveVariant}
                                onSetCustomer={handlers.setSelectedCustomer}
                                onSetStoreType={handlers.setStoreType}
                                onCheckout={handlers.handlePayNow}
                                onClearCart={handlers.clearCart}
                                onAddCustomer={() => {
                                    setShowCustomerForm(true);
                                    setIsSettingsOpen(false);
                                }}
                                onSaveDraft={handlers.handleSaveDraft}
                                onShowDrafts={() => setIsDraftsOpen(true)}
                            />
                        </div>

                        {/* Cart Drawer (Mobile/Tablet) */}
                        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                            <SheetContent side="right" className="p-0 border-none w-full sm:max-w-md">
                                <SheetHeader>
                                    <SheetTitle>Cart</SheetTitle>
                                </SheetHeader>
                                <CartSidebar
                                    items={selectedVariants as any}
                                    customers={customers}
                                    selectedCustomer={selectedCustomer}
                                    storeType={storeType}
                                    subtotal={subtotal}
                                    tax={tax}
                                    discount={discountAmount}
                                    couponAmount={couponAmount}
                                    total={total}
                                    isSettingsOpen={isSettingsOpen}
                                    setIsSettingsOpen={setIsSettingsOpen}
                                    onUpdateQuantity={handlers.handleQuantityChange}
                                    onRemoveItem={handlers.handleRemoveVariant}
                                    onSetCustomer={handlers.setSelectedCustomer}
                                    onSetStoreType={handlers.setStoreType}
                                    onCheckout={() => {
                                        handlers.handlePayNow();
                                        setIsCartOpen(false);
                                    }}
                                    onClearCart={handlers.clearCart}
                                    onAddCustomer={() => {
                                        setShowCustomerForm(true);
                                        setIsSettingsOpen(false);
                                        setIsCartOpen(false);
                                    }}
                                    onSaveDraft={handlers.handleSaveDraft}
                                    onShowDrafts={() => {
                                        setIsDraftsOpen(true);
                                        setIsCartOpen(false);
                                    }}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Modals */}
                    <AnimatePresence>
                        {showOrderSettings && (
                            <OrderSettingsModal
                                key="order-settings-modal"
                                isOpen={showOrderSettings}
                                onClose={() => setShowOrderSettings(false)}
                                customers={customers}
                                selectedCustomer={selectedCustomer}
                                storeType={storeType}
                                onSetCustomer={handlers.setSelectedCustomer}
                                onSetStoreType={handlers.setStoreType}
                                onAddCustomer={() => {
                                    setShowOrderSettings(false);
                                    setShowCustomerForm(true);
                                }}
                            />
                        )}

                        {showOrderConfirmation && pendingOrderData && (
                            <div key="order-confirmation-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <OrderConfirmation
                                    onClose={() => setShowOrderConfirmation(false)}
                                    onConfirm={handlers.handleConfirmOrder}
                                    orderData={{
                                        ...pendingOrderData,
                                        subtotal,
                                        taxes: tax,
                                        discount: discountAmount,
                                        coupon_amount: couponAmount,
                                        total: total,
                                        items: pendingOrderData.items.map(item => {
                                            const variant = selectedVariants.find(v => v.id === item.variant_id);
                                            return {
                                                ...item,
                                                sku: variant?.sku,
                                                image_url: variant?.image_url || []
                                            };
                                        })
                                    } as any}
                                />
                            </div>
                        )}

                        {invoiceData && (
                            <motion.div
                                key="online-invoice-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[110]"
                            >
                                <OrderInvoice orderData={invoiceData} onClose={() => setInvoiceData(null)} />
                            </motion.div>
                        )}

                        {offlineInvoiceData && (
                            <motion.div
                                key="offline-invoice-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[110]"
                            >
                                <OfflineSalesInvoice sale={offlineInvoiceData as any} onClose={() => setOfflineInvoiceData(null)} />
                            </motion.div>
                        )}

                        {showCustomerForm && (
                            <CustomerForm
                                key="customer-form-modal"
                                business_id={`${businessId}`}
                                handleFormClose={() => setShowCustomerForm(false)}
                            />
                        )}
                    </AnimatePresence>

                    <DraftsModal
                        isOpen={isDraftsOpen}
                        onClose={() => setIsDraftsOpen(false)}
                        drafts={drafts}
                        onLoadDraft={handlers.handleDraftSelected}
                        onDeleteDraft={handlers.handleDeleteDraft}
                    />
                </motion.div>
            ) : view === "sales" ? (
                <PosStaffSalesTable key="sales-history-view" />
            ) : (
                <PosStaffPendingSaleTable key="pending-orders-view" orders={pendingOrders} />
            )}
        </AnimatePresence>
    );
};

export default POSContainer;
