// src/features/hospital/HospitalActionGrid.jsx
// Action cards grid shown on the hospital dashboard
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaSearch, FaUsers, FaCloudUploadAlt,
  FaFileContract, FaFileMedical,
} from 'react-icons/fa';
import { ROUTES } from '../../constants/routes';

const CARDS = [
  {
    to: ROUTES.HOSPITAL_SEARCH,
    Icon: FaSearch,
    color: 'var(--accent-secondary)',
    bg: 'rgba(0,212,170,0.10)',
    titleKey: 'hospital.searchPatient',
    descKey: 'hospital.findByArogyam',
  },
  {
    to: ROUTES.HOSPITAL_CONSENT,
    Icon: FaFileContract,
    color: 'var(--accent-primary)',
    bg: 'rgba(255,51,102,0.10)',
    titleKey: 'hospital.requestConsent',
    descKey: 'hospital.accessViaOtp',
  },
  {
    to: ROUTES.HOSPITAL_UPLOAD,
    Icon: FaCloudUploadAlt,
    color: '#ff3b30',
    bg: 'rgba(255,59,48,0.10)',
    titleKey: 'hospital.uploadRecord',
    descKey: 'hospital.addToProfile',
  },
  {
    to: ROUTES.HOSPITAL_PATIENTS,
    Icon: FaUsers,
    color: '#34c759',
    bg: 'rgba(52,199,89,0.10)',
    titleKey: 'nav.directory',
    descKey: 'hospital.previousPatients',
  },
  {
    to: ROUTES.HOSPITAL_RECORDS,
    Icon: FaFileMedical,
    color: '#ffb347',
    bg: 'rgba(255,179,71,0.10)',
    titleKey: 'hospital.uploadedRecordsTitle',
    descKey: 'hospital.viewAllHistory',
    descFallback: 'View all records uploaded by you',
  },
];

const HospitalActionGrid = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-6">
      {CARDS.map(({ to, Icon, color, bg, titleKey, descKey, descFallback }, i) => (
        <Link to={to} key={to} className="no-underline">
          <motion.div
            className="glass-panel h-full flex flex-col items-center justify-center text-center cursor-pointer gap-4 py-8 hover:border-white/20"
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            {/* Icon bubble */}
            <div className="rounded-2xl p-4" style={{ background: bg }}>
              <Icon style={{ fontSize: '2rem', color }} />
            </div>

            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {t(titleKey)}
              </h3>
              <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {t(descKey, descFallback || '')}
              </p>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

export default HospitalActionGrid;
