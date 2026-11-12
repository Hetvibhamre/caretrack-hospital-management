import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { HeartPulse, CheckCircle2, Clock, AlertTriangle, Thermometer, ShieldAlert, ChevronRight } from 'lucide-react';
import { getTodayDateString } from '../utils/businessRules';

export const NurseDashboard: React.FC = () => {
  const { activePatients, currentUser, recordTemperature } = useHospital();
  const todayStr = getTodayDateString();

  // Quick temperature inline entry state
  const [activeInputPatientId, setActiveInputPatientId] = useState<string | null>(null);
  const [quickTemp, setQuickTemp] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Group patients into pending vs completed for today
  const pendingPatients = activePatients.filter(
    (p) => !p.temperatures.some((t) => t.date === todayStr)
  );

  const completedPatients = activePatients.filter(
    (p) => p.temperatures.some((t) => t.date === todayStr)
  );

  const handleQuickSubmit = (patientId: string) => {
    setFeedback(null);
    const parsed = parseFloat(quickTemp);
    if (isNaN(parsed)) {
      setFeedback({ type: 'error', message: 'Please enter a valid numeric temperature reading.' });
      return;
    }

    const res = recordTemperature(patientId, parsed, quickNotes);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setActiveInputPatientId(null);
      setQuickTemp('');
      setQuickNotes('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nurse Monitoring Station</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
              Shift Vitals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record daily body temperature (°C) once per patient per calendar day. Temperatures &ge; 38.0°C trigger fever alerts.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Pending Today: <strong>{pendingPatients.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Completed: <strong>{completedPatients.length}</strong>
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Role Enforcement Notice */}
      {currentUser.role !== 'NURSE' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Previewing as {currentUser.role}:</strong> Only Nursing staff have permission to record vital temperature readings. You can observe the queue or use the top switcher to enter as Nurse.
          </div>
        </div>
      )}

      {/* Pending Queue Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Clock className="w-5 h-5 text-amber-500 mr-2" />
              Patients Awaiting Temperature Check ({pendingPatients.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target for Date: <strong>{todayStr}</strong>. One entry per calendar day strictly enforced.
            </p>
          </div>
        </div>

        {pendingPatients.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <strong className="text-slate-700 text-sm block">All Active Inpatients Checked</strong>
            All active ward patients have their daily temperature logged for {todayStr}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingPatients.map((p) => {
              const isSelected = activeInputPatientId === p.id;
              const prevTemp = p.temperatures[0]; // last historical reading

              return (
                <div key={p.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Patient Summary */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                          Bed #{p.bedNumber}
                        </span>
                        <Link to={`/patient/${p.id}`} className="font-bold text-slate-900 hover:text-sky-600 text-base">
                          {p.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">({p.mrn})</span>
                      </div>
                      <p className="text-xs text-slate-600">{p.diagnosis}</p>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                        <span>Age: {p.age}</span>
                        <span>•</span>
                        <span>
                          Previous Temp:{' '}
                          {prevTemp ? (
                            <strong className={prevTemp.temperatureC >= 38.0 ? 'text-rose-600' : 'text-slate-700'}>
                              {prevTemp.temperatureC}°C ({prevTemp.date})
                            </strong>
                          ) : (
                            'None recorded'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Quick Entry or Button */}
                    <div className="flex items-center space-x-3">
                      {isSelected ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min={30.0}
                              max={45.0}
                              autoFocus
                              placeholder="37.0"
                              value={quickTemp}
                              onChange={(e) => setQuickTemp(e.target.value)}
                              className="w-24 text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            />
                            <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">°C</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Optional notes (e.g. resting, oral)"
                            value={quickNotes}
                            onChange={(e) => setQuickNotes(e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none w-48"
                          />
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleQuickSubmit(p.id)}
                              disabled={currentUser.role !== 'NURSE'}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white disabled:bg-slate-300"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setActiveInputPatientId(null);
                                setQuickTemp('');
                                setQuickNotes('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setActiveInputPatientId(p.id);
                              setQuickTemp('36.8');
                            }}
                            disabled={currentUser.role !== 'NURSE'}
                            className="flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            <Thermometer className="w-3.5 h-3.5 mr-1" />
                            Record Temp
                          </button>
                          <Link
                            to={`/patient/${p.id}`}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Full Chart
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Already Completed Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
            Completed Today&apos;s Temperature Logs ({completedPatients.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged readings for {todayStr}. Further daily modifications are locked to preserve integrity.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3">Bed</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Today&apos;s Reading</th>
                <th className="px-6 py-3">Clinical Evaluation</th>
                <th className="px-6 py-3">Recorded By</th>
                <th className="px-6 py-3 text-right">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedPatients.map((p) => {
                const todayTemp = p.temperatures.find((t) => t.date === todayStr);
                const isFever = todayTemp && todayTemp.temperatureC >= 38.0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-xs">
                      #{p.bedNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/patient/${p.id}`} className="font-semibold text-slate-900 hover:text-sky-600">
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-400 font-mono">{p.mrn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isFever
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {todayTemp?.temperatureC}°C
                        {isFever && <AlertTriangle className="w-3.5 h-3.5 ml-1 text-rose-600" />}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {isFever ? (
                        <span className="text-rose-600 font-bold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          FEVER ALERT (&ge;38.0°C)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Afebrile (&lt;38.0°C)</span>
                      )}
                      {todayTemp?.notes && <div className="text-[11px] text-slate-400 mt-0.5">{todayTemp.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {todayTemp?.recordedBy || 'Nursing Staff'}
                      <div className="text-[10px] text-slate-400 font-mono">Locked for today</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/patient/${p.id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center"
                      >
                        History <ChevronRight className="w-3 h-3 ml-0.5" />
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

