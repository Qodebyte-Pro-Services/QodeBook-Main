/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Switch } from "@/components/ui/switch";
import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useRef, useState, useCallback } from "react";
import { LiaTimesSolid } from "react-icons/lia";
import { FiUpload, FiX} from "react-icons/fi";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useAddProductHandler } from "@/hooks/useHandlers";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getProductAttributes, getProductCategories } from "@/api/controllers/get/handler";
import {  ProductAttributeProp } from "@/models/types/shared/project-type";
import { CategoryPayload } from "@/models/types/shared/handlers-type";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface ProductVariant {
  id: string;
  sku: string;
  price: string;
  quantity: string;
  attribute: string;
  value: string;
  image: File | null;
  imagePreview: string;
  isSelected: boolean;
}

interface VariantTableProps {
  variants: ProductVariant[];
  onVariantChange: (id: string, field: keyof ProductVariant, value: any) => void;
  onImageChange: (id: string, file: File | null) => void;
  onRemoveVariant: (id: string) => void;
}

const VariantTable = ({ variants, onVariantChange, onImageChange, onRemoveVariant }: VariantTableProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onImageChange(id, file);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table className="min-w-[550px]">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16 px-4 py-3">
              <Checkbox 
                className="h-4 w-4"
                checked={variants.length > 0 && variants.every(v => v.isSelected)}
                onCheckedChange={(checked) => {
                  variants.forEach(variant => {
                    onVariantChange(variant.id, 'isSelected', checked);
                  });
                }}
              />
            </TableHead>
            <TableHead className="px-4 py-3 min-w-[180px]">SKU</TableHead>
            <TableHead className="px-4 py-3 min-w-[180px]">Attribute</TableHead>
            <TableHead className="px-4 py-3 min-w-[180px]">Value</TableHead>
            <TableHead className="px-4 py-3 min-w-[150px]">Price</TableHead>
            <TableHead className="px-4 py-3 min-w-[150px]">Quantity</TableHead>
            <TableHead className="px-4 py-3 min-w-[200px]">Image</TableHead>
            <TableHead className="px-4 py-3 w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                No variants added yet
              </TableCell>
            </TableRow>
          ) : (
            variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <Checkbox 
                    checked={variant.isSelected}
                    onCheckedChange={(checked) => 
                      onVariantChange(variant.id, 'isSelected', checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={variant.sku}
                    onChange={(e) => onVariantChange(variant.id, 'sku', e.target.value)}
                    className="h-9 w-full"
                    placeholder="SKU-001"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={variant.attribute}
                    onChange={(e) => onVariantChange(variant.id, 'attribute', e.target.value)}
                    className="h-9 w-full"
                    placeholder="e.g., Color"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={variant.value}
                    onChange={(e) => onVariantChange(variant.id, 'value', e.target.value)}
                    className="h-9 w-full"
                    placeholder="e.g., Red"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) => onVariantChange(variant.id, 'price', e.target.value)}
                    className="h-9 w-full"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={variant.quantity}
                    onChange={(e) => onVariantChange(variant.id, 'quantity', e.target.value)}
                    className="h-9 w-full"
                    placeholder="0"
                    min="0"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {variant.imagePreview ? (
                      <div className="relative">
                        <Image
                          height={100}
                          width={100} 
                          src={variant.imagePreview} 
                          alt="Variant preview" 
                          className="h-10 w-10 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => onImageChange(variant.id, null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="border border-dashed border-gray-300 rounded p-1 text-xs text-gray-500 hover:bg-gray-50">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, variant.id)}
                          />
                        </div>
                      </label>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveVariant(variant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// interface FileWithPreview extends File {
//     preview: string;
// }

interface SelectedFile extends File {
    preview?: string;
}

interface FormData {
    productName: string;
    category: string;
    brand: string;
    isTaxable: boolean;
    unitType: string;
    hasVariations: boolean;
    description: string;
}

interface FormErrors {
    productName?: string;
    category?: string;
    brand?: string;
    unitType?: string;
    description?: string;
    hasVariations?: string;
    productImage?: string;
}

const VariantModal = ({ 
  isOpen, 
  onClose, 
  variants, 
  onVariantChange, 
  onImageChange, 
  onRemoveVariant,
  onAddVariant,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  onVariantChange: (id: string, field: keyof ProductVariant, value: any) => void;
  onImageChange: (id: string, file: File | null) => void;
  onRemoveVariant: (id: string) => void;
  onAddVariant: () => void;
  onSave: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="w-[100%] max-w-[1800px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold">Manage Product Variants</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Product Variants</h3>
            <Button 
              type="button" 
              size="sm"
              onClick={onAddVariant}
            >
              Add Variant
            </Button>
          </div>
          
          <VariantTable 
            variants={variants}
            onVariantChange={onVariantChange}
            onImageChange={onImageChange}
            onRemoveVariant={onRemoveVariant}
          />
        </div>
        
        <DialogFooter className="mt-6 elf">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={onSave}
            disabled={variants.length === 0}
          >
            Save Variants
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddProductForm = ({business_id, handleFormClose }: {business_id: number; handleFormClose: () => void }) => {
    const { hiddenScrollbar } = useCustomStyles();
    
    // State for variant modal and variants
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [variants, setVariants] = useState<ProductVariant[]>([]);

    const generateVariantId = () => Math.random().toString(36).substr(2, 9);

    const handleAddVariant = () => {
        const newVariant: ProductVariant = {
            id: generateVariantId(),
            sku: '',
            price: '',
            quantity: '1',
            attribute: '',
            value: '',
            image: null,
            imagePreview: '',
            isSelected: false
        };
        setVariants(prev => [...prev, newVariant]);
    };

    const handleVariantChange = (id: string, field: keyof ProductVariant, value: any) => {
        setVariants(prev => 
            prev.map(variant => 
                variant.id === id ? { ...variant, [field]: value } : variant
            )
        );
    };

    const handleImageChange = (id: string, file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVariants(prev => 
                    prev.map(variant => 
                        variant.id === id 
                            ? { 
                                ...variant, 
                                image: file, 
                                imagePreview: reader.result as string 
                            } 
                            : variant
                    )
                );
            };
            reader.readAsDataURL(file);
        } else {
            setVariants(prev => 
                prev.map(variant => 
                    variant.id === id 
                        ? { ...variant, image: null, imagePreview: '' } 
                        : variant
                )
            );
        }
    };

    const handleRemoveVariant = (id: string) => {
        setVariants(prev => prev.filter(variant => variant.id !== id));
    };

    const handleSaveVariants = () => {
        // Here you can add validation or transformation before saving
        setIsVariantModalOpen(false);
    };

    const [formData, setFormData] = useState<FormData>({
        productName: '',
        category: '',
        brand: '',
        isTaxable: false,
        unitType: '',
        hasVariations: false,
        description: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const uploadController = useRef<AbortController | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [shouldFetchAttributes, setShouldFetchAttributes] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<number, boolean>>({});

    const { data: productAttributes = { attributes: [] }, isLoading: isLoadingAttributes } = useQuery<{ attributes: ProductAttributeProp[] }>({
        queryKey: ['get-attributes', business_id],
        queryFn: async () => {
            if (!shouldFetchAttributes) return { attributes: [] };
            try {
                const response = await getProductAttributes(business_id);
                return {
                    attributes: [{
                        id: response.id,
                        business_id: response.business_id,
                        name: response.name,
                        created_at: response.created_at,
                        updated_at: response.updated_at,
                        values: response.values
                    }]
                };
            } catch (error) {
                console.error('Error fetching product attributes:', error);
                toast.error('Failed to fetch product attributes');
                return { attributes: [] };
            }
        },
        enabled: shouldFetchAttributes
    });

    const {data: productCategories = { categories: [] }, isLoading: isLoadingCategories} = useQuery<{categories: CategoryPayload[]}>({
        queryKey: ['get-categories', business_id],
        queryFn: async () => await getProductCategories(business_id),
        enabled: typeof business_id !== "undefined",
    });

    const handleProductAttributes = (checked: boolean) => {
        setShouldFetchAttributes(checked);
        if (!checked) {
            setSelectedAttributes({});
        }
    };

    const handleAttributeToggle = (attributeId: number, isChecked: boolean) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeId]: isChecked
        }));
    };

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'productName':
                return !value.trim() ? 'Product name is required' : '';
            case 'category':
                return !value ? 'Please select a category' : '';
            case 'brand':
                return !value.trim() ? 'Brand is required' : '';
            case 'unitType':
                return !value ? 'Please select a unit type' : '';
            case 'description':
                if (!value.trim()) return 'Description is required';
                if (value.trim().length < 10) return 'Description should be at least 10 characters';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        console.log(value);
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            if (key !== 'isTaxable') {
                const error = validateField(key, formData[key as keyof FormData]);
                if (error) {
                    newErrors[key as keyof FormErrors] = error;
                    isValid = false;
                }
            }
        });

        // if (!selectedFile) {
        //     newErrors.productImage = 'Product image is required';
        //     isValid = false;
        // }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fill in all required fields correctly');
            return;
        }

        setIsSubmitting(true);
        console.log('Form submitted:', { ...formData, image: selectedFile });
        setFormData({
            productName: '',
            category: '',
            brand: '',
            isTaxable: false,
            unitType: '',
            hasVariations: false,
            description: '',
        });
        setSelectedFile(null);
        setIsSubmitting(false);
        toast.success('Product added successfully!');
        handleFormClose();
    };

    useEffect(() => {
        return () => {
            if (selectedFile?.preview) {
                URL.revokeObjectURL(selectedFile.preview);
            }
        };
    }, [selectedFile]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.info('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file)
            });

            setSelectedFile(fileWithPreview);
            setUploadProgress(0);
        }
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];

            if (!file.type.startsWith('image/')) {
                toast.info('Please select an image file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should be less than 10MB');
                return;
            }
            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file)
            });

            setSelectedFile(fileWithPreview);
            setUploadProgress(0);
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        uploadController.current = new AbortController();

        try {
            const totalSteps = 50;
            let currentStep = 0;

            const uploadInterval = setInterval(() => {
                if (currentStep >= totalSteps) {
                    clearInterval(uploadInterval);
                    setIsUploading(false);
                    
                    console.log('Upload complete:', selectedFile);
                    return;
                }

                currentStep++;
                const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
                setUploadProgress(progress);

            }, 50);

            return () => clearInterval(uploadInterval);

        } catch (error) {
            console.error('Upload failed:', error);
            setIsUploading(false);
            toast.error('Upload failed. Please try again.');
        }
    }, [selectedFile]);

    const handleCancelUpload = useCallback(() => {
        if (uploadController.current) {
            uploadController.current.abort();
            uploadController.current = null;
        }
        setIsUploading(false);
        setUploadProgress(0);
    }, []);

    const containerVariant = {
        from: {
            scale: 0.1,
            opacity: 0,
            top: -100
        },
        to: {
            scale: 1,
            opacity: 1,
            top: 0
        },
        go: {
            scale: 0.1,
            opacity: 0,
            top: -100
        }
    }
    return(
        <AnimatePresence mode="wait">
            <motion.div 
                variants={containerVariant} 
                initial="from" 
                animate="to" 
                exit="go" 
                className="w-[90%] md:w-[45%] h-full bg-white fixed z-50 right-0 top-[5%] rounded-l-lg p-8 shadow-[0px_0px_0px_100vmax_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
            >
                <div className="flex flex-col gap-y-8">
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-[24px] font-[600]">Add New Product</div>
                            <div className="h-8 w-8 rounded-full bg-slate-100/40 flex justify-center items-center">
                                <LiaTimesSolid size={20} onClick={handleFormClose}/>
                            </div>
                        </div>
                        <div className="text-sm font-[550] text-gray-500">Use this option to create and add a new item to your list or database. Make sure to fill in all required fields.</div>
                    </div>
                    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-auto" style={hiddenScrollbar}>
                        <div className="h-fit">
                            <div className="flex flex-col gap-y-4">
                                <div className="flex flex-col gap-y-1">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="productName" className="text-sm font-medium text-gray-700">Product Name</label>
                                        {errors.productName && <span className="text-red-500 text-xs">{errors.productName}</span>}
                                    </div>
                                    <input 
                                        id="productName"
                                        name="productName"
                                        type="text" 
                                        value={formData.productName}
                                        onChange={handleInputChange}
                                        className={`py-2 pl-4 pr-3 w-full border rounded-sm focus:outline-none ${
                                            errors.productName ? 'border-red-500' : 'border-gray-300 focus:border-template-primary focus:ring-1 focus:ring-template-primary/50'
                                        }`} 
                                        placeholder="Enter product name" 
                                    />
                                </div>

                                <div className="flex flex-col gap-y-1">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                                        {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
                                    </div>
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(value) => {
                                            if (value === "loading" || value === "no-categories") return;
                                            handleSelectChange('category', value);
                                        }}
                                    >
                                        <SelectTrigger className={`py-2 pl-4 pr-3 w-full border rounded-sm focus:outline-none ${
                                            errors.category ? 'border-red-500' : 'border-gray-300 focus:border-template-primary focus:ring-1 focus:ring-template-primary/50'
                                        }`}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        {isLoadingCategories ? (
                                            <SelectContent>
                                                <SelectItem value="loading" disabled className="text-sm font-medium text-gray-500">
                                                    Loading categories...
                                                </SelectItem>
                                            </SelectContent>
                                        ) : productCategories?.categories?.length ? (
                                            <SelectContent>
                                                {productCategories.categories.map((category: CategoryPayload) => (
                                                    <SelectItem key={category.id} value={category.name}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        ) : (
                                            <SelectContent>
                                                <SelectItem value="no-categories" disabled className="text-sm font-medium text-gray-500">
                                                    No categories found
                                                </SelectItem>
                                            </SelectContent>
                                        )}
                                    </Select>                                    
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</label>
                                        {errors.brand && <span className="text-red-500 text-xs">{errors.brand}</span>}
                                    </div>
                                    <input 
                                        id="brand"
                                        name="brand"
                                        type="text" 
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className={`py-2 pl-4 pr-3 w-full border rounded-sm focus:outline-none ${
                                            errors.brand ? 'border-red-500' : 'border-gray-300 focus:border-template-primary focus:ring-1 focus:ring-template-primary/50'
                                        }`} 
                                        placeholder="Enter brand name" 
                                    />
                                </div>

                                <div className="flex flex-col gap-y-1">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="isTaxable" className="text-sm font-medium text-gray-700">Taxable</label>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch 
                                            id="isTaxable"
                                            checked={formData.isTaxable}
                                            data-state={formData.isTaxable ? "checked" : "unchecked"}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTaxable: checked }))}
                                            className="data-[state=checked]:bg-template-primary/30"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            {formData.isTaxable ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="isVariation" className="text-sm font-medium text-gray-700">Has Variations</label>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            id="isVariation"
                                            checked={formData.hasVariations}
                                            data-state={formData.hasVariations ? "checked" : "unchecked"}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({ ...prev, hasVariations: checked }));
                                                handleProductAttributes(checked);
                                            }}
                                            className="data-[state=checked]:bg-template-primary/30"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            {formData.hasVariations ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <AnimatePresence>
                                        {formData.hasVariations && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-full mt-4 space-y-4 overflow-hidden"
                                            >
                                                {isLoadingAttributes ? (
                                                    <div className="text-sm text-gray-500">Loading attributes...</div>
                                                ) : productAttributes.attributes.length > 0 ? (
                                                    <div className="space-y-3 w-full">
                                                        <p className="text-sm font-medium text-gray-700">Select Attributes:</p>
                                                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {productAttributes?.attributes?.map((attribute: ProductAttributeProp) => (
                                                                <motion.div 
                                                                    key={attribute.id}
                                                                    className={`w-full p-3 rounded-lg border transition-colors duration-200 ${
                                                                        selectedAttributes[attribute.id] 
                                                                            ? 'border-template-primary/50 bg-template-primary/2' 
                                                                            : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                    whileHover={{ scale: 1.01 }}
                                                                    whileTap={{ scale: 0.99 }}
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <Checkbox 
                                                                            id={`attr-${attribute?.id}`}
                                                                            checked={!!selectedAttributes[attribute?.id]}
                                                                            onCheckedChange={(checked) => 
                                                                                handleAttributeToggle(attribute?.id, checked as boolean)
                                                                            }
                                                                            className="h-4 w-4 rounded border-gray-300 text-template-primary focus:ring-template-primary"
                                                                        />
                                                                        <label 
                                                                            htmlFor={`attr-${attribute?.id}`}
                                                                            className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                                                                        >
                                                                            {attribute?.name}
                                                                        </label>
                                                                    </div>
                                                                    {selectedAttributes[attribute?.id] && attribute?.values?.length > 0 && (
                                                                        <motion.div 
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            className="mt-2 pl-7 space-y-2"
                                                                        >
                                                                            <p className="text-xs text-gray-500">Values:</p>
                                                                            <div className="space-y-1">
                                                                                {attribute?.values.map(value => (
                                                                                    <div key={value.id} className="flex items-center">
                                                                                        <span className="text-sm text-gray-600">{value.value}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500">
                                                        No attributes found. Please add attributes first.
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex flex-col gap-y-1">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="unitType" className="text-sm font-medium text-gray-700">Unit Type</label>
                                        {errors.unitType && <span className="text-red-500 text-xs">{errors.unitType}</span>}
                                    </div>
                                    <Select 
                                        value={formData.unitType} 
                                        onValueChange={(value) => handleSelectChange('unitType', value)}
                                    >
                                        <SelectTrigger className={`py-2 pl-4 pr-3 w-full border rounded-sm focus:outline-none ${
                                            errors.unitType ? 'border-red-500' : 'border-gray-300 focus:border-template-primary focus:ring-1 focus:ring-template-primary/50'
                                        }`}>
                                            <SelectValue placeholder="Select unit type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pieces">Pieces</SelectItem>
                                            <SelectItem value="liters">Liters</SelectItem>
                                            <SelectItem value="kilograms">Kilograms</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-y-1">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                                        {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                                    </div>
                                    <textarea 
                                        id="description"
                                        name="description"
                                        rows={5} 
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`py-2 pl-4 pr-3 resize-y w-full border rounded-sm focus:outline-none ${
                                            errors.description ? 'border-red-500' : 'border-gray-300 focus:border-template-primary focus:ring-1 focus:ring-template-primary/50'
                                        }`} 
                                        placeholder="Enter product description (minimum 10 characters)"
                                    ></textarea>
                                </div>

                                <div className="flex flex-col gap-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Product Image</span>
                                        {errors.productImage && <span className="text-red-500 text-xs">{errors.productImage}</span>}
                                    </div>
                                    
                                    <input 
                                        id="file-upload" 
                                        ref={fileInputRef}
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                    
                                    {selectedFile ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors">
                                            {selectedFile.preview && (
                                                <div className="relative group">
                                                    <Image
                                                        width={100}
                                                        height={100} 
                                                        src={selectedFile.preview} 
                                                        alt={selectedFile.name}
                                                        className="w-full h-48 object-cover rounded-md mb-3"
                                                    />
                                                    <button
                                                        onClick={() => setSelectedFile(null)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Remove image"
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {isUploading ? (
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>Uploading...</span>
                                                        <span className="font-medium">{Math.round(uploadProgress)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div 
                                                            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleCancelUpload}
                                                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                                    >
                                                        <FiX size={14} /> Cancel Upload
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="truncate max-w-[70%]">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <button
                                                        onClick={handleUpload}
                                                        className="px-4 py-2 bg-template-primary text-white text-sm font-medium rounded-md hover:bg-template-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <FiUpload size={14} /> Upload
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label 
                                            htmlFor="file-upload"
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
                                                dragActive ? 'border-template-primary bg-template-primary/10' : 'border-gray-300 hover:border-template-primary'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clipPath="url(#clip0_1118_198)">
                                                        <path d="M33.4412 3.12061H14.1738V11.1106H37.5563V7.23402C37.5563 4.96567 35.7102 3.12061 33.4412 3.12061Z" fill="#CED9F9"/>
                                                        <path d="M22.5352 12.3403H0V4.92636C0 2.20972 2.21068 0 4.92828 0H12.1336C12.8497 0 13.5396 0.150925 14.1664 0.434509C15.0418 0.828964 15.7939 1.47913 16.3213 2.3286L22.5352 12.3403Z" fill="#40922C"/>
                                                        <path d="M42 13.9999V37.8812C42 40.1525 40.1511 41.9998 37.8789 41.9998H4.12111C1.84891 41.9998 0 40.1525 0 37.8812V9.88037H37.8789C40.1511 9.88037 42 11.7283 42 13.9999Z" fill="#40922C"/>
                                                        <path d="M42 13.9999V37.8812C42 40.1525 40.1511 41.9998 37.8789 41.9998H21V9.88037H37.8789C40.1511 9.88037 42 11.7283 42 13.9999Z" fill="#40922C"/>
                                                        <path d="M32.0471 25.94C32.0471 32.0325 27.0909 36.9889 20.9991 36.9889C14.9073 36.9889 9.95117 32.0325 9.95117 25.94C9.95117 19.8486 14.9073 14.8921 20.9991 14.8921C27.0909 14.8921 32.0471 19.8486 32.0471 25.94Z" fill="#E7ECFC"/>
                                                        <path d="M32.0479 25.94C32.0479 32.0325 27.0918 36.9889 21 36.9889V14.8921C27.0918 14.8921 32.0479 19.8486 32.0479 25.94Z" fill="#CED9F9"/>
                                                        <path d="M24.5612 26.0753C24.3308 26.2704 24.0485 26.3656 23.7688 26.3656C23.4185 26.3656 23.0705 26.2173 22.827 25.9282L22.2307 25.2213V29.8494C22.2307 30.5287 21.6795 31.0799 21.0002 31.0799C20.3209 31.0799 19.7698 30.5287 19.7698 29.8494V25.2213L19.1734 25.9282C18.7344 26.4476 17.9587 26.514 17.4392 26.0753C16.9201 25.6373 16.8535 24.8612 17.2915 24.3418L19.7271 21.4543C20.0447 21.0788 20.508 20.8628 21.0002 20.8628C21.4924 20.8628 21.9558 21.0788 22.2733 21.4543L24.7089 24.3418C25.147 24.8612 25.0803 25.6373 24.5612 26.0753Z" fill="#40922C"/>
                                                        <path d="M24.561 26.0753C24.3306 26.2704 24.0483 26.3656 23.7686 26.3656C23.4183 26.3656 23.0703 26.2173 22.8268 25.9282L22.2305 25.2213V29.8494C22.2305 30.5287 21.6793 31.0799 21 31.0799V20.8628C21.4922 20.8628 21.9555 21.0788 22.2731 21.4543L24.7087 24.3418C25.1467 24.8612 25.0801 25.6373 24.561 26.0753Z" fill="#40922C"/>
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_1118_198">
                                                        <rect width="42" height="42" fill="white"/>
                                                        </clipPath>
                                                    </defs>
                                                </svg>

                                                <div className="text-sm font-medium text-gray-700 mb-1">
                                                    Drag your file(s) to start uploading
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Supports JPG, PNG up to 5MB
                                                </p>
                                                <button 
                                                    type="button"
                                                    className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Browse File
                                                </button>
                                            </div>
                                        </label>
                                    )}
                                </div>
                                <div className="flex gap-x-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsVariantModalOpen(true)}
                                    className="py-2 px-4 w-full border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Generate Variant
                                </button>
                                
                                <VariantModal 
                                    isOpen={isVariantModalOpen}
                                    onClose={() => setIsVariantModalOpen(false)}
                                    variants={variants}
                                    onVariantChange={handleVariantChange}
                                    onImageChange={handleImageChange}
                                    onRemoveVariant={handleRemoveVariant}
                                    onAddVariant={handleAddVariant}
                                    onSave={handleSaveVariants}
                                />
                                <button 
                                    type="submit" 
                                    className={`py-2 px-4 w-full bg-template-primary text-white rounded-sm hover:bg-template-primary/90 transition-colors ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </div>
                                    ) : 'Save'}
                                </button>
                            </div>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    )
};

export default AddProductForm;