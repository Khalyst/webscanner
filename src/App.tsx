import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScanInput } from './components/ScanInput';
import { ScanOverview } from './components/ScanOverview';
import { FlawsList } from './components/FlawsList';
import { HeadersAudit } from './components/tabs/HeadersAudit';
import { SslDnsAudit } from './components/tabs/SslDnsAudit';
import { TechPortsAudit } from './components/tabs/TechPortsAudit';
import { AiExecutiveReport } from './components/tabs/AiExecutiveReport';
import { generateAuditPdf } from './utils/pdfGenerator';
import { SAMPLE_SCAN_RESULT } from './utils/sampleScan';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { DeployModal } from './components/DeployModal';
import type { ScanResult } from './types/scanner';
import {
  ShieldAlert,
  FileDown,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

function ScannerContent() {
  const { language, t, dir } = useLanguage();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleScan = async (targetUrl: string, deepAiScan: boolean) => {
    setIsScanning(true);
    setError(null);
    setScanStep(t.progressStep1);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev === t.progressStep1) return t.progressStep2;
        if (prev === t.progressStep2) return t.progressStep3;
        if (prev === t.progressStep3) return t.progressStep4;
        if (prev === t.progressStep4) return t.progressStep5;
        if (prev === t.progressStep5) return t.progressStep6;
        if (prev === t.progressStep6) return t.progressStep7;
        return t.progressStep7;
      });
    }, 1100);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, deepAiScan, lang: language }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}: Failed to scan endpoint`);
      }

      const result: ScanResult = await response.json();
      setScanResult(result);
      setActiveTab('overview');
      showToast(`${t.navOverview}: ${result.hostname} (${result.flaws.length} ${t.navFlaws.toLowerCase()})`, 'success');
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err?.message || 'Failed to complete vulnerability scan. Please verify target URL.');
      showToast(err?.message || 'Scan failed', 'error');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleExportPdf = () => {
    if (!scanResult) return;
    try {
      generateAuditPdf(scanResult, language);
      showToast(`${t.exportPdf}: ${scanResult.hostname}`, 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showToast('Failed to export PDF report: ' + (err?.message || 'Unknown error'), 'error');
    }
  };

  const handleLoadSample = () => {
    setScanResult(SAMPLE_SCAN_RESULT);
    setActiveTab('overview');
    showToast(t.sampleAuditBannerTitle, 'info');
  };

  const handleNewScan = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-200"
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono transition-all animate-bounce">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error'
                ? 'bg-rose-500'
                : toast.type === 'info'
                ? 'bg-cyan-400'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* Top Bar Header with Language Selector & Docker Deploy */}
      <Header
        currentScan={scanResult}
        onExportPdf={handleExportPdf}
        onNewScan={handleNewScan}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        isScanning={isScanning}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Deploy & GitHub Instructions Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* URL Input Bar */}
        <ScanInput onScan={handleScan} isScanning={isScanning} scanStep={scanStep} />

        {/* Error Notification */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-rose-200">Scan Assessment Encountered an Error</span>
              <p className="text-rose-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* If no scan performed yet, show Intro Cards with Sample Loader */}
        {!scanResult && !isScanning && !error && (
          <div className="max-w-4xl mx-auto space-y-8 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-100">{t.deepVulnCardTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.deepVulnCardDesc}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-100">{t.aiThreatCardTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.aiThreatCardDesc}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileDown className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-100">{t.exportPdfCardTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.exportPdfCardDesc}
                </p>
              </div>
            </div>

            {/* Quick Demo Audit Trigger */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white font-mono flex items-center justify-center sm:justify-start gap-2">
                  <span>{t.sampleAuditBannerTitle}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                    {t.instantDemoBadge}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 max-w-lg">
                  {t.sampleAuditBannerDesc}
                </p>
              </div>

              <button
                onClick={handleLoadSample}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>{t.viewSampleAudit}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scan Results View */}
        {scanResult && (
          <div className="space-y-6">
            {/* Top Overview Card */}
            <ScanOverview
              scan={scanResult}
              onExportPdf={handleExportPdf}
              onSelectTab={setActiveTab}
            />

            {/* Tab Navigation for Mobile */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800">
              {[
                { id: 'overview', label: t.navOverview },
                { id: 'flaws', label: `${t.navFlaws} (${scanResult.flaws.length})` },
                { id: 'headers', label: t.navHeaders },
                { id: 'ssl_dns', label: t.navSslDns },
                { id: 'tech_ports', label: t.navTechPorts },
                { id: 'ai_report', label: t.navExecutive },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Panels */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Executive Brief Preview */}
                {scanResult.aiAnalysis && (
                  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                          {t.executiveSummaryHeading}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('ai_report')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono hover:underline cursor-pointer"
                      >
                        {t.navExecutive} &rarr;
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {scanResult.aiAnalysis.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Primary Flaws List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>{t.navFlaws} ({scanResult.flaws.length})</span>
                    </h3>
                    <button
                      onClick={handleExportPdf}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>{t.exportPdf}</span>
                    </button>
                  </div>

                  <FlawsList flaws={scanResult.flaws} />
                </div>
              </div>
            )}

            {activeTab === 'flaws' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {t.navFlaws} ({scanResult.flaws.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.techVulnerabilityAnalysis}
                  </p>
                </div>
                <FlawsList flaws={scanResult.flaws} />
              </div>
            )}

            {activeTab === 'headers' && (
              <HeadersAudit headersAudit={scanResult.headersAudit} />
            )}

            {activeTab === 'ssl_dns' && (
              <SslDnsAudit
                sslInfo={scanResult.sslInfo}
                dnsRecords={scanResult.dnsRecords}
                cookies={scanResult.cookies}
              />
            )}

            {activeTab === 'tech_ports' && (
              <TechPortsAudit
                techStack={scanResult.techStack}
                ports={scanResult.ports}
                sensitiveEndpoints={scanResult.sensitiveEndpoints}
                robotsTxt={scanResult.robotsTxt}
                securityTxt={scanResult.securityTxt}
              />
            )}

            {activeTab === 'ai_report' && (
              <AiExecutiveReport scan={scanResult} onExportPdf={handleExportPdf} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">{t.appName}</span>
            <span aria-hidden="true">·</span>
            <span>{t.footerRights}</span>
          </div>
          <div>
            <span>{t.footerDisclaimer}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ScannerContent />
    </LanguageProvider>
  );
}
