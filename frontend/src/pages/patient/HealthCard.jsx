// src/pages/patient/HealthCard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { getHealthCard } from '../../services/patientService';
import { Link } from 'react-router-dom';
import { FaDownload, FaShareAlt } from 'react-icons/fa';

const HealthCard = () => {
  const { t } = useTranslation();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealthCard()
      .then(res => setCardData(res.data))
      .catch(err => console.error("Failed to fetch health card", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="skeleton w-full max-w-md h-[400px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="heading-gradient text-3xl font-bold">Emergency QR Card</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Your secure digital health identity</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Card Container */}
        <motion.div 
          className="relative w-full max-w-md mx-auto md:mx-0 p-6 sm:p-8 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.4) 0%, rgba(0, 242, 254, 0.1) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)'
          }}
          whileHover={{ rotateY: 2, rotateX: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Background Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--secondary-color)] opacity-20 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[var(--accent-pink)] opacity-10 blur-[50px] rounded-full pointer-events-none" />
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-5 mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold tracking-wider text-white">Arogyam<span className="text-[var(--secondary-color)]">ID</span></h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-widest">Republic of India</p>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-lg border border-white/20">
              {cardData && <QRCodeSVG value={cardData.healthId} size={70} level="M" />}
            </div>
          </div>

          <div className="space-y-5 relative z-10">
            {/* Name */}
            <div>
              <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Cardholder Name</p>
              <h3 className="text-xl sm:text-2xl text-white font-bold">{cardData?.name || 'N/A'}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Arogyam ID</p>
                <h3 className="text-sm sm:text-base text-[var(--secondary-color)] font-mono tracking-wider font-bold">
                  {cardData?.healthId || 'N/A'}
                </h3>
              </div>
              <div>
                <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Aadhaar No.</p>
                <h3 className="text-sm sm:text-base text-white font-mono tracking-wider font-semibold">
                  {cardData?.aadhaar ? `XXXX XXXX ${cardData.aadhaar.slice(-4)}` : '—'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 bg-white/5 -mx-6 sm:-mx-8 px-6 sm:px-8">
              <div>
                <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Blood Group</p>
                <h3 className="text-xl text-[var(--accent-pink)] font-black">{cardData?.bloodGroup || '—'}</h3>
              </div>
              <div>
                <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Allergies</p>
                <p className="text-sm text-white font-medium">{cardData?.allergies || 'None'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1">Contact</p>
                <h3 className="text-sm text-white font-medium">{cardData?.phone || '—'}</h3>
              </div>
              <div>
                <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Emergency
                </p>
                <h3 className="text-sm text-red-400 font-bold">{cardData?.emergencyContact || '—'}</h3>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions panel */}
        <div className="flex-1 w-full space-y-4">
          <div className="glass-panel !p-6 border-l-4 border-[var(--secondary-color)]">
            <h3 className="font-bold text-[var(--text-primary)] mb-2 text-lg">How to use this card</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Show this QR code at any Arogyam-registered hospital. Doctors can scan it to instantly request access to your medical history, saving time during emergencies.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="primary-btn !py-3 flex-1 flex items-center justify-center gap-2">
              <FaDownload /> Download PDF
            </button>
            <button className="secondary-btn !py-3 flex-1 flex items-center justify-center gap-2">
              <FaShareAlt /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCard;
