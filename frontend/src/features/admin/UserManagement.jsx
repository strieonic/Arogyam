import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icons } from './adminIcons';
import { formatDate } from '../../utils/formatters';

const UserManagement = ({ patients, searchQuery, onSearchChange, onConfirm }) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState('name-az');

  const filtered = patients
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      return !q ||
        p.name?.toLowerCase().includes(q) ||
        p.healthId?.toLowerCase().includes(q) ||
        p.phone?.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'name-az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-za') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <motion.div key="patients" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="admin-page-header">
        <h2>{t('admin.patientRegistry')}</h2>
        <p>{t('admin.patientRegistryDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allPatients')} ({filtered.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchPatients')}
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
                outline: 'none'
              }}
            >
              <option value="name-az">Name (A-Z)</option>
              <option value="name-za">Name (Z-A)</option>
              <option value="newest">Registered (Newest)</option>
              <option value="oldest">Registered (Oldest)</option>
            </select>
          </div>
        </div>


        {filtered.length === 0 ? (
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
                  <th>{t('admin.Arogyam')}</th>
                  <th>{t('common.phone')}</th>
                  <th>{t('admin.bloodGroup')}</th>
                  <th>{t('admin.registered')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>
                        {p.healthId || '—'}
                      </code>
                    </td>
                    <td>{p.phone}</td>
                    <td>{p.bloodGroup || '—'}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          className="action-btn delete admin-tooltip"
                          data-tooltip={t('common.delete')}
                          onClick={() => onConfirm({ id: p._id, action: 'delete-patient', name: p.name })}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showingPatients', { count: filtered.length, total: patients.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default UserManagement;
