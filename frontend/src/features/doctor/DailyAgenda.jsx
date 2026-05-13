// src/features/doctor/DailyAgenda.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FaCalendarDay, FaUser, FaCheckCircle, FaNotesMedical, FaClock } from 'react-icons/fa';
import api from '../../api/axios';
import PrescriptionGenerator from './PrescriptionGenerator';


const DailyAgenda = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [writingPrescriptionFor, setWritingPrescriptionFor] = useState(null);


  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/doctor/appointments?date=${selectedDate}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error('Failed to load daily agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/doctor/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments(); // refresh list
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 border-t-4 border-t-blue-500"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <FaCalendarDay className="text-blue-400 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Daily Agenda</h3>
            <p className="text-xs text-[var(--text-secondary)]">Manage your appointments for the day.</p>
          </div>
        </div>
        
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-input !py-2 !px-4"
        />
      </div>

      {loading ? (
        <div className="text-center py-10"><span className="animate-pulse">Loading agenda...</span></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[var(--text-secondary)]">No appointments scheduled for this date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/10">
              
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[80px]">
                  <p className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-wider mb-1">Time</p>
                  <p className="font-mono font-bold text-blue-400">{appt.timeSlot}</p>
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <FaUser className="text-[var(--text-tertiary)]" /> 
                    {appt.patient?.name || 'Unknown Patient'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-secondary)]`}>
                      {appt.appointmentType}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      appt.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                      appt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  {appt.reason && <p className="text-xs text-[var(--text-secondary)] mt-2">Reason: {appt.reason}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                  <>
                    <button className="secondary-btn !py-2 !px-3 text-xs flex items-center gap-1"
                      onClick={() => toast.info('Medical history viewer coming soon!')}>
                      <FaNotesMedical /> History
                    </button>
                    <button className="primary-btn !bg-green-600 hover:!bg-green-500 !py-2 !px-3 text-xs flex items-center gap-1"
                      onClick={() => updateStatus(appt._id, 'completed')}>
                      <FaCheckCircle /> Complete
                    </button>
                  </>
                )}
                {appt.status === 'completed' && (
                  <button className="primary-btn !bg-blue-600 hover:!bg-blue-500 !py-2 !px-3 text-xs"
                    onClick={() => setWritingPrescriptionFor(appt)}>
                    Write Prescription
                  </button>

                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {writingPrescriptionFor && (
        <PrescriptionGenerator 
          appointment={writingPrescriptionFor} 
          onClose={() => setWritingPrescriptionFor(null)}
          onGenerated={() => {
            setWritingPrescriptionFor(null);
            fetchAppointments(); // Refresh the agenda
          }}
        />
      )}
    </motion.div>
  );
};


export default DailyAgenda;
