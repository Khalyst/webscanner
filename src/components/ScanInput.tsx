import React, { useState } from 'react';
import { Search, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ScanInputProps {
  onScan: (url: string, deepAiScan: boolean) => void;
  isScanning: boolean;
  scanStep?: string;
}

const SAMPLE_TARGETS = [
  { label: 'owasp.org', url: 'https://owasp.org', tag: 'Web App Security Foundation' },
  { label: 'example.com', url: 'http://example.com', tag: 'Standard Test Domain' },
  { label: 'github.com', url: 'https://github.com', tag: 'Developer Platform' },
  { label: 'wikipedia.org', url: 'https://wikipedia.org', tag: 'Knowledge Base' },
];

export const ScanInput: React.FC<ScanInputProps> = ({ onScan, isScanning, scanStep }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [deepAiScan, setDeepAiScan] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isScanning) return;
    onScan(url.trim(), deepAiScan);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    onScan(sampleUrl, deepAiScan);
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
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800 shadow-xl focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="flex items-center flex-1 px-3 py-2 text-slate-400">
            <Globe className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.inputPlaceholder}
              disabled={isScanning}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 px-2 sm:px-0">
            <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer pr-2">
              <input
                type="checkbox"
                checked={deepAiScan}
                onChange={(e) => setDeepAiScan(e.target.checked)}
                disabled={isScanning}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {t.aiAnalysisLabel}
              </span>
            </label>

            <button
              type="submit"
              disabled={!url.trim() || isScanning}
              className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-md"
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

      {/* Quick Target Presets */}
      {!isScanning && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="mr-1">{t.sampleAudits}</span>
          {SAMPLE_TARGETS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700 font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
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
