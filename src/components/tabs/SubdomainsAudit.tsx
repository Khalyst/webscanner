import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  ShieldAlert,
  Server,
  Layers,
  FileDown,
  Copy,
  Check,
  Zap,
  Filter,
  ArrowUpRight,
  Database,
  Lock,
  Radio,
  Clock,
} from 'lucide-react';
import type { SubdomainAudit, SubdomainCategory, SubdomainEntry } from '../../types/scanner';

interface SubdomainsAuditProps {
  subdomains?: SubdomainAudit;
  targetDomain: string;
  onScanSubdomain?: (subdomain: string) => void;
}

export const SubdomainsAudit: React.FC<SubdomainsAuditProps> = ({
  subdomains,
  targetDomain,
  onScanSubdomain,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [resolvingOnly, setResolvingOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveQuerying, setLiveQuerying] = useState(false);
  const [liveAudit, setLiveAudit] = useState<SubdomainAudit | undefined>(subdomains);

  const activeAudit = liveAudit || subdomains;

  const handleLiveQuery = async () => {
    setLiveQuerying(true);
    try {
      const res = await fetch(`/api/osint/subdomains?domain=${encodeURIComponent(targetDomain)}`);
      if (res.ok) {
        const data = await res.json();
        setLiveAudit(data);
      }
    } catch (err) {
      console.error('Failed to query crt.sh:', err);
    } finally {
      setLiveQuerying(false);
    }
  };

  const filteredList = useMemo(() => {
    if (!activeAudit?.subdomains) return [];
    return activeAudit.subdomains.filter((entry) => {
      if (selectedCategory !== 'ALL' && entry.category !== selectedCategory) {
        return false;
      }
      if (resolvingOnly && !entry.isResolving) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          entry.subdomain.toLowerCase().includes(q) ||
          (entry.resolvedIp && entry.resolvedIp.toLowerCase().includes(q)) ||
          (entry.issuerName && entry.issuerName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeAudit, selectedCategory, resolvingOnly, search]);

  const handleCopyAll = () => {
    if (!activeAudit?.subdomains) return;
    const text = activeAudit.subdomains.map((s) => s.subdomain).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!activeAudit?.subdomains) return;
    const rows = [
      ['Subdomain', 'Category', 'Is Wildcard', 'Resolving', 'Resolved IP', 'Issuer', 'Logged At'],
      ...activeAudit.subdomains.map((s) => [
        s.subdomain,
        s.category,
        s.isWildcard ? 'Yes' : 'No',
        s.isResolving ? 'Yes' : 'No',
        s.resolvedIp || '',
        `"${(s.issuerName || '').replace(/"/g, '""')}"`,
        s.loggedAt || '',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeAudit.domain}-subdomains-crtsh.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (category: SubdomainCategory) => {
    switch (category) {
      case 'DEV_STAGING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Dev / Staging
          </span>
        );
      case 'ADMIN_PORTAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-950/80 text-orange-300 border border-orange-800/60 flex items-center gap-1">
            <Lock className="w-3 h-3 text-orange-400" />
            Admin / Portal
          </span>
        );
      case 'API_SERVICE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            API / Gateway
          </span>
        );
      case 'INFRASTRUCTURE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800/60 flex items-center gap-1">
            <Server className="w-3 h-3 text-blue-400" />
            Infrastructure
          </span>
        );
      case 'STORAGE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/60 flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-400" />
            Storage / S3
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700">
            General
          </span>
        );
    }
  };

  const totalDiscovered = activeAudit?.subdomains?.length || 0;
  const resolvingCount = activeAudit?.subdomains?.filter((s) => s.isResolving).length || 0;
  const devStagingCount = activeAudit?.categoriesCount?.devStaging || 0;
  const adminPortalCount = activeAudit?.categoriesCount?.adminPortal || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Subdomain & Certificate Transparency OSINT
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  crt.sh CT Logs
                </span>
                {activeAudit?.hasWildcardCerts && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    Wildcard SSL Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Passive attack-surface mapping discovering hidden subdomains, staging portals, APIs, and forgotten cloud infrastructure via public SSL/TLS logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLiveQuery}
              disabled={liveQuerying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
              title="Query crt.sh live for latest Certificate Transparency logs"
            >
              {liveQuerying ? (
                <>
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Querying crt.sh...</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Refresh CT Logs</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              title="Copy all discovered subdomains to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy All'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
              title="Export discovered assets as CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Discovered Subdomains
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
              {totalDiscovered}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Resolving Hostnames</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
              {resolvingCount}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Dev & Staging (Shadow IT)
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${devStagingCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {devStagingCount}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Admin & Auth Portals
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${adminPortalCount > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
              {adminPortalCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discovered subdomains, IP addresses, issuers..."
              className="w-full bg-slate-950 text-slate-100 placeholder:text-slate-500 text-xs font-mono pl-9 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Toggle Resolving */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono text-slate-300 shrink-0">
            <input
              type="checkbox"
              checked={resolvingOnly}
              onChange={(e) => setResolvingOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <span>Active DNS Resolving Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'ALL', label: 'All Subdomains', count: totalDiscovered },
            { id: 'DEV_STAGING', label: 'Dev / Staging', count: devStagingCount },
            { id: 'ADMIN_PORTAL', label: 'Admin Portals', count: adminPortalCount },
            { id: 'API_SERVICE', label: 'APIs & Gateways', count: activeAudit?.categoriesCount?.apiService || 0 },
            { id: 'INFRASTRUCTURE', label: 'Infrastructure', count: activeAudit?.categoriesCount?.infrastructure || 0 },
            { id: 'STORAGE', label: 'Storage / S3', count: activeAudit?.categoriesCount?.storage || 0 },
            { id: 'GENERAL', label: 'General', count: activeAudit?.categoriesCount?.general || 0 },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-700 font-semibold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Discovered Subdomains List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Showing {filteredList.length} of {totalDiscovered} subdomains</span>
          <span className="text-[11px] text-slate-500">Click &ldquo;Scan&rdquo; to launch target audit</span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Globe className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Subdomains Match Filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or clear category filters to view all entries.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[650px] overflow-y-auto">
            {filteredList.map((entry) => (
              <div
                key={entry.subdomain}
                className="p-3.5 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                {/* Left: Domain & Meta */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://${entry.subdomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1 group text-sm"
                    >
                      <span className="truncate">{entry.subdomain}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    </a>

                    {getCategoryBadge(entry.category)}

                    {entry.isWildcard && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/60">
                        * Wildcard
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    {/* IP status */}
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          entry.isResolving ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                      />
                      <span className={entry.isResolving ? 'text-slate-300 font-semibold' : 'text-slate-500'}>
                        {entry.isResolving ? `IP: ${entry.resolvedIp}` : 'DNS Unresolved'}
                      </span>
                    </span>

                    {/* Issuer */}
                    {entry.issuerName && (
                      <>
                        <span aria-hidden="true" className="text-slate-700">&bull;</span>
                        <span className="text-slate-400 truncate max-w-[220px]" title={entry.issuerName}>
                          Issuer: {entry.issuerName.split(',')[0]}
                        </span>
                      </>
                    )}

                    {/* Logged Date */}
                    {entry.loggedAt && (
                      <>
                        <span aria-hidden="true" className="text-slate-700">&bull;</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(entry.loggedAt).toLocaleDateString()}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Instant Scan Button */}
                <div className="shrink-0 flex items-center gap-2">
                  {onScanSubdomain && (
                    <button
                      type="button"
                      onClick={() => onScanSubdomain(entry.subdomain)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-800/80 hover:border-cyan-600 font-semibold transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-sm"
                      title={`Scan ${entry.subdomain} now`}
                    >
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>Scan Target</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
