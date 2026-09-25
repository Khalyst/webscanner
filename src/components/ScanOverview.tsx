import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
  Unlock,
  FileDown,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { ScanResult } from '../types/scanner';

interface ScanOverviewProps {
  scan: ScanResult;
  onExportPdf: () => void;
  onSelectTab: (tab: string) => void;
}

export const ScanOverview: React.FC<ScanOverviewProps> = ({ scan, onExportPdf, onSelectTab }) => {
  const { t } = useLanguage();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
      case 'B':
        return 'text-teal-400 border-teal-500/40 bg-teal-950/20';
      case 'C':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
      case 'D':
        return 'text-orange-400 border-orange-500/40 bg-orange-950/20';
      default:
        return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
      {/* Top row: Target & Primary score lockup */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{t.targetAudit}</span>
            <span aria-hidden="true">·</span>
            <span>ID: {scan.id}</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(scan.scanTimestamp).toLocaleTimeString()}</span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              {scan.hostname}
            </h2>
            <a
              href={scan.finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono hover:underline"
            >
              <span>{scan.finalUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Quick metadata line */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>IP: {scan.ip || 'Unresolved'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums">{scan.responseTimeMs}ms latency</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              {scan.httpsRedirects ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.strictHttps}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400">{t.httpNotRedirected}</span>
                </>
              )}
            </span>
            {scan.sslInfo && (
              <>
                <span aria-hidden="true">·</span>
                <span>TLS: {scan.sslInfo.protocol}</span>
              </>
            )}
          </div>
        </div>

        {/* Score & Grade Display */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">{t.securityScore}</div>
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums ${getScoreColor(scan.overallScore)}`}>
              {scan.overallScore}
              <span className="text-xs font-normal text-slate-500 ml-1">/100</span>
            </div>
          </div>

          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center font-mono font-black ${getGradeColor(
              scan.securityGrade
            )}`}
          >
            <span className="text-[10px] text-slate-400 font-medium">{t.grade}</span>
            <span className="text-xl sm:text-2xl leading-none">{scan.securityGrade}</span>
          </div>
        </div>
      </div>

      {/* Second row: Findings counts & Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
        <button
          onClick={() => onSelectTab('flaws')}
          className="text-left p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-rose-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{t.criticalRisk}</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums group-hover:scale-105 transition-transform origin-left">
            {scan.flawsCount.critical}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('flaws')}
          className="text-left p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-orange-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{t.highRisk}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-xl font-bold font-mono text-orange-400 mt-1 tabular-nums group-hover:scale-105 transition-transform origin-left">
            {scan.flawsCount.high}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('flaws')}
          className="text-left p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-amber-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{t.mediumRisk}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums group-hover:scale-105 transition-transform origin-left">
            {scan.flawsCount.medium}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('flaws')}
          className="text-left p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-blue-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{t.lowRisk}</span>
            <span className="text-xs text-blue-400 font-mono">·</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1 tabular-nums group-hover:scale-105 transition-transform origin-left">
            {scan.flawsCount.low}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('headers')}
          className="text-left p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-emerald-500/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{t.passedChecks}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums group-hover:scale-105 transition-transform origin-left">
            {scan.passedChecksCount}
          </div>
        </button>

        <div className="flex items-center gap-2 col-span-2 sm:col-span-1 lg:col-span-1">
          <button
            onClick={onExportPdf}
            className="w-full h-full min-h-[58px] px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
