import React, { useEffect, useState } from 'react';
import { alertsApi } from '../api/client';
import { Alert } from '../types';
import { AlertBadge } from '../components/AlertBadge';
import { AlertTriangle, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsApi.list();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleUpdateStatus = async (alertId: number, status: Alert['status']) => {
    try {
      await alertsApi.updateStatus(alertId, status);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>ALERTS & ANOMALIES ENGINE</span>
          </h1>
          <p className="text-xs text-slate-400">Automated signal detection for suspicious criminal structures and transactions.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-3 text-xs">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Severity</th>
              <th className="p-4">Anomaly Signal</th>
              <th className="p-4">Description</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/40">
                <td className="p-4">
                  <AlertBadge severity={a.severity} />
                </td>
                <td className="p-4 font-bold text-cyan-400">{a.alert_type}</td>
                <td className="p-4 font-sans text-slate-200 text-xs leading-relaxed">{a.description}</td>
                <td className="p-4 font-bold text-amber-400">{(a.score * 100).toFixed(0)}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400 border border-slate-800">
                    {a.status}
                  </span>
                </td>
                <td className="p-4 space-x-2 font-sans">
                  {a.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(a.id, 'UNDER_REVIEW')}
                      className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 text-[10px] font-semibold"
                    >
                      Review
                    </button>
                  )}
                  {a.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(a.id, 'RESOLVED')}
                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 text-[10px] font-semibold"
                    >
                      Resolve
                    </button>
                  )}
                  {a.status !== 'DISMISSED' && (
                    <button
                      onClick={() => handleUpdateStatus(a.id, 'DISMISSED')}
                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 text-[10px] font-semibold"
                    >
                      Dismiss
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
