// src/features/patient/LiveQueueCard.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { getMyAppointments } from '../../services/appointmentService';
import { getQueueStatus } from '../../services/queueService';
import { FaClock, FaVolumeUp } from 'react-icons/fa';
import { toast } from 'sonner';

const LiveQueueCard = () => {
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;

    const initQueue = async () => {
      try {
        // 1. Fetch appointments
        const res = await getMyAppointments('confirmed');
        const appointments = res.data.appointments || [];

        // 2. Find today's confirmed appointment with a token
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppt = appointments.find(
          (a) => a.tokenNumber !== null && a.date.startsWith(todayStr)
        );

        if (todayAppt) {
          setActiveAppointment(todayAppt);

          // 3. Fetch initial queue status
          const qRes = await getQueueStatus(todayAppt.hospital._id, todayAppt.department);
          setCurrentToken(qRes.data.currentToken);

          // 4. Connect to socket
          const socketUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
          socket = io(socketUrl, { withCredentials: true });

          socket.on('connect', () => {
            console.log('Connected to queue socket');
            socket.emit('queue:join', todayAppt.hospital._id);
          });

          socket.on('queue:update', (data) => {
            if (data.department === todayAppt.department) {
              setCurrentToken(data.currentToken);
              
              // Notify if patient's turn is next or active
              if (data.currentToken === todayAppt.tokenNumber) {
                toast.success('Your turn has arrived!', { duration: 10000 });
                // Optional: Play a sound
              } else if (todayAppt.tokenNumber - data.currentToken === 2) {
                toast.info('Your turn is approaching! (2 patients ahead)', { duration: 5000 });
              }
            }
          });
        }
      } catch (err) {
        console.error('Failed to init queue:', err);
      } finally {
        setLoading(false);
      }
    };

    initQueue();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  if (loading || !activeAppointment) return null;

  const myToken = activeAppointment.tokenNumber;
  const patientsAhead = Math.max(0, myToken - (currentToken || 0));
  const isMyTurn = currentToken === myToken;
  const isMissed = currentToken > myToken;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`mb-8 p-1 rounded-3xl bg-gradient-to-r ${
          isMyTurn
            ? 'from-emerald-500 to-green-500 shadow-emerald-500/20'
            : 'from-[var(--accent-primary)] to-[var(--secondary-color)] shadow-[var(--accent-primary)]/20'
        } shadow-2xl relative overflow-hidden`}
      >
        <div className="glass-panel !p-6 !rounded-[22px] !border-0 bg-[var(--bg-elevated)]/90 backdrop-blur-xl relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                {!isMyTurn && !isMissed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isMyTurn ? 'bg-emerald-500' : isMissed ? 'bg-red-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="text-xs font-bold text-green-400 tracking-wider uppercase">Live OPD Queue</span>
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-xl">{activeAppointment.hospital?.hospitalName}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{activeAppointment.department}</p>
          </div>

          <div className="flex items-center gap-8 text-center bg-white/5 py-4 px-8 rounded-2xl border border-white/10 w-full md:w-auto justify-center">
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Current Token</p>
              <p className="text-3xl font-mono font-bold text-[var(--text-primary)]">{currentToken || '--'}</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Your Token</p>
              <p className={`text-4xl font-mono font-black ${isMyTurn ? 'text-emerald-400 scale-110 transition-transform' : 'text-[var(--secondary-color)]'}`}>
                {myToken}
              </p>
            </div>
          </div>

          <div className="flex-1 w-full text-center md:text-right">
            {isMyTurn ? (
              <div className="animate-pulse">
                <p className="text-lg font-bold text-emerald-400 mb-1">Please proceed to Doctor</p>
                <p className="text-xs text-[var(--text-secondary)]"><FaVolumeUp className="inline mr-1" /> Your token is currently being called</p>
              </div>
            ) : isMissed ? (
              <div>
                <p className="text-lg font-bold text-red-400 mb-1">You missed your turn</p>
                <p className="text-xs text-[var(--text-secondary)]">Please contact the reception desk immediately</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-white mb-1">{patientsAhead}</p>
                <p className="text-xs text-[var(--text-secondary)]">Patients ahead of you</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center justify-center md:justify-end gap-1">
                  <FaClock /> Est. wait: ~{patientsAhead * 10} mins
                </p>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveQueueCard;
