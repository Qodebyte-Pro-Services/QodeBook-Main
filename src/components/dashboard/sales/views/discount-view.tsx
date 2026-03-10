"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Percent, Tag, Trash2, Edit } from 'lucide-react';
import { DiscountResponseObj } from '@/models/types/shared/handlers-type';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface DiscountViewProps {
    discounts: DiscountResponseObj[];
    isOpen: boolean;
    onClose: () => void;
    onSelectionChange?: (selectedIds: number[]) => void;
}

const DiscountView: React.FC<DiscountViewProps> = ({ discounts, isOpen, onClose, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const filteredDiscounts = discounts.filter(discount =>
        discount.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = () => {
        const allIds = filteredDiscounts.map(discount => discount.id);
        const newSelection = selectedIds.length === filteredDiscounts.length ? [] : allIds;
        setSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    const handleSelectItem = (id: number) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id];
        setSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    const isAllSelected = filteredDiscounts.length > 0 && selectedIds.length === filteredDiscounts.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredDiscounts.length;

    const formatValue = (discount: DiscountResponseObj) => {
        if (typeof discount.percentage === 'string') {
            return `${discount.percentage}%`;
        }
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(Number(discount.percentage));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center gap-3">
                            <Percent className="text-template-primary" size={24} />
                            <h2 className="text-xl font-semibold">Discounts</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search and Selection Controls */}
                    <div className="p-6 border-b space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                placeholder="Search discounts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        {filteredDiscounts.length > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        className={isIndeterminate ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""}
                                    />
                                    <span className="text-sm text-gray-600">
                                        {selectedIds.length === 0 ? 'Select all' : `${selectedIds.length} selected`}
                                    </span>
                                </div>
                                
                                {selectedIds.length > 0 && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                            <Edit size={14} />
                                            Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" className="flex items-center gap-1">
                                            <Trash2 size={14} />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {filteredDiscounts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Percent size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No discounts found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredDiscounts.map((discount) => (
                                    <div
                                        key={discount.id}
                                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                                            selectedIds.includes(discount.id)
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleSelectItem(discount.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedIds.includes(discount.id)}
                                                onCheckedChange={() => handleSelectItem(discount.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex items-start justify-between flex-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-medium">{discount.name || 'Unnamed Discount'}</h3>
                                                    <Badge variant={new Date().getTime() > new Date(`${discount.end_date}`).getTime() ? "destructive" : "default"}>
                                                        {new Date().getTime() > new Date(`${discount.end_date}`).getTime() ? 'Expired' : 'Active'}
                                                    </Badge>
                                                </div>
                                                {discount.amount && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Amount: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(discount.amount))}</span>
                                                    </p>
                                                )}
                                                {discount.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{discount.description}</p>
                                                )}
                                                {discount.end_date && (
                                                    <p className="text-xs text-gray-500">
                                                        Expires: {new Date(discount.end_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-template-primary">
                                                    {formatValue(discount)}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {discount.name}
                                                </div>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DiscountView;
