import React from "react";
import { motion } from "framer-motion";
import Modal from "@/components/dashboard/Modal";
import { Plus } from "lucide-react";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Harvest Plan">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Crop Name
          </label>
          <input
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            placeholder="e.g., Tomatoes"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity (kg)
          </label>
          <input
            type="number"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            placeholder="0"
            value={form.quantityKg}
            onChange={(e) =>
              setForm((s) => ({ ...s, quantityKg: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Price / kg ($)
          </label>
          <input
            type="number"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            placeholder="0"
            value={form.pricePerKg}
            onChange={(e) =>
              setForm((s) => ({ ...s, pricePerKg: Number(e.target.value) }))
            }
          />
        </div>
        <motion.button
          onClick={onSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-2 px-4 py-2 rounded-xl bg-green-600 text-white shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Harvest
        </motion.button>
      </div>
    </Modal>
  );
}
