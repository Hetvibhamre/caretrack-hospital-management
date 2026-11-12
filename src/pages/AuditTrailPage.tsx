import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { formatDateTimeDisplay } from '../utils/businessRules';
import { ClipboardList, Filter, Search, UserCheck, Shield, Clock } from 'lucide-react';
import { UserRole } from '../types';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.patientName && log.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('ADMIT')) {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    if (action.includes('TEMP')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('RECOMMEND')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (action.includes('FINALIZED') || action.includes('DISCHARGE')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('DECEASED')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'DOCTOR':
        return 'bg-emerald-100 text-emerald-800';
      case 'NURSE':
        return 'bg-sky-100 text-sky-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical & Administrative Audit Log</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
              HIPAA Compliance Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of patient admissions, vital recordings, physician round notes, discharge recommendations, and outcome verifications.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono">
          Total Recorded Actions: <strong>{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search action, actor, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['ALL', 'ADMIN', 'DOCTOR', 'NURSE'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Patient Reference</th>
                <th className="px-6 py-3.5">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {formatDateTimeDisplay(log.timestamp)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${getRoleBadge(log.actorRole)}`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                      {log.patientName ? (
                        <span className="font-medium text-slate-800">{log.patientName}</span>
                      ) : (
                        <span className="text-slate-400 italic">System / General</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

