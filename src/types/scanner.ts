export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityFlaw {
  id: string;
  title: string;
  category: 'HEADERS' | 'SSL_TLS' | 'DNS_EMAIL' | 'INFO_DISCLOSURE' | 'PORTS' | 'COOKIES' | 'RECON' | 'OSINT';
  severity: Severity;
  cvssScore: number;
  owaspCategory?: string;
  description: string;
  impact: string;
  evidence?: string;
  remediation: string;
  remediationCode?: {
    nginx?: string;
    apache?: string;
    express?: string;
    cloudflare?: string;
  };
}

export interface HeaderCheckResult {
  header: string;
  present: boolean;
  value?: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  recommendation: string;
  description: string;
  severity: Severity;
}

export interface SslInfo {
  valid: boolean;
  issuer: {
    commonName?: string;
    organization?: string;
    country?: string;
  };
  subject: {
    commonName?: string;
    organization?: string;
  };
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  expired: boolean;
  protocol: string;
  cipherSuite: string;
  sans: string[];
  authorized: boolean;
  authorizationError?: string;
}

export interface DnsRecords {
  a?: string[];
  aaaa?: string[];
  mx?: Array<{ exchange: string; priority: number }>;
  txt?: string[];
  ns?: string[];
  cname?: string[];
  soa?: {
    nsname: string;
    hostmaster: string;
    serial: number;
  };
  spf?: {
    record?: string;
    valid: boolean;
    policy: 'STRICT' | 'SOFT' | 'PERMISSIVE' | 'MISSING';
    details: string;
  };
  dmarc?: {
    record?: string;
    valid: boolean;
    policy: 'REJECT' | 'QUARANTINE' | 'NONE' | 'MISSING';
    details: string;
  };
  dnssec: boolean;
}

export interface CookieAudit {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
  path?: string;
  issues: string[];
}

export interface TechStackItem {
  name: string;
  category: 'Server' | 'Language' | 'Framework' | 'CMS' | 'CDN' | 'Analytics' | 'Security';
  version?: string;
  icon?: string;
  cves?: Array<{
    cveId: string;
    summary: string;
    severity: Severity;
  }>;
}

export interface PortCheck {
  port: number;
  service: string;
  open: boolean;
  risk: 'SAFE' | 'WARNING' | 'CRITICAL';
  description: string;
}

export interface SensitiveEndpointCheck {
  path: string;
  status: number;
  accessible: boolean;
  risk: Severity;
  description: string;
  snippet?: string;
}

export type AiProviderId = 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'mistral' | 'offline' | 'custom';

export interface CustomAiConfig {
  providerName?: string;
  model: string;
  baseUrl: string;
  apiKey?: string;
}

export interface AiProviderInfo {
  id: AiProviderId;
  name: string;
  defaultModel: string;
  availableModels: string[];
  isConfigured: boolean;
  isLocal: boolean;
  description: string;
}

export interface AiAnalysis {
  provider?: AiProviderId;
  providerName?: string;
  modelUsed?: string;
  warning?: string;
  fallbackReason?: string;
  executiveSummary: string;
  attackSurfaceOverview: string;
  topThreatVectors: string[];
  remediationRoadmap: Array<{
    step: number;
    action: string;
    priority: Severity;
    estimatedEffort: string;
  }>;
  complianceNotes: {
    owaspTop10: string;
    pciDss: string;
    iso27001: string;
  };
}

export interface BulkQueueItem {
  id: string;
  url: string;
  normalizedUrl: string;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  progressStep?: string;
  result?: ScanResult;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface BulkScanSummary {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
  averageScore?: number;
  criticalFlaws: number;
  highFlaws: number;
  totalFlaws: number;
}

export interface ScanResult {
  id: string;
  url: string;
  hostname: string;
  ip?: string;
  scanTimestamp: string;
  scanDurationMs: number;
  httpStatus: number;
  finalUrl: string;
  httpsRedirects: boolean;
  responseTimeMs: number;
  
  // Security Scoring
  overallScore: number; // 0 - 100
  securityGrade: SecurityGrade;
  flawsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  passedChecksCount: number;

  // Subsystem Audits
  flaws: SecurityFlaw[];
  headersAudit: HeaderCheckResult[];
  sslInfo?: SslInfo;
  dnsRecords: DnsRecords;
  cookies: CookieAudit[];
  techStack: TechStackItem[];
  ports: PortCheck[];
  sensitiveEndpoints: SensitiveEndpointCheck[];
  robotsTxt?: {
    exists: boolean;
    disallowedPaths: string[];
    sitemaps: string[];
    raw?: string;
  };
  securityTxt?: {
    exists: boolean;
    contact?: string;
    encryption?: string;
    raw?: string;
  };
  aiAnalysis?: AiAnalysis;
  subdomains?: SubdomainAudit;
  softwareUpdates?: SoftwareUpdateAudit;
}

export type SoftwareUpdateStatus = 'CRITICAL_UPDATE_REQUIRED' | 'UPDATE_RECOMMENDED' | 'UP_TO_DATE' | 'UNKNOWN_VERSION';

export interface SoftwareUpdateItem {
  id: string;
  name: string;
  category: 'Server' | 'CMS' | 'Framework' | 'Runtime' | 'Database' | 'Library';
  detectedVersion?: string;
  latestVersion: string;
  isOutdated: boolean;
  isEndOfLife?: boolean;
  status: SoftwareUpdateStatus;
  releaseDate?: string;
  daysOutdated?: number;
  cves: Array<{
    cveId: string;
    summary: string;
    severity: Severity;
    cvssScore?: number;
  }>;
  riskSummary: string;
  remediation: {
    commandGuide: string;
    cliCommands: {
      debianUbuntu?: string;
      rhelCentos?: string;
      docker?: string;
      generic?: string;
    };
    patchAdvisoryUrl?: string;
  };
}

export interface SoftwareUpdateAudit {
  totalComponents: number;
  outdatedCount: number;
  criticalUpdatesCount: number;
  items: SoftwareUpdateItem[];
  overallStatus: 'CRITICAL_ACTION_REQUIRED' | 'UPDATES_PENDING' | 'SECURE';
  generatedAt: string;
  patchScript: string;
}

export interface AdminAlertPayload {
  targetUrl: string;
  hostname: string;
  adminEmail?: string;
  webhookUrl?: string;
  channel: 'slack' | 'discord' | 'email' | 'webhook';
  alertSeverity: 'CRITICAL' | 'HIGH' | 'ALL';
  criticalFlawsCount: number;
  highFlawsCount: number;
  outdatedUpdatesCount: number;
  overallScore: number;
  securityGrade: string;
  vulnerabilities: Array<{
    title: string;
    severity: string;
    category: string;
    description: string;
    remediation: string;
  }>;
  missingUpdates: Array<{
    name: string;
    detectedVersion?: string;
    latestVersion: string;
    status: string;
    remediation: string;
  }>;
  remediationScript: string;
  timestamp: string;
}

export type SubdomainCategory = 'DEV_STAGING' | 'ADMIN_PORTAL' | 'API_SERVICE' | 'INFRASTRUCTURE' | 'STORAGE' | 'GENERAL';

export interface SubdomainEntry {
  subdomain: string;
  loggedAt?: string;
  issuerName?: string;
  isWildcard: boolean;
  category: SubdomainCategory;
  resolvedIp?: string;
  isResolving?: boolean;
}

export interface SubdomainAudit {
  domain: string;
  queriedAt: string;
  totalFound: number;
  uniqueSubdomains: string[];
  subdomains: SubdomainEntry[];
  categoriesCount: {
    devStaging: number;
    adminPortal: number;
    apiService: number;
    infrastructure: number;
    storage: number;
    general: number;
  };
  hasWildcardCerts: boolean;
  source: string;
}

export type McpServerType = 'builtin' | 'sse' | 'http';

export interface McpToolParameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: any;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  serverName: string;
  serverId: string;
  category: 'OSINT' | 'RECON' | 'NETWORK' | 'INTELLIGENCE' | 'CUSTOM';
  parameters: McpToolParameter[];
}

export interface McpServerConfig {
  id: string;
  name: string;
  type: McpServerType;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  latencyMs?: number;
  description: string;
  toolsCount: number;
  isBuiltin: boolean;
  apiKey?: string;
  lastConnected?: string;
}

export interface McpToolCallRequest {
  serverId: string;
  toolName: string;
  arguments: Record<string, any>;
}

export interface McpToolCallResponse {
  success: boolean;
  result?: any;
  error?: string;
  executionTimeMs: number;
  toolName: string;
  serverId: string;
}
