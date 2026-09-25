import type { ScanResult } from '../types/scanner';

export const SAMPLE_SCAN_RESULT: ScanResult = {
  id: 'SCAN-SAMPLE-AUDIT',
  url: 'https://insecure-example.org',
  hostname: 'insecure-example.org',
  ip: '198.51.100.42',
  scanTimestamp: new Date().toISOString(),
  scanDurationMs: 1420,
  httpStatus: 200,
  finalUrl: 'https://insecure-example.org',
  httpsRedirects: true,
  responseTimeMs: 184,
  overallScore: 58,
  securityGrade: 'C',
  flawsCount: {
    critical: 1,
    high: 2,
    medium: 3,
    low: 2,
    info: 1,
    total: 9,
  },
  passedChecksCount: 5,
  flaws: [
    {
      id: 'FLAW-1',
      title: 'Missing Content-Security-Policy (CSP) Header',
      category: 'HEADERS',
      severity: 'HIGH',
      cvssScore: 7.5,
      owaspCategory: 'A03:2021 Injection',
      description:
        'Content-Security-Policy is completely absent from HTTP response headers. The browser has no boundary restrictions for script execution.',
      impact:
        'If any persistent or reflected Cross-Site Scripting (XSS) vulnerability exists, attackers can execute arbitrary JavaScript to hijack user session tokens and exfiltrate credentials.',
      evidence: 'Header Content-Security-Policy not returned',
      remediation:
        "Define a strict Content-Security-Policy starting with default-src 'self' and disallow unsafe-inline scripts.",
      remediationCode: {
        nginx:
          "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none';\" always;",
        apache:
          'Header set Content-Security-Policy "default-src \'self\'; script-src \'self\'; object-src \'none\'; frame-ancestors \'none\';"',
        express: 'app.use(helmet.contentSecurityPolicy());',
        cloudflare: 'Add Transform Rule: Set response header Content-Security-Policy',
      },
    },
    {
      id: 'FLAW-2',
      title: 'Missing HTTP Strict-Transport-Security (HSTS) Header',
      category: 'HEADERS',
      severity: 'HIGH',
      cvssScore: 7.2,
      owaspCategory: 'A02:2021 Cryptographic Failures',
      description:
        'The server does not send the Strict-Transport-Security header to mandate HTTPS connections in client browsers.',
      impact:
        'Users are susceptible to SSL-stripping and active Man-in-the-Middle (MitM) downgrade attacks on untrusted networks.',
      remediation:
        'Enforce HSTS with a 1-year max-age, includeSubDomains, and preload directives.',
      remediationCode: {
        nginx:
          'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
        apache:
          'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
        express: 'app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));',
      },
    },
    {
      id: 'FLAW-3',
      title: 'Missing Anti-Clickjacking Protection (X-Frame-Options)',
      category: 'HEADERS',
      severity: 'MEDIUM',
      cvssScore: 5.7,
      owaspCategory: 'A05:2021 Security Misconfiguration',
      description:
        'Neither X-Frame-Options nor CSP frame-ancestors is present to restrict framing within external origins.',
      impact:
        'Malicious third-party sites can embed the application in an invisible iframe to conduct UI redressing (Clickjacking) attacks.',
      remediation: 'Configure X-Frame-Options: DENY or SAMEORIGIN.',
      remediationCode: {
        nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
        apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
        express: 'app.use(helmet.frameguard({ action: "sameorigin" }));',
      },
    },
    {
      id: 'FLAW-4',
      title: "Dangerous Public Service Port Open: Port 3306 (MySQL Database)",
      category: 'PORTS',
      severity: 'CRITICAL',
      cvssScore: 9.3,
      owaspCategory: 'A05:2021 Security Misconfiguration',
      description:
        'Port 3306 is open and accepting direct TCP handshakes on public IP 198.51.100.42.',
      impact:
        'Direct database access exposes customer records, credentials, and business data to brute-force credential stuffing and exploitation.',
      evidence: 'IP 198.51.100.42:3306 (STATE: OPEN)',
      remediation:
        'Rebind MySQL daemon strictly to 127.0.0.1 or configure cloud firewall rules to deny all 0.0.0.0/0 ingress.',
    },
    {
      id: 'FLAW-5',
      title: 'Missing DMARC Email Authentication Policy Record',
      category: 'DNS_EMAIL',
      severity: 'MEDIUM',
      cvssScore: 5.2,
      owaspCategory: 'A05:2021 Security Misconfiguration',
      description:
        'No DMARC TXT record was located at _dmarc.insecure-example.org. Mail recipients have no guidance on rejecting forged messages.',
      impact:
        'Adversaries can forge executive emails originating from your domain with high deliverability into user inboxes.',
      remediation:
        'Add a TXT record to _dmarc with "v=DMARC1; p=quarantine; rua=mailto:dmarc@insecure-example.org".',
    },
    {
      id: 'FLAW-6',
      title: "Server Software Version Disclosed: 'Apache/2.4.41 (Ubuntu)'",
      category: 'INFO_DISCLOSURE',
      severity: 'LOW',
      cvssScore: 4.1,
      owaspCategory: 'A05:2021 Security Misconfiguration',
      description:
        'The Server HTTP header leaks exact package and distribution details (Apache/2.4.41).',
      impact:
        'Enables automated vulnerability scanners to map version-specific CVE exploit modules against the server.',
      evidence: 'Server: Apache/2.4.41 (Ubuntu)',
      remediation: 'Set ServerTokens Prod and ServerSignature Off in Apache configuration.',
      remediationCode: {
        apache: 'ServerTokens Prod\nServerSignature Off',
      },
    },
  ],
  headersAudit: [
    {
      header: 'Strict-Transport-Security',
      present: false,
      status: 'FAIL',
      recommendation: 'Add: max-age=31536000; includeSubDomains; preload',
      description: 'Enforces HTTPS connections and immunizes against SSL-stripping attacks.',
      severity: 'HIGH',
    },
    {
      header: 'Content-Security-Policy',
      present: false,
      status: 'FAIL',
      recommendation: "Deploy policy starting with default-src 'self'",
      description: 'Mitigates Cross-Site Scripting (XSS) and data injection vulnerabilities.',
      severity: 'HIGH',
    },
    {
      header: 'X-Frame-Options',
      present: false,
      status: 'FAIL',
      recommendation: 'Add: X-Frame-Options: SAMEORIGIN',
      description: 'Protects visitors against Clickjacking and UI redressing.',
      severity: 'MEDIUM',
    },
    {
      header: 'X-Content-Type-Options',
      present: true,
      value: 'nosniff',
      status: 'PASS',
      recommendation: 'Good: MIME sniffing disabled.',
      description: 'Prevents browsers from interpreting uploads as executable scripts.',
      severity: 'INFO',
    },
    {
      header: 'Referrer-Policy',
      present: true,
      value: 'strict-origin-when-cross-origin',
      status: 'PASS',
      recommendation: 'Good: Referrer header disclosure restricted.',
      description: 'Controls referrer information included with requests.',
      severity: 'INFO',
    },
  ],
  sslInfo: {
    valid: true,
    issuer: {
      organization: "Let's Encrypt",
      commonName: 'R3',
      country: 'US',
    },
    subject: {
      commonName: 'insecure-example.org',
    },
    validFrom: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    validTo: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
    daysRemaining: 60,
    expired: false,
    protocol: 'TLSv1.3',
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (TLSv1.3)',
    sans: ['insecure-example.org', 'www.insecure-example.org'],
    authorized: true,
  },
  dnsRecords: {
    a: ['198.51.100.42'],
    aaaa: ['2001:db8::42'],
    mx: [{ exchange: 'mail.insecure-example.org', priority: 10 }],
    ns: ['ns1.insecure-example.org', 'ns2.insecure-example.org'],
    spf: {
      valid: true,
      policy: 'SOFT',
      record: 'v=spf1 include:_spf.google.com ~all',
      details: 'Configured with SOFT fail policy (~all)',
    },
    dmarc: {
      valid: false,
      policy: 'MISSING',
      details: 'No DMARC record found at _dmarc.insecure-example.org',
    },
    dnssec: false,
  },
  cookies: [
    {
      name: 'session_id',
      secure: false,
      httpOnly: false,
      sameSite: 'Lax',
      issues: ['Missing Secure attribute', 'Missing HttpOnly attribute'],
    },
  ],
  techStack: [
    { name: 'Apache/2.4.41', category: 'Server' },
    { name: 'Ubuntu Linux', category: 'Server' },
    { name: 'PHP 8.0', category: 'Language' },
    {
      name: 'WordPress 5.8',
      category: 'CMS',
      cves: [
        {
          cveId: 'CVE-2022-21661',
          summary: 'WordPress SQL Injection via WP_Query parameters',
          severity: 'HIGH',
        },
      ],
    },
  ],
  ports: [
    { port: 80, service: 'HTTP', open: true, risk: 'SAFE', description: 'Web traffic' },
    { port: 443, service: 'HTTPS', open: true, risk: 'SAFE', description: 'Encrypted web' },
    { port: 22, service: 'SSH', open: true, risk: 'WARNING', description: 'Remote management shell' },
    { port: 3306, service: 'MySQL Database', open: true, risk: 'CRITICAL', description: 'Relational database exposed publicly' },
  ],
  sensitiveEndpoints: [],
  robotsTxt: {
    exists: true,
    disallowedPaths: ['/wp-admin/', '/private/', '/backup/'],
    sitemaps: ['https://insecure-example.org/sitemap.xml'],
  },
  securityTxt: {
    exists: false,
  },
  aiAnalysis: {
    executiveSummary:
      'The automated security scan for insecure-example.org revealed an overall security posture score of 58/100 (Grade C). The endpoint has an open public database port and lacks primary defense-in-depth HTTP security headers (CSP, HSTS), creating high vulnerability exposure.',
    attackSurfaceOverview:
      'The external attack surface has multiple high-risk exposure vectors: public exposure of port 3306 (MySQL), missing Content-Security-Policy enabling XSS exploitation, and absence of email DMARC enforcement.',
    topThreatVectors: [
      'Automated brute-force or credential stuffing targeting the publicly exposed MySQL database service on port 3306.',
      'Cross-Site Scripting (XSS) amplification resulting from missing Content-Security-Policy headers on web endpoints.',
      'Executive email spoofing and phishing campaigns exploiting the absence of DMARC policy validation.',
    ],
    remediationRoadmap: [
      {
        step: 1,
        action: 'Immediately firewall or bind port 3306 (MySQL) strictly to 127.0.0.1.',
        priority: 'CRITICAL',
        estimatedEffort: '< 30 mins',
      },
      {
        step: 2,
        action: 'Deploy Strict-Transport-Security (HSTS) with max-age=31536000 and includeSubDomains.',
        priority: 'HIGH',
        estimatedEffort: '1 hour',
      },
      {
        step: 3,
        action: "Implement Content-Security-Policy (CSP) enforcing default-src 'self'.",
        priority: 'HIGH',
        estimatedEffort: '2-4 hours',
      },
      {
        step: 4,
        action: 'Publish a DMARC policy record (p=quarantine) at _dmarc.insecure-example.org.',
        priority: 'MEDIUM',
        estimatedEffort: '1 hour',
      },
    ],
    complianceNotes: {
      owaspTop10: 'Violates OWASP A05:2021 (Security Misconfiguration) and A01:2021 (Broken Access Control).',
      pciDss: 'Fails PCI-DSS Requirement 1 (firewall protection) and Requirement 4 (transmission encryption).',
      iso27001: 'Non-compliant with ISO/IEC 27001:2022 Control A.8.20 and A.8.26.',
    },
  },
};
