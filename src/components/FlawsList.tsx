import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Code2,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { SecurityFlaw, Severity } from '../types/scanner';

interface FlawsListProps {
  flaws: SecurityFlaw[];
}

export const FlawsList: React.FC<FlawsListProps> = ({ flaws }) => {
  const { t } = useLanguage();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(flaws[0]?.id || null);
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/40 border-orange-800/60';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'LOW':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const filteredFlaws = flaws.filter((flaw) => {
    if (filterSeverity !== 'ALL' && flaw.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        flaw.title.toLowerCase().includes(q) ||
        flaw.description.toLowerCase().includes(q) ||
        (flaw.owaspCategory && flaw.owaspCategory.toLowerCase().includes(q)) ||
        flaw.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCode = (flawId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(flawId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const severityCounts = {
    ALL: flaws.length,
    CRITICAL: flaws.filter((f) => f.severity === 'CRITICAL').length,
    HIGH: flaws.filter((f) => f.severity === 'HIGH').length,
    MEDIUM: flaws.filter((f) => f.severity === 'MEDIUM').length,
    LOW: flaws.filter((f) => f.severity === 'LOW').length,
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
            const isActive = filterSeverity === sev;
            const count = severityCounts[sev];
            const label = sev === 'ALL' ? t.allSeverities : sev;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{label}</span>
                <span className="ml-1.5 text-[11px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.filterPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Flaws List */}
      {filteredFlaws.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800/60 p-6">
          <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-slate-200">{t.noFlawsFound}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'All checks for this category passed without vulnerabilities.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFlaws.map((flaw) => {
            const isExpanded = expandedId === flaw.id;
            const currentTab = activeCodeTab[flaw.id] || (flaw.remediationCode?.nginx ? 'nginx' : flaw.remediationCode?.apache ? 'apache' : 'express');

            return (
              <div
                key={flaw.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700/80"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : flaw.id)}
                  className="w-full p-4 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadgeClass(
                          flaw.severity
                        )}`}
                      >
                        {flaw.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {t.cvssScoreLabel} {flaw.cvssScore.toFixed(1)}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400 font-mono truncate">
                        {flaw.category}
                      </span>
                      {flaw.owaspCategory && (
                        <>
                          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
                          <span className="text-xs text-cyan-400/90 font-mono hidden sm:inline">
                            {flaw.owaspCategory}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight">
                      {flaw.title}
                    </h3>
                  </div>

                  <div className="text-slate-400 shrink-0 mt-1 sm:mt-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800/80 bg-slate-950/40 text-xs sm:text-sm">
                    {/* Description */}
                    <div>
                      <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-400 mb-1">
                        {t.techVulnerabilityAnalysis}
                      </h4>
                      <p className="text-slate-300 leading-relaxed">{flaw.description}</p>
                    </div>

                    {/* Impact */}
                    <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg">
                      <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-rose-300 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t.exploitationImpact}</span>
                      </h4>
                      <p className="text-rose-200/90 leading-relaxed text-xs">{flaw.impact}</p>
                    </div>

                    {/* Evidence */}
                    {flaw.evidence && (
                      <div>
                        <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-400 mb-1">
                          {t.evidenceFinding}
                        </h4>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-amber-300/90 break-all select-all">
                          {flaw.evidence}
                        </div>
                      </div>
                    )}

                    {/* Remediation Guide */}
                    <div>
                      <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-400 mb-1">
                        {t.recommendedRemediation}
                      </h4>
                      <p className="text-slate-300 leading-relaxed mb-3">{flaw.remediation}</p>

                      {/* Remediation Code Snippets */}
                      {flaw.remediationCode && Object.keys(flaw.remediationCode).length > 0 && (
                        <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3 py-1.5">
                            <div className="flex items-center gap-1 text-xs font-mono">
                              <Code2 className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                              {(['nginx', 'apache', 'express', 'cloudflare'] as const).map((k) => {
                                const codeVal = flaw.remediationCode?.[k];
                                if (!codeVal) return null;
                                const isTabActive = currentTab === k;
                                return (
                                  <button
                                    key={k}
                                    onClick={() =>
                                      setActiveCodeTab((prev) => ({ ...prev, [flaw.id]: k }))
                                    }
                                    className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors cursor-pointer ${
                                      isTabActive
                                        ? 'bg-slate-800 text-cyan-300 font-bold'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    {k}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => {
                                const code =
                                  flaw.remediationCode?.[currentTab as keyof typeof flaw.remediationCode] ||
                                  flaw.remediationCode?.nginx ||
                                  '';
                                handleCopyCode(flaw.id, code);
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer transition-colors"
                            >
                              {copiedKey === flaw.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">{t.copied}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{t.copySnippet}</span>
                                </>
                              )}
                            </button>
                          </div>

                          <pre className="p-3 text-xs font-mono text-cyan-200/90 overflow-x-auto bg-slate-950">
                            <code>
                              {flaw.remediationCode[currentTab as keyof typeof flaw.remediationCode] ||
                                flaw.remediationCode.nginx ||
                                flaw.remediationCode.apache ||
                                flaw.remediationCode.express}
                            </code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
