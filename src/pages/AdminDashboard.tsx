import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import {
  Users,
  BedDouble,
  FileCheck2,
  AlertTriangle,
  TrendingDown,
  UserPlus,
  ArrowRight,
  ClipboardCheck,
  Activity,
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { TOTAL_BED_CAPACITY, getTodayDateString, checkDischargeEligibility } from '../utils/businessRules';

export const AdminDashboard: React.FC = () => {
  const {
    activePatients,
    recommendedDischargePatients,
    dischargedPatients,
    deceasedPatients,
    totalAdmissionsEver,
    occupiedBedCount,
    freeBedCount,
    mortalityRatePercent,
    successRatePercent,
    isBedCapacityFull,
    currentUser,
    confirmDischarge,
    markPatientDeceased,
  } = useHospital();

  const navigate = useNavigate();
  const todayStr = getTodayDateString();

  // Action states for quick discharge / modal
  const [selectedDeceasedPatientId, setSelectedDeceasedPatientId] = useState<string | null>(null);
  const [deceasedReason, setDeceasedReason] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate Operational Metrics
  const patientsNeedingTempToday = activePatients.filter(
    (p) => !p.temperatures.some((t) => t.date === todayStr)
  );

  const patientsNeedingVisitToday = activePatients.filter(
    (p) => !p.visits.some((v) => v.date === todayStr)
  );

  const feverPatientsToday = activePatients.filter((p) => {
    const todayTemp = p.temperatures.find((t) => t.date === todayStr);
    return todayTemp && todayTemp.temperatureC >= 38.0;
  });

  const handleConfirmDischarge = (patientId: string, patientName: string) => {
    const res = confirmDischarge(patientId);
    if (res.success) {
      setActionMessage({ type: 'success', text: `Discharge finalized for ${patientName}. Bed released!` });
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleMarkDeceased = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeceasedPatientId) return;
    const res = markPatientDeceased(selectedDeceasedPatientId, deceasedReason);
    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setSelectedDeceasedPatientId(null);
      setDeceasedReason('');
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const isMortalityExceeded = mortalityRatePercent > 15.0;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Administration</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Admin Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ward oversight, capacity regulation, task surveillance, and discharge authorization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/register')}
            disabled={isBedCapacityFull}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              isBedCapacityFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:shadow-md'
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Admit New Patient
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Inpatients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Inpatients</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{occupiedBedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Total admissions ever: {totalAdmissionsEver}</div>
          </div>
        </div>

        {/* Free Beds / Total Beds (74) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isBedCapacityFull ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <BedDouble className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bed Capacity</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {freeBedCount}{' '}
              <span className="text-sm font-normal text-slate-500">free of {TOTAL_BED_CAPACITY}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${isBedCapacityFull ? 'bg-rose-500' : 'bg-sky-500'}`}
                style={{ width: `${(occupiedBedCount / TOTAL_BED_CAPACITY) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pending Discharges */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Discharge</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {recommendedDischargePatients.length}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">Ready for Admin sign-off</div>
          </div>
        </div>

        {/* Total Successfully Discharged */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Success Rate</div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-0.5">{successRatePercent}%</div>
            <div className="text-xs text-slate-500 mt-1">{dischargedPatients.length} discharged patients</div>
          </div>
        </div>
      </div>

      {/* Clinical Operations & Mortality Risk Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mortality Benchmark Progress / Alert Card */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isMortalityExceeded
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <TrendingDown className={`w-5 h-5 mr-2 ${isMortalityExceeded ? 'text-rose-600' : 'text-slate-600'}`} />
              Mortality vs 15% Threshold
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isMortalityExceeded ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isMortalityExceeded ? 'CRITICAL ALERT' : 'WITHIN BOUNDS'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900">{mortalityRatePercent}%</span>
              <span className="text-xs text-slate-500 ml-2">
                ({deceasedPatients.length} deaths / {totalAdmissionsEver} admissions)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Standard Limit:</span>
              <span className="text-xs font-bold text-slate-700 ml-1">15.0%</span>
            </div>
          </div>

          {/* Dual Bar Benchmark */}
          <div className="mt-3 relative pt-1">
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100 border border-slate-200">
              <div
                style={{ width: `${Math.min(100, (mortalityRatePercent / 30) * 100)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all ${
                  isMortalityExceeded ? 'bg-rose-600' : 'bg-emerald-500'
                }`}
              ></div>
            </div>
            {/* Target 15% Marker */}
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>0%</span>
              <span className="text-amber-600 font-semibold">15% Threshold</span>
              <span>30%+</span>
            </div>
          </div>

          {isMortalityExceeded ? (
            <div className="mt-4 p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Inpatient mortality rate has exceeded the 15% clinical alert threshold. Review patient safety protocols and intensive care admissions.
              </span>
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-500">
              Hospital mortality rate is safely maintained beneath the 15% clinical review threshold.
            </div>
          )}
        </div>

        {/* Task Surveillance Widget (Nurse & Doctor status) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-sky-600" />
              Today&apos;s Shift Task Surveillance ({todayStr})
            </h2>
            <Link to="/overview" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center">
              View Ward Matrix <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nurse Temp Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Nurse Temperatures</span>
                <Clock className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {activePatients.length - patientsNeedingTempToday.length}{' '}
                <span className="text-xs font-normal text-slate-500">/ {activePatients.length} Done</span>
              </div>
              {patientsNeedingTempToday.length > 0 ? (
                <div className="mt-2 text-xs text-amber-600 font-medium flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                  {patientsNeedingTempToday.length} reading(s) pending
                </div>
              ) : (
                <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All active patients recorded
                </div>
              )}
            </div>

            {/* Doctor Rounds Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Doctor Daily Rounds</span>
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {activePatients.length - patientsNeedingVisitToday.length}{' '}
                <span className="text-xs font-normal text-slate-500">/ {activePatients.length} Done</span>
              </div>
              {patientsNeedingVisitToday.length > 0 ? (
                <div className="mt-2 text-xs text-amber-600 font-medium flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {patientsNeedingVisitToday.length} visit note(s) pending
                </div>
              ) : (
                <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All daily rounds filed
                </div>
              )}
            </div>

            {/* Active Fevers Alert */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Fever Alert (&ge;38°C)</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {feverPatientsToday.length}{' '}
                <span className="text-xs font-normal text-slate-500">Inpatients</span>
              </div>
              {feverPatientsToday.length > 0 ? (
                <div className="mt-2 text-xs text-rose-600 font-semibold">
                  Requires clinical antipyretic review
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">No active febrile cases today</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Discharge Queue (Pending Admin Confirmation) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Discharge Authorization Queue</h2>
              {recommendedDischargePatients.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {recommendedDischargePatients.length} Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients clinically cleared by physicians following strictly verified 3-day afebrile streaks. Admin approval vacates the bed.
            </p>
          </div>
          <Link
            to="/admin/discharges"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center"
          >
            Manage Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recommendedDischargePatients.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No patients currently awaiting discharge authorization.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3">Patient / MRN</th>
                  <th className="px-6 py-3">Bed #</th>
                  <th className="px-6 py-3">Recommended By</th>
                  <th className="px-6 py-3">Clinical Justification</th>
                  <th className="px-6 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendedDischargePatients.map((p) => {
                  const elig = checkDischargeEligibility(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/patient/${p.id}`} className="font-semibold text-sky-700 hover:underline">
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono">{p.mrn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          Bed {p.bedNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-xs">
                        <div className="font-medium">{p.dischargeRecommendedBy || 'Physician'}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.dischargeRecommendedAt?.substring(0, 10)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{p.dischargeSummary}</p>
                        {elig.qualifyingDates.length >= 3 && (
                          <div className="mt-1 text-[11px] text-emerald-700 font-mono">
                            Afebrile Evidence: {elig.qualifyingDates.map((q) => `${q.date} (${q.temperatureC}°C)`).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleConfirmDischarge(p.id, p.name)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                        >
                          Confirm Discharge & Free Bed
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Inpatients Snapshot & Outcome Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Inpatient Census ({activePatients.length})</h2>
            <p className="text-xs text-slate-500">
              Overview of admitted patients. Administrators can review bed assignments or record clinical outcomes.
            </p>
          </div>
          <Link
            to="/admin/patients"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center"
          >
            Full Census Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-4 py-3">Bed #</th>
                <th className="px-4 py-3">Patient Name & MRN</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3">Admitted</th>
                <th className="px-4 py-3">Latest Temp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activePatients.slice(0, 6).map((p) => {
                const latestTemp = p.temperatures[0];
                const isFever = latestTemp && latestTemp.temperatureC >= 38.0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        #{p.bedNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/patient/${p.id}`} className="font-semibold text-slate-900 hover:text-sky-600">
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-400 font-mono">{p.mrn}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                      {p.diagnosis}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {p.admissionDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {latestTemp ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            isFever ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {latestTemp.temperatureC}°C
                          {isFever && <AlertTriangle className="w-3 h-3 ml-1 text-rose-600" />}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 italic">Pending Today</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.status === 'DISCHARGE_RECOMMENDED' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Discharge Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Inpatient
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                      <Link
                        to={`/patient/${p.id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                      >
                        Details
                      </Link>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => setSelectedDeceasedPatientId(p.id)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-800"
                        title="Mark patient outcome as deceased (Administrative record)"
                      >
                        Record Outcome
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outcome / Deceased Confirmation Modal */}
      {selectedDeceasedPatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center text-rose-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Record Patient Deceased
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Marking a patient as deceased permanently moves them to the mortality record, updates the hospital mortality rate, and vacates their assigned bed.
            </p>

            <form onSubmit={handleMarkDeceased} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Primary Cause of Death / Clinical Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={deceasedReason}
                  onChange={(e) => setDeceasedReason(e.target.value)}
                  placeholder="e.g. Refractory septic shock, cardiac arrest..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeceasedPatientId(null);
                    setDeceasedReason('');
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Confirm & Release Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

