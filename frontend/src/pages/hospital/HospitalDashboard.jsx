// src/pages/hospital/HospitalDashboard.jsx
// Thin orchestrator — imports hospital feature sections
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import HospitalActionGrid from '../../features/hospital/HospitalActionGrid';
import HospitalQueueControl from '../../features/hospital/HospitalQueueControl';
import DoctorManagement from '../../features/hospital/DoctorManagement';
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaFileUpload } from 'react-icons/fa';




const HospitalDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      className="max-w-7xl mx-auto px-6 py-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header card */}
      <div className="glass-panel mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="heading-gradient text-3xl font-bold">
            {t('hospital.dashboardTitle')}
          </h1>
          <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
            {user?.hospitalName}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {user?.regNumber && `Reg: ${user.regNumber}`}
          </p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full self-start sm:self-auto border ${
          user?.verificationStatus === 'approved' 
            ? 'bg-green-500/10 border-green-500/25 text-green-400' 
            : 'bg-orange-500/10 border-orange-500/25 text-orange-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${user?.verificationStatus === 'approved' ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
          <span className="text-xs font-semibold capitalize">{user?.verificationStatus || 'Pending'}</span>
        </div>
      </div>

      {user?.verificationStatus !== 'approved' ? (
        <div className="glass-panel p-10 text-center border-t-4 border-t-orange-500">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            {user?.verificationStatus === 'under_review' ? (
              <FaClock className="text-4xl text-orange-400 animate-pulse" />
            ) : (
              <FaExclamationTriangle className="text-4xl text-orange-400" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Verification {user?.verificationStatus === 'under_review' ? 'In Progress' : 'Pending'}
          </h2>
          
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto mb-8">
            Your application is currently being reviewed by our administration team. 
            Expected review time is 24-48 hours. You will receive an email once approved.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1 flex items-center gap-2">
                <FaFileUpload className="text-blue-400" /> Upload Documents
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mb-3">Ensure all your licenses are uploaded correctly to avoid delays.</p>
              <button className="secondary-btn !py-1.5 !px-3 text-xs w-full">Manage Documents</button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1 flex items-center gap-2">
                <FaClock className="text-orange-400" /> Need Help?
              </h4>
              <p className="text-xs text-[var(--text-tertiary)] mb-3">If you have been waiting for more than 48 hours, contact support.</p>
              <button onClick={() => navigate('/hospital/support')} className="secondary-btn !py-1.5 !px-3 text-xs w-full">Contact Support</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <HospitalQueueControl />

          <div className="glass-panel p-6 mb-8">
            <DoctorManagement />
          </div>

          <HospitalActionGrid />
        </>
      )}

    </motion.div>
  );
};

export default HospitalDashboard;
