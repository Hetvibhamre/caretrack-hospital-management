import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { getTodayDateString, checkDischargeEligibility } from '../utils/businessRules';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';

export const DailyOperationsPage: React.FC = () => {
  const { activePatients } = useHospital();
  const todayStr = getTodayDateString();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING_NURSE' | 'PENDING_DOCTOR' | 'FEVER' | 'ELIGIBLE'>('ALL');

  const filteredPatients = activePatients.filter((p) => {
    const todayTemp = p.temperatures.find((t) => t.date === todayStr);
    const todayVisit = p.visits.find((v) => v.date === todayStr);
    const isFever = todayTemp && todayTemp.temperatureC >= 38.0;
    const elig = checkDischargeEligibility(p);

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bedNumber.toString().includes(searchTerm) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'PENDING_NURSE') return !todayTemp;
    if (filterType === 'PENDING_DOCTOR') return !todayVisit;
    if (filterType === 'FEVER') return isFever;
    if (filterType === 'ELIGIBLE') return elig.isEligible;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Hospital Operations Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
              Shift Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Independent tracking of Nurse temperature tasks and Doctor clinical rounds across all active ward beds for {todayStr}.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono">
          Target Date: <strong>{todayStr}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient, bed, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {(
            [
              { key: 'ALL', label: 'All Inpatients' },
              { key: 'PENDING_NURSE', label: 'Pending Nurse Temp' },
              { key: 'PENDING_DOCTOR', label: 'Pending Doctor Round' },
              { key: 'FEVER', label: 'Active Fevers' },
              { key: 'ELIGIBLE', label: 'Discharge Eligible' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterType(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === item.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operations Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3.5">Bed / Patient</th>
                <th className="px-6 py-3.5">Nurse Temp Status (Today)</th>
                <th className="px-6 py-3.5">Doctor Round Status (Today)</th>
                <th className="px-6 py-3.5">Fever Streak & 3-Day Rule</th>
                <th className="px-6 py-3.5">Overall Shift State</th>
                <th className="px-6 py-3.5 text-right">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs">
                    No active inpatients matched the selected operations filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const todayTemp = p.temperatures.find((t) => t.date === todayStr);
                  const todayVisit = p.visits.find((v) => v.date === todayStr);
                  const isFever = todayTemp && todayTemp.temperatureC >= 38.0;
                  const elig = checkDischargeEligibility(p);

                  // Operational State
                  const isBothDone = todayTemp && todayVisit;
                  const isNeitherDone = !todayTemp && !todayVisit;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Bed & Patient */}
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

                      {/* Nurse Temperature Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {todayTemp ? (
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                                isFever
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {todayTemp.temperatureC}°C
                              {isFever && <AlertTriangle className="w-3 h-3 ml-1 text-rose-600" />}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">By {todayTemp.recordedBy}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 mr-1 text-amber-500" />
                            Pending Nurse
                          </span>
                        )}
                      </td>

                      {/* Doctor Round Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {todayVisit ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Completed
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">By {todayVisit.visitedBy}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 mr-1 text-amber-500" />
                            Pending Doctor
                          </span>
                        )}
                      </td>

                      {/* 3-Day Rule & Fever Streak */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {elig.isEligible ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center w-fit">
                            <Sparkles className="w-3 h-3 mr-1" />
                            3 Days Clear
                          </span>
                        ) : (
                          <div>
                            <span className="text-slate-700 font-medium">
                              {elig.consecutiveDaysCount} / 3 days afebrile
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate">
                              {elig.reason}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Shift State Summary */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isBothDone ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Shift Complete
                          </span>
                        ) : isNeitherDone ? (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Both Pending
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                            Partial (1 of 2 Done)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/patient/${p.id}`}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center"
                        >
                          Open <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

