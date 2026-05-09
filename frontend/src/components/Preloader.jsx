import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem('arogyam-preloader-done');
  });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Skip if already done this session
    if (!visible) {
      onCompleteRef.current?.();
      return;
    }

    let current = 0;
    let isCancelled = false;

    const interval = setInterval(() => {
      if (isCancelled) return;
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          if (isCancelled) return;
          setVisible(false);
          sessionStorage.setItem('arogyam-preloader-done', 'true');
          onCompleteRef.current?.();
        }, 500);
        return;
      }
      setProgress(Math.round(current));
    }, 60);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []); // Empty deps — runs once

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#0A0A0F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem'
          }}
        >
          {/* Heartbeat SVG */}
          <motion.svg 
            width="120" height="60" viewBox="0 0 120 60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <motion.path
              d="M 0 30 L 20 30 L 30 10 L 40 50 L 50 20 L 60 40 L 70 30 L 120 30"
              fill="none"
              stroke="#FF3366"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.svg>

          {/* Logo Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#F0EDE8',
              letterSpacing: '-0.03em',
            }}
          >
            Aro<span style={{ color: '#FF3366' }}>gyam</span>
          </motion.div>

          {/* Progress */}
          <div style={{ width: '180px', position: 'relative' }}>
            <div style={{
              width: '100%',
              height: '2px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '1px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#FF3366',
                  borderRadius: '1px',
                  boxShadow: '0 0 12px rgba(255, 51, 102, 0.5)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <span
              style={{
                position: 'absolute',
                right: 0,
                top: '12px',
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.05em'
              }}
            >
              {progress}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
