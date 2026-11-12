import { format, subDays } from 'date-fns';
import { Patient, AuditLog } from '../types';

export function generateSeedPatients(): { patients: Patient[]; auditLogs: AuditLog[] } {
  const today = new Date();
  const d0 = format(today, 'yyyy-MM-dd');
  const d1 = format(subDays(today, 1), 'yyyy-MM-dd');
  const d2 = format(subDays(today, 2), 'yyyy-MM-dd');
  const d3 = format(subDays(today, 3), 'yyyy-MM-dd');
  const d4 = format(subDays(today, 4), 'yyyy-MM-dd');
  const d5 = format(subDays(today, 5), 'yyyy-MM-dd');

  const patients: Patient[] = [
    // 1. Ready for Discharge - meets 3-day rule, doctor can recommend discharge
    {
      id: 'pat-1',
      mrn: 'CT-1001',
      name: 'Eleanor Vance',
      age: 42,
      gender: 'FEMALE',
      admissionDate: d5,
      diagnosis: 'Acute Bacterial Pneumonia (Resolved)',
      bedNumber: 12,
      status: 'ACTIVE',
      temperatures: [
        { id: 't-1-3', patientId: 'pat-1', date: d3, temperatureC: 37.1, recordedAt: `${d3}T08:30:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-1-2', patientId: 'pat-1', date: d2, temperatureC: 36.8, recordedAt: `${d2}T09:00:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-1-1', patientId: 'pat-1', date: d1, temperatureC: 36.7, recordedAt: `${d1}T08:15:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-1-0', patientId: 'pat-1', date: d0, temperatureC: 36.6, recordedAt: `${d0}T08:00:00Z`, recordedBy: 'Nurse Sarah Connor' },
      ],
      visits: [
        { id: 'v-1-1', patientId: 'pat-1', date: d1, visitedAt: `${d1}T10:30:00Z`, visitedBy: 'Dr. Gregory House', notes: 'Lungs clear bilaterally. Vitals stable. Prepare for potential discharge tomorrow.' },
      ],
    },

    // 2. Already Recommended for Discharge - Waiting for Admin Confirmation
    {
      id: 'pat-2',
      mrn: 'CT-1002',
      name: 'James Montgomery',
      age: 65,
      gender: 'MALE',
      admissionDate: d4,
      diagnosis: 'Post-Op Appendectomy Recovery',
      bedNumber: 15,
      status: 'DISCHARGE_RECOMMENDED',
      dischargeRecommendedBy: 'Dr. Allison Cameron',
      dischargeRecommendedAt: `${d0}T09:30:00Z`,
      dischargeSummary: 'Afebrile for 4 days post laparoscopy. Incision sites healing cleanly. Ambulating well.',
      temperatures: [
        { id: 't-2-3', patientId: 'pat-2', date: d3, temperatureC: 36.9, recordedAt: `${d3}T08:20:00Z`, recordedBy: 'Nurse John Watson' },
        { id: 't-2-2', patientId: 'pat-2', date: d2, temperatureC: 36.7, recordedAt: `${d2}T08:45:00Z`, recordedBy: 'Nurse John Watson' },
        { id: 't-2-1', patientId: 'pat-2', date: d1, temperatureC: 36.8, recordedAt: `${d1}T08:10:00Z`, recordedBy: 'Nurse John Watson' },
        { id: 't-2-0', patientId: 'pat-2', date: d0, temperatureC: 36.7, recordedAt: `${d0}T07:45:00Z`, recordedBy: 'Nurse John Watson' },
      ],
      visits: [
        { id: 'v-2-0', patientId: 'pat-2', date: d0, visitedAt: `${d0}T09:30:00Z`, visitedBy: 'Dr. Allison Cameron', notes: 'Patient meets all clinical discharge criteria. Recommended discharge.' },
      ],
    },

    // 3. Active Fever Today - Red alert, cannot be discharged
    {
      id: 'pat-3',
      mrn: 'CT-1003',
      name: 'Carlos Mendoza',
      age: 28,
      gender: 'MALE',
      admissionDate: d3,
      diagnosis: 'Complicated Pyelonephritis',
      bedNumber: 22,
      status: 'ACTIVE',
      temperatures: [
        { id: 't-3-2', patientId: 'pat-3', date: d2, temperatureC: 38.4, recordedAt: `${d2}T09:10:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-3-1', patientId: 'pat-3', date: d1, temperatureC: 37.9, recordedAt: `${d1}T08:50:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-3-0', patientId: 'pat-3', date: d0, temperatureC: 38.8, recordedAt: `${d0}T08:30:00Z`, recordedBy: 'Nurse Sarah Connor' }, // Fever today!
      ],
      visits: [],
    },

    // 4. Missing Temperature Today - Nurse pending task & Doctor warning
    {
      id: 'pat-4',
      mrn: 'CT-1004',
      name: 'Amina Al-Mansoor',
      age: 54,
      gender: 'FEMALE',
      admissionDate: d3,
      diagnosis: 'Congestive Heart Failure Exacerbation',
      bedNumber: 5,
      status: 'ACTIVE',
      temperatures: [
        { id: 't-4-2', patientId: 'pat-4', date: d2, temperatureC: 36.8, recordedAt: `${d2}T09:30:00Z`, recordedBy: 'Nurse John Watson' },
        { id: 't-4-1', patientId: 'pat-4', date: d1, temperatureC: 37.0, recordedAt: `${d1}T09:00:00Z`, recordedBy: 'Nurse John Watson' },
        // Notice: NO temperature recorded today yet!
      ],
      visits: [],
    },

    // 5. Broken Streak Due To Missing Reading Yesterday
    {
      id: 'pat-5',
      mrn: 'CT-1005',
      name: 'Robert Chen',
      age: 36,
      gender: 'MALE',
      admissionDate: d4,
      diagnosis: 'Cellulitis Right Lower Extremity',
      bedNumber: 31,
      status: 'ACTIVE',
      temperatures: [
        { id: 't-5-3', patientId: 'pat-5', date: d3, temperatureC: 36.7, recordedAt: `${d3}T08:45:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-5-2', patientId: 'pat-5', date: d2, temperatureC: 36.6, recordedAt: `${d2}T08:50:00Z`, recordedBy: 'Nurse Sarah Connor' },
        // Missed d1 (yesterday)
        { id: 't-5-0', patientId: 'pat-5', date: d0, temperatureC: 36.8, recordedAt: `${d0}T08:10:00Z`, recordedBy: 'Nurse Sarah Connor' },
      ],
      visits: [
        { id: 'v-5-0', patientId: 'pat-5', date: d0, visitedAt: `${d0}T10:15:00Z`, visitedBy: 'Dr. Gregory House', notes: 'Erythema receding. Temperature log missed yesterday so discharge postponed until continuous afebrile proof established.' },
      ],
    },

    // 6. Newly Admitted Patient Today
    {
      id: 'pat-6',
      mrn: 'CT-1006',
      name: 'Sophia Kovacs',
      age: 19,
      gender: 'FEMALE',
      admissionDate: d0,
      diagnosis: 'Severe Gastroenteritis with Dehydration',
      bedNumber: 44,
      status: 'ACTIVE',
      temperatures: [], // Pending today's admission vitals
      visits: [],
    },

    // 7. Stable with 2 Consecutive Fever-Free Days (Needs 1 more day)
    {
      id: 'pat-7',
      mrn: 'CT-1007',
      name: 'David O\'Connor',
      age: 71,
      gender: 'MALE',
      admissionDate: d2,
      diagnosis: 'COPD Exacerbation',
      bedNumber: 52,
      status: 'ACTIVE',
      temperatures: [
        { id: 't-7-1', patientId: 'pat-7', date: d1, temperatureC: 36.9, recordedAt: `${d1}T09:20:00Z`, recordedBy: 'Nurse John Watson' },
        { id: 't-7-0', patientId: 'pat-7', date: d0, temperatureC: 37.0, recordedAt: `${d0}T08:20:00Z`, recordedBy: 'Nurse John Watson' },
      ],
      visits: [],
    },

    // 8. Historical Successfully Discharged Patient
    {
      id: 'pat-8',
      mrn: 'CT-1008',
      name: 'Margaret Thatcher',
      age: 80,
      gender: 'FEMALE',
      admissionDate: d5,
      diagnosis: 'Elective Knee Arthroplasty',
      bedNumber: 8,
      status: 'DISCHARGED',
      dischargeDate: d1,
      dischargeSummary: 'Physical therapy milestones achieved. Pain well controlled on oral medication.',
      dischargeRecommendedBy: 'Dr. Gregory House',
      dischargeApprovedBy: 'Admin Chief Jackson',
      dischargeApprovedAt: `${d1}T14:30:00Z`,
      temperatures: [
        { id: 't-8-4', patientId: 'pat-8', date: d4, temperatureC: 36.7, recordedAt: `${d4}T08:00:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-8-3', patientId: 'pat-8', date: d3, temperatureC: 36.8, recordedAt: `${d3}T08:00:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-8-2', patientId: 'pat-8', date: d2, temperatureC: 36.6, recordedAt: `${d2}T08:00:00Z`, recordedBy: 'Nurse Sarah Connor' },
        { id: 't-8-1', patientId: 'pat-8', date: d1, temperatureC: 36.6, recordedAt: `${d1}T08:00:00Z`, recordedBy: 'Nurse Sarah Connor' },
      ],
      visits: [
        { id: 'v-8-1', patientId: 'pat-8', date: d1, visitedAt: `${d1}T11:00:00Z`, visitedBy: 'Dr. Gregory House', notes: 'Discharge cleared.' },
      ],
    },

    // 9. Historical Deceased Patient (For Mortality calculation testing)
    {
      id: 'pat-9',
      mrn: 'CT-1009',
      name: 'Arthur Pendelton',
      age: 89,
      gender: 'MALE',
      admissionDate: d5,
      diagnosis: 'Severe Sepsis secondary to Aspiration Pneumonia',
      bedNumber: 70,
      status: 'DECEASED',
      deceasedDate: d2,
      deceasedReason: 'Multisystem organ failure refractory to vasopressor support.',
      deceasedMarkedBy: 'Admin Chief Jackson',
      temperatures: [
        { id: 't-9-3', patientId: 'pat-9', date: d3, temperatureC: 39.4, recordedAt: `${d3}T06:00:00Z`, recordedBy: 'Nurse John Watson' },
        { id: 't-9-2', patientId: 'pat-9', date: d2, temperatureC: 39.8, recordedAt: `${d2}T05:30:00Z`, recordedBy: 'Nurse John Watson' },
      ],
      visits: [
        { id: 'v-9-1', patientId: 'pat-9', date: d2, visitedAt: `${d2}T07:00:00Z`, visitedBy: 'Dr. Allison Cameron', notes: 'Critical condition. Comfort care measures initiated.' },
      ],
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: `${d5}T08:00:00Z`,
      actorRole: 'ADMIN',
      actorName: 'Admin Chief Jackson',
      action: 'PATIENT_ADMITTED',
      patientId: 'pat-1',
      patientName: 'Eleanor Vance',
      details: 'Admitted Eleanor Vance to Bed #12 (Diagnosis: Acute Bacterial Pneumonia)',
    },
    {
      id: 'log-2',
      timestamp: `${d0}T08:00:00Z`,
      actorRole: 'NURSE',
      actorName: 'Nurse Sarah Connor',
      action: 'TEMPERATURE_RECORDED',
      patientId: 'pat-1',
      patientName: 'Eleanor Vance',
      details: 'Recorded temperature: 36.6°C',
    },
    {
      id: 'log-3',
      timestamp: `${d0}T09:30:00Z`,
      actorRole: 'DOCTOR',
      actorName: 'Dr. Allison Cameron',
      action: 'DISCHARGE_RECOMMENDED',
      patientId: 'pat-2',
      patientName: 'James Montgomery',
      details: 'Recommended discharge following 4 days without fever.',
    },
    {
      id: 'log-4',
      timestamp: `${d1}T14:30:00Z`,
      actorRole: 'ADMIN',
      actorName: 'Admin Chief Jackson',
      action: 'DISCHARGE_FINALIZED',
      patientId: 'pat-8',
      patientName: 'Margaret Thatcher',
      details: 'Approved discharge and freed Bed #8.',
    },
    {
      id: 'log-5',
      timestamp: `${d2}T08:00:00Z`,
      actorRole: 'ADMIN',
      actorName: 'Admin Chief Jackson',
      action: 'PATIENT_DECEASED',
      patientId: 'pat-9',
      patientName: 'Arthur Pendelton',
      details: 'Recorded deceased status (Multisystem organ failure). Freed Bed #70.',
    },
  ];

  return { patients, auditLogs };
}

