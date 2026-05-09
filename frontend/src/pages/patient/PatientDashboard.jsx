// src/pages/patient/PatientDashboard.jsx
// Thin orchestrator — imports all patient feature sections
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import HealthIdCard from '../../features/patient/HealthIdCard';
import QuickActions from '../../features/patient/QuickActions';
import ProfileCompletion from '../../features/patient/ProfileCompletion';
import LiveQueueCard from '../../features/patient/LiveQueueCard';



const PatientDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success(t('patient.timelineSynced'), {
        description: t('patient.timelineSyncedDesc'),
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [t]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="h-10 w-64 skeleton rounded-xl mb-8" />
        <div className="bento-wrapper">
          <div className="skeleton bento-tile col-span-2 row-span-2 min-h-[300px]" />
          <div className="skeleton bento-tile col-span-2 min-h-[140px]" />
          <div className="skeleton bento-tile min-h-[140px]" />
          <div className="skeleton bento-tile min-h-[140px]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="heading-gradient text-4xl font-bold">
            {t('patient.dashboardTitle')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('patient.welcomeMessage')}
          </p>
        </div>
      </motion.div>

      {/* Live Socket Queue */}
      <LiveQueueCard />

      {/* Profile Completion Meter */}
      <ProfileCompletion />


      {/* Bento Grid */}

      <div className="bento-wrapper">
        <HealthIdCard user={user} />
        <QuickActions />
      </div>
    </motion.div>
  );
};

export default PatientDashboard;
