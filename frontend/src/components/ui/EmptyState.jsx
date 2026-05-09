// src/components/ui/EmptyState.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmptyState = ({
  emoji = '📭',
  title = 'Nothing here yet',
  description = 'Data will appear here once available.',
  actionLabel,
  actionTo,
  onAction,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center py-20 px-6 glass-panel border-dashed border-2 border-white/10"
  >
    <div className="text-6xl mb-5 select-none" role="img" aria-hidden="true">{emoji}</div>
    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">{title}</h3>
    <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>

    {actionLabel && (actionTo ? (
      <Link to={actionTo}>
        <button className="primary-btn mt-6">{actionLabel}</button>
      </Link>
    ) : (
      <button className="primary-btn mt-6" onClick={onAction}>{actionLabel}</button>
    ))}
  </motion.div>
);

export default EmptyState;
