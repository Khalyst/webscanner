import React, { useState } from 'react';
import { Search, Globe, Sparkles, ArrowRight, Layers, History } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AiProviderSelector } from './AiProviderSelector';
import type { AiProviderId, CustomAiConfig, ScanResult } from '../types/scanner';
import type { HistoryScanEntry } from '../utils/scanHistory';

interface ScanInputProps {
  onScan: (url: string, deepAiScan: boolean, provider: AiProviderId, model: string, customConfig?: CustomAiConfig) => void;
  onOpenBulkScan: () => void;
  isScanning: boolean;
  scanStep?: string;
  selectedProvider: AiProviderId;
  selectedModel: string;
  customConfig?: CustomAiConfig;
  onSelectProvider: (provider: AiProviderId, model: string, customConfig?: CustomAiConfig) => void;
  recentScans?: HistoryScanEntry[];
  onSelectRecentScan?: (scan: ScanResult) => void;
  onOpenHistory?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const SAMPLE_TARGETS = [
  { label: 'owasp.org', url: 'https://owasp.org', tag: 'Web App Security Foundation' },
  { label: 'example.com', url: 'http://example.com', tag: 'Standard Test Domain' },
  { label: 'github.com', url: 'https://github.com', tag: 'Developer Platform' },
  { label: 'wikipedia.org', url: 'https://wikipedia.org', tag: 'Knowledge Base' },
];

export const ScanInput: React.FC<ScanInputProps> = ({
  onScan,
  onOpenBulkScan,
  isScanning,
  scanStep,
  selectedProvider,
  selectedModel,
  customConfig,
  onSelectProvider,
  recentScans = [],
  onSelectRecentScan,
  onOpenHistory,
  inputRef,
}) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [deepAiScan, setDeepAiScan] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isScanning) return;
    onScan(url.trim(), deepAiScan, selectedProvider, selectedModel, customConfig);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    onScan(sampleUrl, deepAiScan, selectedProvider, selectedModel, customConfig);
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    if (score >= 60) return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 lg:my-10 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.tagline}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 max-w-2xl mx-auto leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>
      </div>

      {/* Main Search Box */}
      <form onSubmit={handleSubmit} className="relative space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800 shadow-xl focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="flex items-center flex-1 px-3 py-2 text-slate-400">
            <Globe className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.inputPlaceholder}
              disabled={isScanning}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none font-mono"
            />
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 select-none mr-1 shrink-0">
              / or ⌘K
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 px-2 sm:px-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenBulkScan}
              disabled={isScanning}
              className="px-3.5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs sm:text-sm font-semibold font-mono transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
              title="Audit multiple URLs from a list or file"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Bulk Scan</span>
            </button>

            <button
              type="submit"
              disabled={!url.trim() || isScanning}
              className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-md w-full sm:w-auto"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t.scanningButton}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t.scanButton}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Engine & Deep Scan Controls Ribbon */}
        <div className="flex items-center justify-between px-2 flex-wrap gap-2 text-xs">
          <label className="flex items-center gap-2 text-slate-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={deepAiScan}
              onChange={(e) => setDeepAiScan(e.target.checked)}
              disabled={isScanning}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.aiAnalysisLabel}</span>
            </span>
          </label>

          {/* AI Provider Selector */}
          {deepAiScan && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px] font-mono hidden sm:inline">Engine:</span>
              <AiProviderSelector
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onSelect={onSelectProvider}
                disabled={isScanning}
              />
            </div>
          )}
        </div>
      </form>

      {/* Live Scanning Step Progress */}
      {isScanning && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{scanStep || t.progressStep1}</span>
            </span>
            <span className="text-slate-500">{t.liveTelemetry}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* Recent Audits Chips */}
      {!isScanning && recentScans.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-mono flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recent Audits:</span>
          </span>
          {recentScans.slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRecentScan?.(item.scanResult)}
              className="px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 font-mono transition-colors flex items-center gap-1.5 cursor-pointer text-xs group"
              title={`Load audit for ${item.hostname} (${item.overallScore}/100)`}
            >
              <span className="font-semibold group-hover:text-white">{item.hostname}</span>
              <span
                className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${getScoreBadgeClass(
                  item.overallScore
                )}`}
              >
                {item.securityGrade} · {item.overallScore}
              </span>
            </button>
          ))}
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-xs underline underline-offset-2 ml-1 cursor-pointer"
            >
              All History ({recentScans.length}) →
            </button>
          )}
        </div>
      )}

      {/* Quick Target Presets */}
      {!isScanning && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="mr-1">{t.sampleAudits}</span>
          {SAMPLE_TARGETS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700 font-mono transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <span>{sample.label}</span>
              <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
