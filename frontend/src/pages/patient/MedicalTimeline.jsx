// src/pages/patient/MedicalTimeline.jsx
// Shows all health events (records, consents, appointments) in reverse-chron order
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTimeline } from '../../services/patientService';
import { FaFileMedical, FaShieldAlt, FaCalendarCheck, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const TYPE_META = {
  record: {
    icon: FaFileMedical,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Record',
  },
  consent: {
    icon: FaShieldAlt,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    label: 'Consent',
  },
  appointment: {
    icon: FaCalendarCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    label: 'Appointment',
  },
};

const STATUS_COLORS = {
  pending:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  approved:  'bg-green-500/15  text-green-400  border border-green-500/30',
  confirmed: 'bg-green-500/15  text-green-400  border border-green-500/30',
  rejected:  'bg-red-500/15    text-red-400    border border-red-500/30',
  cancelled: 'bg-red-500/15    text-red-400    border border-red-500/30',
  completed: 'bg-sky-500/15    text-sky-400    border border-sky-500/30',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const MedicalTimeline = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchTimeline = () => {
    setLoading(true);
    setFetchError(false);
    getTimeline()
      .then(r => setEvents(r.data.events || []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTimeline(); }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  return (
    <div className="page-wrapper max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="heading-gradient text-3xl font-bold">Medical Timeline</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Your complete health history in one view</p>
      </motion.div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {['all', 'record', 'consent', 'appointment'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
              filter === f
                ? 'bg-[var(--accent-primary)] text-white border-transparent'
                : 'border-white/10 text-[var(--text-secondary)] hover:border-white/20'
            }`}
          >
            <FaFilter className="inline mr-1 opacity-60" />
            {f === 'all' ? 'All Events' : TYPE_META[f]?.label}
            {f !== 'all' && (
              <span className="ml-1.5 opacity-70">({events.filter(e => e.type === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : fetchError ? (
        <ErrorState
          title="Failed to load timeline"
          message="We couldn't load your health history. Please try again."
          onRetry={fetchTimeline}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={filter === 'all' ? 'No events yet' : `No ${filter} events`}
          description={filter === 'all' ? 'Your health history will appear here as you interact with hospitals and doctors.' : 'Try switching to All Events to see your full history.'}
        />
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />

          <AnimatePresence>
            <div className="space-y-4">
              {filtered.map((event, i) => {
                const meta = TYPE_META[event.type] || TYPE_META.record;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-4 pl-2"
                  >
                    {/* Icon dot */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${meta.bg} ${meta.border} border flex items-center justify-center z-10`}>
                      <Icon className={`${meta.color} text-sm`} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 glass-panel !py-4 !px-5 hover:border-white/10">
                      <div className="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-sm text-[var(--text-primary)]">{event.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{event.subtitle}</p>
                          {event.notes && (
                            <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">"{event.notes}"</p>
                          )}
                          {event.timeSlot && (
                            <p className="text-xs text-[var(--text-tertiary)] mt-1">🕐 {event.timeSlot}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold text-[var(--text-secondary)]">{formatDate(event.date)}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{formatTime(event.date)}</p>
                          {event.status && (
                            <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[event.status] || ''}`}>
                              {event.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MedicalTimeline;
