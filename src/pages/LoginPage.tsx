import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { UserRole } from '../types';
import { ShieldAlert, Stethoscope, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { currentUser, switchRole } = useHospital();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    switchRole(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (newRoleTarget(role)) navigate(newRoleTarget(role));
  };

  const newRoleTarget = (role: UserRole) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'NURSE') return '/nurse';
    if (role === 'DOCTOR') return '/doctor';
    return '/overview';
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-500/30 mb-4">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">CareTrack PMS</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select your clinical or administrative operational role to access the corresponding dashboard.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="font-semibold">Simulated Role Authentication Notice:</strong> This interactive PMS demo simulates role-based access control (RBAC). In a production hospital environment, this integrates with SAML/OIDC SSO, multi-factor authentication, and strict backend permission guards.
          </div>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          {/* Admin Role Card */}
          <button
            onClick={() => handleSelectRole('ADMIN')}
            className={`group text-left p-5 rounded-xl border-2 transition-all flex items-start space-x-4 ${
              selectedRole === 'ADMIN'
                ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-500/20'
                : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700">
                  Hospital Administrator
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Capacity & Discharges
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Admit new patients (up to 74 beds), monitor mortality/success KPIs, supervise nurse & doctor task completion, and approve/finalize medical discharges.
              </p>
              <div className="mt-2 flex items-center text-[11px] text-purple-600 font-medium">
                Enter as Admin Jackson &rarr;
              </div>
            </div>
          </button>

          {/* Nurse Role Card */}
          <button
            onClick={() => handleSelectRole('NURSE')}
            className={`group text-left p-5 rounded-xl border-2 transition-all flex items-start space-x-4 ${
              selectedRole === 'NURSE'
                ? 'border-sky-600 bg-sky-50/50 shadow-md ring-2 ring-sky-500/20'
                : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700">
                  Registered Nurse (RN)
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Vitals & Monitoring
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                View pending daily temperature tasks, record once-per-day body temperature (°C) with fever alerts, and review thermal progression logs.
              </p>
              <div className="mt-2 flex items-center text-[11px] text-sky-600 font-medium">
                Enter as Nurse Sarah Connor &rarr;
              </div>
            </div>
          </button>

          {/* Doctor Role Card */}
          <button
            onClick={() => handleSelectRole('DOCTOR')}
            className={`group text-left p-5 rounded-xl border-2 transition-all flex items-start space-x-4 ${
              selectedRole === 'DOCTOR'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700">
                  Attending Physician (MD)
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Clinical Rounds & Clearance
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Review round tasks, verify temperature checks prior to filing clinical notes, and recommend discharge when 3 consecutive fever-free calendar days are verified.
              </p>
              <div className="mt-2 flex items-center text-[11px] text-emerald-600 font-medium">
                Enter as Dr. Gregory House &rarr;
              </div>
            </div>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            You can dynamically switch roles anytime using the top navigation bar dropdown.
          </p>
        </div>
      </div>
    </div>
  );
};

