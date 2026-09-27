import type { BulkQueueItem, BulkScanSummary } from '../types/scanner';

export function normalizeTargetUrl(input: string): string {
  let cleaned = input.trim();
  if (!cleaned) return '';
  // Remove trailing slashes and quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

export function parseBulkInputText(text: string): string[] {
  if (!text) return [];
  // Split on newlines, commas, semicolons, tabs, and spaces
  const rawTokens = text.split(/[\r\n,;\t]+/);
  const seen = new Set<string>();
  const results: string[] = [];

  for (const token of rawTokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    // Skip comment lines in file formats
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
    // Remove quotes
    const cleaned = trimmed.replace(/^["']|["']$/g, '');
    if (!cleaned) continue;

    const normalized = normalizeTargetUrl(cleaned);
    try {
      const parsed = new URL(normalized);
      // Valid domain must contain a dot or be localhost
      if (parsed.hostname && (parsed.hostname.includes('.') || parsed.hostname === 'localhost')) {
        const canonical = parsed.origin;
        if (!seen.has(canonical.toLowerCase())) {
          seen.add(canonical.toLowerCase());
          results.push(canonical);
        }
      }
    } catch {
      // Ignore invalid URL strings
    }
  }

  return results;
}

export function parseBulkFileContent(fileContent: string, fileName?: string): string[] {
  const isJson = fileName?.toLowerCase().endsWith('.json') || (fileContent.trim().startsWith('[') && fileContent.trim().endsWith(']'));
  
  if (isJson) {
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        const extracted: string[] = [];
        for (const item of parsed) {
          if (typeof item === 'string') {
            extracted.push(item);
          } else if (item && typeof item === 'object') {
            const possibleUrl = item.url || item.domain || item.target || item.hostname || item.host;
            if (typeof possibleUrl === 'string') extracted.push(possibleUrl);
          }
        }
        return parseBulkInputText(extracted.join('\n'));
      }
    } catch {
      // Fallback to text parsing
    }
  }

  return parseBulkInputText(fileContent);
}

export function computeBulkSummary(items: BulkQueueItem[]): BulkScanSummary {
  let completed = 0;
  let failed = 0;
  let inProgress = 0;
  let pending = 0;
  let totalScoreSum = 0;
  let scoredCount = 0;
  let criticalFlaws = 0;
  let highFlaws = 0;
  let totalFlaws = 0;

  for (const item of items) {
    if (item.status === 'completed' && item.result) {
      completed++;
      totalScoreSum += item.result.overallScore;
      scoredCount++;
      criticalFlaws += item.result.flawsCount.critical;
      highFlaws += item.result.flawsCount.high;
      totalFlaws += item.result.flawsCount.total;
    } else if (item.status === 'error') {
      failed++;
    } else if (item.status === 'scanning') {
      inProgress++;
    } else if (item.status === 'pending') {
      pending++;
    }
  }

  return {
    total: items.length,
    completed,
    failed,
    inProgress,
    pending,
    averageScore: scoredCount > 0 ? Math.round(totalScoreSum / scoredCount) : undefined,
    criticalFlaws,
    highFlaws,
    totalFlaws,
  };
}

export function exportBulkReportCsv(items: BulkQueueItem[]): string {
  const headers = [
    'Target URL',
    'Hostname',
    'Status',
    'Overall Score',
    'Grade',
    'Critical Flaws',
    'High Flaws',
    'Medium Flaws',
    'Low Flaws',
    'Total Flaws',
    'HTTPS Enforced',
    'SSL Valid',
    'HTTP Status',
    'Response Time (ms)',
    'Top Identified Flaws',
  ];

  const escapeCsv = (val: any) => {
    const s = String(val ?? '');
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows = items.map((item) => {
    const res = item.result;
    if (!res) {
      return [
        escapeCsv(item.url),
        escapeCsv(item.normalizedUrl),
        escapeCsv(item.status),
        escapeCsv(item.error || 'N/A'),
        'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A',
      ].join(',');
    }

    const topFlaws = res.flaws.slice(0, 3).map((f) => `[${f.severity}] ${f.title}`).join(' | ');

    return [
      escapeCsv(res.url),
      escapeCsv(res.hostname),
      escapeCsv(item.status),
      res.overallScore,
      escapeCsv(res.securityGrade),
      res.flawsCount.critical,
      res.flawsCount.high,
      res.flawsCount.medium,
      res.flawsCount.low,
      res.flawsCount.total,
      res.httpsRedirects ? 'YES' : 'NO',
      res.sslInfo?.valid ? 'YES' : 'NO',
      res.httpStatus,
      res.responseTimeMs,
      escapeCsv(topFlaws),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function exportBulkReportJson(items: BulkQueueItem[]): string {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    summary: computeBulkSummary(items),
    items: items.map((it) => ({
      id: it.id,
      url: it.url,
      status: it.status,
      error: it.error,
      result: it.result,
    })),
  };
  return JSON.stringify(exportPayload, null, 2);
}
