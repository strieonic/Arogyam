// src/features/admin/RecordsView.jsx
// Medical records read-only table
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icons } from './adminIcons';
import { formatDate } from '../../utils/formatters';

const RecordsView = ({ records, searchQuery, onSearchChange }) => {
  const { t } = useTranslation();

  const filtered = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return !q ||
      r.patient?.name?.toLowerCase().includes(q) ||
      r.patient?.healthId?.toLowerCase().includes(q) ||
      r.hospital?.hospitalName?.toLowerCase().includes(q) ||
      r.recordType?.toLowerCase().includes(q);
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
