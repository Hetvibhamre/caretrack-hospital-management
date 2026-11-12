import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { Patient, DischargeEligibilityResult } from '../types';

export const TOTAL_BED_CAPACITY = 74;
export const FEVER_THRESHOLD_C = 38.0; // >= 38.0°C is fever

/**
 * Returns formatted date string YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDateDisplay(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTimeDisplay(isoStr: string): string {
  try {
    return format(parseISO(isoStr), 'MMM dd, yyyy HH:mm');
  } catch {
    return isoStr;
  }
}

/**
 * STRICT 3-CONSECUTIVE CALENDAR DAYS DISCHARGE ELIGIBILITY EVALUATION
 *
 * Rules:
 * 1. Must evaluate calendar days strictly without fever (< 38.0°C).
 * 2. Every single day in the streak must have an explicit recorded temperature.
 * 3. Missing a day breaks the streak immediately (missing != fever-free).
 * 4. Must return exact qualifying dates and readings as evidence.
 * 5. Can evaluate either ending today (if today's temp is recorded and < 38°C)
 *    or ending yesterday (if the last 3 full days yesterday, 2 days ago, 3 days ago are all < 38°C).
 */
export function checkDischargeEligibility(patient: Patient, referenceDateStr: string = getTodayDateString()): DischargeEligibilityResult {
  if (patient.status === 'DISCHARGED' || patient.status === 'DECEASED') {
    return {
      isEligible: false,
      qualifyingDates: [],
      reason: `Patient is currently ${patient.status.toLowerCase()}.`,
      consecutiveDaysCount: 0,
    };
  }

  // Create a map of date string -> temperature record
  const tempMap = new Map<string, number>();
  patient.temperatures.forEach((t) => {
    tempMap.set(t.date, t.temperatureC);
  });

  const refDate = parseISO(referenceDateStr);

  // We can check two windows of 3 consecutive calendar days:
  // Option A: [Today, Yesterday, Day-2] (if today's reading is already recorded)
  // Option B: [Yesterday, Day-2, Day-3] (3 completed previous days)

  const checkWindow = (daysBackList: number[]) => {
    const datesInfo: { date: string; temperatureC: number }[] = [];
    for (const offset of daysBackList) {
      const d = subDays(refDate, offset);
      const dStr = format(d, 'yyyy-MM-dd');

      // Check if patient was even admitted on or before this day
      if (dStr < patient.admissionDate) {
        return null; // was not yet admitted
      }

      const temp = tempMap.get(dStr);
      if (temp === undefined) {
        return null; // Missing reading breaks streak
      }
      if (temp >= FEVER_THRESHOLD_C) {
        return null; // Fever breaks streak
      }
      datesInfo.push({ date: dStr, temperatureC: temp });
    }
    return datesInfo;
  };

  // First try Option A (including today if available)
  const windowA = checkWindow([0, 1, 2]);
  if (windowA) {
    return {
      isEligible: true,
      qualifyingDates: windowA.reverse(), // chronological order
      reason: '3 consecutive calendar days with recorded temperatures strictly below 38.0°C (including today).',
      consecutiveDaysCount: 3,
    };
  }

  // Next try Option B (completed yesterday, day before, and 3 days ago)
  const windowB = checkWindow([1, 2, 3]);
  if (windowB) {
    return {
      isEligible: true,
      qualifyingDates: windowB.reverse(), // chronological order
      reason: '3 complete consecutive calendar days with recorded temperatures strictly below 38.0°C (prior to today).',
      consecutiveDaysCount: 3,
    };
  }

  // If neither, calculate the current active streak backwards from reference date or yesterday
  let activeStreak = 0;
  // Check if today has a valid reading
  const todayTemp = tempMap.get(referenceDateStr);
  let startOffset = 1;
  if (todayTemp !== undefined && todayTemp < FEVER_THRESHOLD_C) {
    activeStreak = 1;
    startOffset = 1;
  } else if (todayTemp !== undefined && todayTemp >= FEVER_THRESHOLD_C) {
    return {
      isEligible: false,
      qualifyingDates: [],
      reason: `Patient has active fever today (${todayTemp}°C >= 38.0°C). Streak reset.`,
      consecutiveDaysCount: 0,
    };
  }

  for (let i = startOffset; i < 30; i++) {
    const d = subDays(refDate, i);
    const dStr = format(d, 'yyyy-MM-dd');
    if (dStr < patient.admissionDate) break;

    const t = tempMap.get(dStr);
    if (t !== undefined && t < FEVER_THRESHOLD_C) {
      activeStreak++;
    } else {
      break;
    }
  }

  let failureReason = `Patient only has ${activeStreak} consecutive fever-free calendar day(s). 3 required.`;
  if (todayTemp === undefined && activeStreak < 3) {
    failureReason += ` Note: Today's temperature has not yet been recorded.`;
  }

  return {
    isEligible: false,
    qualifyingDates: [],
    reason: failureReason,
    consecutiveDaysCount: activeStreak,
  };
}

/**
 * Calculates length of stay in hospital (1-based calendar days)
 */
export function calculateLengthOfStay(admissionDateStr: string, endDateStr?: string): number {
  try {
    const adm = parseISO(admissionDateStr);
    const end = endDateStr ? parseISO(endDateStr) : new Date();
    const diff = differenceInCalendarDays(end, adm);
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

