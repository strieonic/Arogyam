// src/pages/doctor/DoctorLogin.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { FaUserMd, FaLock, FaEnvelope } from 'react-icons/fa';
import api from '../../api/axios';

const DoctorLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/doctor/login', formData);
      login(res.data.doctor, res.data.token, 'doctor');
      toast.success('Login successful');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <FaUserMd className="text-2xl text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Doctor Portal</h2>
          <p className="text-[var(--text-secondary)] mt-2">Log in to manage your appointments and patients.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="form-group">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Email Address</label>
            <div className="relative mt-1">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="email"
                className="form-input pl-11 w-full !bg-white/5"
                placeholder="doctor@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="password"
                className="form-input pl-11 w-full !bg-white/5"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full primary-btn !py-4 flex justify-center items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-500"
          >
            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> : 'Sign In as Doctor'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorLogin;
