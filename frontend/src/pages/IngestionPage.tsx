import React, { useState, useEffect } from 'react';
import { dataImportApi, investigationsApi } from '../api/client';
import { Investigation } from '../types';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const IngestionPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<number | undefined>();
  const [importType, setImportType] = useState<string>('TEXT_DOCUMENT');
  const [docTitle, setDocTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    investigationsApi.list().then(invs => {
      setInvestigations(invs);
      if (invs.length > 0) setSelectedInvId(invs[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('investigation_id', String(selectedInvId));
    formData.append('import_type', importType);
    if (docTitle) formData.append('title', docTitle);
    if (textContent) formData.append('content', textContent);
    if (file) formData.append('file', file);

    try {
      const res = await dataImportApi.importData(formData);
      setResult(res);
      setTextContent('');
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process data import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          <span>DATA INGESTION PIPELINE</span>
        </h1>
        <p className="text-xs text-slate-400">Import structured CSV logs (CDR, Financial, Location) or raw intelligence documents for automated NLP entity extraction.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Case File</label>
              <select
                value={selectedInvId || ''}
                onChange={(e) => setSelectedInvId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {investigations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.case_number} - {inv.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Import Format & Type</label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="TEXT_DOCUMENT">Unstructured Intelligence Report (NLP Extraction)</option>
                <option value="CSV_CDR">CSV: Call Detail Records (CDR)</option>
                <option value="CSV_FINANCIAL">CSV: Financial Transactions</option>
                <option value="CSV_LOCATION">CSV: Location Events</option>
              </select>
            </div>
          </div>

          {importType === 'TEXT_DOCUMENT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Intercept Summary 2026-08"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Text Content / Data Body</label>
            <textarea
              rows={6}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={importType === 'TEXT_DOCUMENT' ? "Paste police report text here..." : "caller,receiver,timestamp,duration\n+15550192,+15550843,2026-08-20T10:00:00Z,120"}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Or Upload File (.txt / .csv)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>{loading ? 'PROCESSING INGESTION & GRAPH SYNC...' : 'PROCESS INGESTION PIPELINE'}</span>
          </button>
        </form>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ingestion Complete & Network Synchronized!</span>
            </div>
            <div className="font-mono text-xs text-slate-300 space-y-1 pt-2 border-t border-emerald-500/20">
              <p>Total Records Processed: {result.total_records}</p>
              <p>Successful: {result.successful_records}</p>
              <p>Entities Created/Matched: {result.entities_created}</p>
              <p>Relationships Created: {result.relationships_created}</p>
              <p>Pipeline Elapsed Time: {result.processing_time_seconds}s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
