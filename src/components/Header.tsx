import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, FileDown, RefreshCw, Terminal, Globe, ChevronDown, Check, Container, Smartphone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import type { ScanResult } from '../types/scanner';

interface HeaderProps {
  currentScan: ScanResult | null;
  onExportPdf: () => void;
  onNewScan: () => void;
  onOpenDeploy: () => void;
  onOpenMobile: () => void;
  isScanning: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScan,
  onExportPdf,
  onNewScan,
  onOpenDeploy,
  onOpenMobile,
  isScanning,
  activeTab,
  setActiveTab,
}) => {
  const { language, setLanguage, t, languages } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'overview', label: t.navOverview },
    { id: 'flaws', label: `${t.navFlaws} (${currentScan?.flaws.length ?? 0})` },
    { id: 'headers', label: t.navHeaders },
    { id: 'ssl_dns', label: t.navSslDns },
    { id: 'tech_ports', label: t.navTechPorts },
    { id: 'ai_report', label: t.navExecutive },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <button
            onClick={onNewScan}
            className="text-left font-bold text-lg tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
          >
            <span>{t.appName}</span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              v1.0
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        {currentScan ? (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
            <span className="uppercase">{t.tagline}</span>
          </div>
        )}

        {/* Zone 3: Primary Actions & International Language Selector */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-slate-300 bg-slate-900/90 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none"
              title="Select language"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold uppercase">{currentLang.code}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-b border-slate-800">
                  Select Language
                </div>
                {languages.map((l) => {
                  const isSelected = l.code === language;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/80 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono uppercase text-[10px] text-slate-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                          {l.code}
                        </span>
                        <span>{l.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile App Download Button */}
          <button
            onClick={onOpenMobile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/70 rounded-lg border border-cyan-800/70 hover:border-cyan-600 transition-colors cursor-pointer select-none"
            title="Download Mobile App (Android / iOS / PWA)"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Mobile App</span>
          </button>

          {/* Docker & GitHub Modal Trigger */}
          <button
            onClick={onOpenDeploy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-slate-300 bg-slate-900/90 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none"
            title="Download via GitHub / Run with Docker"
          >
            <Container className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Docker</span>
          </button>

          {currentScan && (
            <>
              <button
                onClick={onExportPdf}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
                title="Download full professional PDF audit report"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.exportPdf}</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                onClick={onNewScan}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer"
                title="Start a new scan"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t.newAudit}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
