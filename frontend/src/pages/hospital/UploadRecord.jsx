import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const UploadRecord = () => {
  const { t } = useTranslation();
  const [healthId, setHealthId] = useState('');
  const [recordType, setRecordType] = useState('Prescription');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError(t('hospital.pleaseSelectFile'));
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    const data = new FormData();
    data.append('healthId', healthId);
    data.append('recordType', recordType);
    data.append('file', file);

    try {
      const res = await api.post('/records/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message || 'Record successfully uploaded.');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Have you taken patient consent first?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel">
        <h2 className="heading-gradient text-center" style={{ marginBottom: '2rem' }}>{t('hospital.uploadTitle')}</h2>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {t('hospital.consentWarning')}
        </p>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label>{t('hospital.patientArogyamField')}</label>
            <input type="text" className="glass-input" value={healthId} onChange={(e) => setHealthId(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>{t('hospital.recordType')}</label>
            <select className="glass-input" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
              <option value="Prescription">{t('hospital.prescription')}</option>
              <option value="Lab Report">{t('hospital.labReport')}</option>
              <option value="Radiology">{t('hospital.radiology')}</option>
              <option value="Discharge Summary">{t('hospital.dischargeSummary')}</option>
              <option value="Vaccination">{t('hospital.vaccination')}</option>
            </select>
          </div>

          <div className="input-group">
            <label>{t('hospital.uploadDoc')}</label>
            <div style={{ border: '2px dashed var(--glass-border)', padding: '2rem', borderRadius: '8px', textAlign: 'center', transition: 'var(--transition)' }}>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? t('hospital.uploadingCloud') : t('hospital.uploadToArogyam')}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default UploadRecord;
