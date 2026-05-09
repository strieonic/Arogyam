import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { toast } from 'sonner';

const HospitalRegister = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    hospitalName: '', regNumber: '', address: '', email: '', phone: '', password: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    if (file) data.append('file', file); // Multer expects 'file'

    try {
      const res = await api.post('/auth/hospital/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Registration submitted for approval.');
      toast.success(res.data.message || 'Registration submitted for approval.');
      setTimeout(() => navigate('/hospital/login'), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed.');
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="glass-panel">
        <h2 className="heading-gradient text-center" style={{ marginBottom: '2rem' }}>{t('hospital.registerTitle')}</h2>
        
        {message && <div style={{ color: 'var(--secondary-color)', marginBottom: '1rem', textAlign: 'center', padding: '1rem', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '8px' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>{t('hospital.hospitalName')}</label>
            <input type="text" name="hospitalName" className="glass-input" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>{t('hospital.regNumber')}</label>
            <input type="text" name="regNumber" className="glass-input" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>{t('hospital.phoneNumber')}</label>
            <input type="tel" name="phone" className="glass-input" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>{t('hospital.emailAddress')}</label>
            <input type="email" name="email" className="glass-input" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>{t('hospital.password')}</label>
            <input type="password" name="password" className="glass-input" required onChange={handleChange} />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>{t('hospital.completeAddress')}</label>
            <textarea name="address" className="glass-input" rows="2" onChange={handleChange}></textarea>
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>{t('hospital.uploadLicence')}</label>
            <input type="file" accept=".pdf" className="glass-input" onChange={handleFileChange} style={{ paddingTop: '9px' }} />
          </div>

          <button type="submit" className="primary-btn" disabled={loading} style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            {loading ? t('hospital.submittingApp') : t('hospital.submitApp')}
          </button>
        </form>

        <p className="text-center" style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t('hospital.alreadyApproved')} <Link to="/hospital/login" style={{ color: 'var(--secondary-color)' }}>{t('hospital.loginHere')}</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default HospitalRegister;
