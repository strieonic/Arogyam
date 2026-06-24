import React, { useState, Suspense, lazy } from 'react';
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
const Landing = lazy(() => import('./pages/Landing'));

// Patient Pages
const PatientLogin = lazy(() => import('./pages/patient/PatientLogin'));
const PatientRegister = lazy(() => import('./pages/patient/PatientRegister'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const MyRecords = lazy(() => import('./pages/patient/MyRecords'));
const MyConsents = lazy(() => import('./pages/patient/MyConsents'));
const HealthCard = lazy(() => import('./pages/patient/HealthCard'));
const MyHospitals = lazy(() => import('./pages/patient/MyHospitals'));
const FamilyMembers = lazy(() => import('./pages/patient/FamilyMembers'));
const MedicalProfile = lazy(() => import('./pages/patient/MedicalProfile'));
const MedicalTimeline = lazy(() => import('./pages/patient/MedicalTimeline'));
const Appointments = lazy(() => import('./pages/patient/Appointments'));
const MedicineReminders = lazy(() => import('./pages/patient/MedicineReminders'));
const SymptomCheckerPage = lazy(() => import('./pages/patient/SymptomCheckerPage'));

// Hospital Pages
const HospitalLogin = lazy(() => import('./pages/hospital/HospitalLogin'));
const HospitalRegister = lazy(() => import('./pages/hospital/HospitalRegister'));
const HospitalDashboard = lazy(() => import('./pages/hospital/HospitalDashboard'));
const SearchPatient = lazy(() => import('./pages/hospital/SearchPatient'));
const RequestConsent = lazy(() => import('./pages/hospital/RequestConsent'));
const UploadRecord = lazy(() => import('./pages/hospital/UploadRecord'));
const MyPatients = lazy(() => import('./pages/hospital/MyPatients'));
const HospitalRecords = lazy(() => import('./pages/hospital/HospitalRecords'));
const ViewPatientRecords = lazy(() => import('./pages/hospital/ViewPatientRecords'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Doctor Pages
const DoctorLogin = lazy(() => import('./pages/doctor/DoctorLogin'));
const DoctorSetup = lazy(() => import('./pages/doctor/DoctorSetup'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));

// Shared
const SupportCenter = lazy(() => import('./features/shared/SupportCenter'));

// Elegant Glassmorphic loading fallback spinner
const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
    <div className="skeleton-pulse" style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Loading page resources...</p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);


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
  const { isAdmin } = useAuth();
  const sessionAdmin = sessionStorage.getItem('adminAuth') === 'true';
  if (!isAdmin && !sessionAdmin) return <Navigate to="/admin/login" />;
  return children;
};

// Layout wrapper that switches between full-bleed (landing), admin-bleed (admin), and constrained (app)
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const { isAdmin: authIsAdmin } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin/dashboard');
  const isAdmin = authIsAdmin || isAdminPath;

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
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}

      <div className="app-container">
        <Navbar />
        <MainLayout>
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </AnimatePresence>
        </MainLayout>
      </div>

      <ScrollProgress />
      <div className="grain-overlay" aria-hidden="true" style={{ pointerEvents: 'none' }} />
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
