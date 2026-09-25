import React from 'react';
import {
  Layers,
  Radio,
  FileCode,
  AlertTriangle,
  FileText,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { TechStackItem, PortCheck, SensitiveEndpointCheck, ScanResult } from '../../types/scanner';

interface TechPortsAuditProps {
  techStack: TechStackItem[];
  ports: PortCheck[];
  sensitiveEndpoints: SensitiveEndpointCheck[];
  robotsTxt?: ScanResult['robotsTxt'];
  securityTxt?: ScanResult['securityTxt'];
}

export const TechPortsAudit: React.FC<TechPortsAuditProps> = ({
  techStack,
  ports,
  sensitiveEndpoints,
  robotsTxt,
  securityTxt,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* 1. Technology Stack Fingerprint & CVEs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.techFingerprintTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.techFingerprintDesc}
              </p>
            </div>
          </div>
        </div>

        {techStack.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono">
            No distinctive third-party frameworks or CMS signatures identified.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {techStack.map((tech, idx) => (
              <div
                key={`${tech.name}-${idx}`}
                className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-100 font-mono">
                    {tech.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {tech.category}
                  </span>
                </div>

                {tech.cves && tech.cves.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-mono text-rose-400 font-bold block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t.knownCveAdvisories}:
                    </span>
                    {tech.cves.map((cve) => (
                      <div
                        key={cve.cveId}
                        className="bg-rose-950/20 border border-rose-900/30 p-2 rounded text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-300">
                          <span>{cve.cveId}</span>
                          <span className="text-rose-400">[{cve.severity}]</span>
                        </div>
                        <p className="text-[11px] text-rose-200/80 mt-0.5">{cve.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Open Port Reconnaissance */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.portReconTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.portReconDesc}
              </p>
            </div>
          </div>
        </div>

        {ports.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono">No host IP was resolved to scan ports.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {ports.map((p) => {
              let statusClass = 'border-slate-800 bg-slate-950/40 text-slate-500';
              if (p.open) {
                if (p.risk === 'CRITICAL') statusClass = 'border-rose-500/50 bg-rose-950/20 text-rose-300';
                else if (p.risk === 'WARNING') statusClass = 'border-amber-500/50 bg-amber-950/20 text-amber-300';
                else statusClass = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300';
              }

              return (
                <div
                  key={p.port}
                  className={`p-3 rounded-lg border transition-all ${statusClass}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">Port {p.port}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.open ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      {p.open ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>
                  <div className="text-[11px] truncate text-slate-400">{p.service}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sensitive Endpoints & File Reconnaissance */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.robotsTxtTitle} & {t.securityTxtTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Audits crawling policies, RFC 9116 security.txt, and sensitive dotfile probes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Robots.txt Card */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.robotsTxtTitle}</span>
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  robotsTxt?.exists
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                    : 'text-slate-400 bg-slate-900 border-slate-700'
                }`}
              >
                {robotsTxt?.exists ? 'EXISTS' : 'NOT FOUND'}
              </span>
            </div>

            {robotsTxt?.exists ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {t.disallowedRoutes} ({robotsTxt.disallowedPaths.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto font-mono text-[11px]">
                    {robotsTxt.disallowedPaths.map((path) => (
                      <span
                        key={path}
                        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {path}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No robots.txt present on the server root.</p>
            )}
          </div>

          {/* Security.txt Card (RFC 9116) */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.securityTxtTitle}</span>
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  securityTxt?.exists
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                    : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                }`}
              >
                {securityTxt?.exists ? 'COMPLIANT' : 'MISSING'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {securityTxt?.exists
                ? `Vulnerability disclosure policy published at /.well-known/security.txt with contact: ${securityTxt.contact || 'Yes'}`
                : 'No standardized security contact found. Responsible disclosure researchers lack direct contact information.'}
            </p>
          </div>
        </div>

        {/* Sensitive Endpoint Probes */}
        {sensitiveEndpoints.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Sensitive Files Leaked</span>
            </h4>
            <div className="space-y-2">
              {sensitiveEndpoints.map((ep) => (
                <div
                  key={ep.path}
                  className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-xs text-rose-300">
                      {ep.path} [HTTP {ep.status}]
                    </span>
                    <p className="text-xs text-rose-200/80">{ep.description}</p>
                    {ep.snippet && (
                      <div className="font-mono text-[11px] bg-slate-950/80 p-1.5 rounded border border-rose-900/40 text-rose-300">
                        {ep.snippet}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/50 text-rose-200 border border-rose-700">
                    CRITICAL
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
