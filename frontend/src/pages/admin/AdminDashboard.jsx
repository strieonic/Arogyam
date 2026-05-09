import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import './AdminDashboard.css';

/* ── Icon Components ── */
const Icons = {
  Overview: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Hospital: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
    </svg>
  ),
  Patient: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Record: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Consent: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ArrowUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Eye: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Trash: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

/* ── Helper: Format date ── */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/* ==============================================================
   SIDEBAR NAV CONFIG
============================================================== */
const NAV_ITEMS = [
  { key: 'overview', labelKey: 'admin.overviewLabel', icon: Icons.Overview, sectionKey: 'admin.sectionDashboard' },
  { key: 'hospitals', labelKey: 'admin.hospitalsLabel', icon: Icons.Hospital, sectionKey: 'admin.sectionManagement' },
  { key: 'patients', labelKey: 'admin.patientsLabel', icon: Icons.Patient, sectionKey: 'admin.sectionManagement' },
  { key: 'records', labelKey: 'admin.recordsLabel', icon: Icons.Record, sectionKey: 'admin.sectionData' },
  { key: 'consents', labelKey: 'admin.consentsLabel', icon: Icons.Consent, sectionKey: 'admin.sectionData' },
];

/* ==============================================================
   ADMIN DASHBOARD — MAIN COMPONENT
============================================================== */
const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data state
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [consents, setConsents] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  /* ── Fetch dashboard stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  }, []);

  /* ── Fetch hospitals ── */
  const fetchHospitals = useCallback(async () => {
    try {
      const res = await api.get('/admin/hospitals');
      setHospitals(res.data.hospitals || []);
    } catch (err) {
      console.error('Hospitals fetch failed:', err);
    }
  }, []);

  /* ── Fetch patients ── */
  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get('/admin/patients');
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Patients fetch failed:', err);
    }
  }, []);

  /* ── Fetch records ── */
  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get('/admin/records');
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Records fetch failed:', err);
    }
  }, []);

  /* ── Fetch consents ── */
  const fetchConsents = useCallback(async () => {
    try {
      const res = await api.get('/admin/consents');
      setConsents(res.data.consents || []);
    } catch (err) {
      console.error('Consents fetch failed:', err);
    }
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchHospitals(), fetchPatients(), fetchRecords(), fetchConsents()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchStats, fetchHospitals, fetchPatients, fetchRecords, fetchConsents]);

  /* ── Hospital actions ── */
  const handleHospitalAction = async (id, action) => {
    try {
      if (action === 'approve') await api.put(`/admin/hospitals/${id}/approve`);
      else if (action === 'reject') await api.put(`/admin/hospitals/${id}/reject`);
      else if (action === 'delete') await api.delete(`/admin/hospitals/${id}`);
      setConfirmAction(null);
      setSelectedHospital(null);
      await Promise.all([fetchHospitals(), fetchStats()]);
    } catch (err) {
      alert(t('admin.actionFailed'));
    }
  };

  /* ── Patient actions ── */
  const handlePatientAction = async (id, action) => {
    try {
      if (action === 'delete') await api.delete(`/admin/patients/${id}`);
      setConfirmAction(null);
      await Promise.all([fetchPatients(), fetchStats()]);
    } catch (err) {
      alert(t('admin.actionFailed'));
    }
  };

  /* ── View hospital detail ── */
  const handleViewHospital = async (id) => {
    try {
      const res = await api.get(`/admin/hospitals/${id}`);
      setSelectedHospital(res.data);
    } catch (err) {
      console.error('Hospital detail fetch failed:', err);
    }
  };

  /* ── Admin logout ── */
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  /* ── Sidebar nav click ── */
  const handleNavClick = (key) => {
    setActiveView(key);
    setSearchQuery('');
    setFilterStatus('all');
    setSidebarOpen(false);
  };

  /* ── Counts for sidebar badges ── */
  const getCounts = () => ({
    overview: null,
    hospitals: hospitals.length,
    patients: patients.length,
    records: records.length,
    consents: consents.length,
  });
  const counts = getCounts();

  /* ── Filter helpers ── */
  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = !searchQuery || 
      h.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.regNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || h.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredPatients = patients.filter(p =>
    !searchQuery ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.healthId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  const filteredRecords = records.filter(r =>
    !searchQuery ||
    r.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient?.healthId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.hospital?.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.recordType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConsents = consents.filter(c => {
    const matchesSearch = !searchQuery ||
      c.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospitalId?.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  /* ── Page animation ── */
  const pageVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  const staggerContainer = {
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  /* ==============================================================
     RENDER — OVERVIEW VIEW
  ============================================================== */
  const renderOverview = () => (
    <motion.div key="overview" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="admin-page-header">
        <h2>{t('admin.dashboardOverview')}</h2>
        <p>{t('admin.realtimeMetrics')}</p>
      </div>

      {/* Stat Cards */}
      <motion.div className="stats-grid" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div className="stat-card accent-pink" variants={staggerItem}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">👥</div>
            {stats?.recentPatients > 0 && (
              <span className="stat-change positive"><Icons.ArrowUp /> +{stats.recentPatients} {t('admin.thisWeek')}</span>
            )}
          </div>
          <div className="stat-value">{stats?.totalPatients ?? '—'}</div>
          <div className="stat-label">{t('admin.totalPatients')}</div>
        </motion.div>

        <motion.div className="stat-card accent-teal" variants={staggerItem}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">🏥</div>
            {stats?.recentHospitals > 0 && (
              <span className="stat-change positive"><Icons.ArrowUp /> +{stats.recentHospitals} {t('admin.thisWeek')}</span>
            )}
          </div>
          <div className="stat-value">{stats?.totalHospitals ?? '—'}</div>
          <div className="stat-label">{t('admin.registeredHospitals')}</div>
        </motion.div>

        <motion.div className="stat-card accent-amber" variants={staggerItem}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">📋</div>
            {stats?.recentRecords > 0 && (
              <span className="stat-change positive"><Icons.ArrowUp /> +{stats.recentRecords} {t('admin.thisWeek')}</span>
            )}
          </div>
          <div className="stat-value">{stats?.totalRecords ?? '—'}</div>
          <div className="stat-label">{t('admin.medicalRecords')}</div>
        </motion.div>

        <motion.div className="stat-card accent-purple" variants={staggerItem}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">🛡️</div>
            <span className="stat-change neutral">{stats?.approvedConsents ?? 0} {t('admin.approvedSuffix')}</span>
          </div>
          <div className="stat-value">{stats?.totalConsents ?? '—'}</div>
          <div className="stat-label">{t('admin.consentRequests')}</div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="quick-actions" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div className="quick-action-card" variants={staggerItem} onClick={() => handleNavClick('hospitals')}>
          <div className="quick-action-icon">⏳</div>
          <div>
            <h4>{stats?.pendingHospitals ?? 0} {t('admin.pendingApprovals', { count: '' }).trim()}</h4>
            <p>{t('admin.reviewRegistrations')}</p>
          </div>
        </motion.div>
        <motion.div className="quick-action-card" variants={staggerItem} onClick={() => handleNavClick('patients')}>
          <div className="quick-action-icon">👤</div>
          <div>
            <h4>{t('admin.managePatients')}</h4>
            <p>{t('admin.viewAllPatients')}</p>
          </div>
        </motion.div>
        <motion.div className="quick-action-card" variants={staggerItem} onClick={() => handleNavClick('records')}>
          <div className="quick-action-icon">📁</div>
          <div>
            <h4>{t('admin.medicalRecordsAction')}</h4>
            <p>{t('admin.monitorRecords')}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Activity + System Health */}
      <div className="activity-section">
        <motion.div className="activity-feed" variants={staggerItem} initial="hidden" animate="visible">
          <h3>{t('admin.recentActivity')}</h3>
          {hospitals.slice(0, 5).map((h, i) => (
            <div className="activity-item" key={h._id || i}>
              <div className={`activity-dot ${h.status === 'approved' ? 'dot-teal' : h.status === 'rejected' ? 'dot-pink' : 'dot-amber'}`} />
              <div className="activity-text">
                <p>
                  <strong>{h.hospitalName}</strong>
                  {h.status === 'pending' && t('admin.submittedRegistration')}
                  {h.status === 'approved' && t('admin.wasApproved')}
                  {h.status === 'rejected' && t('admin.wasRejected')}
                </p>
                <span>{timeAgo(h.updatedAt || h.createdAt)}</span>
              </div>
            </div>
          ))}
          {hospitals.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', padding: '1rem 0', fontSize: 'var(--text-sm)' }}>{t('admin.noRecentActivity')}</p>
          )}
        </motion.div>

        <motion.div className="system-health" variants={staggerItem} initial="hidden" animate="visible">
          <h3>{t('admin.systemStatus')}</h3>
          <div className="health-item">
            <span className="health-label">{t('admin.approvedHospitals')}</span>
            <span className="health-value">{stats?.approvedHospitals ?? 0}</span>
          </div>
          <div className="health-item">
            <span className="health-label">{t('admin.pendingHospitals')}</span>
            <span className={`health-value ${(stats?.pendingHospitals ?? 0) > 0 ? 'warning' : ''}`}>{stats?.pendingHospitals ?? 0}</span>
          </div>
          <div className="health-item">
            <span className="health-label">{t('admin.rejectedHospitals')}</span>
            <span className={`health-value ${(stats?.rejectedHospitals ?? 0) > 0 ? 'danger' : ''}`}>{stats?.rejectedHospitals ?? 0}</span>
          </div>
          <div className="health-item">
            <span className="health-label">{t('admin.pendingConsents')}</span>
            <span className={`health-value ${(stats?.pendingConsents ?? 0) > 0 ? 'warning' : ''}`}>{stats?.pendingConsents ?? 0}</span>
          </div>
          <div className="health-item">
            <span className="health-label">{t('admin.databaseStatus')}</span>
            <span className="health-value">{t('admin.online')}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  /* ==============================================================
     RENDER — HOSPITALS VIEW
  ============================================================== */
  const renderHospitals = () => (
    <motion.div key="hospitals" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="admin-page-header">
        <h2>{t('admin.hospitalManagement')}</h2>
        <p>{t('admin.hospitalManagementDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allHospitals')} ({filteredHospitals.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchHospitals')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                className={`table-filter-btn ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
              >
                {t(`common.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🏥</div>
            <h4>{t('admin.noHospitalsFound')}</h4>
            <p>{t('admin.adjustSearch')}</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.hospitalName')}</th>
                  <th>{t('admin.regNumber')}</th>
                  <th>{t('admin.email')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.registered')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((h, i) => (
                  <motion.tr 
                    key={h._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.hospitalName}</td>
                    <td><code style={{ fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>{h.regNumber}</code></td>
                    <td>{h.email}</td>
                    <td><span className={`status-badge ${h.status}`}>{h.status}</span></td>
                    <td>{formatDate(h.createdAt)}</td>
                    <td>
                      <div className="action-btn-group">
                        <button className="action-btn view admin-tooltip" data-tooltip={t('admin.viewDetails')} onClick={() => handleViewHospital(h._id)}>
                          <Icons.Eye />
                        </button>
                        {h.status === 'pending' && (
                          <>
                            <button className="action-btn approve admin-tooltip" data-tooltip={t('common.approve')} onClick={() => setConfirmAction({ id: h._id, action: 'approve', name: h.hospitalName })}><Icons.Check /> {t('common.approve')}</button>
                            <button className="action-btn reject admin-tooltip" data-tooltip={t('common.reject')} onClick={() => setConfirmAction({ id: h._id, action: 'reject', name: h.hospitalName })}><Icons.X /> {t('common.reject')}</button>
                          </>
                        )}
                        <button className="action-btn delete admin-tooltip" data-tooltip={t('common.delete')} onClick={() => setConfirmAction({ id: h._id, action: 'delete', name: h.hospitalName })}><Icons.Trash /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showing', { count: filteredHospitals.length, total: hospitals.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  /* ==============================================================
     RENDER — PATIENTS VIEW
  ============================================================== */
  const renderPatients = () => (
    <motion.div key="patients" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="admin-page-header">
        <h2>{t('admin.patientRegistry')}</h2>
        <p>{t('admin.patientRegistryDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allPatients')} ({filteredPatients.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchPatients')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👤</div>
            <h4>{t('admin.noPatientsFound')}</h4>
            <p>{searchQuery ? t('admin.tryDifferentSearch') : t('admin.noPatientsYet')}</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('admin.healthId')}</th>
                  <th>{t('common.phone')}</th>
                  <th>{t('admin.bloodGroup')}</th>
                  <th>{t('admin.registered')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, i) => (
                  <motion.tr
                    key={p._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td><code style={{ fontSize: '12px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>{p.healthId || '—'}</code></td>
                    <td>{p.phone}</td>
                    <td>{p.bloodGroup || '—'}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="action-btn-group">
                        <button className="action-btn delete admin-tooltip" data-tooltip={t('common.delete')} onClick={() => setConfirmAction({ id: p._id, action: 'delete-patient', name: p.name })}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showingPatients', { count: filteredPatients.length, total: patients.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  /* ==============================================================
     RENDER — RECORDS VIEW
  ============================================================== */
  const renderRecords = () => (
    <motion.div key="records" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="admin-page-header">
        <h2>{t('admin.medicalRecordsTitle')}</h2>
        <p>{t('admin.medicalRecordsDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allRecords')} ({filteredRecords.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchRecords')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📋</div>
            <h4>{t('admin.noRecordsFound')}</h4>
            <p>{searchQuery ? t('admin.tryDifferentSearch') : t('admin.noRecordsYet')}</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.patient')}</th>
                  <th>{t('admin.healthId')}</th>
                  <th>{t('admin.hospitalCol')}</th>
                  <th>{t('admin.recordType')}</th>
                  <th>{t('admin.uploadedDate')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, i) => (
                  <motion.tr
                    key={r._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.patient?.name ?? '—'}</td>
                    <td><code style={{ fontSize: '12px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>{r.patient?.healthId ?? '—'}</code></td>
                    <td>{r.hospital?.hospitalName ?? '—'}</td>
                    <td><span className="status-badge approved">{r.recordType || 'General'}</span></td>
                    <td>{formatDate(r.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showingRecords', { count: filteredRecords.length, total: records.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  /* ==============================================================
     RENDER — CONSENTS VIEW
  ============================================================== */
  const renderConsents = () => (
    <motion.div key="consents" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      <div className="admin-page-header">
        <h2>{t('admin.consentManagement')}</h2>
        <p>{t('admin.consentManagementDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allConsents')} ({filteredConsents.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchConsents')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                className={`table-filter-btn ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
              >
                {t(`common.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {filteredConsents.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🛡️</div>
            <h4>{t('admin.noConsentsFound')}</h4>
            <p>{searchQuery ? t('admin.tryDifferentSearch') : t('admin.noConsentsYet')}</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.patient')}</th>
                  <th>{t('admin.hospitalCol')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.requested')}</th>
                  <th>{t('admin.expires')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsents.map((c, i) => (
                  <motion.tr
                    key={c._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.patientId?.name ?? '—'}</td>
                    <td>{c.hospitalId?.hospitalName ?? '—'}</td>
                    <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                    <td>{formatDate(c.createdAt)}<br /><span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{formatTime(c.createdAt)}</span></td>
                    <td>{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showingConsents', { count: filteredConsents.length, total: consents.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  /* ==============================================================
     VIEW ROUTER
  ============================================================== */
  const renderView = () => {
    switch (activeView) {
      case 'overview': return renderOverview();
      case 'hospitals': return renderHospitals();
      case 'patients': return renderPatients();
      case 'records': return renderRecords();
      case 'consents': return renderConsents();
      default: return renderOverview();
    }
  };

  /* ==============================================================
     LOADING STATE
  ============================================================== */
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

  /* ==============================================================
     MAIN RENDER
  ============================================================== */
  return (
    <>
      <div className="admin-portal">
        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <div className="admin-badge"><Icons.Shield /> {t('admin.superAdmin')}</div>
            <h3>HealthID</h3>
            <p>{t('admin.adminPortal')}</p>
          </div>

          <nav className="sidebar-nav">
            {(() => {
              let lastSection = '';
              return NAV_ITEMS.map((item) => {
                const showLabel = item.sectionKey !== lastSection;
                lastSection = item.sectionKey;
                return (
                  <React.Fragment key={item.key}>
                    {showLabel && <div className="sidebar-section-label">{t(item.sectionKey)}</div>}
                    <button
                      className={`sidebar-nav-item ${activeView === item.key ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.key)}
                    >
                      <span className="nav-icon"><item.icon /></span>
                      {t(item.labelKey)}
                      {counts[item.key] != null && (
                        <span className="nav-count">{counts[item.key]}</span>
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

        {/* ── Mobile sidebar backdrop ── */}
        <div
          className={`sidebar-mobile-backdrop ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Main Content ── */}
        <main className="admin-content">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Sidebar Toggle ── */}
      <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <Icons.Close /> : <Icons.Menu />}
      </button>

      {/* ── Hospital Detail Modal ── */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedHospital(null)}
          >
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
                  <span className={`status-badge ${selectedHospital.status}`}>{selectedHospital.status}</span>
                </div>
                <button className="modal-close" onClick={() => setSelectedHospital(null)} style={{ position: 'relative', top: 0, right: 0 }}>✕</button>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>{t('admin.regNumber')}</label>
                  <p>{selectedHospital.regNumber}</p>
                </div>
                <div className="detail-item">
                  <label>{t('admin.email')}</label>
                  <p>{selectedHospital.email}</p>
                </div>
                <div className="detail-item">
                  <label>{t('common.phone')}</label>
                  <p>{selectedHospital.phone || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>{t('admin.registeredOn')}</label>
                  <p>{formatDate(selectedHospital.createdAt)}</p>
                </div>
                <div className="detail-item full-width">
                  <label>{t('common.address')}</label>
                  <p>{selectedHospital.address || '—'}</p>
                </div>
                {selectedHospital.licencePdf && (
                  <div className="detail-item full-width">
                    <label>{t('admin.licenceDocument')}</label>
                    <p>
                      <a href={selectedHospital.licencePdf?.startsWith('http') ? selectedHospital.licencePdf : `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${selectedHospital.licencePdf}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                        {t('admin.viewDocument')} ↗
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {selectedHospital.status === 'pending' && (
                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                  <button className="action-btn approve" style={{ padding: '10px 24px', fontSize: '13px' }} onClick={() => { handleHospitalAction(selectedHospital._id, 'approve'); }}>
                    <Icons.Check /> {t('admin.approveHospital')}
                  </button>
                  <button className="action-btn reject" style={{ padding: '10px 24px', fontSize: '13px' }} onClick={() => { handleHospitalAction(selectedHospital._id, 'reject'); }}>
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
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              className="confirm-dialog"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4>
                {(confirmAction.action === 'approve') && `✅ ${t('admin.approveHospital')}`}
                {(confirmAction.action === 'reject') && `❌ ${t('admin.rejectHospital')}`}
                {(confirmAction.action === 'delete') && `🗑️ ${t('admin.deleteHospital')}`}
                {(confirmAction.action === 'delete-patient') && `🗑️ ${t('admin.deletePatient')}`}
              </h4>
              <p>
                {t('admin.areYouSureAction', { action: confirmAction.action.includes('delete') ? 'delete' : confirmAction.action, name: confirmAction.name })}
                {confirmAction.action.includes('delete') && ` ${t('admin.actionCannotBeUndone')}`}
              </p>
              <div className="confirm-dialog-actions">
                <button className="secondary-btn" style={{ padding: '10px 24px', fontSize: '14px' }} onClick={() => setConfirmAction(null)}>{t('common.cancel')}</button>
                <button
                  className={`action-btn ${confirmAction.action.includes('delete') ? 'reject' : confirmAction.action}`}
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                  onClick={() => {
                    if (confirmAction.action === 'delete-patient') {
                      handlePatientAction(confirmAction.id, 'delete');
                    } else {
                      handleHospitalAction(confirmAction.id, confirmAction.action);
                    }
                  }}
                >
                  {confirmAction.action === 'approve' && t('common.approve')}
                  {confirmAction.action === 'reject' && t('common.reject')}
                  {confirmAction.action.includes('delete') && t('common.delete')}
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
