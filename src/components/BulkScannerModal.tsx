import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ListFilter,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  FileSpreadsheet,
  FileCode,
  FileDown,
  Layers,
  Sparkles,
  Info,
  Clock,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import type {
  BulkQueueItem,
  ScanResult,
  AiProviderId,
  CustomAiConfig,
} from '../types/scanner';
import {
  parseBulkInputText,
  parseBulkFileContent,
  computeBulkSummary,
  exportBulkReportCsv,
  exportBulkReportJson,
} from '../utils/bulkScannerUtils';
import { generateClientSideAudit } from '../utils/clientScanner';
import { generateAuditPdf } from '../utils/pdfGenerator';
import { useLanguage } from '../i18n/LanguageContext';
import { AiProviderSelector } from './AiProviderSelector';

interface BulkScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetailedResult: (result: ScanResult) => void;
  selectedAiProvider: AiProviderId;
  selectedAiModel: string;
  customAiConfig?: CustomAiConfig;
  onSelectAiProvider: (provider: AiProviderId, model: string, config?: CustomAiConfig) => void;
}

const BULK_SAMPLE_PRESETS = [
  {
    name: 'Top Tech Platforms',
    urls: 'github.com, cloudflare.com, digitalocean.com, vercel.com',
  },
  {
    name: 'Security & Standards',
    urls: 'owasp.org, cisa.gov, nist.gov, sans.org',
  },
  {
    name: 'Sample Mixed Domains',
    urls: 'example.com, httpbin.org, wikipedia.org, mozilla.org',
  },
];

export const BulkScannerModal: React.FC<BulkScannerModalProps> = ({
  isOpen,
  onClose,
  onViewDetailedResult,
  selectedAiProvider,
  selectedAiModel,
  customAiConfig,
  onSelectAiProvider,
}) => {
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [queue, setQueue] = useState<BulkQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableAiInBulk, setEnableAiInBulk] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'error' | 'pending'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<BulkQueueItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopRequestedRef = useRef(false);

  // Sync stop requested
  useEffect(() => {
    if (!isProcessing) {
      stopRequestedRef.current = false;
    }
  }, [isProcessing]);

  if (!isOpen) return null;

  const handleAddUrls = (urlsToAdd: string[]) => {
    if (!urlsToAdd.length) return;
    setQueue((prev) => {
      const existing = new Set(prev.map((i) => i.normalizedUrl.toLowerCase()));
      const newItems: BulkQueueItem[] = [];

      for (const u of urlsToAdd) {
        if (!existing.has(u.toLowerCase())) {
          existing.add(u.toLowerCase());
          newItems.push({
            id: `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            url: u,
            normalizedUrl: u,
            status: 'pending',
          });
        }
      }
      return [...prev, ...newItems];
    });
    setInputText('');
  };

  const handleParseAndQueueInput = () => {
    const urls = parseBulkInputText(inputText);
    handleAddUrls(urls);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const urls = parseBulkFileContent(content, file.name);
        handleAddUrls(urls);
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Main Queue Processor: processes sequentially
  const startBulkProcessing = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    stopRequestedRef.current = false;

    // Scan through pending items
    for (let i = 0; i < queue.length; i++) {
      if (stopRequestedRef.current) break;

      const currentItem = queue[i];
      if (currentItem.status === 'completed') continue;

      // Mark current item as scanning
      setQueue((prev) =>
        prev.map((item, idx) =>
          idx === i
            ? { ...item, status: 'scanning', startedAt: Date.now(), progressStep: 'Auditing SSL & Headers...' }
            : item
        )
      );

      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            url: currentItem.normalizedUrl,
            deepAiScan: enableAiInBulk,
            lang: language,
            aiProvider: selectedAiProvider,
            aiModel: selectedAiModel,
            customAiConfig,
          }),
        });

        let scanResult: ScanResult;
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          scanResult = await response.json();
        } else {
          scanResult = generateClientSideAudit(currentItem.normalizedUrl, language);
        }

        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: 'completed',
                  result: scanResult,
                  completedAt: Date.now(),
                  progressStep: undefined,
                }
              : item
          )
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? {
                  ...item,
                  status: 'error',
                  error: err?.message || 'Assessment failed',
                  completedAt: Date.now(),
                  progressStep: undefined,
                }
              : item
          )
        );
      }

      // Small pause between scans to avoid self-rate limiting
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsProcessing(false);
  };

  const handleStopProcessing = () => {
    stopRequestedRef.current = true;
    setIsProcessing(false);
  };

  const handleClearQueue = () => {
    if (isProcessing) return;
    setQueue([]);
    setSelectedItemForPreview(null);
  };

  const handleRetryFailed = () => {
    if (isProcessing) return;
    setQueue((prev) =>
      prev.map((item) =>
        item.status === 'error' ? { ...item, status: 'pending', error: undefined } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemForPreview?.id === id) {
      setSelectedItemForPreview(null);
    }
  };

  const handleExportCsv = () => {
    const csvData = exportBulkReportCsv(queue);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WEBSCANNER_Bulk_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonData = exportBulkReportJson(queue);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WEBSCANNER_Bulk_Audit_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = computeBulkSummary(queue);

  const filteredQueue = queue.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Bulk URL Security Auditing</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Multi-Target Queue
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Input comma-separated domains or upload a TXT/CSV/JSON file to audit multiple web assets in succession.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body: Split into Upper Input + Lower Queue View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Upper Section: Input Form & File Dropzone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Direct Input & Quick Presets (Col 1-2) */}
            <div className="lg:col-span-2 space-y-3">
              <label className="block text-xs font-mono font-medium text-slate-300">
                Target URLs or Domains (Comma-Separated, Space-Separated, or Line-by-Line)
              </label>

              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`https://example.com, target-site.org\napi.service.io, dev.portal.net\nowasp.org`}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
                />
              </div>

              {/* Action Buttons for Input */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-500">Presets:</span>
                  {BULK_SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddUrls(parseBulkInputText(preset.urls))}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleParseAndQueueInput}
                  disabled={!inputText.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Queue Targets</span>
                </button>
              </div>
            </div>

            {/* File Drag-and-Drop Card (Col 3) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 mb-2">
                <Upload className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-slate-200">Import Target File</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Drop .txt, .csv, or .json file
              </p>
              <span className="text-[10px] font-mono text-cyan-400/80 mt-1">
                Parsed automatically
              </span>
            </div>
          </div>

          {/* Engine & Settings Bar */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-slate-300 font-medium select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAiInBulk}
                  onChange={(e) => setEnableAiInBulk(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Deep AI Executive Briefing</span>
                </span>
              </label>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-[11px]">Audit Engine:</span>
                <AiProviderSelector
                  selectedProvider={selectedAiProvider}
                  selectedModel={selectedAiModel}
                  onSelect={onSelectAiProvider}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Queue Control Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              {isProcessing ? (
                <button
                  type="button"
                  onClick={handleStopProcessing}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Queue</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startBulkProcessing}
                  disabled={queue.length === 0 || summary.pending === 0}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {summary.completed > 0 ? 'Resume Queue' : 'Start Audit Queue'}
                  </span>
                </button>
              )}

              {summary.failed > 0 && !isProcessing && (
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-900/40 font-mono text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Errors ({summary.failed})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearQueue}
                disabled={queue.length === 0 || isProcessing}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 font-mono text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Queue Statistics Metric Bar */}
          {queue.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Total Targets</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">{summary.total}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Completed</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{summary.completed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">In Progress</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{summary.inProgress}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">Failed / Blocked</span>
                <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{summary.failed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Avg Security Score</span>
                <span className="text-xl font-bold font-mono text-cyan-300 mt-1 block">
                  {summary.averageScore !== undefined ? `${summary.averageScore}/100` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Queue Filter Tabs & Export Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1">
              {(['all', 'completed', 'error', 'pending'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'all' && `All (${queue.length})`}
                  {filter === 'completed' && `Completed (${summary.completed})`}
                  {filter === 'error' && `Errors (${summary.failed})`}
                  {filter === 'pending' && `Pending (${queue.length - summary.completed - summary.failed - summary.inProgress})`}
                </button>
              ))}
            </div>

            {summary.completed > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Queue List Table */}
          <div className="space-y-2">
            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center border border-slate-800/80 rounded-xl bg-slate-950/40 text-slate-500 font-mono text-xs">
                {queue.length === 0
                  ? 'No targets queued. Enter comma-separated URLs above or drop a file to start bulk auditing.'
                  : 'No targets match the selected filter.'}
              </div>
            ) : (
              filteredQueue.map((item, index) => {
                const res = item.result;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.status === 'scanning'
                        ? 'bg-cyan-950/20 border-cyan-800/80 ring-1 ring-cyan-500/20'
                        : item.status === 'completed'
                        ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                        : item.status === 'error'
                        ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-800'
                        : 'bg-slate-950/50 border-slate-800/40'
                    }`}
                  >
                    {/* Left: Target details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {item.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {item.status === 'scanning' && (
                          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        )}
                        {item.status === 'error' && (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                        {item.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                            {res?.hostname || item.normalizedUrl}
                          </span>
                          {res && (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                res.securityGrade.startsWith('A')
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : res.securityGrade === 'B'
                                  ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                                  : res.securityGrade === 'C'
                                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                                  : 'bg-rose-950 text-rose-400 border-rose-800'
                              }`}
                            >
                              Grade {res.securityGrade} ({res.overallScore}/100)
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>{item.url}</span>
                          {item.status === 'scanning' && (
                            <span className="text-cyan-400 animate-pulse">
                              {item.progressStep || 'Scanning audit checks...'}
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-rose-400 truncate max-w-sm">
                              {item.error}
                            </span>
                          )}
                          {res && (
                            <>
                              <span>·</span>
                              <span className="text-rose-400">
                                {res.flawsCount.critical} Crit
                              </span>
                              <span>·</span>
                              <span className="text-amber-400">
                                {res.flawsCount.high} High
                              </span>
                              <span>·</span>
                              <span>{res.flawsCount.total} total flaws</span>
                              <span>·</span>
                              <span>{res.responseTimeMs}ms</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {res && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onViewDetailedResult(res);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Open Audit</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => generateAuditPdf(res, language)}
                            title="Export PDF"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {!isProcessing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remove target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Sequential queue execution prevents target rate-limiting and conserves client resources.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
