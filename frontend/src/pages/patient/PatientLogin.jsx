import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { sendOTP, verifyOTP } from '../../services/authService';
import { FaPhoneAlt, FaKey, FaUser } from 'react-icons/fa';

const PatientLogin = () => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendOTP(identifier);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(identifier, otp);
      login(res.data.patient, res.data.token, 'patient');
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ maxWidth: '400px', margin: '4rem auto' }}
    >
      <div className="glass-panel">
        <h2 className="heading-gradient text-center" style={{ marginBottom: '2rem' }}>{t('patient.loginTitle')}</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Phone, Email, or Arogyam ID
              </label>
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <FaUser style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ paddingLeft: '45px' }} 
                  placeholder="Enter your identifier" 
                  required 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)} 
                />
              </div>
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? t('patient.sendingOtp') : t('patient.sendOtp')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div className="input-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('patient.enterOtp')}</label>
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <FaKey style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ paddingLeft: '45px', letterSpacing: '2px' }} 
                  placeholder="000000" 
                  required 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)} 
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem' }}>OTP sent to registered email for {identifier}</p>
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? t('patient.verifying') : t('patient.verifyLogin')}
            </button>
          </form>
        )}

        <p className="text-center" style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t('patient.noArogyam')} <Link to="/patient/register" style={{ color: 'var(--secondary-color)' }}>{t('patient.registerLink')}</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default PatientLogin;
