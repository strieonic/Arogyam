// src/pages/doctor/DoctorDashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AvailabilityManager from '../../features/doctor/AvailabilityManager';
import DailyAgenda from '../../features/doctor/DailyAgenda';


const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <motion.div
      className="page-wrapper"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-panel mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="heading-gradient text-3xl font-bold">
            Welcome, {user?.name || 'Doctor'}
          </h1>
          <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
            {user?.hospitalId?.hospitalName}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {user?.specialization} | Reg: {user?.licenseNumber}
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full self-start sm:self-auto"
          style={{ background: 'rgba(52,199,89,0.10)', border: '1px solid rgba(52,199,89,0.25)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-400">Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DailyAgenda />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <AvailabilityManager initialAvailability={user?.availability} />
        </div>
      </div>

    </motion.div>
  );
};

export default DoctorDashboard;
