import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { toast } from 'sonner';
import { FaCheckCircle, FaClock, FaTimesCircle, FaLock, FaKey, FaTimes } from 'react-icons/fa';

/* ── Inline Modal Component ── */
const ConsentModal = ({ consent, onClose, onRefresh }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP from the hospital.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/patient/consents/approve', { consentId: consent._id, otp });
      toast.success(res.data.message || 'Consent approved!');
      onClose();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await api.post('/patient/consents/reject', { consentId: consent._id });
      toast.success(res.data.message || 'Consent rejected.');
      onClose();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject consent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-panel"
        style={{ maxWidth: '420px', width: '100%', padding: '2rem', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔐</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>Approve Access</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--accent-primary)' }}>{consent.hospitalId?.hospitalName || 'A Hospital'}</strong> wants access to your medical records.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
            Enter the 6-digit OTP that the hospital staff shared with you.
          </p>
        </div>

        <form onSubmit={handleApprove} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <FaKey style={{ marginRight: '0.4rem' }} />
              Consent OTP (from hospital)
            </label>
            <input
              type="text"
              className="glass-input"
              style={{ marginTop: '0.5rem', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Verifying…' : '✓ Approve Access'}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
                color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
              }}
            >
              ✗ Deny
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ── Main MyConsents Page ── */
const MyConsents = () => {
  const { t } = useTranslation();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsent, setActiveConsent] = useState(null);

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patient/consents');
      setConsents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch consents", err);
      toast.error('Failed to load consents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsents(); }, []);

  const getStatusBadge = (status) => {
    const styles = {
      approved: { background: 'rgba(52,199,89,0.1)', color: 'var(--success)', border: '1px solid rgba(52,199,89,0.3)' },
      rejected: { background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.3)' },
      pending:  { background: 'rgba(255,196,0,0.1)', color: '#f1c40f', border: '1px solid rgba(255,196,0,0.3)' },
    };
    const icons = { approved: <FaCheckCircle />, rejected: <FaTimesCircle />, pending: <FaClock /> };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', ...styles[status] }}>
        {icons[status]} {status}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AnimatePresence>
        {activeConsent && (
          <ConsentModal
            consent={activeConsent}
            onClose={() => setActiveConsent(null)}
            onRefresh={fetchConsents}
          />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="heading-gradient">{t('patient.consentsTitle')}</h2>
        <button onClick={fetchConsents} className="ghost-btn" style={{ fontSize: '0.85rem' }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading consents…
        </div>
      ) : consents.length === 0 ? (
        <div className="glass-panel text-center" style={{ color: 'var(--text-secondary)', padding: '3rem' }}>
          <FaLock style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.4 }} />
          <p>{t('patient.noConsents')}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.6 }}>When a hospital requests access, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {consents.map((consent, index) => (
            <motion.div
              key={consent._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-panel"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: '180px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {consent.hospitalId?.hospitalName || 'Unknown Hospital'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Requested: {new Date(consent.createdAt).toLocaleString()}
                </p>
                {consent.status === 'approved' && consent.accessEnd && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.2rem' }}>
                    Access until: {new Date(consent.accessEnd).toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {getStatusBadge(consent.status)}
                {consent.status === 'pending' && (
                  <button
                    onClick={() => setActiveConsent(consent)}
                    className="primary-btn"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <FaKey style={{ marginRight: '0.3rem' }} />
                    {t('patient.grantAccess')}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyConsents;
