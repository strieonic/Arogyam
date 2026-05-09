// src/pages/patient/MedicineReminders.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  getReminders, addReminder, updateReminder, deleteReminder
} from '../../services/reminderService';
import { FaPills, FaPlus, FaTimes, FaCheck, FaClock, FaCalendarAlt } from 'react-icons/fa';

const MedicineReminders = () => {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    medicineName: '', dosage: '', frequency: 'once_daily', times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0], endDate: '', notes: ''
  });

  const load = async () => {
    try {
      const res = await getReminders();
      setReminders(res.data.reminders || []);
    } catch {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medicineName || !form.startDate) return toast.error('Name and start date required');
    
    setSubmitting(true);
    try {
      await addReminder(form);
      toast.success('Reminder added');
      setShowForm(false);
      setForm({
        medicineName: '', dosage: '', frequency: 'once_daily', times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0], endDate: '', notes: ''
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await updateReminder(id, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Reminder paused' : 'Reminder activated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await deleteReminder(id);
      toast.success('Reminder deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const addTimeSlot = () => setForm(f => ({ ...f, times: [...f.times, '12:00'] }));
  const updateTimeSlot = (idx, val) => setForm(f => {
    const newTimes = [...f.times];
    newTimes[idx] = val;
    return { ...f, times: newTimes };
  });
  const removeTimeSlot = (idx) => setForm(f => ({ ...f, times: f.times.filter((_, i) => i !== idx) }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="heading-gradient text-3xl font-bold">Medicine Reminders</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage your daily medication schedule</p>
          </div>
          <button
            className="primary-btn !px-5 !py-2.5 !text-sm flex items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <FaPlus /> Add Medicine
          </button>
        </div>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleSubmit} className="glass-panel space-y-5">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FaPills className="text-[var(--accent-primary)]" /> New Medication
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Medicine Name *</label>
                  <input
                    type="text" className="glass-input" required placeholder="e.g. Paracetamol 500mg"
                    value={form.medicineName} onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Dosage</label>
                  <input
                    type="text" className="glass-input" placeholder="e.g. 1 Tablet"
                    value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Frequency</label>
                  <select
                    className="glass-input"
                    value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  >
                    <option value="once_daily">Once Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="thrice_daily">Thrice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Start Date *</label>
                  <input
                    type="date" className="glass-input" required
                    value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">End Date (optional)</label>
                  <input
                    type="date" className="glass-input"
                    value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Remind me at</label>
                <div className="flex flex-wrap gap-3">
                  {form.times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                      <input
                        type="time" className="bg-transparent text-white text-sm outline-none px-2 py-1"
                        value={t} onChange={e => updateTimeSlot(idx, e.target.value)} required
                      />
                      {form.times.length > 1 && (
                        <button type="button" onClick={() => removeTimeSlot(idx)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors">
                          <FaTimes size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                  {form.times.length < 6 && (
                    <button type="button" onClick={addTimeSlot} className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors">
                      + Add Time
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Instructions</label>
                <input
                  type="text" className="glass-input" placeholder="e.g. Take after food"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="primary-btn !text-sm !px-6 !py-2.5">
                  {submitting ? 'Saving…' : 'Save Reminder'}
                </button>
                <button type="button" className="secondary-btn !text-sm !px-5 !py-2.5" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-20 glass-panel border-dashed border-2 border-white/10">
          <div className="flex justify-center mb-4"><FaPills className="text-4xl text-[var(--text-tertiary)]" /></div>
          <h3 className="font-bold text-[var(--text-primary)]">No active reminders</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Add your medications to get notified</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {reminders.map((rem, i) => (
              <motion.div
                key={rem._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-panel !p-5 border-l-4 ${rem.isActive ? 'border-l-[var(--accent-primary)]' : 'border-l-gray-600 opacity-60'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <FaPills className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${rem.isActive ? 'text-white' : 'text-gray-400'}`}>{rem.medicineName}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">{rem.dosage || rem.frequency.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {/* Toggle Active */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={rem.isActive} onChange={() => handleToggleActive(rem._id, rem.isActive)} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {rem.times?.map((t, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                      <FaClock size={10} className="text-[var(--accent-primary)]" /> {t}
                    </span>
                  ))}
                </div>

                {rem.notes && <p className="text-xs text-[var(--text-tertiary)] italic mb-4">"{rem.notes}"</p>}

                <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-auto">
                  <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <FaCalendarAlt /> {new Date(rem.startDate).toLocaleDateString('en-GB')} {rem.endDate ? `— ${new Date(rem.endDate).toLocaleDateString('en-GB')}` : '(Ongoing)'}
                  </p>
                  <button onClick={() => handleDelete(rem._id)} className="text-xs text-red-400 hover:text-red-300 hover:underline">
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MedicineReminders;
