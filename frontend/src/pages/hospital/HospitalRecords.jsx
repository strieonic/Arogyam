import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { FaFileMedical, FaUser, FaIdCard, FaCalendarAlt, FaDownload, FaSearch } from 'react-icons/fa';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

const HospitalRecords = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, filter, and sort states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/hospital/records');
        setRecords(res.data || []);
      } catch (err) {
        console.error("Failed to fetch hospital records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Filter and sort computation
  const filteredRecords = records
    .filter(record => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        record.patient?.name?.toLowerCase().includes(q) ||
        record.patient?.healthId?.toLowerCase().includes(q) ||
        record.recordType?.toLowerCase().includes(q);
      
      const matchesType = filterType === 'all' || 
        record.recordType?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'patient-az') return (a.patient?.name || '').localeCompare(b.patient?.name || '');
      if (sortBy === 'patient-za') return (b.patient?.name || '').localeCompare(a.patient?.name || '');
      return 0;
    });

  // Extract unique record types for filter dropdown
  const uniqueTypes = ['all', ...new Set(records.map(r => r.recordType?.toLowerCase()).filter(Boolean))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-wrapper max-w-5xl">
      <h2 className="heading-gradient" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <FaFileMedical /> {t('hospital.uploadedRecordsTitle')}
      </h2>

      {/* Controls Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search */}
          <div className="search-input-wrap" style={{ flex: '1 1 250px' }}>
            <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="glass-input"
              style={{ paddingLeft: '40px', paddingTop: '10px', paddingBottom: '10px' }}
              placeholder="Search Patient Name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Type */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              className="glass-input"
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              className="glass-input"
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="patient-az">Patient Name (A-Z)</option>
              <option value="patient-za">Patient Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={records.length === 0 ? t('hospital.noRecordsUploaded') : "No records match search criteria"}
          description={records.length === 0 ? "You haven't uploaded any patient records from this portal yet." : "Try clearing your search query or selecting another filter type."}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredRecords.map((record, index) => (
              <motion.div 
                key={record._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {t(`hospital.${record.recordType}`) || record.recordType}
                    </h3>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <FaUser /> {record.patient?.name || t('patient.unknown')}
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <FaIdCard /> {record.patient?.healthId || t('patient.unknown')}
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
                      style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}
                    >
                      <FaDownload /> {t('patient.viewDocument')}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default HospitalRecords;

