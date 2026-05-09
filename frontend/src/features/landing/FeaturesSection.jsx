// src/features/landing/FeaturesSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import GlowCard from '../../components/GlowCard';

const FEATURES = [
  { key: 'feature1', colorKey: 'primary', large: true, icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="2" width="18" height="20" rx="3" stroke="var(--accent-primary)" strokeWidth="1.5"/><path d="M8 7h8M8 11h5M8 15h7" stroke="var(--accent-primary)" strokeWidth="1.3" strokeLinecap="round"/></svg>
  )},
  { key: 'feature2', colorKey: 'secondary', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 7v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-5z" stroke="var(--accent-secondary)" strokeWidth="1.5"/><path d="M9 12l2 2 4-4" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { key: 'feature3', color: '#FFB347', bgColor: 'rgba(255,179,71,0.1)', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#FFB347" strokeWidth="1.5"/><path d="M9 12l2 2 4-4" stroke="#FFB347" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { key: 'feature4', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.1)', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#8B5CF6" strokeWidth="1.5"/><path d="M12 9v4M10 11h4" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
  { key: 'feature5', colorKey: 'secondary', large: true, icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 9h16M9 9v11" stroke="var(--accent-secondary)" strokeWidth="1.3"/></svg>
  )},
];

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="features-section">
      <motion.div className="features-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="section-label">{t('landing.featuresLabel')}</div>
        <h2 className="section-title">{t('landing.featuresTitle')}</h2>
      </motion.div>

      <div className="features-grid">
        {FEATURES.map((f) => (
          <GlowCard
            key={f.key}
            className={`feature-card${f.large ? ' large' : ''}`}
            glowColor={f.bgColor || (f.colorKey === 'primary' ? 'rgba(255,51,102,0.1)' : 'rgba(0,212,170,0.08)')}
          >
            <div className="feature-icon" style={{ background: f.bgColor || (f.colorKey === 'primary' ? 'var(--accent-primary-soft)' : 'var(--accent-secondary-soft)') }}>
              {f.icon}
            </div>
            <h3 className="feature-title">{t(`landing.${f.key}Title`)}</h3>
            <p className="feature-description">{t(`landing.${f.key}Desc`)}</p>
          </GlowCard>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
