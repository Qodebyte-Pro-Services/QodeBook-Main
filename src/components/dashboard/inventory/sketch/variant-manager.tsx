import React, { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RxCross2 } from 'react-icons/rx';
import { Edit2 } from 'lucide-react';
import EditAttributes from '../forms/edit-attribute-comp';
import { ProductAttributeProp } from '@/models/types/shared/project-type';

// Type definitions
interface VariantOption {
    name: string;
    values: string[];
    type: 'text' | 'number' | 'color' | 'range' | 'dropdown';
    isCustom: boolean;
    immutable: boolean;
}

interface BaseOption {
    name: string;
    type: 'text' | 'number' | 'color' | 'range' | 'dropdown';
    values?: string[];
    immutable?: boolean;
    id?: number;
    business_id?: number;
}

interface VariantManagerProps {
    options: VariantOption[];
    setOptions: React.Dispatch<React.SetStateAction<VariantOption[]>>;
    baseOptions: BaseOption[];
    attributes?: (ProductAttributeProp | BaseOption)[];
    businessId?: number;
    onAttributesUpdated?: () => void;
}

export default function VariantManager({
    options,
    setOptions,
    baseOptions,
    attributes,
    businessId = 0,
    onAttributesUpdated,
}: VariantManagerProps) {
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
    const [isEditAttributesOpen, setIsEditAttributesOpen] = useState<boolean>(false);
    const [editingOptionName, setEditingOptionName] = useState<string | null>(null);
    const [customOptionName, setCustomOptionName] = useState<string>('');
    const [inputValue, setInputValue] = useState<Record<string, string>>({});

    const updateOption = (optionName: string, updates: Partial<VariantOption>) => {
        const newOptions = options.map(opt =>
            opt.name === optionName ? { ...opt, ...updates } : opt
        );
        setOptions(newOptions);
    };

    const handleInputTypeChange = (optionName: string, type: VariantOption['type']) => {
        updateOption(optionName, { type });
    };

    const handleAddValue = (optionName: string, value: string) => {
        if (!value?.trim()) return;
        const option = options.find(opt => opt.name === optionName);
        if (option && !option.values.includes(value.trim())) {
            updateOption(optionName, { values: [...option.values, value.trim()] });
        }
        setInputValue(prev => ({ ...prev, [optionName]: '' }));
    };

    const handleRemoveValue = (optionName: string, valueToRemove: string) => {
        const option = options.find(opt => opt.name === optionName);
        if (option) {
            const newValues = option.values.filter(v => v !== valueToRemove);
            updateOption(optionName, { values: newValues });
        }
    };

    const handleAddOption = (optionName: string) => {
        if (optionName === 'add_custom') {
            setIsAlertOpen(true);
            return;
        }
        const baseOpt = baseOptions.find(opt => opt.name === optionName);
        if (!baseOpt) return;

        const newOption: VariantOption = {
            name: baseOpt.name,
            type: baseOpt.type,
            values: [...(baseOpt.values || [])], // Ensure values are copied to prefill all as chips
            isCustom: false,
            immutable: baseOpt.immutable || false, // Add the required immutable property
        };
        setOptions([...options, newOption]);
    };

    const handleConfirmCustomOption = () => {
        if (customOptionName.trim() && !options.some(opt => opt.name === customOptionName.trim())) {
            const newOption: VariantOption = {
                name: customOptionName.trim(),
                values: [],
                type: 'text',
                isCustom: true,
                immutable: false,
            };
            setOptions([...options, newOption]);
            setCustomOptionName('');
            setIsAlertOpen(false);
        }
    };

    const handleRemoveOption = (optionName: string) => {
        setOptions(options.filter(opt => opt.name !== optionName));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, optionName: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddValue(optionName, inputValue[optionName] || '');
        }
    };

    const renderInputForType = (option: VariantOption) => {
        const baseOpt = baseOptions.find(bo => bo.name === option.name);

        if (option.type === 'dropdown' && baseOpt?.values) {
            return (
                <Select onValueChange={(value: string) => handleAddValue(option.name, value)} value="">
                    <SelectTrigger className="w-[70%] border-0 shadow-none border-r rounded-none">
                        <SelectValue placeholder={`Select a ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {baseOpt.values.map((val: string) => (
                            <SelectItem key={val} value={val} disabled={option.values.includes(val)}>
                                {val}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        return (
            <div className="flex items-center w-[70%] border-r">
                <Input
                    type={option.type === 'color' ? 'color' : (option.type === 'number' || option.type === 'range' ? 'number' : 'text')}
                    value={inputValue[option.name] || ''}
                    onChange={(e) => setInputValue({ ...inputValue, [option.name]: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, option.name)}
                    placeholder="Add value"
                    className={`flex-grow border-0 shadow-none rounded-none ${option.type === 'color' ? 'h-10 p-1' : ''}`}
                />
                <Button
                    type="button"
                    onClick={() => handleAddValue(option.name, inputValue[option.name] || '')}
                    className="h-full rounded-none bg-transparent text-primary hover:bg-primary/10 px-3"
                    disabled={!inputValue[option.name]?.trim()}
                >
                    Add
                </Button>
            </div>
        );
    };

    const availableOptions = baseOptions.filter(bo => !options.some(opt => opt.name === bo.name));

    return (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-semibold">Variants</h3>
            <p className="text-sm text-gray-600">
                Add or create variations for your product. e.g., Size, Color.
            </p>

            <div className="flex items-center gap-2">
                <Select onValueChange={handleAddOption} value="">
                    <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Add a variant option" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableOptions.map((opt: BaseOption) => (
                            <SelectItem key={opt.name} value={opt.name}>{opt.name}</SelectItem>
                        ))}
                        <SelectItem value="add_custom">Create new...</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                {options.map((option: VariantOption) => (
                    <div key={option.name} className="p-3 border rounded-md bg-gray-50/80 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium">{option.name}</h4>
                            <div className="flex items-center gap-2">
                                {!option.immutable && attributes && attributes.length > 0 && businessId && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => {
                                            setEditingOptionName(option.name);
                                            setIsEditAttributesOpen(true);
                                        }}
                                        className="h-7 w-7 text-blue-600 hover:text-blue-700"
                                        title="Edit attribute values"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(option.name)} className="h-7 w-7">
                                    <RxCross2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[28px]">
                            {option.values.map((value: string) => (
                                <div key={value} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                                    {option.type === 'color' && (
                                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: value }}></span>
                                    )}
                                    <span>{value}</span>
                                    <button onClick={() => handleRemoveValue(option.name, value)}>
                                        <RxCross2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center w-full border shadow-sm rounded-md overflow-x-hidden">
                            {renderInputForType(option)}
                            <Select
                                value={option.type}
                                onValueChange={(type: VariantOption['type']) => handleInputTypeChange(option.name, type)}
                                disabled={option.immutable}
                            >
                                <SelectTrigger className="w-[30%] flex justify-center border-0 shadow-none bg-transparent">
                                    <span className="text-xs capitalize">{option.type}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    {option.name === 'Color' ? (
                                        <>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="color">Color</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="color">Color</SelectItem>
                                            <SelectItem value="range">Range</SelectItem>
                                        </>
                                    )}
                                    {!option.isCustom && (
                                        <SelectItem value="dropdown">Dropdown</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add Custom Variant</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter the name for your new variant option (e.g., Material, Style).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        type="text"
                        value={customOptionName}
                        onChange={(e) => setCustomOptionName(e.target.value)}
                        placeholder="Variant name"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmCustomOption}>Add</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {attributes && businessId && (
                <EditAttributes
                    businessId={businessId}
                    attributes={attributes}
                    editingOptionName={editingOptionName}
                    isOpen={isEditAttributesOpen}
                    handleClose={() => {
                        setIsEditAttributesOpen(false);
                        setEditingOptionName(null);
                    }}
                    onAttributeUpdated={onAttributesUpdated}
                />
            )}
        </div>
    );
}