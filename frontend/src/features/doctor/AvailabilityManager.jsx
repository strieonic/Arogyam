// src/features/doctor/AvailabilityManager.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FaClock, FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../api/axios';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AvailabilityManager = ({ initialAvailability, onUpdate }) => {
  const [availability, setAvailability] = useState(initialAvailability || []);
  const [saving, setSaving] = useState(false);

  const addSlot = (day) => {
    setAvailability([...availability, { day, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const newAvail = [...availability];
    newAvail[index][field] = value;
    setAvailability(newAvail);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/doctor/availability', { availability });
      toast.success('Availability updated successfully');
      if (onUpdate) onUpdate(res.data.doctor.availability);
    } catch (err) {
      toast.error('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 border-t-4 border-t-indigo-500"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Weekly Availability</h3>
          <p className="text-sm text-[var(--text-secondary)]">Configure your recurring weekly schedule to generate appointment slots.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="primary-btn !py-2 !px-4 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2"
        >
          {saving ? <span className="animate-pulse">Saving...</span> : <><FaSave /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-6">
        {DAYS.map(day => {
          const daySlots = availability.filter(slot => slot.day === day);
          return (
            <div key={day} className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="w-32 flex items-center justify-between">
                <span className={`font-bold ${daySlots.length > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {day}
                </span>
                <button onClick={() => addSlot(day)} className="text-indigo-400 hover:text-indigo-300 p-1">
                  <FaPlus size={12} />
                </button>
              </div>
              
              <div className="flex-1 space-y-2">
                {daySlots.length === 0 ? (
                  <p className="text-sm text-[var(--text-tertiary)] italic py-1">Not available / Day Off</p>
                ) : (
                  daySlots.map((slot, index) => {
                    const globalIndex = availability.findIndex(s => s === slot);
                    return (
                      <div key={globalIndex} className="flex items-center gap-3">
                        <FaClock className="text-[var(--text-tertiary)]" />
                        <input 
                          type="time" 
                          className="form-input !py-1 !px-2 text-sm w-32" 
                          value={slot.startTime} 
                          onChange={(e) => updateSlot(globalIndex, 'startTime', e.target.value)}
                        />
                        <span className="text-[var(--text-tertiary)]">to</span>
                        <input 
                          type="time" 
                          className="form-input !py-1 !px-2 text-sm w-32" 
                          value={slot.endTime} 
                          onChange={(e) => updateSlot(globalIndex, 'endTime', e.target.value)}
                        />
                        <button 
                          onClick={() => removeSlot(globalIndex)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-400/10 transition-colors"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AvailabilityManager;
