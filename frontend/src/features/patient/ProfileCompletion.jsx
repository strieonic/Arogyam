// src/features/patient/ProfileCompletion.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProfileCompletion } from '../../services/patientService';
import { ROUTES } from '../../constants/routes';

const ProfileCompletion = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getProfileCompletion()
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data || data.score === 100) return null; // Hide if perfect

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 glass-panel !p-4 flex flex-col md:flex-row items-center gap-4 justify-between border-l-4 border-l-[var(--accent-primary)]"
    >
      <div className="flex-1 w-full">
        <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">Complete your Medical Profile</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Your profile is {data.score}% complete ({data.completed}/{data.total} fields). Completing it helps doctors assist you better.
        </p>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${data.score}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--secondary-color)] rounded-full"
          />
        </div>
      </div>

      <div className="flex-shrink-0">
        <Link to={ROUTES.PATIENT_PROFILE} className="primary-btn !py-2 !px-4 !text-xs whitespace-nowrap">
          Complete Now
        </Link>
      </div>
    </motion.div>
  );
};

export default ProfileCompletion;
