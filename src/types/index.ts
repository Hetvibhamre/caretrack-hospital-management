export type UserRole = 'ADMIN' | 'NURSE' | 'DOCTOR';

export interface UserSession {
  role: UserRole;
  name: string;
}

export type PatientStatus = 'ACTIVE' | 'DISCHARGE_RECOMMENDED' | 'DISCHARGED' | 'DECEASED';

export interface TemperatureRecord {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  temperatureC: number;
  recordedAt: string; // ISO string
  recordedBy: string; // Nurse name
  notes?: string;
}

export interface DoctorVisitRecord {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  visitedAt: string; // ISO string
  visitedBy: string; // Doctor name
  notes: string;
  temperatureSeenAtVisit?: number;
  reasonIfTempMissing?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  actorRole: UserRole;
  actorName: string;
  action: string;
  patientId?: string;
  patientName?: string;
  details: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. CT-1001
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  admissionDate: string; // YYYY-MM-DD
  diagnosis: string;
  bedNumber: number; // 1 to 74
  status: PatientStatus;
  dischargeDate?: string; // YYYY-MM-DD
  dischargeSummary?: string;
  dischargeRecommendedBy?: string;
  dischargeRecommendedAt?: string;
  dischargeApprovedBy?: string;
  dischargeApprovedAt?: string;
  deceasedDate?: string;
  deceasedReason?: string;
  deceasedMarkedBy?: string;
  temperatures: TemperatureRecord[];
  visits: DoctorVisitRecord[];
}

export interface DischargeEligibilityResult {
  isEligible: boolean;
  qualifyingDates: {
    date: string;
    temperatureC: number;
  }[];
  reason: string;
  consecutiveDaysCount: number;
}

