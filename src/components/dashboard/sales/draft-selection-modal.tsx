"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Package, 
    Loader2,
    User,
    ShoppingCart,
    Trash2,
    CheckCircle2,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { cartUtils } from "@/lib/storage-utils";

interface DraftItem {
    id: string;
    name: string;
    businessId: number;
    branchId: number;
    userId: number;
    createdAt: string;
    cart: unknown[];
    customer: unknown;
    storeType: string;
    matchedDiscounts: Map<number, unknown>;
    matchedTaxes: Map<number, unknown>;
    matchedCoupons: Map<number, unknown>;
    totals: {
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
    };
}

interface DraftSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: number;
    onDraftSelected: (draft: DraftItem) => void;
}

export function DraftSelectionModal({
    isOpen,
    onClose,
    businessId,
    onDraftSelected
}: DraftSelectionModalProps) {
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selectedDraft, setSelectedDraft] = useState<string | null>(null);

    const loadDrafts = useCallback(async () => {
        setIsLoading(true);
        try {
            const allDrafts = await cartUtils.getCartDrafts();
            const businessDrafts = allDrafts
                .filter((draft: DraftItem) => draft.businessId === businessId)
                .sort((a: DraftItem, b: DraftItem) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            setDrafts(businessDrafts);
        } catch (error) {
            console.error("Failed to load drafts:", error);
            toast.error("Failed to load drafts");
        } finally {
            setIsLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (isOpen) {
            loadDrafts();
        }
    }, [isOpen, businessId, loadDrafts]);

    const handleDraftSelect = (draftId: string) => {
        setSelectedDraft(selectedDraft === draftId ? null : draftId);
    };

    const handleLoadDraft = () => {
        if (!selectedDraft) {
            toast.error("Please select a draft to load");
            return;
        }
        
        const draft = drafts.find(d => d.id === selectedDraft);
        if (draft) {
            const preparedDraft = {
                ...draft,
                matchedDiscounts: draft.matchedDiscounts instanceof Map 
                    ? draft.matchedDiscounts 
                    : new Map(Object.entries(draft.matchedDiscounts || {}).map(([k, v]) => [Number(k), v])),
                matchedTaxes: draft.matchedTaxes instanceof Map 
                    ? draft.matchedTaxes 
                    : new Map(Object.entries(draft.matchedTaxes || {}).map(([k, v]) => [Number(k), v])),
                matchedCoupons: draft.matchedCoupons instanceof Map 
                    ? draft.matchedCoupons 
                    : new Map(Object.entries(draft.matchedCoupons || {}).map(([k, v]) => [Number(k), v]))
            };
            
            onDraftSelected(preparedDraft);
            onClose();
        }
    };

    const handleDeleteDraft = async (draftId: string) => {
        setIsDeleting(draftId);
        try {
            const success = await cartUtils.deleteCartDraft(draftId);
            if (success) {
                toast.success("Draft deleted successfully");
                await loadDrafts();
            } else {
                toast.error("Failed to delete draft");
            }
        } catch (error) {
            console.error("Failed to delete draft:", error);
            toast.error("Failed to delete draft");
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getItemCount = (cart: unknown[]) => {
        return cart.reduce((total: number, item: unknown) => {
            const cartItem = item as { quantity?: number };
            return total + (cartItem.quantity || 0);
        }, 0);
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
                        <div className="relative h-24 bg-gradient-to-r from-green-500 to-green-600">
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="relative h-full flex items-center justify-between px-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Package className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Select Draft</h2>
                                        <p className="text-white/80 text-sm mt-1">
                                            Choose a draft to load into your cart
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
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        {drafts.length} draft{drafts.length !== 1 ? 's' : ''} available
                                    </div>
                                    {selectedDraft && (
                                        <button
                                            onClick={handleLoadDraft}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            Load Selected Draft
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                                        <p className="text-gray-500">Loading drafts...</p>
                                    </div>
                                ) : drafts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <Package className="h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium">No drafts found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Save some items to create your first draft
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {drafts.map((draft) => {
                                            const isSelected = selectedDraft === draft.id;
                                            const isDeletingDraft = isDeleting === draft.id;
                                            
                                            return (
                                                <motion.div
                                                    key={draft.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => handleDraftSelect(draft.id)}
                                                    className={cn(
                                                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                                        isSelected 
                                                            ? "border-green-500 bg-green-50" 
                                                            : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                                                    )}
                                                >
                                                    {/* Selection Indicator */}
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        </div>
                                                    )}

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDraft(draft.id);
                                                        }}
                                                        disabled={isDeletingDraft}
                                                        className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                                                        title="Delete Draft"
                                                    >
                                                        {isDeletingDraft ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3" />
                                                        )}
                                                    </button>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                                {draft.name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>{formatDate(draft.createdAt)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <ShoppingCart className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">
                                                                    {getItemCount(draft.cart)} items
                                                                </span>
                                                            </div>

                                                            {draft.customer && String(draft.customer) !== 'walk-in' ? (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-600">
                                                                        Customer: {String(draft.customer)}
                                                                    </span>
                                                                </div>
                                                            ) : null}

                                                            {draft.storeType && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Package className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-600">
                                                                        Type: {draft.storeType}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Totals */}
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>Subtotal:</span>
                                                                    <span>₦{draft.totals.subtotal.toFixed(2)}</span>
                                                                </div>
                                                                {draft.totals.discount > 0 && (
                                                                    <div className="flex justify-between text-green-600">
                                                                        <span>Discount:</span>
                                                                        <span>-₦{draft.totals.discount.toFixed(2)}</span>
                                                                    </div>
                                                                )}
                                                                {draft.totals.tax > 0 && (
                                                                    <div className="flex justify-between text-red-600">
                                                                        <span>Tax:</span>
                                                                        <span>₦{draft.totals.tax.toFixed(2)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between font-semibold text-gray-900 border-t pt-1">
                                                                    <span>Total:</span>
                                                                    <span>₦{draft.totals.total.toFixed(2)}</span>
                                                                </div>
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
                                    <div className="text-sm text-gray-600">
                                        Click on a draft to select it, then click &quot;Load Selected Draft&quot;
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedDraft ? "1 selected" : "0 selected"}
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

