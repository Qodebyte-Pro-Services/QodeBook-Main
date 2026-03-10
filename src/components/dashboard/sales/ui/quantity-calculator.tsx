"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { MarsStrokeIcon } from "lucide-react";
import { HiArrowPath } from "react-icons/hi2";

interface ModernQuantityCalculatorProps {
  unit: number;
  price: number;
  productId: number;
  maxQuantity: number;
  currentQuantity: number;
  onApply: (quantity: number) => void;
  handleClose: () => void;
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const ModernQuantityCalculator = ({
  unit,
  price,
  productId,
  maxQuantity,
  currentQuantity,
  onApply,
  handleClose,
}: ModernQuantityCalculatorProps) => {
  const [activeTab, setActiveTab] = useState<"unit" | "price">("unit");
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    quantity: currentQuantity?.toString?.() ?? "",
    unitPrice: unit.toString(),
    totalPrice: "",
  });

  const calculateTotal = () => {
    if (!formData.quantity) return;
    setIsCalculating(true);
    setTimeout(() => {
      const total = (parseFloat(formData.quantity) * parseFloat(formData.unitPrice) || 0).toFixed(2);
      setFormData(prev => ({ ...prev, totalPrice: total }));
      setIsCalculating(false);
    }, 500);
  };

  const calculateQuantity = () => {
    if (!formData.totalPrice) return;
    setIsCalculating(true);
    setTimeout(() => {
      const quantity = (parseFloat(formData.totalPrice) / parseFloat(formData.unitPrice) || 0).toFixed(2);
      setFormData(prev => ({ ...prev, quantity }));
      setIsCalculating(false);
    }, 500);
  };

  const handleApply = () => {
    const parsedQuantity = Math.min(
      Math.max(1, parseFloat(formData.quantity || "0")),
      maxQuantity
    );
    onApply(isFinite(parsedQuantity) ? parsedQuantity : currentQuantity);
    handleClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Calculator Card */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Quantity Calculator</h2>
                <p className="text-sm text-green-100 mt-1">
                  {activeTab === "unit" 
                    ? "Calculate price based on quantity" 
                    : "Calculate quantity based on price"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                aria-label="Close calculator"
              >
                <MarsStrokeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab("unit")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "unit"
                    ? "bg-white text-green-500 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Unit Price
              </button>
              <button
                onClick={() => setActiveTab("price")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "price"
                    ? "bg-white text-green-500 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Total Price
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "unit" ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2.5 focus:border-green-600 focus:ring-green-600 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">KG</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Available: {maxQuantity} KG
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 pl-7 pr-3 py-2.5 focus:border-green-600 focus:ring-green-600 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={calculateTotal}
                    disabled={!formData.quantity || isCalculating}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCalculating ? (
                      <>
                        <HiArrowPath className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Price"
                    )}
                  </button>
                </div>

                {formData.totalPrice && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₦{parseFloat(formData.totalPrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.quantity} KG × ₦{formData.unitPrice}/KG
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      name="totalPrice"
                      value={formData.totalPrice}
                      onChange={handleInputChange}
                      placeholder="Enter total price"
                      className="block w-full rounded-md border-gray-300 pl-7 pr-3 py-2.5 focus:border-green-600 focus:ring-green-600 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 pl-7 pr-3 py-2.5 focus:border-green-600 focus:ring-green-600 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={calculateQuantity}
                    disabled={!formData.totalPrice || isCalculating}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCalculating ? (
                      <>
                        <HiArrowPath className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Quantity"
                    )}
                  </button>
                </div>

                {formData.quantity && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Calculated Quantity</p>
                    <p className="text-2xl font-bold text-green-700">
                      {parseFloat(formData.quantity).toFixed(2)} KG
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ₦{parseFloat(formData.totalPrice).toLocaleString()} ÷ ₦{formData.unitPrice}/KG
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!formData.quantity || !formData.totalPrice}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModernQuantityCalculator;
