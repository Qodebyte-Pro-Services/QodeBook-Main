"use client"

import { motion, AnimatePresence } from "framer-motion";
import { BsFillPencilFill } from "react-icons/bs";
import { X, AlertCircle, Save } from "lucide-react";
import { RiLoader4Line } from "react-icons/ri";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoriesResponseType, CategoryPayload, SingleProductType } from "@/models/types/shared/handlers-type";

export interface EditProductFormData {
  name: string;
  brand: string;
  description: string;
  category_id: number;
  unit: string;
  threshold: number;
  taxable: boolean;
  hasVariation: boolean;
}

export interface EditProductFormErrors {
  name?: string;
  brand?: string;
  description?: string;
  category_id?: string;
  unit?: string;
  threshold?: string;
}

export interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: EditProductFormData;
  formErrors: EditProductFormErrors;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (value: string) => void;
  categories: CategoryPayload[];
  isSubmitting: boolean;
  product: SingleProductType | null;
}

export const EditProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  formErrors,
  onFormChange,
  onCategoryChange,
  categories,
  isSubmitting,
  product
}: EditProductFormProps) => {
  if (!isOpen || !product) return null;

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
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <BsFillPencilFill size={24} />
                </div>
                <h2 className="text-xl font-bold">Edit Product</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-white/80 text-sm">
              Update product information and settings
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  id="edit-name"
                  name="name"
                  value={formData.name} 
                  onChange={onFormChange}
                  placeholder="Enter product name"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.name 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}
                />
                {formErrors.name && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <label htmlFor="edit-brand" className="text-sm font-semibold text-gray-700">
                  Brand *
                </label>
                <input 
                  type="text" 
                  id="edit-brand"
                  name="brand"
                  value={formData.brand} 
                  onChange={onFormChange}
                  placeholder="Enter brand name"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.brand 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}
                />
                {formErrors.brand && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.brand}</span>
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-semibold text-gray-700">
                  Category *
                </label>
                <Select value={formData.category_id.toString()} onValueChange={onCategoryChange}>
                  <SelectTrigger className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.category_id 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Select a category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category_id && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.category_id}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">
                  Description *
                </label>
                <textarea 
                  id="edit-description"
                  name="description"
                  rows={4}
                  value={formData.description} 
                  onChange={onFormChange}
                  placeholder="Describe this product (minimum 10 characters)"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                    formErrors.description 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                  }`}
                />
                {formErrors.description && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{formErrors.description}</span>
                  </div>
                )}
              </div>

              {/* Unit and Threshold */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-unit" className="text-sm font-semibold text-gray-700">
                    Unit *
                  </label>
                  <input 
                    type="text" 
                    id="edit-unit"
                    name="unit"
                    value={formData.unit} 
                    onChange={onFormChange}
                    placeholder="e.g., kg, pieces, liters"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors.unit 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                    }`}
                  />
                  {formErrors.unit && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.unit}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-threshold" className="text-sm font-semibold text-gray-700">
                    Threshold Level
                  </label>
                  <input 
                    type="number" 
                    id="edit-threshold"
                    name="threshold"
                    min="0"
                    value={formData.threshold} 
                    onChange={onFormChange}
                    placeholder="0"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      formErrors.threshold 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                    }`}
                  />
                  {formErrors.threshold && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{formErrors.threshold}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="edit-taxable"
                    name="taxable"
                    checked={formData.taxable}
                    onChange={onFormChange}
                    className="w-4 h-4 text-template-chart-store bg-gray-100 border-gray-300 rounded focus:ring-template-chart-store focus:ring-2"
                  />
                  <label htmlFor="edit-taxable" className="text-sm font-medium text-gray-700">
                    Taxable product
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="edit-hasVariation"
                    name="hasVariation"
                    checked={formData.hasVariation}
                    onChange={onFormChange}
                    className="w-4 h-4 text-template-chart-store bg-gray-100 border-gray-300 rounded focus:ring-template-chart-store focus:ring-2"
                  />
                  <label htmlFor="edit-hasVariation" className="text-sm font-medium text-gray-700">
                    Product has variations
                  </label>
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
                    <span>Update Product</span>
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
