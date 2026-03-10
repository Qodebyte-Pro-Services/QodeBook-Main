"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calculator, Trash2, Edit } from 'lucide-react';
import { TaxesResponseObj } from '@/models/types/shared/handlers-type';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface TaxesViewProps {
    taxes: TaxesResponseObj[];
    isOpen: boolean;
    onClose: () => void;
    onSelectionChange?: (selectedIds: number[]) => void;
}

const TaxesView: React.FC<TaxesViewProps> = ({ taxes, isOpen, onClose, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const filteredTaxes = taxes.filter(tax =>
        tax.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tax.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = () => {
        const allIds = filteredTaxes.map(tax => tax.id);
        const newSelection = selectedIds.length === filteredTaxes.length ? [] : allIds;
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

    const isAllSelected = filteredTaxes.length > 0 && selectedIds.length === filteredTaxes.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredTaxes.length;

    const formatRate = (tax: TaxesResponseObj) => {
        if (tax.type === 'percentage') {
            return `${tax.rate}%`;
        }
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN"
        }).format(Number(tax.rate));
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
                            <Calculator className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold">Taxes</h2>
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
                                placeholder="Search taxes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        {filteredTaxes.length > 0 && (
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
                        {filteredTaxes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No taxes found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTaxes.map((tax) => (
                                    <div
                                        key={tax.id}
                                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                                            selectedIds.includes(tax.id)
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleSelectItem(tax.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedIds.includes(tax.id)}
                                                onCheckedChange={() => handleSelectItem(tax.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex items-start justify-between flex-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-medium">{tax.name || 'Unnamed Tax'}</h3>
                                                    <Badge variant="default">
                                                        Active
                                                    </Badge>
                                                </div>
                                                {tax.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{tax.description}</p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Created: {new Date(tax.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-blue-600">
                                                    {formatRate(tax)}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {tax.type}
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

export default TaxesView;
