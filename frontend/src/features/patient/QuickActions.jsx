// src/features/patient/QuickActions.jsx
// Clickable action tiles on the patient dashboard
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  FaNotesMedical, FaHospitalUser, FaHospital,
  FaUsers, FaHeartbeat, FaClipboardCheck, FaHistory, FaCalendarCheck, FaPills
} from 'react-icons/fa';
import { ROUTES } from '../../constants/routes';

const ACTIONS = [
  {
    icon: FaHistory,
    color: '#007aff',
    bg: 'rgba(0,122,255,0.10)',
    titleKey: 'patient.medicalTimeline',
    descKey: 'patient.viewHistory',
    path: ROUTES.PATIENT_TIMELINE,
    span: 'col-span-2',
    name: 'Medical Timeline',
    row: false,
  },
  {
    icon: FaCalendarCheck,
    color: '#34c759',
    bg: 'rgba(52,199,89,0.10)',
    titleKey: 'patient.appointments',
    descKey: 'patient.bookAppointments',
    path: ROUTES.PATIENT_APPOINTMENTS,
    name: 'Appointments',
  },
  {
    icon: FaPills,
    color: '#ff9500',
    bg: 'rgba(255,149,0,0.10)',
    titleKey: 'patient.reminders',
    descKey: 'patient.medicineSchedule',
    path: ROUTES.PATIENT_REMINDERS,
    name: 'Medicine Reminders',
  },
  {
    icon: FaNotesMedical,
    color: '#af52de',
    bg: 'rgba(175,82,222,0.10)',
    titleKey: 'patient.myRecordsTitle',
    descKey: 'patient.viewEncrypted',
    path: ROUTES.PATIENT_RECORDS,
    name: 'Medical Records',
  },
  {
    icon: FaClipboardCheck,
    color: '#ff3b30',
    bg: 'rgba(255,59,48,0.10)',
    titleKey: 'patient.accessControl',
    descKey: 'patient.manageDoctorKeys',
    path: ROUTES.PATIENT_CONSENTS,
    name: 'Access Controls',
  },
  {
    icon: FaHeartbeat,
    color: '#ff2d55',
    bg: 'rgba(255,45,85,0.10)',
    titleKey: 'patient.medicalProfile',
    descKey: 'patient.allergiesContacts',
    path: ROUTES.PATIENT_PROFILE,
    name: 'Medical Profile',
  },
];


const ActionTile = ({ action, index }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = action.icon;

  const handleClick = () => {
    toast(`Accessing ${action.name}…`, { duration: 1200 });
    setTimeout(() => navigate(action.path), 700);
  };

  const isWide = action.span === 'col-span-2';

  return (
    <motion.div
      className={`bento-tile ${action.span || ''} cursor-pointer flex ${isWide ? 'flex-row items-center gap-6' : 'flex-col items-center justify-center text-center'}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex-shrink-0 rounded-full p-4 mb-0" style={{ background: action.bg }}>
        <Icon style={{ fontSize: isWide ? '2rem' : '2.5rem', color: action.color }} />
      </div>
      <div className={isWide ? '' : 'mt-3'}>
        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {t(action.titleKey, action.name)}
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t(action.descKey, '')}
        </p>
      </div>
    </motion.div>
  );
};

const QuickActions = () => (
  <>
    {ACTIONS.map((action, i) => (
      <ActionTile key={action.name} action={action} index={i} />
    ))}
  </>
);

export default QuickActions;
