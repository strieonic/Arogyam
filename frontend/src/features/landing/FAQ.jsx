// src/features/landing/FAQ.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [isOpen]);

  return (
    <motion.div className="faq-item" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <span>{question}</span>
        <svg className={`faq-chevron ${isOpen ? 'open' : ''}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="faq-answer" style={{ maxHeight: isOpen ? height + 'px' : '0px', transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div ref={contentRef} className="faq-answer-inner">{answer}</div>
      </div>
    </motion.div>
  );
};

const FAQ = () => {
  const { t } = useTranslation();
  const faqs = [
    { q: t('landing.faq1Q'), a: t('landing.faq1A') },
    { q: t('landing.faq2Q'), a: t('landing.faq2A') },
    { q: t('landing.faq3Q'), a: t('landing.faq3A') },
    { q: t('landing.faq4Q'), a: t('landing.faq4A') },
    { q: t('landing.faq5Q'), a: t('landing.faq5A') },
  ];

  return (
    <section className="faq-section">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center' }}>
        <div className="section-label">{t('landing.faqLabel')}</div>
        <h2 className="section-title" style={{ margin: '0 auto' }}>{t('landing.faqTitle')}</h2>
      </motion.div>
      <div className="faq-list">
        {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />)}
      </div>
    </section>
  );
};

export default FAQ;
