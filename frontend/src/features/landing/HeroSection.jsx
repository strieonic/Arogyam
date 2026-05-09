// src/features/landing/HeroSection.jsx
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MorphingShape from '../../components/MorphingShape';
import { ROUTES } from '../../constants/routes';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

const HeroSection = () => {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.96]);

  return (
    <motion.section ref={heroRef} className="hero-section" style={{ opacity: heroOpacity, scale: heroScale }}>
      <MorphingShape />
      <div className="hero-inner">
        {/* Left — Content */}
        <motion.div className="hero-content" initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} custom={0}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              {t('landing.badge')}
            </div>
          </motion.div>

          <motion.h1 className="hero-headline" variants={fadeUp} custom={0.1}>
            {t('landing.headline').split('<accent>').map((part, i) => {
              if (i === 0) return <React.Fragment key={i}>{part}</React.Fragment>;
              const [accent, rest] = part.split('</accent>');
              return <React.Fragment key={i}><span className="accent">{accent}</span>{rest}</React.Fragment>;
            })}
          </motion.h1>

          <motion.p className="hero-description" variants={fadeUp} custom={0.2}>
            {t('landing.description')}
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp} custom={0.3}>
            <Link to={ROUTES.PATIENT_REGISTER} className="primary-btn" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
              {t('landing.ctaPrimary')}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to={ROUTES.HOSPITAL_LOGIN} className="secondary-btn" style={{ padding: '16px 32px' }}>
              {t('landing.ctaHospital')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right — Floating Card Composition */}
        <div className="hero-visual">
          <div className="hero-floating-cards">
            <motion.div className="floating-card floating-card-1" initial={{ opacity: 0, y: 40, x: -20 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'var(--accent-primary-soft)' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5v15M1.5 9h15" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div>
                  <div className="card-title">{t('landing.card1Title')}</div>
                  <div className="card-subtitle">{t('landing.card1Subtitle')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '8px', width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
              </div>
              <div className="card-bar">
                <motion.div className="card-bar-fill" style={{ background: 'var(--accent-primary)' }} initial={{ width: '0%' }} animate={{ width: '85%' }} transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
              </div>
            </motion.div>

            <motion.div className="floating-card floating-card-2" initial={{ opacity: 0, y: 30, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'var(--accent-secondary-soft)' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L2 6v6c0 3.5 3 5.5 7 6.5 4-1 7-3 7-6.5V6L9 1.5z" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 9.5l2 2 3.5-4" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <div className="card-title">{t('landing.card2Title')}</div>
                  <div className="card-subtitle">{t('landing.card2Subtitle')}</div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,212,170,0.08)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 600, marginTop: '8px' }}>
                {t('landing.card2Status')}
              </div>
            </motion.div>

            <motion.div className="floating-card floating-card-3" initial={{ opacity: 0, y: 20, x: -10 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(255,179,71,0.1)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="2" stroke="#FFB347" strokeWidth="1.5" /><path d="M5 5h6M5 8h4" stroke="#FFB347" strokeWidth="1.2" strokeLinecap="round" /></svg>
                </div>
                <div>
                  <div className="card-title">{t('landing.card3Title')}</div>
                  <div className="card-subtitle">{t('landing.card3Subtitle')}</div>
                </div>
              </div>
              <div className="card-bar">
                <motion.div className="card-bar-fill" style={{ background: 'var(--accent-tertiary)' }} initial={{ width: '0%' }} animate={{ width: '65%' }} transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 5 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t('common.scroll')}
        </span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, var(--text-tertiary), transparent)' }} />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
