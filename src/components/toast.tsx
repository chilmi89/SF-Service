"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  show: boolean;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastVariants = {
  success: {
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-500',
    progress: 'bg-emerald-500/20',
    icon: <CheckCircle size={20} />
  },
  error: {
    border: 'border-red-100',
    iconBg: 'bg-red-500',
    progress: 'bg-red-500/20',
    icon: <XCircle size={20} />
  },
  warning: {
    border: 'border-amber-100',
    iconBg: 'bg-amber-500',
    progress: 'bg-amber-500/20',
    icon: <AlertTriangle size={20} />
  },
  info: {
    border: 'border-blue-100',
    iconBg: 'bg-blue-500',
    progress: 'bg-blue-500/20',
    icon: <Info size={20} />
  }
};

/**
 * Reusable Toast Component
 * Mirrors the structure and style of toast.blade.php
 */
export const Toast: React.FC<ToastProps> = ({
  show,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const variant = toastVariants[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 left-4 right-4 md:left-auto md:right-5 md:top-5 z-[9999] flex md:w-full md:max-w-sm overflow-hidden rounded-xl border bg-white shadow-2xl transition-all ${variant.border}`}
        >
          <div className="flex items-center p-4 w-full">
            {/* Icon Box */}
            <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-white ${variant.iconBg}`}>
              {variant.icon}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              {title && (
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              )}
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>

            {/* Close Button */}
            <div className="ml-4 flex flex-shrink-0">
              <button 
                onClick={onClose}
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Subtle Progress Bar */}
          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`absolute bottom-0 left-0 h-1 origin-left ${variant.progress} w-full`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};