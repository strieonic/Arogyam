// src/features/hospital/DoctorManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FaUserMd, FaPlus, FaLink, FaEnvelope, FaIdCard, FaPhone } from 'react-icons/fa';
import api from '../../api/axios';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experienceYears: '',
    licenseNumber: ''
  });

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/hospital/doctors');
      setDoctors(res.data.doctors || []);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hospital/doctors', {
        ...formData,
        experienceYears: Number(formData.experienceYears)
      });
      toast.success('Doctor invited successfully');
      setInviteLink(res.data.inviteLink); // Prototype display
      fetchDoctors();
      setFormData({ name: '', email: '', phone: '', specialization: '', experienceYears: '', licenseNumber: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite doctor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Manage Doctors</h2>
        <button 
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="primary-btn !py-2 !px-4 text-sm flex items-center gap-2"
        >
          {showInviteForm ? 'Cancel' : <><FaPlus /> Invite Doctor</>}
        </button>
      </div>

      {showInviteForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="glass-panel p-6 border-t-4 border-t-blue-500"
        >
          <h3 className="text-lg font-bold mb-4">Invite New Doctor</h3>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-xs text-[var(--text-secondary)]">Full Name</label>
              <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs text-[var(--text-secondary)]">Email Address</label>
              <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs text-[var(--text-secondary)]">Phone</label>
              <input type="text" className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs text-[var(--text-secondary)]">Specialization</label>
              <input type="text" className="form-input" required placeholder="e.g. Cardiologist" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs text-[var(--text-secondary)]">License Number</label>
              <input type="text" className="form-input" required value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs text-[var(--text-secondary)]">Experience (Years)</label>
              <input type="number" className="form-input" required value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="primary-btn w-full !bg-blue-600">Send Invitation Link</button>
            </div>
          </form>

          {inviteLink && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-xs text-green-400 font-bold mb-1">Invitation Link Generated (Prototype Only):</p>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={inviteLink} className="form-input flex-1 !py-1 text-sm bg-black/20" />
                <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Copied!'); }} className="secondary-btn !py-1 !px-3 text-sm">Copy</button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center p-8"><span className="animate-pulse">Loading doctors...</span></div>
        ) : doctors.length === 0 ? (
          <div className="col-span-2 glass-panel p-8 text-center text-[var(--text-secondary)]">No doctors invited yet.</div>
        ) : (
          doctors.map(doc => (
            <div key={doc._id} className="glass-panel p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FaUserMd className="text-xl text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[var(--text-primary)]">{doc.name}</h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${doc.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">{doc.specialization}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><FaEnvelope /> {doc.email}</span>
                  <span className="flex items-center gap-1"><FaIdCard /> {doc.licenseNumber}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;
