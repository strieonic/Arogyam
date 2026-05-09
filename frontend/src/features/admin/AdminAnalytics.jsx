// src/features/admin/AdminAnalytics.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Icons } from './adminIcons';
import { FaUserMd, FaPrescriptionBottleAlt, FaExclamationCircle, FaUserInjured, FaHospital, FaCalendarCheck, FaFileMedical } from 'react-icons/fa';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Approved (green), Pending (amber), Rejected (red)

const AdminAnalytics = ({ stats, onNavigate }) => {
  if (!stats) return null;

  return (
    <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="admin-page-header flex justify-between items-end">
        <div>
          <h2>Platform Analytics</h2>
          <p>Real-time metrics and system health</p>
        </div>
      </div>

      {/* Core Stats Grid (8 cards) */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" variants={stagger} initial="hidden" animate="visible">
        <motion.div className="glass-panel p-5 border-l-4 border-l-blue-500" variants={item}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaUserInjured className="text-xl text-blue-500" /> <span className="font-semibold text-sm">Total Patients</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalPatients || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-green-500 cursor-pointer hover:bg-white/5" variants={item} onClick={() => onNavigate('hospitals')}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaHospital className="text-xl text-green-500" /> <span className="font-semibold text-sm">Approved Hospitals</span>
          </div>
          <div className="text-3xl font-bold">{stats.approvedHospitals || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-amber-500 cursor-pointer hover:bg-white/5" variants={item} onClick={() => onNavigate('hospitals')}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <Icons.Hospital /> <span className="font-semibold text-sm">Pending Hospitals</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{stats.pendingHospitals || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-purple-500" variants={item}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaUserMd className="text-xl text-purple-500" /> <span className="font-semibold text-sm">Total Doctors</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalDoctors || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-indigo-500" variants={item}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaCalendarCheck className="text-xl text-indigo-500" /> <span className="font-semibold text-sm">Appointments</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalAppointments || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-teal-500" variants={item}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaPrescriptionBottleAlt className="text-xl text-teal-500" /> <span className="font-semibold text-sm">Prescriptions</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalPrescriptions || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-cyan-500" variants={item}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaFileMedical className="text-xl text-cyan-500" /> <span className="font-semibold text-sm">Reports Uploaded</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalRecords || 0}</div>
        </motion.div>

        <motion.div className="glass-panel p-5 border-l-4 border-l-red-500" variants={item}>
          <div className="flex items-center gap-3 mb-2 text-[var(--text-secondary)]">
            <FaExclamationCircle className="text-xl text-red-500" /> <span className="font-semibold text-sm">Open Complaints</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.complaintsOpen || 0}</div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Patient Growth Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Icons.ArrowUp /> Monthly Registrations
          </h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={stats.charts?.monthlyRegistrations || []}>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="patients" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Trends */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FaCalendarCheck className="text-indigo-400" /> Daily Appointments
          </h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={stats.charts?.dailyAppointments || []}>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} 
                  tickFormatter={(val) => {
                    if (!val) return '';
                    return val.split('-').slice(1).join('/'); // show MM/DD
                  }}
                />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="appointments" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hospital Approval Status */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FaHospital className="text-green-400" /> Hospital Status Distribution
            </h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-sm">
              Overview of all registered hospitals on the platform by their current administrative verification status.
            </p>
            
            <div className="mt-6 flex flex-col gap-3">
              {stats.charts?.hospitalStatusData?.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-[var(--text-secondary)] w-20">{entry.name}</span>
                  <span className="font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ height: 250, width: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.charts?.hospitalStatusData || []}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats.charts?.hospitalStatusData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default AdminAnalytics;
