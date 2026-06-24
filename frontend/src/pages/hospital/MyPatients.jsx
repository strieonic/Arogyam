import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

const MyPatients = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Sort states
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-az');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/hospital/patients');
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Filter and sort computation
  const filteredPatients = patients
    .filter(p => {
      const q = search.toLowerCase();
      const patientName = p.patientId?.name || p.patientName || '';
      const healthId = p.patientId?.healthId || '';
      return !q || 
        patientName.toLowerCase().includes(q) || 
        healthId.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const nameA = a.patientId?.name || a.patientName || '';
      const nameB = b.patientId?.name || b.patientName || '';
      if (sortBy === 'name-az') return nameA.localeCompare(nameB);
      if (sortBy === 'name-za') return nameB.localeCompare(nameA);
      
      const dateA = a.lastVisit ? new Date(a.lastVisit) : new Date(0);
      const dateB = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
      if (sortBy === 'visit-newest') return dateB - dateA;
      if (sortBy === 'visit-oldest') return dateA - dateB;
      return 0;
    });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="heading-gradient" style={{ marginBottom: '2rem' }}>
        {t('hospital.directoryPageTitle')}
      </h2>

      {/* Controls panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-input-wrap" style={{ flex: '1 1 250px' }}>
            <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="glass-input"
              style={{ paddingLeft: '40px', paddingTop: '10px', paddingBottom: '10px' }}
              placeholder="Search by Name or Health ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              className="glass-input"
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name-az">Name (A-Z)</option>
              <option value="name-za">Name (Z-A)</option>
              <option value="visit-newest">Last Visit (Newest First)</option>
              <option value="visit-oldest">Last Visit (Oldest First)</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          emoji="👥"
          title={patients.length === 0 ? t('hospital.noPatients') : "No patients found"}
          description={patients.length === 0 ? "No patient has registered visits under your hospital database yet." : "Try clearing your search query or sorting settings."}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredPatients.map((patient, index) => {
              const name = patient.patientId?.name || patient.patientName || t('patient.unknown');
              const healthId = patient.patientId?.healthId || 'N/A';
              const lastVisit = patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A';

              return (
                <motion.div 
                  key={patient._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel"
                >
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                    {name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    {t('hospital.healthId')} {healthId}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('hospital.lastVisit')} {lastVisit}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default MyPatients;

