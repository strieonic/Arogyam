// src/pages/doctor/DoctorSetup.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FaUserMd, FaLock } from 'react-icons/fa';
import api from '../../api/axios';

const DoctorSetup = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing invitation token.');
      navigate('/doctor/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/doctor/setup', { token, password });
      toast.success('Account activated! You can now log in.');
      navigate('/doctor/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden border-t-4 border-t-blue-500"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <FaUserMd className="text-2xl text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Activate Account</h2>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">Please create a secure password for your new Doctor account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="form-group">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">New Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="password"
                className="form-input pl-11 w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Confirm Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="password"
                className="form-input pl-11 w-full"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full primary-btn !py-4 bg-blue-600 hover:bg-blue-500"
          >
            {loading ? 'Activating...' : 'Activate & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorSetup;
