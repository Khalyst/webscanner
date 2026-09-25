export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityFlaw {
  id: string;
  title: string;
  category: 'HEADERS' | 'SSL_TLS' | 'DNS_EMAIL' | 'INFO_DISCLOSURE' | 'PORTS' | 'COOKIES' | 'RECON';
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
}
