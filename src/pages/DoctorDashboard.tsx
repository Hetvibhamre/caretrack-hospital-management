import React from 'react';
import { Link } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { getTodayDateString, checkDischargeEligibility } from '../utils/businessRules';

export const DoctorDashboard: React.FC = () => {
  const { activePatients, currentUser } = useHospital();
  const todayStr = getTodayDateString();

  // Patients awaiting visit note today
  const pendingVisits = activePatients.filter(
    (p) => !p.visits.some((v) => v.date === todayStr)
  );

  const completedVisits = activePatients.filter(
    (p) => p.visits.some((v) => v.date === todayStr)
  );

  // Discharge-eligible candidates
  const dischargeCandidates = activePatients.filter((p) => {
    const elig = checkDischargeEligibility(p);
    return elig.isEligible && p.status === 'ACTIVE';
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Physician Clinical Rounds</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Doctor Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct daily ward evaluations, verify temperature records prior to logging notes, and recommend discharge when 3 fever-free calendar days are satisfied.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Pending Rounds: <strong>{pendingVisits.length}</strong>
          </span>
          {dischargeCandidates.length > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Eligible for Discharge: <strong>{dischargeCandidates.length}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Role Enforcement Notice */}
      {currentUser.role !== 'DOCTOR' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Previewing as {currentUser.role}:</strong> Only Attending Physicians can enter clinical visit notes and recommend discharge. Please switch to the Doctor role via the top bar to perform actions.
          </div>
        </div>
      )}

      {/* Discharge Candidates Spotlight */}
      {dischargeCandidates.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-emerald-900">
              Action Required: Discharge-Eligible Patients ({dischargeCandidates.length})
            </h2>
          </div>
          <p className="text-xs text-emerald-800 mb-4">
            The following patients have satisfied the strict 3-consecutive-calendar-day afebrile criteria (&lt; 38.0°C). Review and submit discharge recommendations to forward them to the Hospital Administrator.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dischargeCandidates.map((p) => {
              const elig = checkDischargeEligibility(p);
              return (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Bed #{p.bedNumber}
                      </span>
                      <strong className="text-slate-900 text-sm">{p.name}</strong>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.diagnosis}</p>
                    <div className="text-[11px] text-emerald-700 font-mono mt-1">
                      Validated: {elig.qualifyingDates.map((q) => `${q.date} (${q.temperatureC}°C)`).join(', ')}
                    </div>
                  </div>
                  <Link
                    to={`/patient/${p.id}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center whitespace-nowrap ml-3"
                  >
                    Recommend Discharge &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Round Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <ClipboardList className="w-5 h-5 text-sky-600 mr-2" />
            Inpatient Round List & Daily Vitals Status ({activePatients.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Green indicator means today&apos;s temperature is available. Red alert indicates fever or missing vitals requiring clinical attention.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3.5">Bed / Patient</th>
                <th className="px-6 py-3.5">Today&apos;s Temp Status</th>
                <th className="px-6 py-3.5">Fever Streak / 3-Day Rule</th>
                <th className="px-6 py-3.5">Today&apos;s Visit Note</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activePatients.map((p) => {
                const todayTemp = p.temperatures.find((t) => t.date === todayStr);
                const hasTempToday = !!todayTemp;
                const isFeverToday = todayTemp && todayTemp.temperatureC >= 38.0;
                const todayVisit = p.visits.find((v) => v.date === todayStr);
                const elig = checkDischargeEligibility(p);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Patient & Bed */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          #{p.bedNumber}
                        </span>
                        <div>
                          <Link to={`/patient/${p.id}`} className="font-bold text-slate-900 hover:text-sky-600">
                            {p.name}
                          </Link>
                          <div className="text-xs text-slate-400 font-mono">
                            {p.mrn} • {p.age}y
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate mt-1">
                        {p.diagnosis}
                      </div>
                    </td>

                    {/* Today's Temp Status Indicator */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!hasTempToday ? (
                        <div className="flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs w-fit">
                          <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-600 animate-spin" />
                          <span>Missing Today</span>
                        </div>
                      ) : isFeverToday ? (
                        <div className="flex items-center text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-300 text-xs font-bold w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                          <span>{todayTemp.temperatureC}°C (FEVER)</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs font-semibold w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                          <span>{todayTemp.temperatureC}°C (Normal)</span>
                        </div>
                      )}
                    </td>

                    {/* 3-Day Rule Afebrile Streak Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {elig.isEligible ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center w-fit">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          3 Days Clear &bull; Eligible
                        </span>
                      ) : (
                        <div>
                          <span className="text-slate-600 font-medium">
                            {elig.consecutiveDaysCount} / 3 fever-free days
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate">
                            {elig.reason}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Today's Visit Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {todayVisit ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Visit Completed
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">By {todayVisit.visitedBy}</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Visit Pending
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/patient/${p.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-sky-700 text-white transition-colors"
                      >
                        {todayVisit ? 'Review Chart' : 'Conduct Round'} &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

