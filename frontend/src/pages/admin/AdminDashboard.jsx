// src/pages/admin/AdminDashboard.jsx
// Thin orchestrator — all logic lives here, views are in src/features/admin/
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Services (no direct axios in components)
import {
  getAdminStats, getAllHospitals, getHospitalById,
  approveHospital, rejectHospital, deleteHospital,
  getAllPatients, deletePatient,
  getAllRecords, getAllConsents,
} from '../../services/adminService';

// Feature views
import AdminAnalytics from '../../features/admin/AdminAnalytics';
import HospitalVerification from '../../features/admin/HospitalVerification';
import UserManagement from '../../features/admin/UserManagement';
import RecordsView from '../../features/admin/RecordsView';
import ConsentLogs from '../../features/admin/ConsentLogs';
import ComplaintManagement from '../../features/admin/ComplaintManagement';
import { Icons } from '../../features/admin/adminIcons';

import './AdminDashboard.css';

/* ── Sidebar nav config ── */
const NAV_ITEMS = [
  { key: 'overview',  labelKey: 'admin.overviewLabel',  icon: Icons.Overview,  sectionKey: 'admin.sectionDashboard' },
  { key: 'hospitals', labelKey: 'admin.hospitalsLabel', icon: Icons.Hospital,  sectionKey: 'admin.sectionManagement' },
  { key: 'patients',  labelKey: 'admin.patientsLabel',  icon: Icons.Patient,   sectionKey: 'admin.sectionManagement' },
  { key: 'records',   labelKey: 'admin.recordsLabel',   icon: Icons.Record,    sectionKey: 'admin.sectionData' },
  { key: 'consents',  labelKey: 'admin.consentsLabel',  icon: Icons.Consent,   sectionKey: 'admin.sectionData' },
  { key: 'support',   labelKey: 'Support Tickets',      icon: Icons.Hospital,  sectionKey: 'admin.sectionManagement' },
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // View state
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data state
  const [stats, setStats]       = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients]  = useState([]);
  const [records, setRecords]    = useState([]);
  const [consents, setConsents]  = useState([]);

  // Shared UI state (passed down to views)
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionReason, setActionReason] = useState('');


  /* ── Data fetchers ── */
  const fetchStats     = useCallback(() => getAdminStats().then(r => setStats(r.data)).catch(() => {}), []);
  const fetchHospitals = useCallback(() => getAllHospitals().then(r => setHospitals(r.data.hospitals || [])).catch(() => {}), []);
  const fetchPatients  = useCallback(() => getAllPatients().then(r => setPatients(r.data.patients || [])).catch(() => {}), []);
  const fetchRecords   = useCallback(() => getAllRecords().then(r => setRecords(r.data.records || [])).catch(() => {}), []);
  const fetchConsents  = useCallback(() => getAllConsents().then(r => setConsents(r.data.consents || [])).catch(() => {}), []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchHospitals(), fetchPatients(), fetchRecords(), fetchConsents()]);
      setLoading(false);
    };
    init();
  }, [fetchStats, fetchHospitals, fetchPatients, fetchRecords, fetchConsents]);

  /* ── Hospital actions ── */
  const handleHospitalAction = async (id, action) => {
    try {
      if (action === 'approve') await approveHospital(id);
      else if (action === 'reject') await rejectHospital(id, actionReason);
      else if (action === 'suspend') await suspendHospital(id, actionReason);
      else if (action === 'delete') await deleteHospital(id);
      setConfirmAction(null);
      setActionReason('');
      setSelectedHospital(null);
      await Promise.all([fetchHospitals(), fetchStats()]);
    } catch {
      alert(t('admin.actionFailed'));
    }
  };

  /* ── Patient actions ── */
  const handlePatientAction = async (id) => {
    try {
      await deletePatient(id);
      setConfirmAction(null);
      await Promise.all([fetchPatients(), fetchStats()]);
    } catch {
      alert(t('admin.actionFailed'));
    }
  };

  /* ── View hospital detail ── */
  const handleViewHospital = async (id) => {
    try {
      const res = await getHospitalById(id);
      setSelectedHospital(res.data);
    } catch {
      // ignore
    }
  };

  /* ── Navigation ── */
  const handleNavClick = (key) => {
    setActiveView(key);
    setSearchQuery('');
    setFilterStatus('all');
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  /* ── Sidebar badge counts ── */
  const counts = {
    hospitals: hospitals.length,
    patients: patients.length,
    records: records.length,
    consents: consents.length,
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="admin-portal">
        <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)' }}
          />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{t('admin.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  /* ── Active view router ── */
  const renderView = () => {
    const commonSearch = { searchQuery, onSearchChange: setSearchQuery };
    const commonFilter = { filterStatus, onFilterChange: setFilterStatus };
    switch (activeView) {
      case 'overview':  return <AdminAnalytics stats={stats} onNavigate={handleNavClick} />;
      case 'hospitals': return <HospitalVerification hospitals={hospitals} {...commonSearch} {...commonFilter} onView={handleViewHospital} onConfirm={setConfirmAction} />;
      case 'patients':  return <UserManagement patients={patients} {...commonSearch} onConfirm={setConfirmAction} />;
      case 'records':   return <RecordsView records={records} {...commonSearch} />;
      case 'consents':  return <ConsentLogs consents={consents} {...commonSearch} {...commonFilter} />;
      case 'support':   return <ComplaintManagement />;
      default:          return <AdminAnalytics stats={stats} onNavigate={handleNavClick} />;
    }
  };

  return (
    <>
      <div className="admin-portal">
        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <div className="admin-badge"><Icons.Shield /> {t('admin.superAdmin')}</div>
            <h3>Arogyam</h3>
            <p>{t('admin.adminPortal')}</p>
          </div>

          <nav className="sidebar-nav">
            {(() => {
              let lastSection = '';
              return NAV_ITEMS.map((navItem) => {
                const showLabel = navItem.sectionKey !== lastSection;
                lastSection = navItem.sectionKey;
                return (
                  <React.Fragment key={navItem.key}>
                    {showLabel && <div className="sidebar-section-label">{t(navItem.sectionKey)}</div>}
                    <button
                      className={`sidebar-nav-item ${activeView === navItem.key ? 'active' : ''}`}
                      onClick={() => handleNavClick(navItem.key)}
                    >
                      <span className="nav-icon"><navItem.icon /></span>
                      {t(navItem.labelKey)}
                      {counts[navItem.key] != null && (
                        <span className="nav-count">{counts[navItem.key]}</span>
                      )}
                    </button>
                  </React.Fragment>
                );
              });
            })()}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <Icons.Logout /> {t('common.logout')}
            </button>
          </div>
        </aside>

        {/* ── Mobile backdrop ── */}
        <div
          className={`sidebar-mobile-backdrop ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Main content ── */}
        <main className="admin-content">
          <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
        </main>
      </div>

      {/* ── Mobile toggle ── */}
      <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <Icons.Close /> : <Icons.Menu />}
      </button>

      {/* ── Hospital Detail Modal ── */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedHospital(null)}>
            <motion.div
              className="modal-panel"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{selectedHospital.hospitalName}</h3>
                  <span className={`status-badge ${selectedHospital.verificationStatus}`}>{selectedHospital.verificationStatus?.replace('_', ' ')}</span>
                </div>
                <button className="modal-close" onClick={() => setSelectedHospital(null)} style={{ position: 'relative', top: 0, right: 0 }}>✕</button>
              </div>

              <div className="detail-grid">
                {[
                  { label: t('admin.regNumber'), value: selectedHospital.regNumber },
                  { label: t('admin.email'), value: selectedHospital.email },
                  { label: t('common.phone'), value: selectedHospital.phone || '—' },
                  { label: t('admin.registeredOn'), value: new Date(selectedHospital.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                ].map((field) => (
                  <div className="detail-item" key={field.label}>
                    <label>{field.label}</label>
                    <p>{field.value}</p>
                  </div>
                ))}
                <div className="detail-item full-width">
                  <label>{t('common.address')}</label>
                  <p>{selectedHospital.address || '—'}</p>
                </div>
                {selectedHospital.licencePdf && (
                  <div className="detail-item full-width">
                    <label>{t('admin.licenceDocument')}</label>
                    <p>
                      <a
                        href={selectedHospital.licencePdf?.startsWith('http') ? selectedHospital.licencePdf : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '')}${selectedHospital.licencePdf}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {t('admin.viewDocument')} ↗
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {selectedHospital.verificationStatus === 'pending' && (
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                  <button className="action-btn approve" style={{ padding: '10px 24px', fontSize: '13px' }} onClick={() => setConfirmAction({ id: selectedHospital._id, action: 'approve', name: selectedHospital.hospitalName })}>
                    <Icons.Check /> {t('admin.approveHospital')}
                  </button>
                  <button className="action-btn reject" style={{ padding: '10px 24px', fontSize: '13px' }} onClick={() => setConfirmAction({ id: selectedHospital._id, action: 'reject', name: selectedHospital.hospitalName })}>
                    <Icons.X /> {t('admin.rejectHospital')}
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Action Dialog ── */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmAction(null)}>
            <motion.div
              className="confirm-dialog"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4>
                {confirmAction.action === 'approve'        && `✅ ${t('admin.approveHospital')}`}
                {confirmAction.action === 'reject'         && `❌ ${t('admin.rejectHospital')}`}
                {confirmAction.action === 'suspend'        && `🛡️ Suspend Hospital`}
                {confirmAction.action === 'delete'         && `🗑️ ${t('admin.deleteHospital')}`}
                {confirmAction.action === 'delete-patient' && `🗑️ ${t('admin.deletePatient')}`}
              </h4>
              <p>
                {t('admin.areYouSureAction', {
                  action: confirmAction.action.includes('delete') ? 'delete' : confirmAction.action,
                  name: confirmAction.name,
                })}
                {confirmAction.action.includes('delete') && ` ${t('admin.actionCannotBeUndone')}`}
              </p>
              
              {(confirmAction.action === 'reject' || confirmAction.action === 'suspend') && (
                <textarea 
                  className="form-input" 
                  style={{ width: '100%', marginTop: '1rem', minHeight: '80px' }} 
                  placeholder="Reason (Optional but recommended)"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              )}

              <div className="confirm-dialog-actions" style={{ marginTop: '1.5rem' }}>
                <button className="secondary-btn" style={{ padding: '10px 24px', fontSize: '14px' }} onClick={() => { setConfirmAction(null); setActionReason(''); }}>
                  {t('common.cancel')}
                </button>
                <button
                  className={`action-btn ${confirmAction.action.includes('delete') ? 'reject' : confirmAction.action}`}
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                  onClick={() => {
                    if (confirmAction.action === 'delete-patient') handlePatientAction(confirmAction.id);
                    else handleHospitalAction(confirmAction.id, confirmAction.action);
                  }}
                >
                  {confirmAction.action === 'approve'                 && t('common.approve')}
                  {confirmAction.action === 'reject'                  && t('common.reject')}
                  {confirmAction.action.includes('delete')            && t('common.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;
