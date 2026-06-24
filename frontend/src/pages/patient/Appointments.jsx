// src/pages/patient/Appointments.jsx
// Patient appointment booking + listing page
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  getApprovedHospitals, bookAppointment,
  getMyAppointments, cancelAppointment,
} from '../../services/appointmentService';
import { FaCalendarPlus, FaHospital, FaTimes, FaCheck, FaClock } from 'react-icons/fa';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const STATUS_PILL = {
  pending:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  confirmed: 'bg-green-500/15  text-green-400  border border-green-500/30',
  cancelled: 'bg-red-500/15    text-red-400    border border-red-500/30',
  completed: 'bg-sky-500/15    text-sky-400    border border-sky-500/30',
};

const TIME_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM',
];

const DEPARTMENTS = ['General OPD','Cardiology','Neurology','Orthopaedics','Paediatrics','Gynaecology','Dermatology','ENT','Ophthalmology'];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });

const Appointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments]   = useState([]);
  const [hospitals, setHospitals]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [submitting, setSubmitting]       = useState(false);

  const [form, setForm] = useState({
    hospitalId: '', date: '', timeSlot: '', department: 'General OPD', reason: '',
  });

  const load = async () => {
    setFetchError(false);
    try {
      const [aptRes, hospRes] = await Promise.all([
        getMyAppointments(filterStatus === 'all' ? undefined : filterStatus),
        getApprovedHospitals(),
      ]);
      setAppointments(aptRes.data.appointments || []);
      setHospitals(hospRes.data.hospitals || []);
    } catch {
      toast.error('Failed to load appointments');
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.hospitalId || !form.date || !form.timeSlot) {
      return toast.error('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      await bookAppointment(form);
      toast.success('Appointment booked!');
      setShowForm(false);
      setForm({ hospitalId: '', date: '', timeSlot: '', department: 'General OPD', reason: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      load();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="heading-gradient text-3xl font-bold">Appointments</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Book and manage your hospital visits</p>
          </div>
          <button
            className="primary-btn !px-5 !py-2.5 !text-sm flex items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <FaCalendarPlus /> Book Appointment
          </button>
        </div>
      </motion.div>

      {/* Booking Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleBook} className="glass-panel space-y-5">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FaHospital className="text-[var(--accent-primary)]" /> New Appointment
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Hospital *</label>
                  <select
                    className="glass-input"
                    value={form.hospitalId}
                    onChange={e => setForm(f => ({ ...f, hospitalId: e.target.value }))}
                    required
                  >
                    <option value="">Select hospital…</option>
                    {hospitals.map(h => (
                      <option key={h._id} value={h._id}>{h.hospitalName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Date *</label>
                  <input
                    type="date" min={minDate}
                    className="glass-input"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Time Slot *</label>
                  <select
                    className="glass-input"
                    value={form.timeSlot}
                    onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}
                    required
                  >
                    <option value="">Select time…</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Department</label>
                  <select
                    className="glass-input"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Reason (optional)</label>
                <textarea
                  className="glass-input"
                  rows={2}
                  placeholder="Brief description of your concern…"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="primary-btn !text-sm !px-6 !py-2.5">
                  {submitting ? 'Booking…' : 'Confirm Booking'}
                </button>
                <button type="button" className="secondary-btn !text-sm !px-5 !py-2.5" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','pending','confirmed','completed','cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize transition-all ${
              filterStatus === s
                ? 'bg-[var(--accent-primary)] text-white border-transparent'
                : 'border-white/10 text-[var(--text-secondary)] hover:border-white/20'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : fetchError ? (
        <ErrorState
          title="Failed to load appointments"
          message="We couldn't retrieve your appointments. Please try again."
          onRetry={load}
        />
      ) : appointments.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="No appointments yet"
          description={filterStatus === 'all' ? 'Book your first appointment using the button above.' : `No ${filterStatus} appointments found.`}
          actionLabel={filterStatus === 'all' ? 'Book Appointment' : undefined}
          onAction={filterStatus === 'all' ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel !py-4 !px-5 flex items-center gap-4 flex-wrap"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FaCalendarPlus className="text-emerald-400 text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--text-primary)]">{apt.hospital?.hospitalName}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {apt.department} · {formatDate(apt.date)} · <FaClock className="inline mr-0.5" />{apt.timeSlot}
                </p>
                {apt.reason && <p className="text-xs text-[var(--text-tertiary)] mt-0.5 italic">"{apt.reason}"</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_PILL[apt.status]}`}>
                  {apt.status}
                </span>
                {apt.tokenNumber && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-[var(--text-secondary)] border border-white/10">
                    Token #{apt.tokenNumber}
                  </span>
                )}
                {['pending','confirmed'].includes(apt.status) && (
                  <button
                    onClick={() => handleCancel(apt._id)}
                    className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    title="Cancel"
                  >
                    <FaTimes className="text-red-400 text-xs" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
