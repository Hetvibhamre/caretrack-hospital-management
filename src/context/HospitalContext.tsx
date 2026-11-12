import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Patient, UserRole, UserSession, AuditLog, TemperatureRecord, DoctorVisitRecord } from '../types';
import { generateSeedPatients } from '../data/seedData';
import { TOTAL_BED_CAPACITY, getTodayDateString, checkDischargeEligibility } from '../utils/businessRules';

interface HospitalContextType {
  currentUser: UserSession;
  switchRole: (role: UserRole) => void;
  patients: Patient[];
  auditLogs: AuditLog[];
  activePatients: Patient[];
  dischargedPatients: Patient[];
  deceasedPatients: Patient[];
  recommendedDischargePatients: Patient[];
  occupiedBedCount: number;
  freeBedCount: number;
  totalAdmissionsEver: number;
  mortalityRatePercent: number;
  successRatePercent: number;
  isBedCapacityFull: boolean;

  // Actions
  admitPatient: (patientData: {
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    diagnosis: string;
    bedNumber: number;
  }) => { success: boolean; message: string; patient?: Patient };

  recordTemperature: (
    patientId: string,
    temperatureC: number,
    notes?: string
  ) => { success: boolean; message: string };

  recordDoctorVisit: (
    patientId: string,
    notes: string,
    reasonIfTempMissing?: string
  ) => { success: boolean; message: string };

  recommendDischarge: (
    patientId: string,
    summary: string
  ) => { success: boolean; message: string };

  confirmDischarge: (
    patientId: string,
    summary?: string
  ) => { success: boolean; message: string };

  markPatientDeceased: (
    patientId: string,
    reason: string
  ) => { success: boolean; message: string };

  resetToDemoData: () => void;
}

const STORAGE_KEY_PATIENTS = 'caretrack_patients_v1';
const STORAGE_KEY_LOGS = 'caretrack_audit_logs_v1';
const STORAGE_KEY_USER = 'caretrack_active_user_v1';

const defaultRoleNames: Record<UserRole, string> = {
  ADMIN: 'Admin Jackson',
  NURSE: 'Nurse Sarah Connor',
  DOCTOR: 'Dr. Gregory House',
};

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { role: 'ADMIN', name: defaultRoleNames.ADMIN };
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const seed = generateSeedPatients();
    return seed.patients;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const seed = generateSeedPatients();
    return seed.auditLogs;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save patients to localStorage', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to save logs to localStorage', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    setCurrentUser({
      role,
      name: defaultRoleNames[role],
    });
  };

  const addAuditLog = (
    action: string,
    details: string,
    patientId?: string,
    patientName?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorRole: currentUser.role,
      actorName: currentUser.name,
      action,
      patientId,
      patientName,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Derived patient groups
  const activePatients = useMemo(
    () => patients.filter((p) => p.status === 'ACTIVE' || p.status === 'DISCHARGE_RECOMMENDED'),
    [patients]
  );

  const dischargedPatients = useMemo(
    () => patients.filter((p) => p.status === 'DISCHARGED'),
    [patients]
  );

  const deceasedPatients = useMemo(
    () => patients.filter((p) => p.status === 'DECEASED'),
    [patients]
  );

  const recommendedDischargePatients = useMemo(
    () => patients.filter((p) => p.status === 'DISCHARGE_RECOMMENDED'),
    [patients]
  );

  const occupiedBedCount = activePatients.length;
  const freeBedCount = Math.max(0, TOTAL_BED_CAPACITY - occupiedBedCount);
  const isBedCapacityFull = occupiedBedCount >= TOTAL_BED_CAPACITY;

  const totalAdmissionsEver = patients.length;
  const mortalityRatePercent =
    totalAdmissionsEver > 0
      ? Number(((deceasedPatients.length / totalAdmissionsEver) * 100).toFixed(1))
      : 0;

  const successRatePercent =
    totalAdmissionsEver > 0
      ? Number(((dischargedPatients.length / totalAdmissionsEver) * 100).toFixed(1))
      : 0;

  // ACTION: Admit Patient (ADMIN ONLY)
  const admitPatient = (patientData: {
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    diagnosis: string;
    bedNumber: number;
  }) => {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only Administrators can admit patients.' };
    }

    if (occupiedBedCount >= TOTAL_BED_CAPACITY) {
      return {
        success: false,
        message: `Hospital Bed Capacity Reached (${TOTAL_BED_CAPACITY}/${TOTAL_BED_CAPACITY}). Cannot admit patient until a bed is vacated.`,
      };
    }

    // Validate bed number
    if (patientData.bedNumber < 1 || patientData.bedNumber > TOTAL_BED_CAPACITY) {
      return { success: false, message: `Bed number must be between 1 and ${TOTAL_BED_CAPACITY}.` };
    }

    // Check if bed is already occupied by an active patient
    const bedTaken = activePatients.find((p) => p.bedNumber === patientData.bedNumber);
    if (bedTaken) {
      return {
        success: false,
        message: `Bed #${patientData.bedNumber} is currently occupied by ${bedTaken.name} (MRN: ${bedTaken.mrn}). Choose a different bed.`,
      };
    }

    const todayStr = getTodayDateString();
    const newMrn = `CT-${1000 + patients.length + 1}`;
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      mrn: newMrn,
      name: patientData.name.trim(),
      age: patientData.age,
      gender: patientData.gender,
      admissionDate: todayStr,
      diagnosis: patientData.diagnosis.trim(),
      bedNumber: patientData.bedNumber,
      status: 'ACTIVE',
      temperatures: [],
      visits: [],
    };

    setPatients((prev) => [newPatient, ...prev]);
    addAuditLog(
      'PATIENT_ADMITTED',
      `Admitted patient ${newPatient.name} (Age: ${newPatient.age}) to Bed #${newPatient.bedNumber}. Diagnosis: ${newPatient.diagnosis}`,
      newPatient.id,
      newPatient.name
    );

    return {
      success: true,
      message: `Patient ${newPatient.name} admitted successfully to Bed #${newPatient.bedNumber}.`,
      patient: newPatient,
    };
  };

  // ACTION: Record Temperature (NURSE ONLY)
  const recordTemperature = (
    patientId: string,
    temperatureC: number,
    notes?: string
  ) => {
    if (currentUser.role !== 'NURSE') {
      return { success: false, message: 'Unauthorized: Only Nursing staff can record vitals.' };
    }

    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (targetPatient.status === 'DISCHARGED' || targetPatient.status === 'DECEASED') {
      return { success: false, message: 'Cannot record vitals for discharged or deceased patients.' };
    }

    // OWASP & Medical input validation
    if (isNaN(temperatureC) || temperatureC < 30.0 || temperatureC > 45.0) {
      return {
        success: false,
        message: 'Invalid temperature reading. Must be a realistic clinical value between 30.0°C and 45.0°C.',
      };
    }

    const todayStr = getTodayDateString();
    // Rule: One Entry Per Day per patient
    const alreadyRecordedToday = targetPatient.temperatures.some((t) => t.date === todayStr);
    if (alreadyRecordedToday) {
      return {
        success: false,
        message: `Temperature has already been recorded for ${targetPatient.name} today (${todayStr}). One entry per calendar day is enforced.`,
      };
    }

    const newRecord: TemperatureRecord = {
      id: `temp-${Date.now()}`,
      patientId,
      date: todayStr,
      temperatureC: Number(temperatureC.toFixed(1)),
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.name,
      notes: notes?.trim() || undefined,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          temperatures: [newRecord, ...p.temperatures],
        };
      })
    );

    addAuditLog(
      'TEMPERATURE_RECORDED',
      `Recorded daily temperature: ${newRecord.temperatureC}°C${newRecord.temperatureC >= 38.0 ? ' (FEVER ALERT)' : ' (Normal)'}${notes ? ` - Notes: ${notes}` : ''}`,
      targetPatient.id,
      targetPatient.name
    );

    return {
      success: true,
      message: `Temperature ${newRecord.temperatureC}°C recorded successfully for ${targetPatient.name}.`,
    };
  };

  // ACTION: Record Doctor Visit (DOCTOR ONLY)
  const recordDoctorVisit = (
    patientId: string,
    notes: string,
    reasonIfTempMissing?: string
  ) => {
    if (currentUser.role !== 'DOCTOR') {
      return { success: false, message: 'Unauthorized: Only Doctors can record visit notes.' };
    }

    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (targetPatient.status === 'DISCHARGED' || targetPatient.status === 'DECEASED') {
      return { success: false, message: 'Cannot record visit note for inactive patients.' };
    }

    if (!notes || notes.trim().length < 5) {
      return { success: false, message: 'Clinical visit notes must be at least 5 characters.' };
    }

    const todayStr = getTodayDateString();
    const todayTemp = targetPatient.temperatures.find((t) => t.date === todayStr);

    // If temp missing today, require reason
    if (!todayTemp && (!reasonIfTempMissing || reasonIfTempMissing.trim().length < 5)) {
      return {
        success: false,
        message: "Today's temperature reading is missing! A clinical justification is required to proceed with visit note without today's vitals.",
      };
    }

    const newVisit: DoctorVisitRecord = {
      id: `visit-${Date.now()}`,
      patientId,
      date: todayStr,
      visitedAt: new Date().toISOString(),
      visitedBy: currentUser.name,
      notes: notes.trim(),
      temperatureSeenAtVisit: todayTemp?.temperatureC,
      reasonIfTempMissing: !todayTemp ? reasonIfTempMissing?.trim() : undefined,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          visits: [newVisit, ...p.visits],
        };
      })
    );

    addAuditLog(
      'DOCTOR_VISIT_RECORDED',
      `Clinical round note filed.${!todayTemp ? ` (Proceeded without temp: ${reasonIfTempMissing})` : ` (Temp verified: ${todayTemp.temperatureC}°C)`}`,
      targetPatient.id,
      targetPatient.name
    );

    return {
      success: true,
      message: `Visit note recorded successfully for ${targetPatient.name}.`,
    };
  };

  // ACTION: Recommend Discharge (DOCTOR ONLY)
  const recommendDischarge = (patientId: string, summary: string) => {
    if (currentUser.role !== 'DOCTOR') {
      return { success: false, message: 'Unauthorized: Only Doctors can recommend discharge.' };
    }

    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) {
      return { success: false, message: 'Patient not found.' };
    }

    // STRICT 3-CONSECUTIVE CALENDAR DAYS VALIDATION
    const eligibility = checkDischargeEligibility(targetPatient);
    if (!eligibility.isEligible) {
      return {
        success: false,
        message: `Discharge eligibility criteria NOT met! ${eligibility.reason}`,
      };
    }

    if (targetPatient.status === 'DISCHARGE_RECOMMENDED') {
      return { success: false, message: 'Discharge has already been recommended for this patient.' };
    }

    const nowIso = new Date().toISOString();
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'DISCHARGE_RECOMMENDED',
          dischargeRecommendedBy: currentUser.name,
          dischargeRecommendedAt: nowIso,
          dischargeSummary: summary.trim() || 'Patient medically cleared for discharge. Afebrile streak criteria verified.',
        };
      })
    );

    addAuditLog(
      'DISCHARGE_RECOMMENDED',
      `Doctor recommended discharge. Verified 3 fever-free calendar days: ${eligibility.qualifyingDates.map((q) => `${q.date} (${q.temperatureC}°C)`).join(', ')}.`,
      targetPatient.id,
      targetPatient.name
    );

    return {
      success: true,
      message: `Discharge recommended for ${targetPatient.name}. Patient placed in Admin Discharge Queue.`,
    };
  };

  // ACTION: Confirm Discharge (ADMIN ONLY)
  const confirmDischarge = (patientId: string, summary?: string) => {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only Administrators can finalize discharges and release beds.' };
    }

    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (targetPatient.status !== 'DISCHARGE_RECOMMENDED') {
      return {
        success: false,
        message: 'Cannot finalize discharge without prior Doctor clinical recommendation.',
      };
    }

    const todayStr = getTodayDateString();
    const nowIso = new Date().toISOString();

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'DISCHARGED',
          dischargeDate: todayStr,
          dischargeApprovedBy: currentUser.name,
          dischargeApprovedAt: nowIso,
          dischargeSummary: summary || p.dischargeSummary || 'Discharge confirmed by hospital administration.',
        };
      })
    );

    addAuditLog(
      'DISCHARGE_FINALIZED',
      `Approved and finalized discharge for ${targetPatient.name}. Bed #${targetPatient.bedNumber} is now freed.`,
      targetPatient.id,
      targetPatient.name
    );

    return {
      success: true,
      message: `Discharge finalized for ${targetPatient.name}. Bed #${targetPatient.bedNumber} is now free.`,
    };
  };

  // ACTION: Mark Patient Deceased (ADMIN ONLY)
  const markPatientDeceased = (patientId: string, reason: string) => {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only Administrators can record outcome status.' };
    }

    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetPatient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (targetPatient.status === 'DECEASED' || targetPatient.status === 'DISCHARGED') {
      return { success: false, message: 'Cannot mark an already inactive patient as deceased.' };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, message: 'A clinical explanation/cause is required (minimum 5 characters).' };
    }

    const todayStr = getTodayDateString();
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'DECEASED',
          deceasedDate: todayStr,
          deceasedReason: reason.trim(),
          deceasedMarkedBy: currentUser.name,
        };
      })
    );

    addAuditLog(
      'PATIENT_DECEASED',
      `Marked patient as deceased. Cause: ${reason.trim()}. Freed Bed #${targetPatient.bedNumber}.`,
      targetPatient.id,
      targetPatient.name
    );

    return {
      success: true,
      message: `Outcome recorded for ${targetPatient.name}. Bed #${targetPatient.bedNumber} has been released.`,
    };
  };

  // Reset to initial demo dataset
  const resetToDemoData = () => {
    const seed = generateSeedPatients();
    setPatients(seed.patients);
    setAuditLogs(seed.auditLogs);
    localStorage.removeItem(STORAGE_KEY_PATIENTS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    addAuditLog('SYSTEM_RESET', 'Hospital dataset reset to default synthetic demo records.');
  };

  return (
    <HospitalContext.Provider
      value={{
        currentUser,
        switchRole,
        patients,
        auditLogs,
        activePatients,
        dischargedPatients,
        deceasedPatients,
        recommendedDischargePatients,
        occupiedBedCount,
        freeBedCount,
        totalAdmissionsEver,
        mortalityRatePercent,
        successRatePercent,
        isBedCapacityFull,
        admitPatient,
        recordTemperature,
        recordDoctorVisit,
        recommendDischarge,
        confirmDischarge,
        markPatientDeceased,
        resetToDemoData,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};

