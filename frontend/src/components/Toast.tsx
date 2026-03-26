"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const TOAST_STYLES = {
  success: { bg: "#00FF87", icon: "✓", border: "#0A0A0A" },
  error: { bg: "#FF2D55", icon: "✗", border: "#0A0A0A" },
  info: { bg: "#4DFFFF", icon: "ℹ", border: "#0A0A0A" },
};

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  const style = TOAST_STYLES[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[100] border-3 border-black shadow-brutal-xl max-w-sm"
      style={{ backgroundColor: style.bg }}
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-black bg-black flex items-center justify-center text-white font-mono font-bold text-lg flex-shrink-0 animate-bounce-subtle">
          {style.icon}
        </div>
        <p className="font-mono text-sm text-black font-bold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="w-6 h-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all flex items-center justify-center font-mono font-bold text-xs hover:rotate-90 duration-300"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }: { toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>; removeToast: (id: string) => void }) {
  return (
    <AnimatePresence>
      {toasts.map((toast, i) => (
        <motion.div
          key={toast.id}
          style={{ bottom: `${24 + i * 80}px` }}
          className="fixed right-6 z-[100]"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
