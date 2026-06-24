import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { toast } from 'sonner';
import { FaSearch, FaUser, FaClock, FaCalendarPlus, FaFileUpload, FaHistory, FaPhoneAlt, FaTint } from 'react-icons/fa';

const SearchPatient = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  // Use debounce for partial name search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 3) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter]);

  const performSearch = async () => {
    if (!query) {
      setPatients([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/hospital/search-patient`, {
        params: { q: query, filter }
      });
      setPatients(res.data.patients || []);
      setHasSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setPatients([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-wrapper">
      <div className="text-center mb-8">
        <h2 className="heading-gradient text-3xl font-bold mb-2">Smart Patient Search</h2>
        <p className="text-[var(--text-secondary)]">
          Search authorized patients by Name, Phone, Email, or Arogyam ID.
        </p>
      </div>

      <div className="glass-panel p-6 mb-8 relative z-20">
        <form onSubmit={handleManualSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              className="form-input pl-12 w-full !bg-white/5" 
              placeholder="e.g. Rahul, 9876543210, HID-1234, rahul@email.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="form-input md:w-48 !bg-white/5"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Patients</option>
            <option value="recent">Recently Visited</option>
            <option value="blood_O+">O+ Blood Group</option>
            <option value="blood_A+">A+ Blood Group</option>
            <option value="blood_B+">B+ Blood Group</option>
          </select>

          <button type="submit" className="primary-btn !bg-blue-600 px-8" disabled={loading}>
            Search
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="text-center p-8 glass-panel border border-blue-500/20">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-bold animate-pulse">Searching patient...</p>
          </div>
        )}

        {!loading && hasSearched && patients.length === 0 && (
          <div className="text-center p-12 glass-panel bg-red-500/5 border border-red-500/20">
            <p className="text-red-400 font-bold text-lg mb-2">No patient found.</p>
            <p className="text-[var(--text-secondary)] text-sm">
              Check spelling or Arogyam ID. Note: You can only search for patients who have booked an appointment, visited before, or granted you consent.
            </p>
          </div>
        )}

        {!loading && !hasSearched && query.length === 0 && (
          <div className="text-center p-12 glass-panel border border-white/5">
            <FaUser className="mx-auto text-4xl text-[var(--text-tertiary)] mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)]">Start typing to search the patient directory.</p>
          </div>
        )}

        {!loading && patients.map(patient => (
          <motion.div 
            key={patient._id} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 flex flex-col md:flex-row justify-between gap-6 border-l-4 border-l-blue-500 hover:bg-white/5 transition-colors"
          >
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 text-2xl font-bold">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  {patient.name}
                </h3>
                <p className="text-sm font-mono text-blue-400 mt-1 mb-3">{patient.healthId}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1"><FaUser /> {patient.gender || 'N/A'}, {patient.age ? `${patient.age} yrs` : 'Age N/A'}</span>
                  <span className="flex items-center gap-1"><FaTint className="text-red-400" /> {patient.bloodGroup || 'N/A'}</span>
                  {patient.phone && <span className="flex items-center gap-1"><FaPhoneAlt /> {patient.phone}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col justify-end gap-2 shrink-0 md:min-w-[160px]">
              <button 
                onClick={() => navigate(`/hospital/records/${patient.healthId}`)}
                className="secondary-btn !py-2 !px-3 text-xs w-full justify-start flex items-center gap-2"
              >
                <FaHistory className="text-[var(--text-tertiary)]" /> Open Timeline
              </button>
              
              <button 
                onClick={() => navigate(`/hospital/upload`)} // You could pass state here if needed
                className="secondary-btn !py-2 !px-3 text-xs w-full justify-start flex items-center gap-2"
              >
                <FaFileUpload className="text-[var(--text-tertiary)]" /> Upload Report
              </button>

              <button 
                onClick={() => toast.info('Appointment booking coming soon!', { description: 'This feature is under development.' })}
                className="primary-btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-3 text-xs w-full justify-center flex items-center gap-2"
              >
                <FaCalendarPlus /> Book Appt
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchPatient;
