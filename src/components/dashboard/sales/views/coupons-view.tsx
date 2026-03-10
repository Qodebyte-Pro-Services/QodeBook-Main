"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Tag, Trash2, Edit } from 'lucide-react';
import { CouponResponseObj } from '@/models/types/shared/handlers-type';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface CouponsViewProps {
    coupons: CouponResponseObj[];
    isOpen: boolean;
    onClose: () => void;
    onSelectionChange?: (selectedIds: number[]) => void;
}

const CouponsView: React.FC<CouponsViewProps> = ({ coupons, isOpen, onClose, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const filteredCoupons = coupons.filter(coupon => coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelectAll = () => {
        const allIds = filteredCoupons.map(coupon => coupon.id);
        const newSelection = selectedIds.length === filteredCoupons.length ? [] : allIds;
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

    const isAllSelected = filteredCoupons.length > 0 && selectedIds.length === filteredCoupons.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredCoupons.length;

    const formatValue = (coupon: CouponResponseObj) => {
        if (typeof coupon.discount_percentage === 'string') {
            return `${coupon.discount_percentage}%`;
        }
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(Number(coupon.discount_amount));
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
                            <Tag className="text-green-600" size={24} />
                            <h2 className="text-xl font-semibold">Coupons</h2>
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
                                placeholder="Search coupons..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        {filteredCoupons.length > 0 && (
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
                                        <Button variant="destructive" size="sm" className="flex items-center gap-1 text-white cursor-pointer">
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
                        {filteredCoupons.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Tag size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No coupons found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCoupons.map((coupon) => (
                                    <div
                                        key={coupon.id}
                                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                                            selectedIds.includes(coupon.id)
                                                ? 'bg-green-50 border-green-200'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleSelectItem(coupon.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedIds.includes(coupon.id)}
                                                onCheckedChange={() => handleSelectItem(coupon.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex items-start justify-between flex-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-medium">{coupon.code || 'Unnamed Coupon'}</h3>
                                                    <Badge variant={new Date().getTime() > new Date(`${coupon.end_date}`).getTime() ? "destructive" : "default"}>
                                                        {new Date().getTime() > new Date(`${coupon.end_date}`).getTime() ? 'Inactive' : 'Active'}
                                                    </Badge>
                                                </div>
                                                {coupon.code && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
                                                    </p>
                                                )}
                                                {coupon.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                                                )}
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    {coupon.discount_percentage !== undefined && (
                                                        <span>Percentage Discount: {coupon.discount_percentage} %</span>
                                                    )}
                                                    {coupon.usage_limit && (
                                                        <span>Limit: {coupon.usage_limit}</span>
                                                    )}
                                                    {coupon.end_date && (
                                                        <span>Expires: {new Date(coupon.end_date).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-green-600">
                                                    {formatValue(coupon)}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    Coupon
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

export default CouponsView;
