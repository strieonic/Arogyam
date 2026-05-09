// src/features/landing/CTASection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';

const CTASection = () => {
  const { t } = useTranslation();
  return (
    <section className="cta-section">
      <div className="cta-bg" />
      <motion.div className="cta-inner" initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <h2 className="cta-headline">
          {t('landing.ctaHeadline')}<br />
          <span className="accent-gradient">{t('landing.ctaAccent')}</span>
        </h2>
        <p className="cta-description">{t('landing.ctaDescription')}</p>
        <div className="cta-actions">
          <Link to={ROUTES.PATIENT_REGISTER} className="primary-btn" style={{ padding: '18px 40px', fontSize: '1.05rem' }}>
            {t('landing.ctaPrimary')}
          </Link>
          <Link to={ROUTES.HOSPITAL_REGISTER} className="secondary-btn" style={{ padding: '18px 36px' }}>
            {t('landing.ctaRegisterHospital')}
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
