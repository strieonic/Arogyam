import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonBox = ({ width = '100%', height = '20px', className = '' }) => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
    className={`bg-white/10 rounded-md ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox
        key={i}
        width={i === lines - 1 ? '60%' : '100%'}
        height="14px"
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-panel p-4 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <SkeletonBox width="48px" height="48px" className="rounded-full" />
      <div className="flex-1">
        <SkeletonBox width="40%" height="16px" className="mb-2" />
        <SkeletonBox width="20%" height="12px" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`w-full overflow-hidden rounded-xl border border-white/10 ${className}`}>
    {/* Header */}
    <div className="flex bg-white/5 p-4 border-b border-white/10">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={`th-${i}`} className="flex-1">
          <SkeletonBox width="60%" height="16px" />
        </div>
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rIndex) => (
      <div key={`tr-${rIndex}`} className="flex p-4 border-b border-white/5">
        {Array.from({ length: columns }).map((_, cIndex) => (
          <div key={`td-${rIndex}-${cIndex}`} className="flex-1">
            <SkeletonBox width="80%" height="14px" />
          </div>
        ))}
      </div>
    ))}
  </div>
);
