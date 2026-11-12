# CareTrack – Hospital Patient Management System (PMS)

CareTrack is an inpatient hospital management web application engineered with React, TypeScript, and Tailwind CSS. It coordinates clinical workflows across Administrators, Nurses, and Attending Physicians with role-based governance, bed capacity enforcement, and strict multi-day afebrile discharge verification.

---

## 🚀 Live Demo & Deployment

- **Live Production URL:** [https://caretrack-hospital-management-theta.vercel.app](https://caretrack-hospital-management-theta.vercel.app)
- **GitHub Repository:** [https://github.com/Hetvibhamre/caretrack-hospital-management](https://github.com/Hetvibhamre/caretrack-hospital-management)
- **Local Dev Server:** `npm run dev` (defaults to [http://localhost:5173/](http://localhost:5173/))

### Running Locally
```bash
# 1. Clone the repository / open project directory
cd FactWise

# 2. Install dependencies
npm install

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview -- --port 4173
```

---

## 🏛️ Clean Architecture

CareTrack follows a layered modular architecture:
```
src/
├── types/                # Core domain interfaces (Patient, TemperatureRecord, AuditLog, Roles)
├── utils/                # Pure business logic functions
│   └── businessRules.ts  # Strict 3-day afebrile algorithm, LOS calculation, Bed limits
├── context/              # Central State Management & Persistence Layer
│   └── HospitalContext.tsx # In-browser localStorage sync, RBAC action dispatchers, KPIs
├── data/                 # Deterministic synthetic seed data (9 realistic clinical cases)
│   └── seedData.ts
├── components/           # Reusable UI & Layout components
│   └── Navbar.tsx        # Responsive navigation, bed counter, quick role switcher
├── pages/                # Role dashboards and dedicated views
│   ├── LoginPage.tsx              # Interactive role selection & authentication explanation
│   ├── DailyOperationsPage.tsx    # Shift operations matrix (Nurse & Doctor status tracking)
│   ├── AdminDashboard.tsx         # Ward KPIs, Bed capacity (74 limit), Mortality benchmark
│   ├── PatientRegistrationPage.tsx# Inpatient admission form with bed conflict checks
│   ├── PatientListPage.tsx        # Searchable master patient directory
│   ├── NurseDashboard.tsx         # Pending shift temperatures & single-entry lock
│   ├── DoctorDashboard.tsx        # Clinical rounds, temp validation, discharge clearance
│   ├── DischargeQueuePage.tsx     # Admin discharge authorization queue
│   ├── PatientDetailPage.tsx      # Comprehensive inpatient chart, vitals timeline, notes
│   └── AuditTrailPage.tsx         # HIPAA compliance activity logging
└── main.tsx              # Application entry point
```

---

## 👥 Role-Based Access Control (RBAC)

The system supports three user roles with strict separation of duties:

| Capability | Admin (Hospital Admin) | Nurse (RN) | Doctor (Attending MD) |
|---|:---:|:---:|:---:|
| **Patient Admission** | ✅ Yes (Max 74 Beds) | ❌ Restricted | ❌ Restricted |
| **Record Body Temperature** | ❌ Restricted | ✅ Yes (1 per day) | ❌ Restricted |
| **View Doctor Notes** | ✅ Yes | ❌ Confidential | ✅ Yes |
| **Write Daily Round Notes** | ❌ Restricted | ❌ Restricted | ✅ Yes |
| **Recommend Discharge** | ❌ Restricted | ❌ Restricted | ✅ Yes (If 3-Day Rule Met) |
| **Finalize Discharge & Release Bed** | ✅ Yes | ❌ Restricted | ❌ Restricted |
| **Record Patient Outcome (Deceased)** | ✅ Yes | ❌ Restricted | ❌ Restricted |
| **Monitor Mortality & Ward KPIs** | ✅ Yes | ❌ Restricted | ❌ Restricted |

---

## 🩺 Business Rules & Clinical Logic

### 1. Strict 3-Consecutive Calendar Day Afebrile Rule
- **Fever Threshold:** Temperature $\ge 38.0^\circ\text{C}$ ($100.4^\circ\text{F}$) constitutes an active fever.
- **Consecutive Days:** A patient is discharge-eligible only if they have recorded body temperatures **strictly below $38.0^\circ\text{C}$** for **three complete consecutive calendar days**.
- **Missing Reading Penalty:** Missing a day immediately breaks the streak (a missing reading $\neq$ fever-free).
- **Exact Date Evidence:** The system evaluates calendar dates and presents the exact three qualifying dates and temperatures as evidence on the clinical chart.

### 2. One Temperature Entry Per Day
- After nursing staff records a patient's temperature for a given calendar date, further entries for that calendar date are disabled and locked to prevent duplicate or conflicting records.

### 3. Doctor Verification & Vitals Prerequisite
- Attending Physicians are shown clear visual indicators (green = normal, red = fever $\ge 38.0^\circ\text{C}$, amber = missing) before filing round notes.
- If today's temperature has not yet been recorded by a nurse, the doctor must provide a clinical justification to proceed.

### 4. Bed Capacity Limit (74 Beds)
- Hospital ward bed capacity is strictly capped at **74 beds**.
- Attempting to admit a patient when 74 beds are occupied generates an explicit capacity error.
- Only finalizing a discharge or recording a deceased outcome releases an occupied bed.

### 5. Mortality & Success Rate KPI Benchmark
- **Mortality Rate:** $\frac{\text{Deceased Inpatients}}{\text{Total Historical Admissions}} \times 100\%$
- **Benchmark:** The Admin dashboard provides visual alerts with a status badge whenever the hospital mortality rate exceeds the **15% threshold**.

---

## 🗄️ Synthetic Demo Patients

CareTrack initializes on first load with 9 synthetic inpatient records demonstrating all critical operational scenarios:

1. **Eleanor Vance (Bed #12):** Acute bacterial pneumonia; meets 3 consecutive calendar days without fever ($37.1^\circ\text{C}, 36.8^\circ\text{C}, 36.7^\circ\text{C}$). Ready for Doctor discharge recommendation.
2. **James Montgomery (Bed #15):** Post-op appendectomy; already recommended for discharge by physician. Waiting in Admin queue for final confirmation.
3. **Carlos Mendoza (Bed #22):** Complicated pyelonephritis; active fever ($38.8^\circ\text{C}$) today. Triggers red fever alert; discharge recommendation locked.
4. **Amina Al-Mansoor (Bed #5):** Congestive heart failure; missing today's temperature reading. Shows in Nurse pending queue and warns Doctor during rounds.
5. **Robert Chen (Bed #31):** Cellulitis; missed temperature reading yesterday, resetting the 3-day consecutive afebrile streak.
6. **Sophia Kovacs (Bed #44):** Newly admitted today with dehydration; baseline vitals pending.
7. **David O'Connor (Bed #52):** COPD exacerbation; 2 consecutive fever-free days, requires 1 more day to qualify for discharge.
8. **Margaret Thatcher (Historical):** Successfully discharged knee replacement patient (Bed #8 released).
9. **Arthur Pendelton (Historical):** Deceased patient (Bed #70 released), included for mortality rate benchmarking.

*(Click "Reset Demo Data" in the top bar anytime to restore this dataset).*

---

## 🔒 Security & Limitations Notice

- **Demonstration Authentication:** Role selection in this application is simulated for demonstration and assessment purposes. In a production hospital environment, this must be integrated with an enterprise identity provider (OAuth2/OIDC, SAML, active directory, smart card badge readers) and backend token validation.
- **Client-Side Persistence:** Patient data is cached in in-browser `localStorage`. Data persists across page reloads within the same browser instance, but is not synchronized across distinct client machines without a central API server.
