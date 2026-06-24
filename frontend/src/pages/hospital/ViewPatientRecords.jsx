import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { FaFileMedical, FaUser, FaHospital, FaCalendarAlt, FaDownload, FaArrowLeft } from 'react-icons/fa';

const ViewPatientRecords = () => {
  const { t } = useTranslation();
  const { healthId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get(`/records/${healthId}`);
        setRecords(res.data.records || []);
      } catch (err) {
        console.error("Failed to fetch patient records", err);
        setError(err.response?.data?.message || t('patient.unknown') + ' error');
      } finally {
        setLoading(false);
      }
    };
    if (healthId) {
      fetchRecords();
    }
  }, [healthId, t]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-wrapper max-w-5xl">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/hospital/search')} className="ghost-btn" style={{ padding: '8px', borderRadius: '50%' }}>
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="heading-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaUser /> {t('admin.patient')} Records: {healthId}
          </h2>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>{t('common.loading')}</div>
      ) : error ? (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      ) : records.length === 0 ? (
        <div className="glass-panel text-center" style={{ color: 'var(--text-secondary)', padding: '3rem' }}>
          {t('patient.noRecords')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {records.map((record, index) => (
            <motion.div 
              key={record._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FaFileMedical /> {t(`hospital.${record.recordType}`) || record.recordType}
                  </h3>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <FaHospital /> {record.hospital?.hospitalName || t('patient.unknownHospital')}
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <FaCalendarAlt /> {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {record.fileUrl && (
                  <a 
                    href={record.fileUrl?.startsWith('http') ? record.fileUrl : `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${record.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ghost-btn"
                    style={{ justifyContent: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}
                  >
                    <FaDownload /> {t('patient.viewDocument')}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ViewPatientRecords;
