import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { useAuth, AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';

// Shell Components
import Navbar from './components/Navbar';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';

import ScrollProgress from './components/ScrollProgress';

// Public Pages
import Landing from './pages/Landing';

// Patient Pages
import PatientLogin from './pages/patient/PatientLogin';
import PatientRegister from './pages/patient/PatientRegister';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyRecords from './pages/patient/MyRecords';
import MyConsents from './pages/patient/MyConsents';
import HealthCard from './pages/patient/HealthCard';
import MyHospitals from './pages/patient/MyHospitals';
import FamilyMembers from './pages/patient/FamilyMembers';
import MedicalProfile from './pages/patient/MedicalProfile';
import MedicalTimeline from './pages/patient/MedicalTimeline';
import Appointments from './pages/patient/Appointments';
import MedicineReminders from './pages/patient/MedicineReminders';
import SymptomCheckerPage from './pages/patient/SymptomCheckerPage';


// Hospital Pages
import HospitalLogin from './pages/hospital/HospitalLogin';
import HospitalRegister from './pages/hospital/HospitalRegister';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import SearchPatient from './pages/hospital/SearchPatient';
import RequestConsent from './pages/hospital/RequestConsent';
import UploadRecord from './pages/hospital/UploadRecord';
import MyPatients from './pages/hospital/MyPatients';
import HospitalRecords from './pages/hospital/HospitalRecords';
import ViewPatientRecords from './pages/hospital/ViewPatientRecords';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Doctor Pages
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorSetup from './pages/doctor/DoctorSetup';
import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Shared
import SupportCenter from './features/shared/SupportCenter';

// Protected Routes wrappers
const ProtectedPatientRoute = ({ children }) => {
  const { user, role } = useAuth();
  if (!user || role !== 'patient') return <Navigate to="/patient/login" />;
  return children;
};

const ProtectedHospitalRoute = ({ children }) => {
  const { user, role } = useAuth();
  if (!user || role !== 'hospital') return <Navigate to="/hospital/login" />;
  return children;
};

const ProtectedDoctorRoute = ({ children }) => {
  const { user, role } = useAuth();
  if (!user || role !== 'doctor') return <Navigate to="/doctor/login" />;
  return children;
};


const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return children;
};

// Layout wrapper that switches between full-bleed (landing), admin-bleed (admin), and constrained (app)
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin/dashboard');

  const layoutClass = isLanding ? 'full-bleed' : isAdmin ? 'admin-bleed' : 'constrained';

  return (
    <main id="main-content" className={`main-content ${layoutClass}`} aria-label="Main content">
      {children}
    </main>
  );
};

function AppInner() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const location = useLocation();

  return (
    <>
      <Preloader onComplete={() => setPreloaderDone(true)} />

      <ScrollProgress />
      <div className="grain-overlay" aria-hidden="true" />
      
      <div className="app-container">
        <Navbar />
        <MainLayout>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              
              {/* Patient App Flow */}
              <Route path="/patient/login" element={<PatientLogin />} />
              <Route path="/patient/register" element={<PatientRegister />} />
              <Route path="/patient/dashboard" element={<ProtectedPatientRoute><PatientDashboard /></ProtectedPatientRoute>} />
              <Route path="/patient/records" element={<ProtectedPatientRoute><MyRecords /></ProtectedPatientRoute>} />
              <Route path="/patient/consents" element={<ProtectedPatientRoute><MyConsents /></ProtectedPatientRoute>} />
              <Route path="/patient/healthcard" element={<ProtectedPatientRoute><HealthCard /></ProtectedPatientRoute>} />
              <Route path="/patient/hospitals" element={<ProtectedPatientRoute><MyHospitals /></ProtectedPatientRoute>} />
              <Route path="/patient/family" element={<ProtectedPatientRoute><FamilyMembers /></ProtectedPatientRoute>} />
              <Route path="/patient/profile" element={<ProtectedPatientRoute><MedicalProfile /></ProtectedPatientRoute>} />
              <Route path="/patient/timeline" element={<ProtectedPatientRoute><MedicalTimeline /></ProtectedPatientRoute>} />
              <Route path="/patient/appointments" element={<ProtectedPatientRoute><Appointments /></ProtectedPatientRoute>} />
              <Route path="/patient/reminders" element={<ProtectedPatientRoute><MedicineReminders /></ProtectedPatientRoute>} />
              <Route path="/patient/symptom-checker" element={<ProtectedPatientRoute><SymptomCheckerPage /></ProtectedPatientRoute>} />
              <Route path="/patient/support" element={<ProtectedPatientRoute><SupportCenter /></ProtectedPatientRoute>} />

              {/* Hospital App Flow */}
              <Route path="/hospital/login" element={<HospitalLogin />} />
              <Route path="/hospital/register" element={<HospitalRegister />} />
              <Route path="/hospital/dashboard" element={<ProtectedHospitalRoute><HospitalDashboard /></ProtectedHospitalRoute>} />
              <Route path="/hospital/search" element={<ProtectedHospitalRoute><SearchPatient /></ProtectedHospitalRoute>} />
              <Route path="/hospital/consent" element={<ProtectedHospitalRoute><RequestConsent /></ProtectedHospitalRoute>} />
              <Route path="/hospital/upload" element={<ProtectedHospitalRoute><UploadRecord /></ProtectedHospitalRoute>} />
              <Route path="/hospital/patients" element={<ProtectedHospitalRoute><MyPatients /></ProtectedHospitalRoute>} />
              <Route path="/hospital/records" element={<ProtectedHospitalRoute><HospitalRecords /></ProtectedHospitalRoute>} />
              <Route path="/hospital/records/:healthId" element={<ProtectedHospitalRoute><ViewPatientRecords /></ProtectedHospitalRoute>} />
              <Route path="/hospital/support" element={<ProtectedHospitalRoute><SupportCenter /></ProtectedHospitalRoute>} />
              
              {/* Admin Flow */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />

              {/* Doctor Flow */}
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/setup" element={<DoctorSetup />} />
              <Route path="/doctor/dashboard" element={<ProtectedDoctorRoute><DoctorDashboard /></ProtectedDoctorRoute>} />


              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </MainLayout>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <SmoothScroll>
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              },
            }}
          />
          <AppInner />
        </SmoothScroll>
      </Router>
    </AuthProvider>
  );
}

export default App;
