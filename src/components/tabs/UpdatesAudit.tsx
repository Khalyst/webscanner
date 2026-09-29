import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Download,
  Copy,
  Terminal,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Server,
  PackageCheck,
  Check,
  Code,
} from 'lucide-react';
import type { ScanResult, SoftwareUpdateItem } from '../../types/scanner';

interface UpdatesAuditProps {
  scan: ScanResult;
  onOpenAlertModal: () => void;
}

export const UpdatesAudit: React.FC<UpdatesAuditProps> = ({ scan, onOpenAlertModal }) => {
  const updates = scan.softwareUpdates;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadScript = () => {
    const script = updates?.patchScript || '#!/bin/bash\necho "No patches pending"';
    const blob = new Blob([script], { type: 'text/x-sh;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patch-${scan.hostname.replace(/[^a-z0-9]/gi, '_')}.sh`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!updates || updates.items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center space-y-4">
        <PackageCheck className="w-12 h-12 text-cyan-400 mx-auto opacity-75" />
        <h3 className="text-lg font-bold text-white">No Infrastructure Version Tokens Exposed</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          The audited endpoint does not broadcast vulnerable software version signatures in server headers or meta tags. This reduces the reconnaissance surface for automated attackers.
        </p>
        <button
          onClick={onOpenAlertModal}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs inline-flex items-center gap-2 cursor-pointer border border-slate-700"
        >
          <BellRing className="w-4 h-4 text-cyan-400" />
          <span>Configure Administrator Alert Channels</span>
        </button>
      </div>
    );
  }

  const isCritical = updates.criticalUpdatesCount > 0;
  const isPending = updates.outdatedCount > 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Administrator Action Ribbon */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isCritical
            ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-rose-800/80 shadow-xl'
            : isPending
            ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-800/80 shadow-xl'
            : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-800/80 shadow-xl'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  isCritical
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : isPending
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}
              >
                {updates.overallStatus.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Software & CVE Patch Intelligence
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isCritical
                ? `Critical Component Updates Required on ${scan.hostname}`
                : isPending
                ? `Outdated Software Components Detected on ${scan.hostname}`
                : `Infrastructure Components Hardened & Up-to-Date`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isCritical
                ? `Identified ${updates.criticalUpdatesCount} critical or End-of-Life component(s) with known CVE exploit paths. Dispatch an automated advisory to sysadmins immediately.`
                : isPending
                ? `Discovered ${updates.outdatedCount} component(s) with newer stable security releases available. Regular patching minimizes exploit opportunities.`
                : 'All detected frameworks, web server daemons, and runtimes match active, supported security patch baselines.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenAlertModal}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer w-full sm:w-auto"
            >
              <BellRing className="w-4 h-4 animate-pulse" />
              <span>Alert Administrator Now</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadScript}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              title="Download bash patch script"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download .sh Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono mb-1">Monitored Components</div>
          <div className="text-2xl font-extrabold text-white font-mono">{updates.totalComponents}</div>
          <div className="text-[11px] text-slate-500 mt-1">Web, runtime, frameworks</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono mb-1">Outdated Components</div>
          <div className={`text-2xl font-extrabold font-mono ${updates.outdatedCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {updates.outdatedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending vendor updates</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono mb-1">Critical Action Items</div>
          <div className={`text-2xl font-extrabold font-mono ${updates.criticalUpdatesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {updates.criticalUpdatesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High/Critical CVEs or EOL</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono mb-1">Patch Automation</div>
          <div className="text-base font-bold text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            <span>Playbook Ready</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bash, Docker, APT, DNF</div>
        </div>
      </div>

      {/* Component Update Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Component Vulnerability & Patch Inventory</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {updates.items.length} Component(s) Audited
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {updates.items.map((item) => (
            <ComponentUpdateCard
              key={item.id}
              item={item}
              onCopy={handleCopy}
              copiedId={copiedId}
              onOpenAlertModal={onOpenAlertModal}
            />
          ))}
        </div>
      </div>

      {/* Copyable Quick Shell Script Box */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white font-mono">Generated Server Patch Playbook (Bash)</h4>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(updates.patchScript, 'full-script')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedId === 'full-script' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Playbook</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Playbook</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-emerald-400 max-h-52 overflow-y-auto leading-relaxed">
          {updates.patchScript}
        </pre>
      </div>

    </div>
  );
};

interface ComponentCardProps {
  item: SoftwareUpdateItem;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onOpenAlertModal: () => void;
}

const ComponentUpdateCard: React.FC<ComponentCardProps> = ({
  item,
  onCopy,
  copiedId,
  onOpenAlertModal,
}) => {
  const isCritical = item.status === 'CRITICAL_UPDATE_REQUIRED';
  const isRecommended = item.status === 'UPDATE_RECOMMENDED';

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isCritical
          ? 'bg-rose-950/20 border-rose-800/80'
          : isRecommended
          ? 'bg-amber-950/20 border-amber-800/80'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="text-base font-extrabold text-white font-mono">{item.name}</h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {item.category}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isCritical
                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                  : isRecommended
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              }`}
            >
              {item.status.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.riskSummary}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
          <div className="bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase">Detected Version</div>
            <div className="font-bold text-white">{item.detectedVersion || 'Concealed / Unknown'}</div>
          </div>

          <div className="bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase">Latest Secure Target</div>
            <div className="font-bold text-cyan-400">{item.latestVersion}</div>
          </div>
        </div>
      </div>

      {/* CVEs section if available */}
      {item.cves.length > 0 && (
        <div className="py-3.5 border-b border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Associated CVE Vulnerabilities ({item.cves.length}):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.cves.map((c) => (
              <div
                key={c.cveId}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-950 text-xs font-mono flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-300">{c.cveId}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-900/60 text-rose-200">
                      {c.severity}
                    </span>
                    {c.cvssScore && (
                      <span className="text-[10px] text-slate-400">CVSS {c.cvssScore}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{c.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remediation Guide & Terminal Commands */}
      <div className="pt-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Administrator Remediation & Commands:</span>
          </div>

          {item.remediation.patchAdvisoryUrl && (
            <a
              href={item.remediation.patchAdvisoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Official Advisory</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <p className="text-xs text-slate-400 font-sans">{item.remediation.commandGuide}</p>

        {/* Copyable CLI Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {item.remediation.cliCommands.debianUbuntu && (
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Debian / Ubuntu</span>
                <code className="text-xs font-mono text-cyan-300 truncate block">
                  {item.remediation.cliCommands.debianUbuntu}
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopy(item.remediation.cliCommands.debianUbuntu!, `${item.id}-deb`)
                }
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                title="Copy command"
              >
                {copiedId === `${item.id}-deb` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {item.remediation.cliCommands.rhelCentos && (
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">RHEL / CentOS / Rocky</span>
                <code className="text-xs font-mono text-cyan-300 truncate block">
                  {item.remediation.cliCommands.rhelCentos}
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopy(item.remediation.cliCommands.rhelCentos!, `${item.id}-rhel`)
                }
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                title="Copy command"
              >
                {copiedId === `${item.id}-rhel` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {item.remediation.cliCommands.docker && (
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Docker Image Update</span>
                <code className="text-xs font-mono text-cyan-300 truncate block">
                  {item.remediation.cliCommands.docker}
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopy(item.remediation.cliCommands.docker!, `${item.id}-docker`)
                }
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                title="Copy command"
              >
                {copiedId === `${item.id}-docker` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {item.remediation.cliCommands.generic && (
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">CLI Command</span>
                <code className="text-xs font-mono text-cyan-300 truncate block">
                  {item.remediation.cliCommands.generic}
                </code>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopy(item.remediation.cliCommands.generic!, `${item.id}-generic`)
                }
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                title="Copy command"
              >
                {copiedId === `${item.id}-generic` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
