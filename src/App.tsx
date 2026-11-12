import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HospitalProvider } from './context/HospitalContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NurseDashboard } from './pages/NurseDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientListPage } from './pages/PatientListPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { PatientRegistrationPage } from './pages/PatientRegistrationPage';
import { DischargeQueuePage } from './pages/DischargeQueuePage';
import { DailyOperationsPage } from './pages/DailyOperationsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';

export const App: React.FC = () => {
  return (
    <HospitalProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              {/* Default redirects to overview / role dashboard */}
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/overview" element={<DailyOperationsPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/patients" element={<PatientListPage />} />
              <Route path="/admin/register" element={<PatientRegistrationPage />} />
              <Route path="/admin/discharges" element={<DischargeQueuePage />} />

              {/* Nurse Routes */}
              <Route path="/nurse" element={<NurseDashboard />} />

              {/* Doctor Routes */}
              <Route path="/doctor" element={<DoctorDashboard />} />

              {/* Shared Patient Chart & Audits */}
              <Route path="/patient/:id" element={<PatientDetailPage />} />
              <Route path="/audit" element={<AuditTrailPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </main>

          {/* Clean Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">CareTrack PMS</span>
                <span>•</span>
                <span>Inpatient Management System</span>
              </div>
              <div className="text-slate-400">
                Hospital Capacity: 74 Beds Limit &bull; Strict 3-Day Afebrile Discharge Rule (&lt;38.0°C)
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </HospitalProvider>
  );
};

export default App;
