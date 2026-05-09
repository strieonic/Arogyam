// src/components/ui/ErrorState.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center py-16 px-6 glass-panel border border-red-500/20 bg-red-500/5"
  >
    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
      <FaExclamationTriangle className="text-red-500 text-2xl" />
    </div>
    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{title}</h3>
    <p className="text-sm text-[var(--text-secondary)] max-w-sm">{message}</p>

    {onRetry && (
      <button
        onClick={onRetry}
        className="secondary-btn mt-6 flex items-center gap-2"
      >
        <FaRedo className="text-xs" /> Try Again
      </button>
    )}
  </motion.div>
);

export default ErrorState;
