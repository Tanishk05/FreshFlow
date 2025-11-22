"use client";
import React from "react";
import { motion } from "framer-motion";
import Modal from "@/components/dashboard/Modal";
import { Plus, Sprout, Package, DollarSign } from "lucide-react";
import ActionButton from "@/components/dashboard/shared/ActionButton";

type FormState = {
  name: string;
  quantityKg: number;
  pricePerKg: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: () => void;
};

export default function AddCropModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
}: Props) {
  const totalValue = form.quantityKg * form.pricePerKg;
  const isValid =
    form.name.trim() && form.quantityKg > 0 && form.pricePerKg > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Harvest Plan">
      <div className="flex flex-col gap-4">
        {/* Header Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50"
        >
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-300">
              Plan your next harvest and set pricing
            </span>
          </div>
        </motion.div>

        {/* Form Fields */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Sprout className="w-4 h-4" />
            Crop Name
          </label>
          <input
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder:text-gray-400"
            placeholder="e.g., Organic Tomatoes"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Package className="w-4 h-4" />
            Quantity (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder:text-gray-400"
            placeholder="0.0"
            value={form.quantityKg || ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, quantityKg: Number(e.target.value) }))
            }
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4" />
            Price per kg ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder:text-gray-400"
            placeholder="0.00"
            value={form.pricePerKg || ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, pricePerKg: Number(e.target.value) }))
            }
          />
        </div>

        {/* Summary */}
        {isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Value
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalValue.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {form.quantityKg} kg × ${form.pricePerKg.toFixed(2)}/kg
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <ActionButton
            variant="success"
            fullWidth
            icon={<Plus className="w-4 h-4" />}
            onClick={onSubmit}
            disabled={!isValid}
          >
            Add Harvest
          </ActionButton>
          <ActionButton variant="outline" onClick={onClose}>
            Cancel
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
