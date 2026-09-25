import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  FileDown,
  Layers,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { ScanResult } from '../../types/scanner';

interface AiExecutiveReportProps {
  scan: ScanResult;
  onExportPdf: () => void;
}

export const AiExecutiveReport: React.FC<AiExecutiveReportProps> = ({ scan, onExportPdf }) => {
  const { t } = useLanguage();
  const ai = scan.aiAnalysis;

  if (!ai) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800">
        <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">Executive Report Not Available</h3>
        <p className="text-xs text-slate-500 mt-1">
          Enable the "AI Executive Analysis" option when launching a scan to generate this briefing.
        </p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-rose-400 border-rose-900/50 bg-rose-950/30';
      case 'HIGH':
        return 'text-orange-400 border-orange-900/50 bg-orange-950/30';
      case 'MEDIUM':
        return 'text-amber-400 border-amber-900/50 bg-amber-950/30';
      default:
        return 'text-blue-400 border-blue-900/50 bg-blue-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Executive Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {t.cisoReportTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.cisoReportDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{t.exportPdf}</span>
          </button>
        </div>

        <div className="pt-4 space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            {t.executiveSummaryHeading}
          </h4>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {ai.executiveSummary}
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {t.attackSurfaceHeading}
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {ai.attackSurfaceOverview}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Threat & Exploitation Vectors */}
      {ai.topThreatVectors && ai.topThreatVectors.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {t.threatPathwaysHeading}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {ai.topThreatVectors.map((vector, index) => (
              <div
                key={index}
                className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>VECTOR #{index + 1}</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{vector}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Prioritized Step-by-Step Remediation Roadmap */}
      {ai.remediationRoadmap && ai.remediationRoadmap.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                {t.remediationRoadmapHeading}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Sequential Playbook</span>
          </div>

          <div className="space-y-2.5">
            {ai.remediationRoadmap.map((item) => (
              <div
                key={item.step}
                className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-cyan-300 shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                      {item.action}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {t.estimatedEffortLabel}: {item.estimatedEffort}
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border ${getPriorityColor(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Compliance Alignment Overview */}
      {ai.complianceNotes && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {t.complianceReadinessHeading}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-mono font-bold text-slate-200 block">OWASP Top 10 (2021)</span>
              <p className="text-slate-400 leading-relaxed">{ai.complianceNotes.owaspTop10}</p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-mono font-bold text-slate-200 block">PCI-DSS Requirement 4 & 6</span>
              <p className="text-slate-400 leading-relaxed">{ai.complianceNotes.pciDss}</p>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
              <span className="font-mono font-bold text-slate-200 block">ISO/IEC 27001 Annex A.8</span>
              <p className="text-slate-400 leading-relaxed">{ai.complianceNotes.iso27001}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
