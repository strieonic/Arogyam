// src/features/landing/HowItWorks.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = [
    { num: '01', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { num: '02', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { num: '03', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
    { num: '04', title: t('landing.step4Title'), desc: t('landing.step4Desc') },
  ];

  return (
    <section className="process-section">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="section-label">{t('landing.processLabel')}</div>
        <h2 className="section-title">{t('landing.processTitle')}</h2>
      </motion.div>

      <div className="process-steps">
        {steps.map((step, i) => (
          <motion.div key={i} className="process-step" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="process-step-number">{step.num}</div>
            <h4 className="process-step-title">{step.title}</h4>
            <p className="process-step-desc">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
