// src/features/admin/HospitalVerification.jsx
// Hospital management table with approve / reject / delete actions
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icons } from './adminIcons';
import { formatDate } from '../../utils/formatters';

const HospitalVerification = ({
  hospitals,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onView,
  onAction,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const filtered = hospitals.filter((h) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      h.hospitalName?.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.regNumber?.toLowerCase().includes(q);
    const matchFilter = filterStatus === 'all' || h.verificationStatus === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div key="hospitals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="admin-page-header">
        <h2>{t('admin.hospitalManagement')}</h2>
        <p>{t('admin.hospitalManagementDesc')}</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{t('admin.allHospitals')} ({filtered.length})</h3>
          <div className="table-controls">
            <div className="search-input-wrap">
              <Icons.Search />
              <input
                type="text"
                className="table-search"
                placeholder={t('admin.searchHospitals')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            {['all', 'pending', 'under_review', 'approved', 'rejected', 'suspended'].map((f) => (
              <button
                key={f}
                className={`table-filter-btn ${filterStatus === f ? 'active' : ''}`}
                onClick={() => onFilterChange(f)}
              >
                {t(`common.${f}`) || f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
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
                {filtered.map((h, i) => (
                  <motion.tr
                    key={h._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.hospitalName}</td>
                    <td><code style={{ fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>{h.regNumber}</code></td>
                    <td>{h.email}</td>
                    <td><span className={`status-badge ${h.verificationStatus}`}>{h.verificationStatus?.replace('_', ' ')}</span></td>
                    <td>{formatDate(h.createdAt)}</td>
                    <td>
                      <div className="action-btn-group">
                        <button className="action-btn view admin-tooltip" data-tooltip={t('admin.viewDetails')} onClick={() => onView(h._id)}>
                          <Icons.Eye />
                        </button>
                        {h.verificationStatus === 'pending' && (
                          <>
                            <button className="action-btn approve admin-tooltip" data-tooltip={t('common.approve')} onClick={() => onConfirm({ id: h._id, action: 'approve', name: h.hospitalName })}>
                              <Icons.Check />
                            </button>
                            <button className="action-btn reject admin-tooltip" data-tooltip={t('common.reject')} onClick={() => onConfirm({ id: h._id, action: 'reject', name: h.hospitalName })}>
                              <Icons.X />
                            </button>
                          </>
                        )}
                        {h.verificationStatus === 'approved' && (
                           <button className="action-btn reject admin-tooltip" data-tooltip={"Suspend"} onClick={() => onConfirm({ id: h._id, action: 'suspend', name: h.hospitalName })}>
                             <Icons.Shield />
                           </button>
                        )}
                        <button className="action-btn delete admin-tooltip" data-tooltip={t('common.delete')} onClick={() => onConfirm({ id: h._id, action: 'delete', name: h.hospitalName })}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span className="pagination-info">{t('admin.showing', { count: filtered.length, total: hospitals.length })}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default HospitalVerification;
