import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { UserRole } from '../types';
import {
  Activity,
  UserCheck,
  ShieldAlert,
  Stethoscope,
  ClipboardList,
  LogOut,
  BedDouble,
  UserPlus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, freeBedCount, occupiedBedCount, recommendedDischargePatients, resetToDemoData } = useHospital();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    switchRole(newRole);
    if (newRole === 'ADMIN') navigate('/admin');
    else if (newRole === 'NURSE') navigate('/nurse');
    else if (newRole === 'DOCTOR') navigate('/doctor');
  };

  const getRoleBadgeColor = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DOCTOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'NURSE':
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      {/* Top Banner / Status Strip */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-sky-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Operational Mode: Live Inpatient Ward
          </span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center text-slate-300">
            <BedDouble className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Beds: <strong className="text-white ml-1">{occupiedBedCount}/74</strong> ({freeBedCount} Available)
          </span>
          {recommendedDischargePatients.length > 0 && (
            <span className="flex items-center text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
              {recommendedDischargePatients.length} Pending Discharge Approval
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to default initial state?')) {
                resetToDemoData();
              }
            }}
            title="Reset to initial 9 demo patients and logs"
            className="flex items-center text-xs text-slate-400 hover:text-white transition-colors bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset Demo Data
          </button>
          <span className="text-slate-400">|</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white">CareTrack</span>
                <span className="text-[10px] bg-sky-500/30 text-sky-300 font-semibold uppercase px-1.5 py-0.5 rounded border border-sky-400/30">
                  Hospital PMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Inpatient Management System</p>
            </div>
          </div>

          {/* Navigation Links according to Role & Overview */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/overview"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Daily Operations
            </NavLink>

            {currentUser.role === 'ADMIN' && (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  Admin Dashboard
                </NavLink>
                <NavLink
                  to="/admin/patients"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  All Patients
                </NavLink>
                <NavLink
                  to="/admin/discharges"
                  className={({ isActive }) =>
                    `relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  Discharge Queue
                  {recommendedDischargePatients.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-xs rounded-full bg-amber-500 text-slate-950 font-bold">
                      {recommendedDischargePatients.length}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/admin/register"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                      isActive ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`
                  }
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Admit Patient
                </NavLink>
              </>
            )}

            {currentUser.role === 'NURSE' && (
              <>
                <NavLink
                  to="/nurse"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  Nurse Dashboard
                </NavLink>
              </>
            )}

            {currentUser.role === 'DOCTOR' && (
              <>
                <NavLink
                  to="/doctor"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  Doctor Rounds
                </NavLink>
              </>
            )}

            <NavLink
              to="/audit"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Audit Trail
            </NavLink>
          </nav>

          {/* Quick Role Switcher Simulation */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{currentUser.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${getRoleBadgeColor()}`}>
                {currentUser.role} ROLE
              </span>
            </div>

            <div className="relative">
              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg pl-2.5 pr-7 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer appearance-none"
                title="Simulate Role Switching"
              >
                <option value="ADMIN">Switch to Admin</option>
                <option value="NURSE">Switch to Nurse</option>
                <option value="DOCTOR">Switch to Doctor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                ▼
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              title="Change User / Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-slate-800/80 border-t border-slate-700/60 space-x-2 text-xs">
        <NavLink to="/overview" className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
          Operations
        </NavLink>
        {currentUser.role === 'ADMIN' && (
          <>
            <NavLink to="/admin" end className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
              Admin
            </NavLink>
            <NavLink to="/admin/patients" className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
              Patients
            </NavLink>
            <NavLink to="/admin/discharges" className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
              Discharges ({recommendedDischargePatients.length})
            </NavLink>
            <NavLink to="/admin/register" className="px-2.5 py-1.5 rounded bg-sky-700 whitespace-nowrap">
              + Admit
            </NavLink>
          </>
        )}
        {currentUser.role === 'NURSE' && (
          <NavLink to="/nurse" end className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
            Nurse Dashboard
          </NavLink>
        )}
        {currentUser.role === 'DOCTOR' && (
          <NavLink to="/doctor" end className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
            Doctor Rounds
          </NavLink>
        )}
        <NavLink to="/audit" className="px-2.5 py-1.5 rounded bg-slate-900 whitespace-nowrap">
          Audit
        </NavLink>
      </div>
    </header>
  );
};

