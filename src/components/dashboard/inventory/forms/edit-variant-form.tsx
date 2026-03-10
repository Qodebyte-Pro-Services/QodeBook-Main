"use client"

import { motion, AnimatePresence } from "framer-motion";
import { BsFillPencilFill } from "react-icons/bs";
import { X, AlertCircle, Save, Plus, Minus, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { RiLoader4Line } from "react-icons/ri";
import { ProductVariantsType } from "@/store/data/product-variants";
import { useRef, useState } from "react";
import Image from "next/image";

export interface EditVariantFormData {
  sku: string;
  threshold: number;
  cost_price: string;
  selling_price: string;
  expiry_date: string;
  attributes: Array<{
    name: string;
    value?: string;
    value_id?: number;
    attribute_id?: number;
  }>;
  image_url: Array<{secure_url: string; public_id: string;}>;
  image_url_files: File[];
  deleteImages: string[];
  barcode?: string;
}

export interface EditVariantFormErrors {
  sku?: string;
  threshold?: string;
  cost_price?: string;
  selling_price?: string;
  expiry_date?: string;
  attributes?: string;
  images?: string;
  barcode?: string;
}

export interface EditVariantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: EditVariantFormData;
  formErrors: EditVariantFormErrors;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onThresholdChange: (increment: boolean) => void;
  onImageUpload: (files: FileList) => void;
  onImageRemove: (publicId: string, isExisting: boolean) => void;
  isSubmitting: boolean;
  variant: ProductVariantsType | null;
}

export const EditVariantForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formErrors,
  onFormChange,
  onThresholdChange,
  onImageUpload,
  onImageRemove,
  isSubmitting,
  variant
}: EditVariantFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen || !variant) return null;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onImageUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
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
                  <BsFillPencilFill size={24} />
                </div>
                <h2 className="text-xl font-bold">Edit Product Variant</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-white/80 text-sm">
              Update variant information, pricing, and images
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Variant Images Section */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700">
                  Variant Images
                </label>
                
                {/* Image Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                    dragOver 
                      ? 'border-template-chart-store bg-template-chart-store/5' 
                      : 'border-gray-300 hover:border-template-chart-store/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop images here, or{' '}
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="text-template-chart-store hover:text-template-chart-store/80 font-medium"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Support: JPG, PNG, GIF up to 10MB each
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {formErrors.images && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.images}</span>
                  </div>
                )}

                {/* Current Images Grid */}
                {(formData.image_url.length > 0 || formData.image_url_files.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Current Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Existing Images */}
                      {formData.image_url.map((image, index) => (
                        <div key={image.public_id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              width={300}
                              height={300}
                              src={image.secure_url}
                              alt={`Variant image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onImageRemove(image.public_id, true)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {/* New Images */}
                      {formData.image_url_files.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              width={300}
                              height={300}
                              src={URL.createObjectURL(file)}
                              alt={`New image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onImageRemove(index.toString(), false)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {formData.image_url.length === 0 && formData.image_url_files.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No images uploaded yet</p>
                  </div>
                )}
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <label htmlFor="edit-sku" className="text-sm font-semibold text-gray-700">
                  SKU *
                </label>
                <input 
                  type="text" 
                  id="edit-sku"
                  name="sku"
                  value={formData.sku} 
                  onChange={onFormChange}
                  placeholder="Enter SKU"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.sku 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}
                />
                {formErrors.sku && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.sku}</span>
                  </div>
                )}
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <label htmlFor="edit-barcode" className="text-sm font-semibold text-gray-700">
                  Barcode *
                </label>
                <input 
                  type="text" 
                  id="edit-barcode"
                  name="barcode"
                  value={formData.barcode} 
                  onChange={onFormChange}
                  placeholder="Enter Barcode"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.barcode 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}
                />
                {formErrors.barcode && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.barcode}</span>
                  </div>
                )}
              </div>

              {/* Attributes Display */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Attributes
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border">
                  {formData.attributes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.attributes.map((attr, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-template-chart-store/10 text-template-chart-store rounded-full text-sm font-medium"
                        >
                          {attr.name}: {attr.value || 'N/A'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No attributes defined</span>
                  )}
                </div>
              </div>

              {/* Quantity and Threshold */}
              <div className="grid grid-cols-1">
                {/* <div className="space-y-2">
                  <label htmlFor="edit-quantity" className="text-sm font-semibold text-gray-700">
                    Quantity *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(false)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      id="edit-quantity"
                      name="quantity"
                      min="0"
                      value={formData.quantity} 
                      onChange={onFormChange}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-center ${
                        formErrors.quantity 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => onQuantityChange(true)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {formErrors.quantity && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.quantity}</span>
                    </div>
                  )}
                </div> */}

                <div className="space-y-2">
                  <label htmlFor="edit-threshold" className="text-sm font-semibold text-gray-700">
                    Threshold Level
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onThresholdChange(false)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      id="edit-threshold"
                      name="threshold"
                      min="0"
                      value={formData.threshold} 
                      onChange={onFormChange}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-center ${
                        formErrors.threshold 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => onThresholdChange(true)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {formErrors.threshold && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.threshold}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Price and Selling Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-cost-price" className="text-sm font-semibold text-gray-700">
                    Cost Price (₦) *
                  </label>
                  <input 
                    type="text" 
                    id="edit-cost-price"
                    name="cost_price"
                    value={formData.cost_price} 
                    onChange={onFormChange}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors.cost_price 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                    }`}
                  />
                  {formErrors.cost_price && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.cost_price}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-selling-price" className="text-sm font-semibold text-gray-700">
                    Selling Price (₦) *
                  </label>
                  <input 
                    type="text" 
                    id="edit-selling-price"
                    name="selling_price"
                    value={formData.selling_price} 
                    onChange={onFormChange}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors.selling_price 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                    }`}
                  />
                  {formErrors.selling_price && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.selling_price}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label htmlFor="edit-expiry-date" className="text-sm font-semibold text-gray-700">
                  Expiry Date *
                </label>
                <input 
                  type="date" 
                  id="edit-expiry-date"
                  name="expiry_date"
                  value={formData.expiry_date} 
                  onChange={onFormChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.expiry_date 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}
                />
                {formErrors.expiry_date && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.expiry_date}</span>
                  </div>
                )}
              </div>

              {/* Current Status Display */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Current Status
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      variant?.quantity === 0 
                        ? 'bg-red-100 text-red-800' 
                        : variant?.quantity <= variant?.threshold 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {variant?.quantity === 0 
                        ? 'Out of Stock' 
                        : variant?.quantity <= variant?.threshold 
                        ? 'Low Stock' 
                        : 'In Stock'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RiLoader4Line className="animate-spin" size={16} />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Update Variant</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
