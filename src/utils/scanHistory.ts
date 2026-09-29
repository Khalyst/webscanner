import type { ScanResult } from '../types/scanner';

export interface HistoryScanEntry {
  id: string;
  url: string;
  hostname: string;
  overallScore: number;
  securityGrade: string;
  flawsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scanTimestamp: string;
  responseTimeMs: number;
  subdomainsCount?: number;
  scanResult: ScanResult;
}

const STORAGE_KEY = 'webscanner_scan_history_v1';
const MAX_HISTORY_ITEMS = 25;

export function getScanHistory(): HistoryScanEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Failed to parse scan history from localStorage:', err);
    return [];
  }
}

export function saveScanToHistory(scan: ScanResult): HistoryScanEntry[] {
  try {
    const current = getScanHistory();
    // Filter out previous scan of exact same hostname to avoid duplicates, keeping newest
    const filtered = current.filter(
      (item) => item.hostname.toLowerCase() !== scan.hostname.toLowerCase()
    );

    const newEntry: HistoryScanEntry = {
      id: scan.id,
      url: scan.url,
      hostname: scan.hostname,
      overallScore: scan.overallScore,
      securityGrade: scan.securityGrade,
      flawsCount: {
        critical: scan.flawsCount.critical,
        high: scan.flawsCount.high,
        medium: scan.flawsCount.medium,
        low: scan.flawsCount.low,
      },
      scanTimestamp: scan.scanTimestamp,
      responseTimeMs: scan.responseTimeMs,
      subdomainsCount: scan.subdomains?.totalFound ?? 0,
      scanResult: scan,
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save scan to localStorage:', err);
    return getScanHistory();
  }
}

export function removeScanFromHistory(id: string): HistoryScanEntry[] {
  try {
    const current = getScanHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to remove scan from history:', err);
    return getScanHistory();
  }
}

export function clearScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear scan history:', err);
  }
}

export function exportHistoryToJson(history: HistoryScanEntry[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `webscanner-history-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportHistoryToCsv(history: HistoryScanEntry[]): void {
  const headers = ['Hostname', 'Target URL', 'Overall Score', 'Grade', 'Critical Flaws', 'High Flaws', 'Medium Flaws', 'Low Flaws', 'Latency (ms)', 'Scan Timestamp'];
  const rows = history.map((item) => [
    `"${item.hostname}"`,
    `"${item.url}"`,
    item.overallScore,
    `"${item.securityGrade}"`,
    item.flawsCount.critical,
    item.flawsCount.high,
    item.flawsCount.medium,
    item.flawsCount.low,
    item.responseTimeMs,
    `"${item.scanTimestamp}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `webscanner-history-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
