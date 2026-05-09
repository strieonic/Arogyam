// src/features/landing/StatsSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimatedCounter from '../../components/AnimatedCounter';

const StatsSection = ({ stats }) => {
  const { t } = useTranslation();

  const items = [
    { value: stats.patients, suffix: '+', label: t('landing.statArogyams'), useIndianFormat: true, delay: 0.1 },
    { value: stats.hospitals, suffix: '+', label: t('landing.statHospitals'), delay: 0.2 },
    { value: stats.records, suffix: '+', label: t('landing.statRecords'), delay: 0.3 },
    { value: stats.uptime, suffix: '%', label: t('landing.statUptime'), decimals: 1, delay: 0.4 },
  ];

  return (
    <section className="stats-section">
      <div className="stats-inner">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="section-label" style={{ textAlign: 'center' }}>{t('landing.statsLabel')}</div>
          <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto' }}>{t('landing.statsTitle')}</h2>
        </motion.div>

        <div className="stats-grid">
          {items.map((item, i) => (
            <motion.div key={i} className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: item.delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <div className="stat-number">
                <AnimatedCounter end={item.value} suffix={item.suffix} decimals={item.decimals} useIndianFormat={item.useIndianFormat} />
              </div>
              <div className="stat-label">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
