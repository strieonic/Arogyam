import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icons } from './adminIcons';
import { formatDate } from '../../utils/formatters';

const RecordsView = ({ records, searchQuery, onSearchChange }) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState('newest');

  const filtered = records
    .filter((r) => {
      const q = searchQuery.toLowerCase();
      return !q ||
        r.patient?.name?.toLowerCase().includes(q) ||
        r.patient?.healthId?.toLowerCase().includes(q) ||
        r.hospital?.hospitalName?.toLowerCase().includes(q) ||
        r.recordType?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'patient-az') return (a.patient?.name || '').localeCompare(b.patient?.name || '');
      if (sortBy === 'hospital-az') return (a.hospital?.hospitalName || '').localeCompare(b.hospital?.hospitalName || '');
      return 0;
    });

  return (
    <motion.div key="records" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="admin-page-header">
        <h2>{t('admin.medicalRecordsTitle')}</h2>
        <p>{t('admin.medicalRecordsDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allRecords')} ({filtered.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchRecords')}
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
              <option value="newest">Uploaded (Newest)</option>
              <option value="oldest">Uploaded (Oldest)</option>
              <option value="patient-az">Patient Name (A-Z)</option>
              <option value="hospital-az">Hospital Name (A-Z)</option>
            </select>
          </div>
        </div>


        {filtered.length === 0 ? (
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
                  <th>{t('admin.Arogyam')}</th>
                  <th>{t('admin.hospitalCol')}</th>
                  <th>{t('admin.recordType')}</th>
                  <th>{t('admin.uploadedDate')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr key={r._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.patient?.name ?? '—'}</td>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>
                        {r.patient?.healthId ?? '—'}
                      </code>
                    </td>
                    <td>{r.hospital?.hospitalName ?? '—'}</td>
                    <td><span className="status-badge approved">{r.recordType || 'General'}</span></td>
                    <td>{formatDate(r.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showingRecords', { count: filtered.length, total: records.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default RecordsView;
