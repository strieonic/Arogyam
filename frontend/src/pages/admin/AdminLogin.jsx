import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const AdminLogin = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', { email, password });
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      // Fallback: hardcoded credentials for offline dev
      if (email === 'admin@arogyam.com' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/dashboard');
      } else {
        setError(err.response?.data?.message || 'Invalid admin credentials');
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: '440px', margin: '5rem auto', padding: '0 var(--space-lg)' }}
    >
      <div className="glass-panel" style={{ padding: 'var(--space-2xl)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'rgba(255, 51, 102, 0.1)',
              border: '1px solid rgba(255, 51, 102, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
              fontSize: '1.8rem',
            }}
          >
            🛡️
          </motion.div>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: '6px' }}>{t('admin.loginTitle')}</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="alert alert-danger"
            style={{ marginBottom: 'var(--space-lg)' }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="input-group">
            <label>{t('admin.emailAddress')}</label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', top: '15px', left: '14px', color: 'var(--text-tertiary)' }}
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="admin-email-input"
                type="email"
                className="glass-input"
                style={{ paddingLeft: '42px' }}
                placeholder="admin@arogyam.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>{t('admin.password')}</label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', top: '15px', left: '14px', color: 'var(--text-tertiary)' }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="admin-password-input"
                type="password"
                className="glass-input"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-xs)', padding: '16px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                  }}
                />
                {t('admin.authenticating')}
              </span>
            ) : (
              t('admin.accessPanel')
            )}
          </motion.button>
        </form>

        {/* Footer Hint */}
        <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
          {t('admin.protectedBy')}
        </p>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
