import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { FileCheck2, ShieldAlert, CheckCircle2, ChevronRight, BedDouble, AlertCircle } from 'lucide-react';
import { checkDischargeEligibility } from '../utils/businessRules';

export const DischargeQueuePage: React.FC = () => {
  const { recommendedDischargePatients, currentUser, confirmDischarge, freeBedCount } = useHospital();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConfirm = (patientId: string, patientName: string, bedNumber: number) => {
    setFeedback(null);
    const res = confirmDischarge(patientId);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Discharge successfully confirmed for ${patientName}! Bed #${bedNumber} has been released.`,
      });
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discharge Management Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Admin Final Approval
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review medically recommended discharges. Confirming discharge permanently frees up the assigned hospital bed.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center">
          <BedDouble className="w-4 h-4 mr-1.5 text-sky-600" />
          Available Hospital Beds: <strong className="ml-1 text-sky-700">{freeBedCount}</strong>
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

      {currentUser.role !== 'ADMIN' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Administrator Access Enforced:</strong> You are signed in as <strong>{currentUser.role}</strong>. Only Hospital Administrators can approve and finalize discharges. Switch to the Admin role to confirm discharges.
          </div>
        </div>
      )}

      {/* Main Queue List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <FileCheck2 className="w-5 h-5 text-amber-500 mr-2" />
            Physician-Recommended Inpatients ({recommendedDischargePatients.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients verified by medical staff to have 3 consecutive days without fever.
          </p>
        </div>

        {recommendedDischargePatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <strong className="text-sm text-slate-700 block">Queue is Empty</strong>
            There are no pending discharge recommendations awaiting administrator confirmation.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recommendedDischargePatients.map((p) => {
              const elig = checkDischargeEligibility(p);

              return (
                <div key={p.id} className="p-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
                          Bed #{p.bedNumber}
                        </span>
                        <Link to={`/patient/${p.id}`} className="font-bold text-slate-900 hover:text-sky-600 text-lg">
                          {p.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">({p.mrn})</span>
                        <span className="text-xs text-slate-500">
                          {p.age}y / {p.gender}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">
                        <strong>Diagnosis:</strong> {p.diagnosis}
                      </p>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>
                            Physician Recommendation by: <strong>{p.dischargeRecommendedBy}</strong>
                          </span>
                          <span className="font-mono text-[11px]">{p.dischargeRecommendedAt?.substring(0, 10)}</span>
                        </div>
                        <p className="text-slate-800 italic">&ldquo;{p.dischargeSummary}&rdquo;</p>
                      </div>

                      {/* Afebrile Streak Audit Evidence */}
                      {elig.qualifyingDates.length >= 3 && (
                        <div className="text-[11px] text-emerald-800 font-mono bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
                          Afebrile Evidence: {elig.qualifyingDates.map((q) => `${q.date} (${q.temperatureC}°C)`).join(' → ')}
                        </div>
                      )}
                    </div>

                    {/* Admin Confirmation Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center space-y-2">
                      <button
                        onClick={() => handleConfirm(p.id, p.name, p.bedNumber)}
                        disabled={currentUser.role !== 'ADMIN'}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all whitespace-nowrap ${
                          currentUser.role === 'ADMIN'
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        Confirm Discharge & Free Bed #{p.bedNumber}
                      </button>
                      <Link
                        to={`/patient/${p.id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center"
                      >
                        Review Full Chart <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

