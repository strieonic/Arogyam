import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/i18n';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  const isOnAdminPage = location.pathname.startsWith('/admin');
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem('adminAuth');
    navigate('/');
    setMenuOpen(false);
  }, [logout, navigate]);

  const handleAdminLogout = useCallback(() => {
    localStorage.removeItem('adminAuth');
    navigate('/');
    setMenuOpen(false);
  }, [navigate]);

  const closeMenu = () => setMenuOpen(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const navLinkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1, x: 0,
      transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }),
  };

  // Language Selector Component
  const LanguageSelector = ({ isMobile = false }) => (
    <div className={`lang-selector ${isMobile ? 'lang-selector-mobile' : ''}`} ref={isMobile ? null : langRef}>
      <button
        className="lang-toggle"
        onClick={() => setLangOpen(!langOpen)}
        aria-label={t('common.selectLanguage')}
        id="language-selector-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span className="lang-current">{currentLang.nativeLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`lang-chevron ${langOpen ? 'lang-chevron-open' : ''}`}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <AnimatePresence>
        {langOpen && (
          <motion.div
            className="lang-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`lang-option ${i18n.language === lang.code ? 'lang-option-active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
                id={`lang-option-${lang.code}`}
              >
                <span className="lang-native">{lang.nativeLabel}</span>
                <span className="lang-english">{lang.label}</span>
                {i18n.language === lang.code && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="lang-check">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isLanding && !scrolled ? 'navbar-transparent' : ''}`}>
        <div className="nav-inner">
          {/* Brand */}
          <Link to="/" className="brand-logo" onClick={closeMenu}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="brand-heartbeat">
              <path 
                d="M2 14h5l3-8 4 16 3-10 2 4h7" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="brand-text">
              Arogy<span className="brand-accent">am</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-desktop">
            {isAdmin && isOnAdminPage ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                <div className="nav-user-controls">
                  <span className="user-greeting">{t('nav.admin')}</span>
                  <button onClick={handleAdminLogout} className="ghost-btn btn-sm">{t('common.logout')}</button>
                </div>
              </>
            ) : !user ? (
              <>
                <Link to="/patient/login" className="nav-link">{t('nav.login')}</Link>
                <Link to="/hospital/login" className="nav-link">{t('nav.hospitalPortal')}</Link>
                <Link to="/admin/login" className="nav-link">{t('nav.adminPortal')}</Link>
                <Link to="/patient/register" className="nav-cta">
                  {t('nav.getStarted')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: '4px' }}>
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </>
            ) : (
              <>
                {role === 'patient' && (
                  <>
                    <Link to="/patient/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                    <Link to="/patient/records" className="nav-link">{t('nav.records')}</Link>
                    <Link to="/patient/symptom-checker" className="nav-link">Symptom Checker</Link>
                    <Link to="/patient/consents" className="nav-link">{t('nav.consents')}</Link>
                    <Link to="/patient/healthcard" className="nav-link">{t('nav.healthCard')}</Link>
                    <Link to="/patient/support" className="nav-link">Support</Link>
                  </>
                )}
                {role === 'hospital' && (
                  <>
                    <Link to="/hospital/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                    <Link to="/hospital/search" className="nav-link">{t('nav.searchNav')}</Link>
                    <Link to="/hospital/consent" className="nav-link">{t('nav.consent')}</Link>
                    <Link to="/hospital/upload" className="nav-link">{t('nav.upload')}</Link>
                    <Link to="/hospital/patients" className="nav-link">{t('nav.directory')}</Link>
                    <Link to="/hospital/support" className="nav-link">Support</Link>
                  </>
                )}
                <div className="nav-user-controls">
                  <NotificationBell />
                  <span className="user-greeting">{user.name || user.hospitalName || 'User'}</span>
                  <button onClick={handleLogout} className="ghost-btn btn-sm">{t('common.logout')}</button>
                </div>
              </>
            )}
            <LanguageSelector />
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <div className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mobile-menu-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mobile-menu-links">
                {isAdmin && isOnAdminPage ? (
                  <>
                    <motion.div custom={0} initial="hidden" animate="visible" variants={navLinkVariants}>
                      <Link to="/admin/dashboard" className="mobile-link" onClick={closeMenu}>{t('nav.dashboard')}</Link>
                    </motion.div>
                    <motion.div custom={1} initial="hidden" animate="visible" variants={navLinkVariants}>
                      <button onClick={handleAdminLogout} className="mobile-link">{t('common.logout')}</button>
                    </motion.div>
                  </>
                ) : !user ? (
                  <>
                    <motion.div custom={0} initial="hidden" animate="visible" variants={navLinkVariants}>
                      <Link to="/patient/login" className="mobile-link" onClick={closeMenu}>{t('nav.patientLogin')}</Link>
                    </motion.div>
                    <motion.div custom={1} initial="hidden" animate="visible" variants={navLinkVariants}>
                      <Link to="/patient/register" className="mobile-link accent" onClick={closeMenu}>{t('common.register')}</Link>
                    </motion.div>
                    <motion.div custom={2} initial="hidden" animate="visible" variants={navLinkVariants}>
                      <Link to="/hospital/login" className="mobile-link" onClick={closeMenu}>{t('nav.hospitalPortal')}</Link>
                    </motion.div>
                    <motion.div custom={3} initial="hidden" animate="visible" variants={navLinkVariants}>
                      <Link to="/admin/login" className="mobile-link subtle" onClick={closeMenu}>{t('nav.admin')}</Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {role === 'patient' && (
                      <>
                        <motion.div custom={0} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/patient/dashboard" className="mobile-link" onClick={closeMenu}>{t('nav.dashboard')}</Link>
                        </motion.div>
                        <motion.div custom={1} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/patient/records" className="mobile-link" onClick={closeMenu}>{t('nav.records')}</Link>
                        </motion.div>
                        <motion.div custom={2} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/patient/symptom-checker" className="mobile-link" onClick={closeMenu}>Symptom Checker</Link>
                        </motion.div>
                        <motion.div custom={3} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/patient/consents" className="mobile-link" onClick={closeMenu}>{t('nav.consents')}</Link>
                        </motion.div>
                        <motion.div custom={4} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/patient/healthcard" className="mobile-link" onClick={closeMenu}>{t('nav.healthCard')}</Link>
                        </motion.div>
                        <motion.div custom={5} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/patient/support" className="mobile-link" onClick={closeMenu}>Support</Link>
                        </motion.div>
                      </>
                    )}
                    {role === 'hospital' && (
                      <>
                        <motion.div custom={0} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/hospital/dashboard" className="mobile-link" onClick={closeMenu}>{t('nav.dashboard')}</Link>
                        </motion.div>
                        <motion.div custom={1} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/hospital/search" className="mobile-link" onClick={closeMenu}>{t('nav.searchNav')}</Link>
                        </motion.div>
                        <motion.div custom={2} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/hospital/consent" className="mobile-link" onClick={closeMenu}>{t('nav.consent')}</Link>
                        </motion.div>
                        <motion.div custom={3} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/hospital/upload" className="mobile-link" onClick={closeMenu}>{t('nav.upload')}</Link>
                        </motion.div>
                        <motion.div custom={4} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/hospital/patients" className="mobile-link" onClick={closeMenu}>{t('nav.directory')}</Link>
                        </motion.div>
                        <motion.div custom={5} initial="hidden" animate="visible" variants={navLinkVariants}>
                          <Link to="/hospital/support" className="mobile-link" onClick={closeMenu}>Support</Link>
                        </motion.div>
                      </>
                    )}
                    <motion.div custom={6} initial="hidden" animate="visible" variants={navLinkVariants} className="mobile-user-section">
                      <span className="mobile-user-name">{user.name || user.hospitalName || 'User'}</span>
                      <button onClick={handleLogout} className="ghost-btn">{t('common.logout')}</button>
                    </motion.div>
                  </>
                )}
                
                {/* Mobile Language Selector */}
                <motion.div custom={7} initial="hidden" animate="visible" variants={navLinkVariants} className="mobile-lang-section">
                  <span className="mobile-section-label">{t('common.selectLanguage')}</span>
                  <div className="mobile-lang-grid">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        className={`mobile-lang-btn ${i18n.language === lang.code ? 'mobile-lang-active' : ''}`}
                        onClick={() => changeLanguage(lang.code)}
                      >
                        <span className="mobile-lang-native">{lang.nativeLabel}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div custom={8} initial="hidden" animate="visible" variants={navLinkVariants} className="mobile-theme-toggle">
                  <button onClick={toggleTheme} className="ghost-btn">
                    {theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
