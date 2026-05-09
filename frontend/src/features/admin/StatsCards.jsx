// src/features/admin/StatsCards.jsx
// Overview stats grid + quick actions + activity feed
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icons } from './adminIcons';
import { timeAgo } from '../../utils/formatters';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const StatsCards = ({ stats, hospitals, onNavigate }) => {
  const { t } = useTranslation();

  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="admin-page-header">
        <h2>{t('admin.dashboardOverview')}</h2>
        <p>{t('admin.realtimeMetrics')}</p>
      </div>

      {/* Stat Cards */}
      <motion.div className="stats-grid" variants={stagger} initial="hidden" animate="visible">
        <motion.div className="stat-card accent-pink" variants={item}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">👥</div>
            {stats?.recentPatients > 0 && (
              <span className="stat-change positive"><Icons.ArrowUp /> +{stats.recentPatients} {t('admin.thisWeek')}</span>
            )}
          </div>
          <div className="stat-value">{stats?.totalPatients ?? '—'}</div>
          <div className="stat-label">{t('admin.totalPatients')}</div>
        </motion.div>

        <motion.div className="stat-card accent-teal" variants={item}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">🏥</div>
            {stats?.recentHospitals > 0 && (
              <span className="stat-change positive"><Icons.ArrowUp /> +{stats.recentHospitals} {t('admin.thisWeek')}</span>
            )}
          </div>
          <div className="stat-value">{stats?.totalHospitals ?? '—'}</div>
          <div className="stat-label">{t('admin.registeredHospitals')}</div>
        </motion.div>

        <motion.div className="stat-card accent-amber" variants={item}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">📋</div>
            {stats?.recentRecords > 0 && (
              <span className="stat-change positive"><Icons.ArrowUp /> +{stats.recentRecords} {t('admin.thisWeek')}</span>
            )}
          </div>
          <div className="stat-value">{stats?.totalRecords ?? '—'}</div>
          <div className="stat-label">{t('admin.medicalRecords')}</div>
        </motion.div>

        <motion.div className="stat-card accent-purple" variants={item}>
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">🛡️</div>
            <span className="stat-change neutral">{stats?.approvedConsents ?? 0} {t('admin.approvedSuffix')}</span>
          </div>
          <div className="stat-value">{stats?.totalConsents ?? '—'}</div>
          <div className="stat-label">{t('admin.consentRequests')}</div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="quick-actions" variants={stagger} initial="hidden" animate="visible">
        <motion.div className="quick-action-card" variants={item} onClick={() => onNavigate('hospitals')}>
          <div className="quick-action-icon">⏳</div>
          <div>
            <h4>{stats?.pendingHospitals ?? 0} {t('admin.pendingApprovals', { count: '' }).trim()}</h4>
            <p>{t('admin.reviewRegistrations')}</p>
          </div>
        </motion.div>
        <motion.div className="quick-action-card" variants={item} onClick={() => onNavigate('patients')}>
          <div className="quick-action-icon">👤</div>
          <div>
            <h4>{t('admin.managePatients')}</h4>
            <p>{t('admin.viewAllPatients')}</p>
          </div>
        </motion.div>
        <motion.div className="quick-action-card" variants={item} onClick={() => onNavigate('records')}>
          <div className="quick-action-icon">📁</div>
          <div>
            <h4>{t('admin.medicalRecordsAction')}</h4>
            <p>{t('admin.monitorRecords')}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Activity + System Health */}
      <div className="activity-section">
        <motion.div className="activity-feed" variants={item} initial="hidden" animate="visible">
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

        <motion.div className="system-health" variants={item} initial="hidden" animate="visible">
          <h3>{t('admin.systemStatus')}</h3>
          {[
            { label: t('admin.approvedHospitals'), value: stats?.approvedHospitals ?? 0 },
            { label: t('admin.pendingHospitals'), value: stats?.pendingHospitals ?? 0, warn: true },
            { label: t('admin.rejectedHospitals'), value: stats?.rejectedHospitals ?? 0, danger: true },
            { label: t('admin.pendingConsents'), value: stats?.pendingConsents ?? 0, warn: true },
            { label: t('admin.databaseStatus'), value: t('admin.online') },
          ].map((row, i) => (
            <div className="health-item" key={i}>
              <span className="health-label">{row.label}</span>
              <span className={`health-value ${row.warn && row.value > 0 ? 'warning' : ''} ${row.danger && row.value > 0 ? 'danger' : ''}`}>
                {row.value}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCards;
