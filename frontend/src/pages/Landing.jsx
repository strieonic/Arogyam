// src/pages/Landing.jsx
// Thin orchestrator — imports all landing feature sections
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TextReveal from '../components/TextReveal';
import { getPublicStats } from '../services/publicService';
import { ROUTES } from '../constants/routes';

import HeroSection from '../features/landing/HeroSection';
import FeaturesSection from '../features/landing/FeaturesSection';
import StatsSection from '../features/landing/StatsSection';
import HowItWorks from '../features/landing/HowItWorks';
import FAQ from '../features/landing/FAQ';
import CTASection from '../features/landing/CTASection';
import './Landing.css';

const Landing = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ patients: 0, hospitals: 0, records: 0, uptime: 99.9 });
  const brandRef = useRef(null);
  const brandInView = useInView(brandRef, { once: true, margin: '-150px' });

  useEffect(() => {
    getPublicStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <HeroSection />

      {/* Brand statement */}
      <section className="brand-statement-section" ref={brandRef}>
        <motion.div className="brand-statement-text" initial={{ opacity: 0 }} animate={brandInView ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}>
          <TextReveal delay={0.1}>{t('landing.brandStatement')}</TextReveal>
        </motion.div>
      </section>

      <FeaturesSection />
      <StatsSection stats={stats} />
      <HowItWorks />
      <FAQ />
      <CTASection />

      {/* Footer */}
      <footer className="premium-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-logo">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path d="M2 14h5l3-8 4 16 3-10 2 4h7" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Aro<span style={{ color: 'var(--accent-primary)' }}>gyam</span>
            </div>
            <p className="footer-brand-desc">{t('landing.footerDesc')}</p>
          </div>

          <div>
            <h4 className="footer-column-title">{t('landing.footerPatients')}</h4>
            <ul className="footer-links">
              <li><Link to={ROUTES.PATIENT_REGISTER}>{t('landing.footerCreateArogyam')}</Link></li>
              <li><Link to={ROUTES.PATIENT_LOGIN}>{t('landing.footerPatientLogin')}</Link></li>
              <li><Link to={ROUTES.PATIENT_RECORDS}>{t('landing.footerMyRecords')}</Link></li>
              <li><Link to={ROUTES.PATIENT_HEALTH_CARD}>{t('landing.footerHealthCard')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">{t('landing.footerHospitals')}</h4>
            <ul className="footer-links">
              <li><Link to={ROUTES.HOSPITAL_REGISTER}>{t('landing.footerRegisterHospital')}</Link></li>
              <li><Link to={ROUTES.HOSPITAL_LOGIN}>{t('landing.footerHospitalLogin')}</Link></li>
              <li><Link to={ROUTES.HOSPITAL_SEARCH}>{t('landing.footerSearchPatients')}</Link></li>
              <li><Link to={ROUTES.HOSPITAL_UPLOAD}>{t('landing.footerUploadRecords')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">{t('landing.footerPlatform')}</h4>
            <ul className="footer-links">
              <li><Link to={ROUTES.ADMIN_LOGIN}>{t('landing.footerAdminPortal')}</Link></li>
              <li><Link to={ROUTES.DOCTOR_LOGIN}>{t('common.doctorPortal', 'Doctor Portal')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">
            {t('landing.footerCopyright', { year: new Date().getFullYear() })}
          </span>
          <div className="footer-india-badge">{t('common.madeInIndia')}</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
