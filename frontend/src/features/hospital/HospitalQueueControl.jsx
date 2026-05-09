// src/features/hospital/HospitalQueueControl.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getQueueStatus, advanceQueue } from '../../services/queueService';
import { FaUserMd, FaVolumeUp, FaAngleDoubleRight } from 'react-icons/fa';

const HospitalQueueControl = () => {
  const { user } = useAuth();
  const [department, setDepartment] = useState('General OPD');
  const [currentToken, setCurrentToken] = useState(0);
  const [lastAssigned, setLastAssigned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await getQueueStatus(user._id, department);
      setCurrentToken(res.data.currentToken || 0);
      setLastAssigned(res.data.lastAssigned || 0);
    } catch {
      toast.error('Failed to load queue status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchQueue();
  }, [department, user?._id]);

  const handleAdvance = async () => {
    if (currentToken >= lastAssigned && lastAssigned !== 0) {
      return toast.info('No more patients waiting in queue.');
    }
    
    setAdvancing(true);
    try {
      const nextToken = currentToken + 1;
      const res = await advanceQueue(department, nextToken);
      setCurrentToken(res.data.currentToken);
      toast.success(`Token ${res.data.currentToken} called`);
    } catch {
      toast.error('Failed to advance queue');
    } finally {
      setAdvancing(false);
    }
  };

  const patientsWaiting = Math.max(0, lastAssigned - currentToken);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel !p-6 mb-8 border-l-4 border-l-emerald-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Live Queue Management</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">OPD Queue Control</h3>
          <p className="text-sm text-[var(--text-secondary)]">Broadcast real-time token updates directly to patient dashboards.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 py-3 px-6 rounded-2xl border border-white/10 text-center w-full md:w-auto">
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Serving</p>
            <p className="text-4xl font-mono font-black text-emerald-400">
              {loading ? '--' : currentToken === 0 ? '0' : currentToken}
            </p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Waiting</p>
            <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
              {loading ? '-' : patientsWaiting}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 w-full md:w-auto">
          <button 
            onClick={handleAdvance} 
            disabled={advancing || loading || (currentToken >= lastAssigned && lastAssigned !== 0)}
            className="w-full primary-btn !py-4 !px-8 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaVolumeUp />
            Call Next Token <FaAngleDoubleRight />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HospitalQueueControl;
