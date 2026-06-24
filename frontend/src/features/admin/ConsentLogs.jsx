import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icons } from './adminIcons';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ConsentLogs = ({ consents, searchQuery, onSearchChange, filterStatus, onFilterChange }) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState('newest');

  const filtered = consents
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        c.patientId?.name?.toLowerCase().includes(q) ||
        c.hospitalId?.hospitalName?.toLowerCase().includes(q);
      const matchFilter = filterStatus === 'all' || c.status === filterStatus;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <motion.div key="consents" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="admin-page-header">
        <h2>{t('admin.consentManagement')}</h2>
        <p>{t('admin.consentManagementDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allConsents')} ({filtered.length})</h3>
          <div className="table-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchConsents')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="table-filter-btn"
              style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '8px 16px', 
                color: 'var(--text-primary)', 
                cursor: 'pointer',
                fontWeight: 600,
                outline: 'none',
                height: '38px'
              }}
            >
              <option value="newest">Requested (Newest)</option>
              <option value="oldest">Requested (Oldest)</option>
            </select>

            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                className={`table-filter-btn ${filterStatus === f ? 'active' : ''}`}
                onClick={() => onFilterChange(f)}
              >
                {t(`common.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
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
                {filtered.map((c, i) => (
                  <motion.tr key={c._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.patientId?.name ?? '—'}</td>
                    <td>{c.hospitalId?.hospitalName ?? '—'}</td>
                    <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
                    <td>
                      {formatDate(c.createdAt)}
                      <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showingConsents', { count: filtered.length, total: consents.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ConsentLogs;
