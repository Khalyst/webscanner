import React, { useState } from 'react';
import {
  History,
  X,
  Search,
  ExternalLink,
  RotateCcw,
  Trash2,
  Download,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { HistoryScanEntry } from '../utils/scanHistory';
import {
  exportHistoryToJson,
  exportHistoryToCsv,
} from '../utils/scanHistory';
import type { ScanResult } from '../types/scanner';

interface RecentScansModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryScanEntry[];
  onSelectScan: (scan: ScanResult) => void;
  onRescan: (url: string) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
}

export const RecentScansModal: React.FC<RecentScansModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectScan,
  onRescan,
  onDeleteEntry,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filtered = history.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.hostname.toLowerCase().includes(q) ||
      entry.url.toLowerCase().includes(q) ||
      entry.securityGrade.toLowerCase().includes(q)
    );
  });

  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((acc, h) => acc + h.overallScore, 0) / history.length)
      : 0;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
      case 'B':
        return 'text-teal-400 border-teal-500/40 bg-teal-950/30';
      case 'C':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
      case 'D':
        return 'text-orange-400 border-orange-500/40 bg-orange-950/30';
      default:
        return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">Recent Audits History</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {history.length} saved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Instantly revisit or re-run past vulnerability assessments (stored locally in browser)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Actions Bar */}
        {history.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400 font-mono">
              <span>
                Avg Score:{' '}
                <strong className={`font-semibold ${getScoreColor(avgScore)}`}>
                  {avgScore}/100
                </strong>
              </span>
              <span>·</span>
              <span>
                Tracked Targets: <strong className="text-white font-semibold">{history.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportHistoryToJson(history)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                title="Download history as JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => exportHistoryToCsv(history)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                title="Download history as CSV"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>CSV</span>
              </button>
              {confirmClear ? (
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="text-[11px] text-rose-400 font-mono">Clear all?</span>
                  <button
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 transition-colors flex items-center gap-1 font-mono text-[11px] cursor-pointer ml-1"
                  title="Clear all stored history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search Filter */}
        {history.length > 0 && (
          <div className="p-3 border-b border-slate-800/60 bg-slate-950/30">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by hostname, URL or grade (e.g. github.com, A+)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-800/40">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white font-mono">No Audit History Recorded</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Whenever you audit a website or load a sample audit, results are safely cached here for instant 1-click recall.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono">
              No previous scans match "{searchQuery}"
            </div>
          ) : (
            filtered.map((entry) => (
              <div
                key={entry.id}
                className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                {/* Left info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Grade Badge */}
                  <div
                    className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center font-mono font-black shrink-0 ${getGradeColor(
                      entry.securityGrade
                    )}`}
                  >
                    <span className="text-[9px] uppercase tracking-tighter opacity-70">Grade</span>
                    <span className="text-base leading-none">{entry.securityGrade}</span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white font-mono truncate">
                        {entry.hostname}
                      </span>
                      <span className={`text-xs font-mono font-bold ${getScoreColor(entry.overallScore)}`}>
                        {entry.overallScore}/100
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(entry.scanTimestamp).toLocaleDateString()} ·{' '}
                        {new Date(entry.scanTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
                      <span className="text-rose-400 text-[11px]">
                        {entry.flawsCount.critical} Crit
                      </span>
                      <span>·</span>
                      <span className="text-orange-400 text-[11px]">
                        {entry.flawsCount.high} High
                      </span>
                      <span>·</span>
                      <span className="text-amber-400 text-[11px]">
                        {entry.flawsCount.medium} Med
                      </span>
                      {entry.subdomainsCount !== undefined && entry.subdomainsCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-purple-300 text-[11px]">
                            {entry.subdomainsCount} Subs
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span className="text-slate-500 text-[11px]">{entry.responseTimeMs}ms</span>
                    </div>
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => {
                      onSelectScan(entry.scanResult);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Load this scan into dashboard immediately"
                  >
                    <span>View Audit</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => {
                      onRescan(entry.url);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    title="Run fresh live scan"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Tip: Press `H` anywhere to open History</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
