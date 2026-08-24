import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, MapPin } from 'lucide-react';
import type { Product } from '../types';

interface ProductModalProps {
  product: Product;
  sellerName?: string;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  sellerName = "Verified Electronics Ethiopia",
  onClose,
}) => {
  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 0 }}
          className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto glass-panel bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Gallery Showcase */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700/60 shadow-lg group">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-cyan-500/90 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {product.condition}
                </div>
              </div>
            </div>

            {/* Product Details & Seller Metadata */}
            <div className="space-y-4">
              <div>
                <span className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">Official Ethiopia Warranty Item</span>
                <h2 className="text-2xl font-black text-white leading-tight mt-1">{product.title}</h2>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Market Value:</span>
                  <span className="text-amber-400 font-bold">{product.estimatedValue.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Verification ID:</span>
                  <span className="text-cyan-300 font-semibold">ET-PRD-{product.id}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Seller Information</h4>
                <div className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-cyan-200">{sellerName}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" /> Bole, Addis Ababa Ethiopia
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all text-sm"
                >
                  Continue to Game
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
