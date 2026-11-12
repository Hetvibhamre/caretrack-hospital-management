import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { TOTAL_BED_CAPACITY } from '../utils/businessRules';
import { UserPlus, BedDouble, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const PatientRegistrationPage: React.FC = () => {
  const { admitPatient, activePatients, occupiedBedCount, freeBedCount, isBedCapacityFull, currentUser } = useHospital();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [diagnosis, setDiagnosis] = useState('');
  const [bedNumber, setBedNumber] = useState<number | ''>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Find next naturally available bed number (1 to 74)
  const occupiedBedSet = new Set(activePatients.map((p) => p.bedNumber));
  let suggestedBed: number | null = null;
  for (let i = 1; i <= TOTAL_BED_CAPACITY; i++) {
    if (!occupiedBedSet.has(i)) {
      suggestedBed = i;
      break;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // OWASP & Business Validation
    if (!name.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }
    if (age === '' || isNaN(Number(age)) || Number(age) < 0 || Number(age) > 130) {
      setErrorMsg('Please enter a valid patient age (0 - 130).');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorMsg('Admission diagnosis and clinical rationale are required.');
      return;
    }
    if (bedNumber === '' || isNaN(Number(bedNumber)) || Number(bedNumber) < 1 || Number(bedNumber) > TOTAL_BED_CAPACITY) {
      setErrorMsg(`Bed number must be between 1 and ${TOTAL_BED_CAPACITY}.`);
      return;
    }

    const res = admitPatient({
      name: name.trim(),
      age: Number(age),
      gender,
      diagnosis: diagnosis.trim(),
      bedNumber: Number(bedNumber),
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setName('');
      setAge('');
      setDiagnosis('');
      setBedNumber('');
      setTimeout(() => {
        if (res.patient) {
          navigate(`/patient/${res.patient.id}`);
        } else {
          navigate('/admin/patients');
        }
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-2">
          Only Hospital Administrators can admit and register new patients.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Capacity Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <UserPlus className="w-6 h-6 mr-2 text-sky-600" />
            Admit New Inpatient
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign bed, register patient demographics, and open digital inpatient chart.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
          <BedDouble className="w-4 h-4 text-sky-600" />
          <span>
            Capacity: <strong>{occupiedBedCount} / {TOTAL_BED_CAPACITY}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className={freeBedCount === 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
            {freeBedCount} Available
          </span>
        </div>
      </div>

      {isBedCapacityFull && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Hospital Capacity Limit Reached:</strong> All {TOTAL_BED_CAPACITY} inpatient beds are currently occupied. New admissions cannot be completed until an existing patient is discharged.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-sm text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              disabled={isBedCapacityFull}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. William Shakespeare"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Age (Years) *
            </label>
            <input
              type="number"
              required
              min={0}
              max={130}
              disabled={isBedCapacityFull}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="e.g. 54"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Gender *
            </label>
            <select
              disabled={isBedCapacityFull}
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other / Non-Binary</option>
            </select>
          </div>

          {/* Bed Assignment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Bed (1 - {TOTAL_BED_CAPACITY}) *
              </label>
              {suggestedBed && (
                <button
                  type="button"
                  onClick={() => setBedNumber(suggestedBed)}
                  className="text-[11px] text-sky-600 hover:underline font-semibold"
                >
                  Use next free (Bed #{suggestedBed})
                </button>
              )}
            </div>
            <input
              type="number"
              required
              min={1}
              max={TOTAL_BED_CAPACITY}
              disabled={isBedCapacityFull}
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder={`1 to ${TOTAL_BED_CAPACITY}`}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Currently occupied beds: {Array.from(occupiedBedSet).sort((a, b) => a - b).join(', ') || 'None'}
            </p>
          </div>

          {/* Admission Date (Automated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Admission Date
            </label>
            <input
              type="text"
              disabled
              value={new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Timestamp automatically logged in system audit trail.
            </p>
          </div>

          {/* Primary Diagnosis & Clinical Indication */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Primary Admitting Diagnosis & Clinical Summary *
            </label>
            <textarea
              required
              rows={3}
              disabled={isBedCapacityFull}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute exacerbation of chronic bronchitis, suspected lower respiratory tract infection..."
              className="w-full text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBedCapacityFull}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
              isBedCapacityFull
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
            }`}
          >
            Confirm Admission & Open Chart
          </button>
        </div>
      </form>
    </div>
  );
};

