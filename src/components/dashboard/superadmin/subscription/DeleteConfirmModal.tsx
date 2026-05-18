"use client";

import React from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <h3 className="text-sm font-bold text-red-600">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-8">
              <p className="text-sm font-medium text-gray-500 text-center">
                {message}
              </p>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl border border-gray-300 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
