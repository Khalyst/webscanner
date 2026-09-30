import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ScanInput } from './components/ScanInput';
import { ScanOverview } from './components/ScanOverview';
import { FlawsList } from './components/FlawsList';
import { HeadersAudit } from './components/tabs/HeadersAudit';
import { SslDnsAudit } from './components/tabs/SslDnsAudit';
import { TechPortsAudit } from './components/tabs/TechPortsAudit';
import { SubdomainsAudit } from './components/tabs/SubdomainsAudit';
import { AiExecutiveReport } from './components/tabs/AiExecutiveReport';
import { UpdatesAudit } from './components/tabs/UpdatesAudit';
import { AdminAlertModal } from './components/AdminAlertModal';
import { generateAuditPdf } from './utils/pdfGenerator';
import { SAMPLE_SCAN_RESULT } from './utils/sampleScan';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { DeployModal } from './components/DeployModal';
import { MobileDownloadModal } from './components/MobileDownloadModal';
import { BulkScannerModal } from './components/BulkScannerModal';
import { McpHubModal } from './components/McpHubModal';
import { RecentScansModal } from './components/RecentScansModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  getScanHistory,
  saveScanToHistory,
  removeScanFromHistory,
  clearScanHistory,
  type HistoryScanEntry,
} from './utils/scanHistory';
import { generateClientSideAudit } from './utils/clientScanner';
import type { ScanResult, AiProviderId, CustomAiConfig } from './types/scanner';
import {
  ShieldAlert,
  FileDown,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  PackageCheck,
  BellRing,
  Send,
  Terminal,
} from 'lucide-react';

function ScannerContent() {
  const { language, t, dir } = useLanguage();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState<HistoryScanEntry[]>(() => {
    return getScanHistory();
  });
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [selectedAiProvider, setSelectedAiProvider] = useState<AiProviderId>(() => {
    try {
      const saved = localStorage.getItem('webscanner_ai_provider');
      return (saved as AiProviderId) || 'offline';
    } catch {
      return 'offline';
    }
  });
  const [selectedAiModel, setSelectedAiModel] = useState<string>(() => {
    try {
      return localStorage.getItem('webscanner_ai_model') || 'Deterministic CISO Engine v1.0';
    } catch {
      return 'Deterministic CISO Engine v1.0';
    }
  });
  const [customAiConfig, setCustomAiConfig] = useState<CustomAiConfig | undefined>(() => {
    try {
      const baseUrl = localStorage.getItem('webscanner_custom_base_url');
      const model = localStorage.getItem('webscanner_custom_model');
      const providerName = localStorage.getItem('webscanner_custom_provider_name');
      const apiKey = localStorage.getItem('webscanner_custom_api_key');
      if (baseUrl || model) {
        return {
          baseUrl: baseUrl || 'https://api.deepseek.com/v1',
          model: model || 'deepseek-chat',
          providerName: providerName || 'DeepSeek',
          apiKey: apiKey || undefined,
        };
      }
    } catch {
      // ignore
    }
    return undefined;
  });

  const handleSelectAiProvider = (provider: AiProviderId, model: string, config?: CustomAiConfig) => {
    setSelectedAiProvider(provider);
    setSelectedAiModel(model);
    if (config) {
      setCustomAiConfig(config);
    }
    try {
      localStorage.setItem('webscanner_ai_provider', provider);
      localStorage.setItem('webscanner_ai_model', model);
    } catch {
      // ignore
    }
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Escape closes any active modal
      if (e.key === 'Escape') {
        setIsHistoryModalOpen(false);
        setIsBulkModalOpen(false);
        setIsMcpModalOpen(false);
        setIsDeployModalOpen(false);
        setIsMobileModalOpen(false);
        setIsAlertModalOpen(false);
        return;
      }

      // Ctrl+K or Cmd+K or "/" focuses scan input
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !isEditing)) {
        e.preventDefault();
        scanInputRef.current?.focus();
        scanInputRef.current?.select();
        return;
      }

      // "H" or "h" opens History modal when not typing
      if ((e.key === 'h' || e.key === 'H') && !isEditing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsHistoryModalOpen((prev) => !prev);
        return;
      }

      // Quick tab switching 1-8
      if (scanResult && !isEditing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '1') setActiveTab('overview');
        else if (e.key === '2') setActiveTab('flaws');
        else if (e.key === '3') setActiveTab('headers');
        else if (e.key === '4') setActiveTab('ssl_dns');
        else if (e.key === '5') setActiveTab('tech_ports');
        else if (e.key === '6') setActiveTab('updates');
        else if (e.key === '7') setActiveTab('subdomains');
        else if (e.key === '8') setActiveTab('ai_report');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanResult]);

  const handleDeleteHistoryEntry = (id: string) => {
    const updated = removeScanFromHistory(id);
    setScanHistory(updated);
    showToast('Removed audit from history', 'info');
  };

  const handleClearAllHistory = () => {
    clearScanHistory();
    setScanHistory([]);
    showToast('Audit history cleared', 'info');
  };

  const handleQuickScan = (targetUrl: string) => {
    handleScan(targetUrl, true, selectedAiProvider, selectedAiModel, customAiConfig);
    setActiveTab('overview');
  };

  const handleScan = async (
    targetUrl: string,
    deepAiScan: boolean,
    provider = selectedAiProvider,
    model = selectedAiModel,
    config = customAiConfig
  ) => {
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          url: targetUrl,
          deepAiScan,
          lang: language,
          aiProvider: provider,
          aiModel: model,
          customAiConfig: config,
        }),
      });

      clearInterval(stepInterval);

      let result: ScanResult | null = null;
      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        console.warn(`Backend returned status ${response.status} (${contentType}), activating local deterministic audit fallback`);
        result = generateClientSideAudit(targetUrl, language);
      }

      if (result) {
        setScanResult(result);
        const updatedHistory = saveScanToHistory(result);
        setScanHistory(updatedHistory);
        setActiveTab('overview');
        showToast(`${t.navOverview}: ${result.hostname} (${result.flaws.length} ${t.navFlaws.toLowerCase()})`, 'success');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.warn('Network scan fetch error, falling back to local deterministic scan:', err);
      try {
        const fallbackResult = generateClientSideAudit(targetUrl, language);
        setScanResult(fallbackResult);
        const updatedHistory = saveScanToHistory(fallbackResult);
        setScanHistory(updatedHistory);
        setActiveTab('overview');
        showToast(`${t.navOverview}: ${fallbackResult.hostname}`, 'info');
      } catch (fallbackErr: any) {
        setError(err?.message || 'Failed to complete vulnerability scan. Please verify target URL.');
        showToast(err?.message || 'Scan failed', 'error');
      }
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
    const updatedHistory = saveScanToHistory(SAMPLE_SCAN_RESULT);
    setScanHistory(updatedHistory);
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

      {/* PWA Mobile Install Banner */}
      <PWAInstallBanner onOpenMobileModal={() => setIsMobileModalOpen(true)} />

      {/* Top Bar Header with Language Selector & Docker Deploy */}
      <Header
        currentScan={scanResult}
        onExportPdf={handleExportPdf}
        onNewScan={handleNewScan}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        onOpenMobile={() => setIsMobileModalOpen(true)}
        onOpenBulkScan={() => setIsBulkModalOpen(true)}
        onOpenMcpHub={() => setIsMcpModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenAlertModal={() => {
          if (!scanResult) {
            setScanResult(SAMPLE_SCAN_RESULT);
          }
          setIsAlertModalOpen(true);
        }}
        historyCount={scanHistory.length}
        isScanning={isScanning}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!scanResult) {
            setScanResult(SAMPLE_SCAN_RESULT);
          }
          setActiveTab(tab);
        }}
      />

      {/* Administrator Security Alert & Webhook Dispatcher Modal */}
      <AdminAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        scan={scanResult || SAMPLE_SCAN_RESULT}
      />

      {/* Deploy & GitHub Instructions Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Mobile Download & PWA Install Modal */}
      <MobileDownloadModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* Bulk URL Scanning Queue Modal */}
      <BulkScannerModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onViewDetailedResult={(result) => {
          setScanResult(result);
          setActiveTab('overview');
          showToast(`${t.navOverview}: ${result.hostname}`, 'success');
        }}
        selectedAiProvider={selectedAiProvider}
        selectedAiModel={selectedAiModel}
        customAiConfig={customAiConfig}
        onSelectAiProvider={handleSelectAiProvider}
      />

      {/* Model Context Protocol (MCP) & OSINT Tool Hub */}
      <McpHubModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        defaultDomain={scanResult?.hostname || 'example.com'}
        onScanTarget={handleQuickScan}
      />

      {/* Recent Audits History Modal */}
      <RecentScansModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={scanHistory}
        onSelectScan={(scan) => {
          setScanResult(scan);
          setActiveTab('overview');
          showToast(`Loaded audit: ${scan.hostname}`, 'info');
        }}
        onRescan={(url) => {
          handleScan(url, true);
        }}
        onDeleteEntry={handleDeleteHistoryEntry}
        onClearHistory={handleClearAllHistory}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* URL Input Bar */}
        <ScanInput
          onScan={handleScan}
          onOpenBulkScan={() => setIsBulkModalOpen(true)}
          isScanning={isScanning}
          scanStep={scanStep}
          selectedProvider={selectedAiProvider}
          selectedModel={selectedAiModel}
          customConfig={customAiConfig}
          onSelectProvider={handleSelectAiProvider}
          recentScans={scanHistory}
          onSelectRecentScan={(scan) => {
            setScanResult(scan);
            setActiveTab('overview');
            showToast(`Loaded audit: ${scan.hostname}`, 'info');
          }}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          inputRef={scanInputRef}
        />

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

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center sm:justify-end">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 hover:border-cyan-600 text-xs font-semibold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bulk URL Scanner</span>
                </button>

                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold font-mono transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{t.viewSampleAudit}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* FEATURE SHOWCASE: Software Updates & Admin Incident Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-900/90 border border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-700/80 text-amber-300">
                    NEW • CVE INTELLIGENCE
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Software Updates & CVE Patch Playbook</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Detects outdated components (Nginx, Apache, PHP, WordPress), maps published CVEs, and generates copyable/downloadable <code className="text-cyan-400 font-mono">.sh</code> remediation scripts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScanResult(SAMPLE_SCAN_RESULT);
                    setActiveTab('updates');
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-600/40 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explore Software Updates & Playbook Tab</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-rose-950/30 via-slate-900/60 to-slate-900/90 border border-rose-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <BellRing className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-700/80 text-rose-300">
                    NEW • INCIDENT RESPONSE
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Administrator Incident Alert System</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Instant multi-channel webhook dispatching to Slack (Block Kit), Discord (color embeds), SIEM/JSON endpoints, and formatted RFC email advisories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!scanResult) setScanResult(SAMPLE_SCAN_RESULT);
                    setIsAlertModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-600/40 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-rose-400" />
                  <span>Open Administrator Alert Modal</span>
                </button>
              </div>
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
              onOpenAlertModal={() => setIsAlertModalOpen(true)}
            />

            {/* Tab Navigation for Mobile */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800">
              {[
                { id: 'overview', label: t.navOverview },
                { id: 'flaws', label: `${t.navFlaws} (${scanResult.flaws.length})` },
                { id: 'headers', label: t.navHeaders },
                { id: 'ssl_dns', label: t.navSslDns },
                { id: 'tech_ports', label: t.navTechPorts },
                { id: 'updates', label: `Updates (${scanResult.softwareUpdates?.outdatedCount || 0})` },
                { id: 'subdomains', label: `${t.navSubdomains} (${scanResult.subdomains?.totalFound || 0})` },
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

                  <FlawsList
                    flaws={scanResult.flaws}
                    initialScore={scanResult.overallScore}
                    initialGrade={scanResult.securityGrade}
                    hostname={scanResult.hostname}
                  />
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
                <FlawsList
                  flaws={scanResult.flaws}
                  initialScore={scanResult.overallScore}
                  initialGrade={scanResult.securityGrade}
                  hostname={scanResult.hostname}
                />
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

            {activeTab === 'updates' && (
              <UpdatesAudit
                scan={scanResult}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
              />
            )}

            {activeTab === 'subdomains' && (
              <SubdomainsAudit
                subdomains={scanResult.subdomains}
                targetDomain={scanResult.hostname}
                onScanSubdomain={handleQuickScan}
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
