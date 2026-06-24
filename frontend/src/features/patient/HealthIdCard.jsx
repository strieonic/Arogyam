// src/features/patient/HealthIdCard.jsx
// Hero identity card shown prominently on the patient dashboard
import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import MagneticButton from '../../components/MagneticButton';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const HealthIdCard = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      className="col-span-2 row-span-2 rounded-3xl p-8 flex flex-col justify-between border border-white/10 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.4) 0%, rgba(0, 212, 170, 0.15) 100%)',
        backdropFilter: 'blur(16px)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top: Identity */}
      <div className="flex justify-between items-start gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
            {t('patient.globalArogyam')}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-words">{user?.name}</h2>
          <p className="text-lg sm:text-xl font-mono tracking-widest break-all" style={{ color: 'var(--accent-primary)' }}>
            {user?.healthId}
          </p>
          {user?.bloodGroup && (
            <span className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
              Blood: {user.bloodGroup}
            </span>
          )}
        </div>

        {/* QR */}
        <div className="bg-white p-2.5 rounded-xl shadow-lg flex-shrink-0">
          <QRCodeSVG value={user?.healthId || 'AROGYAM-GUEST'} size={80} level="M" />
        </div>
      </div>

      {/* Bottom: Status + Action */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10">
        <span className="text-sm text-gray-400">
          {t('patient.statusEncrypted')}{' '}
          <span className="text-green-400 font-semibold">{t('patient.fullyEncrypted')}</span>
        </span>
        <MagneticButton
          className="primary-btn !text-sm !px-5 !py-2.5"
          onClick={() => navigate(ROUTES.PATIENT_HEALTH_CARD)}
        >
          {t('patient.viewPassport')}
        </MagneticButton>
      </div>
    </motion.div>
  );
};

export default HealthIdCard;
