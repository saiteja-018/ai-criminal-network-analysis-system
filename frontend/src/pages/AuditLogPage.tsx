import React, { useEffect, useState } from 'react';
import { auditLogsApi } from '../api/client';
import { AuditLog } from '../types';
import { ShieldCheck, Lock, User, FileText } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogsApi.list().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>SECURITY & AUDIT TRAILS</span>
        </h1>
        <p className="text-xs text-slate-400">Immutable audit log of all system actions, data exports, queries, and administrative events for judicial compliance.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Officer / User</th>
              <th className="p-4">Action Performed</th>
              <th className="p-4">Resource</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/40">
                <td className="p-4 text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="p-4 font-bold text-cyan-400">{l.user_display}</td>
                <td className="p-4 font-bold text-slate-200">{l.action}</td>
                <td className="p-4 text-slate-300">{l.resource_type} #{l.resource_id}</td>
                <td className="p-4 text-slate-500">{l.ip_address || '127.0.0.1'}</td>
                <td className="p-4 font-sans text-slate-400 text-[10px]">
                  {JSON.stringify(l.metadata)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
