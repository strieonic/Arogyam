import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { FaHospital, FaPhone, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

const MyHospitals = () => {
  const { t } = useTranslation();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/patient/hospitals');
        setHospitals(res.data || []);
      } catch (err) {
        console.error("Failed to fetch linked hospitals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-wrapper max-w-4xl">
      <h2 className="heading-gradient" style={{ marginBottom: '2rem' }}>{t('patient.myHospitalsTitle')}</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>{t('common.loading')}</div>
      ) : hospitals.length === 0 ? (
        <div className="glass-panel text-center" style={{ color: 'var(--text-secondary)', padding: '3rem' }}>
          {t('patient.noHospitalsFound')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {hospitals.map((link, index) => (
            <motion.div 
              key={link._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel"
            >
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaHospital /> {link.hospitalId?.hospitalName || t('patient.unknownHospital')}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {link.hospitalId?.phone && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaPhone /> {link.hospitalId.phone}
                  </p>
                )}
                
                {link.hospitalId?.email && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaEnvelope /> {link.hospitalId.email}
                  </p>
                )}
                
                {link.hospitalId?.address && (
                  <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <FaMapMarkerAlt style={{ marginTop: '3px' }} /> {link.hospitalId.address}
                  </p>
                )}
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                {t('patient.lastVisit')}: {link.lastVisit ? new Date(link.lastVisit).toLocaleDateString() : t('common.unknown')}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyHospitals;
