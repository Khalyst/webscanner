import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { HeaderCheckResult } from '../../types/scanner';

interface HeadersAuditProps {
  headersAudit: HeaderCheckResult[];
}

export const HeadersAudit: React.FC<HeadersAuditProps> = ({ headersAudit }) => {
  const { t } = useLanguage();
  const passCount = headersAudit.filter((h) => h.status === 'PASS').length;
  const warnCount = headersAudit.filter((h) => h.status === 'WARN').length;
  const failCount = headersAudit.filter((h) => h.status === 'FAIL').length;

  return (
    <div className="space-y-4">
      {/* Overview Stat Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            {t.headersMatrixTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.headersMatrixDesc}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{passCount} PASS</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{warnCount} WARN</span>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-800/40">
            <XCircle className="w-3.5 h-3.5" />
            <span>{failCount} FAIL</span>
          </span>
        </div>
      </div>

      {/* Headers Table / Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {headersAudit.map((header) => {
            let statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            let statusBg = 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
            if (header.status === 'WARN') {
              statusIcon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
              statusBg = 'text-amber-400 bg-amber-950/20 border-amber-900/30';
            } else if (header.status === 'FAIL') {
              statusIcon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
              statusBg = 'text-rose-400 bg-rose-950/20 border-rose-900/30';
            }

            return (
              <div key={header.header} className="p-4 hover:bg-slate-900/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcon}
                    <span className="font-mono font-bold text-sm text-slate-100">
                      {header.header}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded border ${statusBg}`}>
                      {header.status}
                    </span>
                    <span className="text-slate-500">[{header.severity}]</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {header.description}
                </p>

                {header.present && header.value && (
                  <div className="mb-2">
                    <div className="text-[11px] font-mono text-slate-500 mb-0.5">{t.foundValue}:</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-xs text-cyan-300 break-all select-all">
                      {header.value}
                    </div>
                  </div>
                )}

                <div className="text-xs bg-slate-950/40 p-2 rounded border border-slate-800/50 flex items-start gap-1.5 text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-cyan-400 font-medium">{t.recommendationLabel}:</strong>{' '}
                    {header.recommendation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
