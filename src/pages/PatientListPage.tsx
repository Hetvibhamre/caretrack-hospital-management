import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext';
import { PatientStatus } from '../types';
import { Search, Filter, BedDouble, AlertTriangle, ArrowUpDown, ChevronRight, Activity } from 'lucide-react';
import { calculateLengthOfStay, getTodayDateString } from '../utils/businessRules';

export const PatientListPage: React.FC = () => {
  const { patients } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PatientStatus>('ALL');
  const todayStr = getTodayDateString();

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bedNumber.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            Active Inpatient
          </span>
        );
      case 'DISCHARGE_RECOMMENDED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            Discharge Pending
          </span>
        );
      case 'DISCHARGED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Discharged
          </span>
        );
      case 'DECEASED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Deceased
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete census archive containing active inpatients, pending recommendations, discharges, and outcomes.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono">
          Total Records: <strong>{patients.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, MRN, bed, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {(['ALL', 'ACTIVE', 'DISCHARGE_RECOMMENDED', 'DISCHARGED', 'DECEASED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'DISCHARGE_RECOMMENDED'
                ? 'Discharge Pending'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Bed / Location</th>
                <th className="px-6 py-3.5">Stay Length</th>
                <th className="px-6 py-3.5">Today&apos;s Temp</th>
                <th className="px-6 py-3.5">Today&apos;s Visit</th>
                <th className="px-6 py-3.5">Current Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No patient records matched the specified filter or query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const todayTemp = p.temperatures.find((t) => t.date === todayStr);
                  const latestTemp = p.temperatures[0];
                  const todayVisit = p.visits.find((v) => v.date === todayStr);
                  const los = calculateLengthOfStay(p.admissionDate, p.dischargeDate || p.deceasedDate);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & MRN */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/patient/${p.id}`} className="font-bold text-slate-900 hover:text-sky-600">
                          {p.name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
                          <span>{p.mrn}</span>
                          <span>•</span>
                          <span>{p.age}y / {p.gender.charAt(0)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-xs truncate mt-0.5">
                          {p.diagnosis}
                        </div>
                      </td>

                      {/* Bed */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {p.status === 'ACTIVE' || p.status === 'DISCHARGE_RECOMMENDED' ? (
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                            Bed #{p.bedNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Released (Was #{p.bedNumber})
                          </span>
                        )}
                      </td>

                      {/* Stay Length */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                        <strong>Day {los}</strong>
                        <div className="text-[11px] text-slate-400">Since {p.admissionDate}</div>
                      </td>

                      {/* Today's Temp */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {todayTemp ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              todayTemp.temperatureC >= 38.0
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {todayTemp.temperatureC}°C
                            {todayTemp.temperatureC >= 38.0 && <AlertTriangle className="w-3 h-3 ml-1 text-rose-600" />}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">
                            {p.status === 'ACTIVE' || p.status === 'DISCHARGE_RECOMMENDED' ? 'Not recorded' : '—'}
                          </span>
                        )}
                      </td>

                      {/* Today's Visit */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {todayVisit ? (
                          <span className="text-emerald-700 font-semibold flex items-center">
                            Completed
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {p.status === 'ACTIVE' || p.status === 'DISCHARGE_RECOMMENDED' ? 'Pending' : '—'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/patient/${p.id}`}
                          className="inline-flex items-center text-xs font-semibold text-sky-600 hover:text-sky-800"
                        >
                          View Chart <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
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

