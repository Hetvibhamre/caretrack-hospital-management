import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import {
  calculateLengthOfStay,
  getTodayDateString,
  checkDischargeEligibility,
  formatDateDisplay,
  formatDateTimeDisplay,
  FEVER_THRESHOLD_C,
} from '../utils/businessRules';
import {
  Activity,
  Calendar,
  BedDouble,
  User,
  Thermometer,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    patients,
    currentUser,
    recordTemperature,
    recordDoctorVisit,
    recommendDischarge,
    confirmDischarge,
  } = useHospital();

  const patient = patients.find((p) => p.id === id);
  const todayStr = getTodayDateString();

  const [activeTab, setActiveTab] = useState<'VITALS' | 'DOCTOR_NOTES' | 'ELIGIBILITY'>('VITALS');

  // Nurse Form State
  const [nurseTemp, setNurseTemp] = useState('');
  const [nurseNotes, setNurseNotes] = useState('');

  // Doctor Form State
  const [doctorNotes, setDoctorNotes] = useState('');
  const [doctorReasonIfMissing, setDoctorReasonIfMissing] = useState('');
  const [recommendDischargeSummary, setRecommendDischargeSummary] = useState('');

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Patient Record Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The requested patient chart could not be located in the current database.
        </p>
        <button
          onClick={() => navigate('/overview')}
          className="mt-6 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Operations
        </button>
      </div>
    );
  }

  const lengthOfStay = calculateLengthOfStay(patient.admissionDate, patient.dischargeDate || patient.deceasedDate);
  const eligibility = checkDischargeEligibility(patient);
  const todayTempRecord = patient.temperatures.find((t) => t.date === todayStr);
  const todayVisitRecord = patient.visits.find((v) => v.date === todayStr);
  const hasTempToday = !!todayTempRecord;
  const isFeverToday = todayTempRecord && todayTempRecord.temperatureC >= FEVER_THRESHOLD_C;

  // Handlers
  const handleNurseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const parsed = parseFloat(nurseTemp);
    if (isNaN(parsed)) {
      setFeedback({ type: 'error', message: 'Please enter a valid numeric temperature.' });
      return;
    }
    const res = recordTemperature(patient.id, parsed, nurseNotes);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setNurseTemp('');
      setNurseNotes('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleDoctorVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = recordDoctorVisit(patient.id, doctorNotes, doctorReasonIfMissing);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setDoctorNotes('');
      setDoctorReasonIfMissing('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleDoctorRecommendDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = recommendDischarge(patient.id, recommendDischargeSummary);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setRecommendDischargeSummary('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAdminConfirmDischarge = () => {
    setFeedback(null);
    const res = confirmDischarge(patient.id);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="text-xs text-slate-400 font-mono">Chart ID: {patient.id}</div>
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

      {/* Patient Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{patient.name}</h1>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                {patient.mrn}
              </span>
              {patient.status === 'ACTIVE' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  Active Inpatient
                </span>
              )}
              {patient.status === 'DISCHARGE_RECOMMENDED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  Discharge Recommended
                </span>
              )}
              {patient.status === 'DISCHARGED' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Discharged on {patient.dischargeDate}
                </span>
              )}
              {patient.status === 'DECEASED' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                  Deceased ({patient.deceasedDate})
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-700">{patient.diagnosis}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {patient.age} yrs • {patient.gender}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <BedDouble className="w-3.5 h-3.5 mr-1 text-sky-500" />
                {patient.status === 'ACTIVE' || patient.status === 'DISCHARGE_RECOMMENDED' ? (
                  <strong>Bed #{patient.bedNumber}</strong>
                ) : (
                  <span>Bed #{patient.bedNumber} (Released)</span>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Admitted: {patient.admissionDate} (Day {lengthOfStay})
              </span>
            </div>
          </div>

          {/* Quick Discharge Badge / Trigger */}
          <div className="flex flex-col items-start md:items-end justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600 mb-1">3-Day Discharge Eligibility:</span>
            {eligibility.isEligible ? (
              <div className="flex items-center text-emerald-700 font-bold bg-emerald-100/70 px-3 py-1.5 rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Eligible: 3 Days Fever-Free!
              </div>
            ) : (
              <div className="flex items-center text-slate-600 font-medium">
                <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                {eligibility.consecutiveDaysCount} / 3 consecutive afebrile days
              </div>
            )}
            <div className="text-[11px] text-slate-400 mt-1 max-w-xs text-left md:text-right">
              {eligibility.reason}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('VITALS')}
          className={`pb-3 transition-colors border-b-2 flex items-center ${
            activeTab === 'VITALS'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Thermometer className="w-4 h-4 mr-1.5" />
          Vitals History & Temperature Log ({patient.temperatures.length})
        </button>
        <button
          onClick={() => setActiveTab('DOCTOR_NOTES')}
          className={`pb-3 transition-colors border-b-2 flex items-center ${
            activeTab === 'DOCTOR_NOTES'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 mr-1.5" />
          Physician Rounds & Notes ({patient.visits.length})
        </button>
        <button
          onClick={() => setActiveTab('ELIGIBILITY')}
          className={`pb-3 transition-colors border-b-2 flex items-center ${
            activeTab === 'ELIGIBILITY'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Discharge Clearance Audit
        </button>
      </div>

      {/* TAB 1: VITALS & TEMPERATURE */}
      {activeTab === 'VITALS' && (
        <div className="space-y-6">
          {/* Nurse Input Form (Allowed for Nurse Role) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Thermometer className="w-5 h-5 mr-2 text-sky-600" />
                Record Today&apos;s Daily Temperature ({todayStr})
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                Nursing Action
              </span>
            </div>

            {hasTempToday ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm block font-bold">
                    Temperature Recorded Today: {todayTempRecord?.temperatureC}°C
                  </strong>
                  Logged at {formatDateTimeDisplay(todayTempRecord?.recordedAt || '')} by {todayTempRecord?.recordedBy}.
                  <span className="block mt-1 font-semibold text-emerald-900">
                    Rule Enforced: Only one entry per calendar day is permitted. Further recording for today is locked.
                  </span>
                </div>
              </div>
            ) : currentUser.role !== 'NURSE' ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Nurse Permission Required:</strong> You are currently signed in as <strong>{currentUser.role}</strong>. Administrators and Doctors cannot enter vitals. Switch to the Nurse role via the top bar to record temperature.
                </div>
              </div>
            ) : patient.status !== 'ACTIVE' && patient.status !== 'DISCHARGE_RECOMMENDED' ? (
              <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-xs">
                Cannot record vitals for inactive or discharged patients.
              </div>
            ) : (
              <form onSubmit={handleNurseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Body Temperature (°C) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min={30.0}
                        max={45.0}
                        required
                        placeholder="36.8"
                        value={nurseTemp}
                        onChange={(e) => setNurseTemp(e.target.value)}
                        className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">°C</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Normal: 36.5–37.5°C • Fever &ge; 38.0°C</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Clinical Vitals Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oral probe, patient resting calmly in semi-Fowler position"
                      value={nurseNotes}
                      onChange={(e) => setNurseNotes(e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20"
                  >
                    Submit Daily Temperature Log
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Temperature History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recorded Temperature Timeline
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {patient.temperatures.length} total entries
              </span>
            </div>

            {patient.temperatures.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No temperatures recorded for this patient yet.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-3">Calendar Date</th>
                    <th className="px-6 py-3">Temperature</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Notes</th>
                    <th className="px-6 py-3 text-right">Nurse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.temperatures.map((t) => {
                    const isFever = t.temperatureC >= FEVER_THRESHOLD_C;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs font-semibold">
                          {t.date}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isFever
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {t.temperatureC.toFixed(1)}°C
                            {isFever && <AlertTriangle className="w-3.5 h-3.5 ml-1 text-rose-600" />}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                          {isFever ? (
                            <span className="text-rose-600 font-bold">Fever Alert (&ge;38.0°C)</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Afebrile (&lt;38.0°C)</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-500">
                          {t.notes || '—'}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-right text-xs text-slate-500">
                          {t.recordedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR NOTES & ROUNDS */}
      {activeTab === 'DOCTOR_NOTES' && (
        <div className="space-y-6">
          {/* Permission Check for Nurses: Nurses cannot see doctor notes */}
          {currentUser.role === 'NURSE' ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Restricted Clinical Section</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                Per hospital governance policy, Nursing staff cannot review or edit confidential Attending Physician clinical progress notes.
              </p>
            </div>
          ) : (
            <>
              {/* Doctor Visit Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-emerald-600" />
                    Daily Attending Physician Round Note ({todayStr})
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Doctor Action
                  </span>
                </div>

                {/* Verification Notice: Check if today's temp is recorded */}
                <div className="mb-4">
                  {!hasTempToday ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-sm">
                          Warning: Today&apos;s Temperature Has Not Been Recorded Yet!
                        </strong>
                        Nursing staff have not yet entered a temperature reading for this patient today. To ensure clinical safety, you must provide a justification below if you wish to record a visit before vitals are logged.
                      </div>
                    </div>
                  ) : isFeverToday ? (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-sm">
                          Fever Alert Active: {todayTempRecord.temperatureC}°C
                        </strong>
                        Patient presented with elevated temperature (&ge;38.0°C) today. Antipyretic therapy and septic workup recommended.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Today&apos;s vitals verified: <strong>{todayTempRecord.temperatureC}°C</strong> (Afebrile).
                      </span>
                    </div>
                  )}
                </div>

                {currentUser.role !== 'DOCTOR' ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Physician Role Required:</strong> Only Attending Doctors can write clinical round notes. You are signed in as <strong>{currentUser.role}</strong>.
                    </div>
                  </div>
                ) : patient.status !== 'ACTIVE' && patient.status !== 'DISCHARGE_RECOMMENDED' ? (
                  <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-xs">
                    Cannot enter notes for inactive or discharged patients.
                  </div>
                ) : (
                  <form onSubmit={handleDoctorVisitSubmit} className="space-y-4">
                    {!hasTempToday && (
                      <div>
                        <label className="block text-xs font-bold text-amber-800 uppercase mb-1">
                          Clinical Justification for Proceeding Without Today&apos;s Temperature *
                        </label>
                        <input
                          type="text"
                          required
                          value={doctorReasonIfMissing}
                          onChange={(e) => setDoctorReasonIfMissing(e.target.value)}
                          placeholder="e.g. Urgent morning round prior to nursing shift vitals collection"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Physician Progress Note & Examination Summary *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="e.g. Patient alert and oriented x3. Lungs clear, abdomen soft and non-tender. Tolerating oral diet..."
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        File Daily Progress Note
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Doctor Visit Notes Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Clinical Progress Notes History ({patient.visits.length})
                </h3>

                {patient.visits.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No doctor visit notes recorded yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patient.visits.map((v) => (
                      <div key={v.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{v.visitedBy}</span>
                          <span className="text-slate-400 font-mono">{formatDateTimeDisplay(v.visitedAt)}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{v.notes}</p>
                        {v.reasonIfTempMissing && (
                          <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                            <strong>Overrode Missing Temp:</strong> {v.reasonIfTempMissing}
                          </div>
                        )}
                        {v.temperatureSeenAtVisit && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Verified temp at visit: {v.temperatureSeenAtVisit}°C
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: DISCHARGE CLEARANCE AUDIT & ACTIONS */}
      {activeTab === 'ELIGIBILITY' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <FileCheck2 className="w-5 h-5 mr-2 text-purple-600" />
                3-Consecutive Calendar Day Afebrile Discharge Audit
              </h2>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 font-bold">
                Threshold: &lt; {FEVER_THRESHOLD_C.toFixed(1)}°C
              </span>
            </div>

            {/* Strict Evaluation Evidence Card */}
            <div
              className={`p-5 rounded-2xl border ${
                eligibility.isEligible
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-amber-50/70 border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-600">
                    Clinical Evaluation Result
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center">
                    {eligibility.isEligible ? (
                      <span className="text-emerald-800 flex items-center">
                        <CheckCircle2 className="w-6 h-6 mr-2 text-emerald-600" />
                        Qualified for Discharge Recommendation
                      </span>
                    ) : (
                      <span className="text-amber-800 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2 text-amber-600" />
                        Criteria Not Yet Met ({eligibility.consecutiveDaysCount}/3 Days)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                {eligibility.reason}
              </p>

              {/* Exact Dates Evidence Box */}
              {eligibility.qualifyingDates.length >= 3 && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-200 shadow-sm">
                  <div className="text-xs font-bold text-emerald-900 mb-2">
                    Verified Qualifying Afebrile Calendar Days (Evidence):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {eligibility.qualifyingDates.map((q, idx) => (
                      <div key={idx} className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-xs">
                        <div className="font-mono font-bold text-emerald-900">{q.date}</div>
                        <div className="text-emerald-700 text-[11px]">
                          Reading: <strong>{q.temperatureC}°C</strong> (&lt; 38.0°C)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DOCTOR ACTION: Recommend Discharge */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Physician Discharge Clearance
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Only an Attending Physician can recommend discharge, and the button is strictly disabled unless the 3-day consecutive afebrile criteria is mathematically satisfied.
              </p>

              {patient.status === 'DISCHARGE_RECOMMENDED' ? (
                <div className="p-4 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-900">
                  <strong>Discharge Already Recommended:</strong> Recommended by {patient.dischargeRecommendedBy} at{' '}
                  {patient.dischargeRecommendedAt}. Patient is currently waiting in the Administrator queue for final bed release.
                </div>
              ) : patient.status === 'DISCHARGED' ? (
                <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900">
                  Patient finalized and discharged on {patient.dischargeDate}.
                </div>
              ) : (
                <form onSubmit={handleDoctorRecommendDischarge} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Discharge Summary & Clinical Clearance Notes
                    </label>
                    <textarea
                      rows={2}
                      disabled={!eligibility.isEligible || currentUser.role !== 'DOCTOR'}
                      value={recommendDischargeSummary}
                      onChange={(e) => setRecommendDischargeSummary(e.target.value)}
                      placeholder={
                        eligibility.isEligible
                          ? "e.g. Afebrile for 3 days, vitals stable, oral medications tolerated well. Cleared for discharge."
                          : "Disabled until patient achieves 3 full consecutive calendar days without fever."
                      }
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-200/60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {currentUser.role !== 'DOCTOR' && 'Must be signed in as Doctor to recommend discharge.'}
                    </span>
                    <button
                      type="submit"
                      disabled={!eligibility.isEligible || currentUser.role !== 'DOCTOR'}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        eligibility.isEligible && currentUser.role === 'DOCTOR'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Recommend Discharge (Forward to Admin)
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ADMIN ACTION: Finalize Discharge */}
            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200">
              <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2">
                Administrator Final Discharge Authorization
              </h3>
              <p className="text-xs text-purple-700 mb-4">
                Administrators finalize the discharge, officially vacating Bed #{patient.bedNumber} and updating hospital census KPIs.
              </p>

              {patient.status === 'DISCHARGE_RECOMMENDED' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-purple-900">
                    <div>
                      <strong>Recommended by:</strong> {patient.dischargeRecommendedBy}
                    </div>
                    <div className="text-slate-600 mt-1 italic">{patient.dischargeSummary}</div>
                  </div>
                  <button
                    onClick={handleAdminConfirmDischarge}
                    disabled={currentUser.role !== 'ADMIN'}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm Discharge & Release Bed #{patient.bedNumber}
                  </button>
                </div>
              ) : patient.status === 'DISCHARGED' ? (
                <div className="text-xs text-emerald-800 font-semibold">
                  Discharge confirmed by {patient.dischargeApprovedBy} at {patient.dischargeApprovedAt}. Bed released.
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Patient has not been recommended for discharge by a physician yet. Final confirmation unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

