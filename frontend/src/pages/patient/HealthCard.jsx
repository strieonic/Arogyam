// src/pages/patient/HealthCard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { getPatientProfile } from '../../services/patientService';
import { Link } from 'react-router-dom';
import { SkeletonBox } from '../../components/ui/SkeletonLoader';
import { FaDownload, FaShareAlt, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const HealthCard = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    getPatientProfile()
      .then(res => setProfileData(res.data))
      .catch(err => {
        console.error("Failed to fetch patient profile for card", err);
        toast.error("Failed to load health card information");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    if (profileData?.healthId) {
      navigator.clipboard.writeText(profileData.healthId);
      toast.success("Arogyam ID copied to clipboard for sharing!");
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAge = (dobString) => {
    if (!dobString) return '—';
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper max-w-3xl flex justify-center items-center">
        <SkeletonBox width="100%" height="260px" className="max-w-md rounded-[2rem]" />
      </div>
    );
  }


  // Format allergies array or string
  const allergyList = Array.isArray(profileData?.allergies) 
    ? profileData.allergies.join(', ') 
    : (profileData?.allergies || 'None');

  return (
    <div className="page-wrapper print:p-0 print:m-0">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 print:hidden">
        <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="heading-gradient text-3xl font-bold">Emergency Health Card</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Your secure, flippable digital health identity card</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start print:block">
        {/* Interactive 3D Flip Card */}
        <div className="w-full flex flex-col items-center gap-4 print:hidden">
          <div 
            className={`health-card-scene ${flipped ? 'is-flipped' : ''}`}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="health-card-inner">
              {/* CARD FRONT */}
              <div className="health-card-front">
                {/* Background Glows */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--secondary-color)] opacity-20 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[var(--accent-pink)] opacity-10 blur-[50px] rounded-full pointer-events-none" />

                {/* Card Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold tracking-wider text-white">
                      Arogyam<span className="text-[var(--secondary-color)]">ID</span>
                    </h2>
                    <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest">Republic of India</p>
                  </div>
                  <span className="card-badge success">Emergency Card</span>
                </div>

                {/* Card Body */}
                <div className="flex gap-4 items-center relative z-10 py-3">
                  {/* Left Column (Initials Avatar & QR Code) */}
                  <div className="flex flex-col gap-3 items-center">
                    <div className="card-avatar-initials">
                      {getInitials(profileData?.name)}
                    </div>
                  </div>

                  {/* Right Column (General Metadata) */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div>
                      <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Cardholder Name</p>
                      <h3 className="text-base sm:text-lg text-white font-bold break-words leading-tight">{profileData?.name || 'N/A'}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Arogyam ID</p>
                        <h4 className="text-[10px] sm:text-[11px] text-[var(--secondary-color)] font-mono font-bold break-all">
                          {profileData?.healthId || 'N/A'}
                        </h4>
                      </div>
                      <div>
                        <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Aadhaar No.</p>
                        <h4 className="text-[10px] sm:text-[11px] text-white font-mono break-all">
                          {profileData?.aadhaar ? `XXXX XXXX ${profileData.aadhaar.slice(-4)}` : '—'}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5">
                      <div>
                        <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Blood</p>
                        <h4 className="text-xs text-[var(--accent-primary)] font-black">{profileData?.bloodGroup || '—'}</h4>
                      </div>
                      <div>
                        <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Gender</p>
                        <h4 className="text-xs text-white font-semibold capitalize">{profileData?.gender || '—'}</h4>
                      </div>
                      <div>
                        <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Age</p>
                        <h4 className="text-xs text-white font-semibold">{profileData?.dob ? `${getAge(profileData.dob)} yrs` : '—'}</h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-end pt-2 border-t border-white/5 relative z-10">
                  <div>
                    <p className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">DOB</p>
                    <p className="text-[10px] text-white font-mono">{formatDate(profileData?.dob)}</p>
                  </div>
                  <div className="p-1 bg-white rounded-lg shadow-lg border border-white/20 flex items-center justify-center">
                    {profileData && <QRCodeSVG value={profileData.healthId} size={42} level="M" />}
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="health-card-back">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Emergency & Medical Details</h3>
                  <span className="card-badge danger">Scan for Records</span>
                </div>

                {/* Body Details */}
                <div className="space-y-2.5 relative z-10 py-2 text-[11px]">
                  <div>
                    <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold block">Permanent Address</span>
                    <p className="text-white line-clamp-2 leading-tight">{profileData?.address || 'No address provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
                    <div>
                      <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold block">Primary Contact</span>
                      <p className="text-white font-medium break-all">{profileData?.phone || '—'}</p>
                      <p className="text-[9px] text-[var(--text-tertiary)] break-all">{profileData?.email || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold block">Emergency Contact</span>
                      <p className="text-white font-bold break-all">
                        {profileData?.emergencyContact?.phone || profileData?.emergencyContact || '—'}
                      </p>
                      <p className="text-[9px] text-[var(--text-tertiary)] break-words">
                        {profileData?.emergencyContact?.name || 'Primary'} ({profileData?.emergencyContact?.relation || 'Contact'})
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2">
                    <span className="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold block">Known Allergies</span>
                    <p className="text-[var(--accent-pink)] font-semibold break-words leading-tight">{allergyList}</p>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="pt-2 border-t border-white/5 text-[8px] text-[var(--text-tertiary)] leading-tight text-center relative z-10">
                  This card is part of the Arogyam network. Show this QR code to medical officers for record query authorization.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive hints */}
          <button 
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
            onClick={() => setFlipped(!flipped)}
          >
            <FaSyncAlt className="animate-pulse" /> Click card to flip and check details
          </button>
        </div>

        {/* Flat Layout visible ONLY for window.print() */}
        <div className="health-card-print-grid">
          {/* PRINT FRONT */}
          <div className="print-card-face">
            <div className="flex justify-between items-center border-b card-border-sep pb-3">
              <div>
                <h2 className="text-xl font-bold tracking-wider card-text-highlight">
                  ArogyamID
                </h2>
                <p className="text-[9px] card-text-muted uppercase tracking-widest">Republic of India</p>
              </div>
              <span className="text-[10px] font-bold uppercase border border-emerald-300 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                Emergency Card
              </span>
            </div>

            <div className="flex gap-4 items-center py-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-700">
                {getInitials(profileData?.name)}
              </div>

              <div className="flex-1 space-y-1">
                <div>
                  <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">Cardholder Name</p>
                  <h3 className="text-lg card-text-dark font-bold">{profileData?.name || 'N/A'}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">Arogyam ID</p>
                    <h4 className="text-xs card-text-highlight font-mono font-bold">{profileData?.healthId || 'N/A'}</h4>
                  </div>
                  <div>
                    <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">Aadhaar No.</p>
                    <h4 className="text-xs card-text-dark font-mono">
                      {profileData?.aadhaar ? `XXXX XXXX ${profileData.aadhaar.slice(-4)}` : '—'}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t card-border-sep text-center">
              <div>
                <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">DOB</p>
                <h4 className="text-xs card-text-dark font-semibold">{formatDate(profileData?.dob)}</h4>
              </div>
              <div>
                <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">Blood</p>
                <h4 className="text-xs text-red-600 font-black">{profileData?.bloodGroup || '—'}</h4>
              </div>
              <div>
                <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">Gender</p>
                <h4 className="text-xs card-text-dark font-semibold capitalize">{profileData?.gender || '—'}</h4>
              </div>
              <div>
                <p className="text-[8px] card-text-muted uppercase tracking-widest font-bold">Age</p>
                <h4 className="text-xs card-text-dark font-semibold">{profileData?.dob ? `${getAge(profileData.dob)} yrs` : '—'}</h4>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t card-border-sep">
              <span className="text-[8px] card-text-muted">AROGYAM PATIENT NETWORK</span>
              <div className="border border-slate-300 p-1 bg-white rounded">
                {profileData && <QRCodeSVG value={profileData.healthId} size={50} level="M" />}
              </div>
            </div>
          </div>

          {/* PRINT BACK */}
          <div className="print-card-face">
            <div className="flex justify-between items-center border-b card-border-sep pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider card-text-highlight">Emergency & Medical Details</h3>
              <span className="text-[9px] font-bold uppercase border border-red-300 bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                Scan Front QR
              </span>
            </div>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <span className="text-[8px] card-text-muted uppercase tracking-widest font-bold block">Permanent Address</span>
                <p className="card-text-dark leading-tight">{profileData?.address || 'No address provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t card-border-sep pt-2">
                <div>
                  <span className="text-[8px] card-text-muted uppercase tracking-widest font-bold block">Primary Contact</span>
                  <p className="card-text-dark font-semibold break-all">{profileData?.phone || '—'}</p>
                  <p className="text-[9px] card-text-muted break-all">{profileData?.email || '—'}</p>
                </div>
                <div>
                  <span className="text-[8px] card-text-muted uppercase tracking-widest font-bold block">Emergency Contact</span>
                  <p className="card-text-dark font-bold break-all">
                    {profileData?.emergencyContact?.phone || profileData?.emergencyContact || '—'}
                  </p>
                  <p className="text-[9px] card-text-muted break-words">
                    {profileData?.emergencyContact?.name || 'Primary'} ({profileData?.emergencyContact?.relation || 'Contact'})
                  </p>
                </div>
              </div>

              <div className="border-t card-border-sep pt-2">
                <span className="text-[8px] card-text-muted uppercase tracking-widest font-bold block">Known Allergies</span>
                <p className="text-red-700 font-bold break-words">{allergyList}</p>
              </div>
            </div>

            <div className="pt-2 border-t card-border-sep text-[8px] card-text-muted text-center leading-tight">
              This card is part of the Arogyam network. Show this QR code to medical officers for record query authorization.
            </div>
          </div>
        </div>

        {/* Actions panel */}
        <div className="flex-1 w-full space-y-4 print:hidden">
          <div className="glass-panel !p-6 border-l-4 border-[var(--secondary-color)]">
            <h3 className="font-bold text-[var(--text-primary)] mb-2 text-lg">Digital Emergency ID</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              This flippable smart card compiles your vital identity, contact, emergency details, and allergy warnings. 
            </p>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              💡 <strong>How to use:</strong> Show this card to any healthcare officer. When scanned, it authorizes secure record query consent. Click on the card to flip it and review the details stored on the back.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleDownload}
              className="primary-btn !py-3 flex-1 flex items-center justify-center gap-2"
              title="Download PDF copy"
            >
              <FaDownload /> Download PDF
            </button>
            <button 
              onClick={handleShare}
              className="secondary-btn !py-3 flex-1 flex items-center justify-center gap-2"
              title="Copy ID to Clipboard"
            >
              <FaShareAlt /> Share ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCard;
