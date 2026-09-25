import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import tls from 'tls';
import net from 'net';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type {
  ScanResult,
  SecurityFlaw,
  HeaderCheckResult,
  SslInfo,
  DnsRecords,
  CookieAudit,
  TechStackItem,
  PortCheck,
  SensitiveEndpointCheck,
  AiAnalysis,
  SecurityGrade,
  Severity,
} from './src/types/scanner.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check for private/internal IPs to prevent SSRF
function isPrivateIp(ip: string): boolean {
  if (!ip) return false;
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}

// Port probe helper
function probePort(host: string, port: number, timeout = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpen = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      isOpen = true;
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// TLS inspection helper
function inspectTlsCertificate(hostname: string, port = 443, timeout = 3000): Promise<SslInfo | null> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          const authError = socket.authorizationError;
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol() || 'TLSv1.2';

          if (!cert || !cert.valid_to) {
            socket.destroy();
            resolve(null);
            return;
          }

          const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString() : '';
          const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString() : '';
          const validToDate = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.round((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const expired = daysRemaining <= 0;

          // Parse SANs
          let sans: string[] = [];
          if (cert.subjectaltname) {
            sans = cert.subjectaltname.split(',').map((s) => s.trim().replace(/^DNS:/, ''));
          }

          const toCertStr = (v: string | string[] | undefined): string | undefined =>
            Array.isArray(v) ? v.join(', ') : v;

          socket.destroy();
          resolve({
            valid: authorized && !expired,
            issuer: {
              commonName: toCertStr(cert.issuer?.CN),
              organization: toCertStr(cert.issuer?.O),
              country: toCertStr(cert.issuer?.C),
            },
            subject: {
              commonName: toCertStr(cert.subject?.CN),
              organization: toCertStr(cert.subject?.O),
            },
            validFrom,
            validTo,
            daysRemaining,
            expired,
            protocol,
            cipherSuite: cipher ? `${cipher.name} (${cipher.standardName || cipher.version})` : 'Unknown',
            sans,
            authorized,
            authorizationError: authError ? String(authError) : undefined,
          });
        } catch {
          socket.destroy();
          resolve(null);
        }
      }
    );

    socket.on('error', () => {
      socket.destroy();
      resolve(null);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 6000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Main Scan API
app.post('/api/scan', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let { url: inputUrl, deepAiScan = true, lang = 'en' } = req.body;

  if (!inputUrl || typeof inputUrl !== 'string') {
    res.status(400).json({ error: 'Valid URL is required' });
    return;
  }

  // Normalize URL
  inputUrl = inputUrl.trim();
  let targetProtocol = 'https:';
  if (inputUrl.startsWith('http://')) {
    targetProtocol = 'http:';
  } else if (!inputUrl.startsWith('https://')) {
    inputUrl = 'https://' + inputUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Basic SSRF protection
  if (isPrivateIp(hostname)) {
    res.status(400).json({ error: 'Scanning localhost or private subnets is prohibited.' });
    return;
  }

  const flaws: SecurityFlaw[] = [];
  let flawCounter = 1;
  const addFlaw = (flaw: Omit<SecurityFlaw, 'id'>) => {
    flaws.push({
      ...flaw,
      id: `FLAW-${flawCounter++}`,
    });
  };

  try {
    // 1. DNS Reconnaissance
    const dnsRecords: DnsRecords = {
      dnssec: false,
    };
    let resolvedIp: string | undefined;

    try {
      const aRecords = await dns.promises.resolve4(hostname).catch(() => []);
      if (aRecords.length > 0) {
        dnsRecords.a = aRecords;
        resolvedIp = aRecords[0];
        if (isPrivateIp(resolvedIp)) {
          res.status(400).json({ error: 'Host resolves to private IP address.' });
          return;
        }
      }
    } catch {
      // Continue
    }

    try {
      const aaaaRecords = await dns.promises.resolve6(hostname).catch(() => []);
      if (aaaaRecords.length > 0) dnsRecords.aaaa = aaaaRecords;
    } catch {
      // Continue
    }

    try {
      const mxRecords = await dns.promises.resolveMx(hostname).catch(() => []);
      if (mxRecords.length > 0) {
        dnsRecords.mx = mxRecords.map((m) => ({ exchange: m.exchange, priority: m.priority }));
      }
    } catch {
      // Continue
    }

    try {
      const nsRecords = await dns.promises.resolveNs(hostname).catch(() => []);
      if (nsRecords.length > 0) dnsRecords.ns = nsRecords;
    } catch {
      // Continue
    }

    try {
      const cnameRecords = await dns.promises.resolveCname(hostname).catch(() => []);
      if (cnameRecords.length > 0) dnsRecords.cname = cnameRecords;
    } catch {
      // Continue
    }

    try {
      const soaRecord = await dns.promises.resolveSoa(hostname).catch(() => null);
      if (soaRecord) {
        dnsRecords.soa = {
          nsname: soaRecord.nsname,
          hostmaster: soaRecord.hostmaster,
          serial: soaRecord.serial,
        };
      }
    } catch {
      // Continue
    }

    // TXT records, SPF and DMARC
    try {
      const txtRecords = await dns.promises.resolveTxt(hostname).catch(() => []);
      const flatTxt = txtRecords.map((t) => t.join(''));
      dnsRecords.txt = flatTxt;

      const spfRecord = flatTxt.find((t) => t.startsWith('v=spf1'));
      if (spfRecord) {
        let policy: 'STRICT' | 'SOFT' | 'PERMISSIVE' | 'MISSING' = 'SOFT';
        if (spfRecord.includes('-all')) policy = 'STRICT';
        else if (spfRecord.includes('~all')) policy = 'SOFT';
        else if (spfRecord.includes('+all') || spfRecord.includes('?all')) policy = 'PERMISSIVE';

        dnsRecords.spf = {
          record: spfRecord,
          valid: true,
          policy,
          details: `Configured with ${policy} policy (${spfRecord.slice(0, 60)}${spfRecord.length > 60 ? '...' : ''})`,
        };

        if (policy === 'PERMISSIVE') {
          addFlaw({
            title: 'Permissive SPF Record (+all or ?all)',
            category: 'DNS_EMAIL',
            severity: 'MEDIUM',
            cvssScore: 5.3,
            owaspCategory: 'A05:2021 Security Misconfiguration',
            description: 'The SPF record allows any host to send mail on behalf of this domain, facilitating email spoofing and phishing attacks.',
            impact: 'Attackers can impersonate your domain in phishing emails with high deliverability.',
            evidence: spfRecord,
            remediation: 'Change SPF qualifier mechanism to -all (hard fail) or ~all (soft fail).',
          });
        }
      } else {
        dnsRecords.spf = {
          valid: false,
          policy: 'MISSING',
          details: 'No SPF TXT record discovered for domain.',
        };
        addFlaw({
          title: 'Missing SPF Email Authentication Record',
          category: 'DNS_EMAIL',
          severity: 'MEDIUM',
          cvssScore: 5.0,
          owaspCategory: 'A05:2021 Security Misconfiguration',
          description: 'No Sender Policy Framework (SPF) record was detected for this domain. Any mail server can forge emails purporting to originate from this domain.',
          impact: 'Increases susceptibility to CEO fraud, brand impersonation, and phishing scams targeting clients or staff.',
          remediation: 'Add a TXT record to your root DNS zone: "v=spf1 include:_spf.yourprovider.com ~all".',
        });
      }

      // Check DMARC
      try {
        const dmarcTxt = await dns.promises.resolveTxt(`_dmarc.${hostname}`).catch(() => []);
        const dmarcRecord = dmarcTxt.map((t) => t.join('')).find((t) => t.startsWith('v=DMARC1'));
        if (dmarcRecord) {
          let policy: 'REJECT' | 'QUARANTINE' | 'NONE' | 'MISSING' = 'NONE';
          if (/p=reject/i.test(dmarcRecord)) policy = 'REJECT';
          else if (/p=quarantine/i.test(dmarcRecord)) policy = 'QUARANTINE';
          else if (/p=none/i.test(dmarcRecord)) policy = 'NONE';

          dnsRecords.dmarc = {
            record: dmarcRecord,
            valid: true,
            policy,
            details: `DMARC policy configured to ${policy}`,
          };

          if (policy === 'NONE') {
            addFlaw({
              title: 'Weak DMARC Policy (p=none)',
              category: 'DNS_EMAIL',
              severity: 'LOW',
              cvssScore: 3.7,
              owaspCategory: 'A05:2021 Security Misconfiguration',
              description: 'The DMARC policy is set to monitoring-only (p=none), meaning fraudulent spoofed emails will not be rejected or quarantined by recipient mail servers.',
              impact: 'Unauthenticated emails will still be delivered to recipient inboxes.',
              evidence: dmarcRecord,
              remediation: 'Transition DMARC policy to p=quarantine or p=reject once mail sources have been verified.',
            });
          }
        } else {
          dnsRecords.dmarc = {
            valid: false,
            policy: 'MISSING',
            details: 'No DMARC record found at _dmarc.' + hostname,
          };
          addFlaw({
            title: 'Missing DMARC Policy Record',
            category: 'DNS_EMAIL',
            severity: 'MEDIUM',
            cvssScore: 5.2,
            owaspCategory: 'A05:2021 Security Misconfiguration',
            description: 'No DMARC record found. DMARC enables domain owners to specify how unauthenticated emails should be handled and receive delivery telemetry.',
            impact: 'Domain can be spoofed in executive spear-phishing campaigns without visibility.',
            remediation: 'Publish a TXT record at _dmarc.' + hostname + ' with "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@' + hostname + '".',
          });
        }
      } catch {
        dnsRecords.dmarc = {
          valid: false,
          policy: 'MISSING',
          details: 'Failed to query _dmarc.' + hostname,
        };
      }
    } catch {
      // Continue
    }

    // 2. HTTP Redirection & HTTPS enforcement check
    let httpsRedirects = false;
    try {
      const httpRes = await fetchWithTimeout(`http://${hostname}`, {
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WEBSCANNER/1.0',
        },
      });
      const location = httpRes.headers.get('location') || '';
      if ([301, 302, 307, 308].includes(httpRes.status) && location.startsWith('https://')) {
        httpsRedirects = true;
      } else {
        addFlaw({
          title: 'Insecure Plaintext HTTP Allowed (No Strict HTTPS Redirect)',
          category: 'SSL_TLS',
          severity: 'HIGH',
          cvssScore: 7.4,
          owaspCategory: 'A02:2021 Cryptographic Failures',
          description: 'The server does not automatically redirect plain HTTP traffic on port 80 to encrypted HTTPS. Communication can be intercepted or modified in transit.',
          impact: 'Adversaries on local networks or ISPs can conduct Man-in-the-Middle (MitM) eavesdropping, session hijacking, or inject malicious scripts.',
          evidence: `HTTP Status: ${httpRes.status}, Location: ${location || 'None'}`,
          remediation: 'Configure server to return 301 Permanent Redirect for all HTTP requests to HTTPS.',
          remediationCode: {
            nginx: 'server {\n  listen 80;\n  server_name ' + hostname + ';\n  return 301 https://$host$request_uri;\n}',
            apache: 'RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
          },
        });
      }
    } catch {
      // Server might not listen on port 80 or connection refused
    }

    // 3. TLS / SSL Certificate Deep Audit
    const sslInfo = await inspectTlsCertificate(hostname);
    if (sslInfo) {
      if (!sslInfo.authorized) {
        addFlaw({
          title: 'Untrusted or Self-Signed SSL/TLS Certificate',
          category: 'SSL_TLS',
          severity: 'CRITICAL',
          cvssScore: 9.1,
          owaspCategory: 'A02:2021 Cryptographic Failures',
          description: `The certificate is not trusted by public Certificate Authorities: ${sslInfo.authorizationError || 'Untrusted root CA'}.`,
          impact: 'Users encounter terrifying browser security interstitial warnings. Active traffic interception is trivial without warning verification.',
          evidence: sslInfo.authorizationError,
          remediation: 'Deploy a valid, publicly trusted certificate issued by Let\'s Encrypt, DigiCert, or Cloudflare.',
        });
      } else if (sslInfo.expired) {
        addFlaw({
          title: 'Expired SSL/TLS Certificate',
          category: 'SSL_TLS',
          severity: 'CRITICAL',
          cvssScore: 8.8,
          owaspCategory: 'A02:2021 Cryptographic Failures',
          description: `The SSL certificate expired on ${sslInfo.validTo}. Browsers will terminate TLS connections with invalid cert errors.`,
          impact: 'Complete service denial for HTTPS traffic; browser warning blocks standard visitors.',
          evidence: `Expired ${Math.abs(sslInfo.daysRemaining)} days ago`,
          remediation: 'Renew and reload SSL certificate immediately.',
        });
      } else if (sslInfo.daysRemaining < 15) {
        addFlaw({
          title: 'SSL/TLS Certificate Expiring Imminently',
          category: 'SSL_TLS',
          severity: 'HIGH',
          cvssScore: 6.5,
          owaspCategory: 'A02:2021 Cryptographic Failures',
          description: `The SSL certificate will expire in ${sslInfo.daysRemaining} days (${sslInfo.validTo}).`,
          impact: 'Service disruption if certificate is not renewed before cutoff.',
          evidence: `${sslInfo.daysRemaining} days remaining`,
          remediation: 'Automate renewal with Certbot or host provider auto-renewal.',
        });
      }

      // Check protocol version
      if (sslInfo.protocol === 'TLSv1' || sslInfo.protocol === 'TLSv1.1') {
        addFlaw({
          title: 'Deprecated TLS Protocol Version in Use',
          category: 'SSL_TLS',
          severity: 'HIGH',
          cvssScore: 7.5,
          owaspCategory: 'A02:2021 Cryptographic Failures',
          description: `The server negotiated ${sslInfo.protocol}, which has been officially deprecated by IETF due to known cryptographic weaknesses (BEAST, POODLE).`,
          impact: 'Susceptible to cryptographic downgrade attacks and compliance failure (PCI-DSS violation).',
          evidence: sslInfo.protocol,
          remediation: 'Disable TLS 1.0 and TLS 1.1; enforce TLS 1.2 and TLS 1.3 exclusively.',
          remediationCode: {
            nginx: 'ssl_protocols TLSv1.2 TLSv1.3;\nssl_prefer_server_ciphers on;',
            apache: 'SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1',
          },
        });
      }
    } else {
      addFlaw({
        title: 'TLS/HTTPS Handshake Failed on Port 443',
        category: 'SSL_TLS',
        severity: 'CRITICAL',
        cvssScore: 9.0,
        owaspCategory: 'A02:2021 Cryptographic Failures',
        description: 'Unable to establish secure TLS connection to port 443. The site may not have HTTPS enabled.',
        impact: 'Site cannot provide end-to-end encryption for sensitive visitor credentials or communications.',
        remediation: 'Install and bind an SSL/TLS certificate to port 443.',
      });
    }

    // 4. Primary HTTPS Fetch & Security Headers
    let httpStatus = 0;
    let finalUrl = inputUrl;
    let responseTimeMs = 0;
    const rawHeaders: Record<string, string> = {};
    let responseBody = '';
    const cookieAudits: CookieAudit[] = [];

    try {
      const fetchStart = Date.now();
      const resPrimary = await fetchWithTimeout(inputUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WEBSCANNER/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      responseTimeMs = Date.now() - fetchStart;
      httpStatus = resPrimary.status;
      finalUrl = resPrimary.url || inputUrl;

      // Extract headers
      resPrimary.headers.forEach((val, key) => {
        rawHeaders[key.toLowerCase()] = val;
      });

      // Sample HTML body for tech stack detection (first 100KB)
      try {
        const text = await resPrimary.text();
        responseBody = text.slice(0, 100000);
      } catch {
        // ignore
      }

      // Check cookies
      const rawCookies = resPrimary.headers.get('set-cookie');
      if (rawCookies) {
        const cookieStrings = rawCookies.split(/,(?=[^;]+=[^;]+)/);
        for (const cStr of cookieStrings) {
          const parts = cStr.split(';').map((s) => s.trim());
          const nameValue = parts[0] || '';
          const cName = nameValue.split('=')[0] || 'cookie';
          const isSecure = parts.some((p) => p.toLowerCase() === 'secure');
          const isHttpOnly = parts.some((p) => p.toLowerCase() === 'httponly');
          const sameSitePart = parts.find((p) => p.toLowerCase().startsWith('samesite='));
          const sameSite = sameSitePart ? sameSitePart.split('=')[1] : undefined;

          const issues: string[] = [];
          if (!isSecure) issues.push('Missing Secure attribute');
          if (!isHttpOnly) issues.push('Missing HttpOnly attribute');
          if (!sameSite) issues.push('Missing SameSite attribute');

          cookieAudits.push({
            name: cName,
            secure: isSecure,
            httpOnly: isHttpOnly,
            sameSite,
            issues,
          });

          if (!isSecure) {
            addFlaw({
              title: `Cookie '${cName}' Missing 'Secure' Attribute`,
              category: 'COOKIES',
              severity: 'MEDIUM',
              cvssScore: 5.4,
              owaspCategory: 'A05:2021 Security Misconfiguration',
              description: `The cookie '${cName}' lacks the Secure flag, allowing it to be transmitted unencrypted if an HTTP request is made.`,
              impact: 'Network eavesdroppers can capture session authentication tokens in plaintext over untrusted WiFi.',
              remediation: 'Append "; Secure" to the Set-Cookie header directive.',
            });
          }

          if (!isHttpOnly) {
            addFlaw({
              title: `Cookie '${cName}' Missing 'HttpOnly' Attribute`,
              category: 'COOKIES',
              severity: 'LOW',
              cvssScore: 4.3,
              owaspCategory: 'A05:2021 Security Misconfiguration',
              description: `The cookie '${cName}' does not set the HttpOnly flag, making it accessible to client-side document.cookie JavaScript API.`,
              impact: 'If a Cross-Site Scripting (XSS) vulnerability exists, the attacker can trivially exfiltrate user session cookies.',
              remediation: 'Append "; HttpOnly" to the Set-Cookie header directive.',
            });
          }
        }
      }
    } catch (err: any) {
      httpStatus = 0;
      addFlaw({
        title: 'Target Web Application Unreachable',
        category: 'RECON',
        severity: 'HIGH',
        cvssScore: 7.0,
        owaspCategory: 'A05:2021 Security Misconfiguration',
        description: `Failed to connect to web endpoint ${inputUrl}: ${err?.message || 'Connection error'}.`,
        impact: 'Service is down or blocking scanner requests.',
        remediation: 'Verify DNS records, firewall ingress rules, and web server daemon state.',
      });
    }

    // 5. Evaluate HTTP Security Headers
    const headersAudit: HeaderCheckResult[] = [];

    // HSTS
    const hsts = rawHeaders['strict-transport-security'];
    if (hsts) {
      const hasSubdomains = /includesubdomains/i.test(hsts);
      const hasPreload = /preload/i.test(hsts);
      const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;

      if (maxAge >= 15768000) {
        headersAudit.push({
          header: 'Strict-Transport-Security',
          present: true,
          value: hsts,
          status: 'PASS',
          recommendation: 'Good: Strong HSTS policy enforced.',
          description: 'Enforces HTTPS and prevents SSL-stripping man-in-the-middle attacks.',
          severity: 'INFO',
        });
      } else {
        headersAudit.push({
          header: 'Strict-Transport-Security',
          present: true,
          value: hsts,
          status: 'WARN',
          recommendation: 'Increase max-age to at least 31536000 (1 year) and include subdomains.',
          description: 'HSTS max-age is lower than recommended 6-12 months.',
          severity: 'LOW',
        });
        addFlaw({
          title: 'HSTS max-age Duration Too Low',
          category: 'HEADERS',
          severity: 'LOW',
          cvssScore: 3.1,
          owaspCategory: 'A05:2021 Security Misconfiguration',
          description: `Strict-Transport-Security max-age is ${maxAge}s, which is below the recommended 31536000s (1 year).`,
          impact: 'Clients revert to insecure HTTP sooner if they have not visited recently.',
          evidence: hsts,
          remediation: 'Set: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
          remediationCode: {
            nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
            apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
          },
        });
      }
    } else {
      headersAudit.push({
        header: 'Strict-Transport-Security',
        present: false,
        status: 'FAIL',
        recommendation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        description: 'Enforces HTTPS connections and immunizes against SSL-stripping MitM attacks.',
        severity: 'HIGH',
      });
      addFlaw({
        title: 'Missing HTTP Strict-Transport-Security (HSTS) Header',
        category: 'HEADERS',
        severity: 'HIGH',
        cvssScore: 7.2,
        owaspCategory: 'A02:2021 Cryptographic Failures',
        description: 'HSTS instructs browsers to exclusively load the site via HTTPS, refusing any fallback to plaintext HTTP even if linked.',
        impact: 'Users are vulnerable to SSL-stripping tools (e.g. sslstrip), DNS spoofing, and rogue public Wi-Fi access points.',
        remediation: 'Send the Strict-Transport-Security header on all HTTPS responses.',
        remediationCode: {
          nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
          apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
          express: 'app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));',
        },
      });
    }

    // Content-Security-Policy (CSP)
    const csp = rawHeaders['content-security-policy'];
    if (csp) {
      const hasUnsafeInline = csp.includes("'unsafe-inline'");
      const hasUnsafeEval = csp.includes("'unsafe-eval'");
      const hasWildcard = csp.includes('*');

      if (hasUnsafeInline || hasUnsafeEval) {
        headersAudit.push({
          header: 'Content-Security-Policy',
          present: true,
          value: csp.slice(0, 100) + '...',
          status: 'WARN',
          recommendation: "Avoid 'unsafe-inline' or 'unsafe-eval'; migrate to nonces or SHA-256 hashes.",
          description: 'CSP is present but contains permissive directives that reduce XSS resistance.',
          severity: 'MEDIUM',
        });
        addFlaw({
          title: "Permissive CSP Directives Detected ('unsafe-inline' or 'unsafe-eval')",
          category: 'HEADERS',
          severity: 'MEDIUM',
          cvssScore: 5.8,
          owaspCategory: 'A03:2021 Injection',
          description: "The Content-Security-Policy allows 'unsafe-inline' or 'unsafe-eval', enabling inline script injection.",
          impact: 'Substantially reduces browser protection against Cross-Site Scripting (XSS) attacks.',
          evidence: csp.slice(0, 120),
          remediation: 'Refactor inline scripts to external modules with cryptographic nonces or hashes.',
        });
      } else {
        headersAudit.push({
          header: 'Content-Security-Policy',
          present: true,
          value: csp.slice(0, 80) + '...',
          status: 'PASS',
          recommendation: 'Good: Restrictive Content-Security-Policy implemented.',
          description: 'Mitigates Cross-Site Scripting (XSS) and data injection attacks.',
          severity: 'INFO',
        });
      }
    } else {
      headersAudit.push({
        header: 'Content-Security-Policy',
        present: false,
        status: 'FAIL',
        recommendation: "Add: default-src 'self'; script-src 'self'; object-src 'none';",
        description: 'Restricts sources from which scripts, styles, and media can be loaded.',
        severity: 'HIGH',
      });
      addFlaw({
        title: 'Missing Content-Security-Policy (CSP) Header',
        category: 'HEADERS',
        severity: 'HIGH',
        cvssScore: 7.5,
        owaspCategory: 'A03:2021 Injection',
        description: 'Content-Security-Policy (CSP) is the single most effective browser defense against Cross-Site Scripting (XSS) and data exfiltration.',
        impact: 'If any XSS flaw exists on the application, injected script payloads execute unrestricted with access to DOM, cookies, and tokens.',
        remediation: "Deploy a Content-Security-Policy starting with default-src 'self' and restrict object-src 'none'.",
        remediationCode: {
          nginx: 'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\'; object-src \'none\'; frame-ancestors \'none\';" always;',
          apache: 'Header set Content-Security-Policy "default-src \'self\'; script-src \'self\'; object-src \'none\'; frame-ancestors \'none\';"',
          express: "app.use(helmet.contentSecurityPolicy());",
        },
      });
    }

    // X-Frame-Options
    const xfo = rawHeaders['x-frame-options'];
    const cspHasFrameAncestors = csp && csp.includes('frame-ancestors');
    if (xfo || cspHasFrameAncestors) {
      headersAudit.push({
        header: 'X-Frame-Options',
        present: true,
        value: xfo || 'Protected via CSP frame-ancestors',
        status: 'PASS',
        recommendation: 'Good: Clickjacking protection active.',
        description: 'Prevents the site from being rendered inside an iframe on malicious origins.',
        severity: 'INFO',
      });
    } else {
      headersAudit.push({
        header: 'X-Frame-Options',
        present: false,
        status: 'FAIL',
        recommendation: 'Add: X-Frame-Options: DENY or SAMEORIGIN',
        description: 'Protects visitors against Clickjacking and UI redressing attacks.',
        severity: 'MEDIUM',
      });
      addFlaw({
        title: 'Missing Anti-Clickjacking Protection (X-Frame-Options / frame-ancestors)',
        category: 'HEADERS',
        severity: 'MEDIUM',
        cvssScore: 5.7,
        owaspCategory: 'A05:2021 Security Misconfiguration',
        description: 'The site does not restrict framing via X-Frame-Options or CSP frame-ancestors. Malicious websites can overlay transparent iframes.',
        impact: 'Attackers can trick authenticated users into clicking buttons or executing unwanted state-changing transactions (Clickjacking).',
        remediation: 'Configure X-Frame-Options: DENY or SAMEORIGIN.',
        remediationCode: {
          nginx: 'add_header X-Frame-Options "DENY" always;',
          apache: 'Header always set X-Frame-Options "DENY"',
          express: 'app.use(helmet.frameguard({ action: "deny" }));',
        },
      });
    }

    // X-Content-Type-Options
    const xcto = rawHeaders['x-content-type-options'];
    if (xcto && xcto.toLowerCase().includes('nosniff')) {
      headersAudit.push({
        header: 'X-Content-Type-Options',
        present: true,
        value: xcto,
        status: 'PASS',
        recommendation: 'Good: MIME sniffing disabled.',
        description: 'Prevents browsers from MIME-sniffing a response away from declared content-type.',
        severity: 'INFO',
      });
    } else {
      headersAudit.push({
        header: 'X-Content-Type-Options',
        present: false,
        status: 'FAIL',
        recommendation: 'Add: X-Content-Type-Options: nosniff',
        description: 'Forces browser to strictly respect declared Content-Type, mitigating MIME confusion exploits.',
        severity: 'LOW',
      });
      addFlaw({
        title: "Missing 'X-Content-Type-Options: nosniff' Header",
        category: 'HEADERS',
        severity: 'LOW',
        cvssScore: 4.0,
        owaspCategory: 'A05:2021 Security Misconfiguration',
        description: 'Without nosniff, older or lax browsers may execute text/plain or image uploads as JavaScript if HTML/JS tags are discovered inside.',
        impact: 'Can enable Cross-Site Scripting (XSS) via user-uploaded media or avatars.',
        remediation: 'Add X-Content-Type-Options: nosniff to all responses.',
        remediationCode: {
          nginx: 'add_header X-Content-Type-Options "nosniff" always;',
          apache: 'Header always set X-Content-Type-Options "nosniff"',
        },
      });
    }

    // Referrer-Policy
    const refPolicy = rawHeaders['referrer-policy'];
    if (refPolicy) {
      headersAudit.push({
        header: 'Referrer-Policy',
        present: true,
        value: refPolicy,
        status: 'PASS',
        recommendation: 'Good: Referrer header disclosure restricted.',
        description: 'Controls how much referrer information should be included with requests.',
        severity: 'INFO',
      });
    } else {
      headersAudit.push({
        header: 'Referrer-Policy',
        present: false,
        status: 'WARN',
        recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin',
        description: 'Protects sensitive URL query parameters (tokens, IDs) from leaking to 3rd party domains.',
        severity: 'LOW',
      });
      addFlaw({
        title: 'Missing Referrer-Policy Header',
        category: 'HEADERS',
        severity: 'LOW',
        cvssScore: 3.4,
        owaspCategory: 'A05:2021 Security Misconfiguration',
        description: 'Without a Referrer-Policy, the browser might transmit full path and query strings to external domains clicked by the user.',
        impact: 'Accidental leakage of secret tokens, session identifiers, or PII contained in URL parameters.',
        remediation: 'Set Referrer-Policy: strict-origin-when-cross-origin.',
        remediationCode: {
          nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
          apache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
        },
      });
    }

    // Permissions-Policy
    const permPolicy = rawHeaders['permissions-policy'] || rawHeaders['feature-policy'];
    if (permPolicy) {
      headersAudit.push({
        header: 'Permissions-Policy',
        present: true,
        value: permPolicy.slice(0, 70) + (permPolicy.length > 70 ? '...' : ''),
        status: 'PASS',
        recommendation: 'Good: Browser APIs restricted via Permissions-Policy.',
        description: 'Controls which browser features (camera, microphone, geolocation) can be invoked.',
        severity: 'INFO',
      });
    } else {
      headersAudit.push({
        header: 'Permissions-Policy',
        present: false,
        status: 'WARN',
        recommendation: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()',
        description: 'Disables sensitive device hardware APIs if not needed.',
        severity: 'LOW',
      });
      addFlaw({
        title: 'Missing Permissions-Policy Header',
        category: 'HEADERS',
        severity: 'LOW',
        cvssScore: 2.8,
        owaspCategory: 'A05:2021 Security Misconfiguration',
        description: 'No Permissions-Policy defined to restrict embedded frames or scripts from requesting sensitive hardware APIs (webcam, mic, accelerometer, geolocation).',
        impact: 'Third-party advertising widgets or embedded scripts could prompt users for hardware permissions.',
        remediation: 'Specify Permissions-Policy: camera=(), microphone=(), geolocation=().',
      });
    }

    // Cross-Origin-Opener-Policy (COOP)
    const coop = rawHeaders['cross-origin-opener-policy'];
    if (coop) {
      headersAudit.push({
        header: 'Cross-Origin-Opener-Policy',
        present: true,
        value: coop,
        status: 'PASS',
        recommendation: 'Good: COOP isolates browsing context.',
        description: 'Mitigates Spectre-style cross-origin data leakage.',
        severity: 'INFO',
      });
    } else {
      headersAudit.push({
        header: 'Cross-Origin-Opener-Policy',
        present: false,
        status: 'WARN',
        recommendation: 'Consider: Cross-Origin-Opener-Policy: same-origin',
        description: 'Isolates top-level document from cross-origin popup windows.',
        severity: 'LOW',
      });
    }

    // 6. Technology & Server Fingerprinting + Info Disclosure
    const techStack: TechStackItem[] = [];

    // Check Server banner
    const serverHeader = rawHeaders['server'];
    if (serverHeader) {
      techStack.push({
        name: serverHeader,
        category: 'Server',
      });

      // Does it leak specific version? (e.g. Apache/2.4.41 or nginx/1.18.0)
      if (/\d+\.\d+/.test(serverHeader)) {
        addFlaw({
          title: `Server Version Disclosure in HTTP Header: '${serverHeader}'`,
          category: 'INFO_DISCLOSURE',
          severity: 'LOW',
          cvssScore: 4.1,
          owaspCategory: 'A05:2021 Security Misconfiguration',
          description: `The web server explicitly broadcasts its exact software version in the 'Server' header: ${serverHeader}.`,
          impact: 'Allows malicious actors to lookup version-specific CVE vulnerabilities and automate targeted exploit payloads.',
          evidence: `Server: ${serverHeader}`,
          remediation: 'Disable server signature tokens in production configuration.',
          remediationCode: {
            nginx: 'server_tokens off;',
            apache: 'ServerTokens Prod\nServerSignature Off',
          },
        });
      }
    }

    // Check X-Powered-By
    const poweredBy = rawHeaders['x-powered-by'];
    if (poweredBy) {
      techStack.push({
        name: poweredBy,
        category: 'Framework',
      });
      addFlaw({
        title: `Backend Technology Leaked via 'X-Powered-By: ${poweredBy}'`,
        category: 'INFO_DISCLOSURE',
        severity: 'LOW',
        cvssScore: 4.3,
        owaspCategory: 'A05:2021 Security Misconfiguration',
        description: `The application reveals its underlying runtime or framework (${poweredBy}) via the X-Powered-By header.`,
        impact: 'Facilitates technology fingerprinting and reconnaissance for framework-specific 0-day or 1-day vulnerabilities.',
        evidence: `X-Powered-By: ${poweredBy}`,
        remediation: 'Suppress or strip the X-Powered-By header in application or proxy settings.',
        remediationCode: {
          express: 'app.disable("x-powered-by");',
          apache: 'Header unset X-Powered-By',
          nginx: 'proxy_hide_header X-Powered-By;',
        },
      });
    }

    // Detect CDN / Cloud WAF
    if (rawHeaders['cf-ray'] || rawHeaders['cf-cache-status']) {
      techStack.push({ name: 'Cloudflare', category: 'CDN' });
    }
    if (rawHeaders['x-amz-cf-id'] || rawHeaders['x-amz-cf-pop']) {
      techStack.push({ name: 'AWS CloudFront', category: 'CDN' });
    }
    if (rawHeaders['x-fastly-request-id']) {
      techStack.push({ name: 'Fastly', category: 'CDN' });
    }
    if (rawHeaders['x-akamai-transformed']) {
      techStack.push({ name: 'Akamai', category: 'CDN' });
    }

    // HTML Body inspection for CMS / frameworks
    if (responseBody) {
      if (responseBody.includes('wp-content') || responseBody.includes('wp-includes')) {
        techStack.push({
          name: 'WordPress',
          category: 'CMS',
          cves: [
            {
              cveId: 'CVE-2023-2745',
              summary: 'WordPress Core directory traversal & privilege escalation vulnerabilities',
              severity: 'HIGH',
            },
          ],
        });
      }
      if (responseBody.includes('Drupal.settings') || responseBody.includes('drupal.js')) {
        techStack.push({ name: 'Drupal', category: 'CMS' });
      }
      if (responseBody.includes('Shopify.theme') || responseBody.includes('cdn.shopify.com')) {
        techStack.push({ name: 'Shopify', category: 'CMS' });
      }
      if (responseBody.includes('_next/static') || responseBody.includes('__NEXT_DATA__')) {
        techStack.push({ name: 'Next.js', category: 'Framework' });
      }
      if (responseBody.includes('react-root') || responseBody.includes('data-reactroot')) {
        techStack.push({ name: 'React', category: 'Framework' });
      }

      // Check generator meta tag
      const generatorMatch = responseBody.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
      if (generatorMatch && generatorMatch[1]) {
        techStack.push({
          name: generatorMatch[1],
          category: 'CMS',
        });
        addFlaw({
          title: `CMS Version Leaked via HTML Generator Meta Tag`,
          category: 'INFO_DISCLOSURE',
          severity: 'LOW',
          cvssScore: 3.5,
          owaspCategory: 'A05:2021 Security Misconfiguration',
          description: `The page exposes software and version details in an HTML meta tag: "${generatorMatch[1]}".`,
          impact: 'Automated crawlers easily index outdated instances for mass automated exploitation.',
          evidence: generatorMatch[0],
          remediation: 'Remove the generator tag from the site header templates.',
        });
      }
    }

    // 7. Sensitive Endpoints & robots.txt / security.txt Check
    const sensitiveEndpoints: SensitiveEndpointCheck[] = [];
    let robotsTxtData: ScanResult['robotsTxt'];
    let securityTxtData: ScanResult['securityTxt'];

    // Check robots.txt
    try {
      const robotsRes = await fetchWithTimeout(`https://${hostname}/robots.txt`, {}, 3000);
      if (robotsRes.ok) {
        const text = await robotsRes.text();
        const lines = text.split('\n');
        const disallowed = lines
          .filter((l) => l.trim().toLowerCase().startsWith('disallow:'))
          .map((l) => l.split(':')[1]?.trim() || '')
          .filter(Boolean);
        const sitemaps = lines
          .filter((l) => l.trim().toLowerCase().startsWith('sitemap:'))
          .map((l) => l.split(':').slice(1).join(':').trim())
          .filter(Boolean);

        robotsTxtData = {
          exists: true,
          disallowedPaths: disallowed.slice(0, 20),
          sitemaps: sitemaps.slice(0, 5),
          raw: text.slice(0, 800),
        };

        // Check if sensitive admin paths are exposed in robots.txt
        const sensitiveKeywords = ['admin', 'backup', 'portal', 'internal', 'api', 'dashboard', 'private', 'phpmyadmin', 'staging'];
        const exposedSensitive = disallowed.filter((p) => sensitiveKeywords.some((k) => p.toLowerCase().includes(k)));
        if (exposedSensitive.length > 0) {
          addFlaw({
            title: 'Sensitive Administrative Routes Exposed in robots.txt',
            category: 'INFO_DISCLOSURE',
            severity: 'LOW',
            cvssScore: 3.8,
            owaspCategory: 'A01:2021 Broken Access Control',
            description: `The robots.txt file reveals paths to potentially private endpoints: ${exposedSensitive.slice(0, 5).join(', ')}.`,
            impact: 'Attackers inspect robots.txt as an reconnaissance blueprint to locate hidden administrative interfaces.',
            evidence: exposedSensitive.slice(0, 5).join(', '),
            remediation: 'Enforce authentication and network-level access controls rather than relying on robots.txt for obscurity.',
          });
        }
      }
    } catch {
      // Continue
    }

    // Check security.txt (RFC 9116)
    try {
      const secTxtRes = await fetchWithTimeout(`https://${hostname}/.well-known/security.txt`, {}, 3000);
      if (secTxtRes.ok) {
        const text = await secTxtRes.text();
        const contactMatch = text.match(/Contact:\s*([^\n\r]+)/i);
        securityTxtData = {
          exists: true,
          contact: contactMatch ? contactMatch[1].trim() : 'Defined',
          raw: text.slice(0, 500),
        };
      } else {
        securityTxtData = { exists: false };
      }
    } catch {
      securityTxtData = { exists: false };
    }

    // Probe common sensitive files (safe GET checks)
    const probePaths = [
      { path: '/.git/HEAD', risk: 'CRITICAL' as Severity, desc: 'Exposed Git repository metadata allows full source code reconstruction.' },
      { path: '/.env', risk: 'CRITICAL' as Severity, desc: 'Environment configuration file containing database credentials and secret API keys.' },
      { path: '/wp-config.php.bak', risk: 'HIGH' as Severity, desc: 'Backup file containing plaintext database passwords.' },
    ];

    for (const p of probePaths) {
      try {
        const checkRes = await fetchWithTimeout(`https://${hostname}${p.path}`, { method: 'GET' }, 2500);
        if (checkRes.status === 200) {
          const sample = (await checkRes.text()).slice(0, 100);
          const isRealGit = p.path.includes('.git') && sample.includes('ref:');
          const isRealEnv = p.path.includes('.env') && (sample.includes('=') && !sample.includes('<!DOCTYPE'));

          if (isRealGit || isRealEnv) {
            sensitiveEndpoints.push({
              path: p.path,
              status: checkRes.status,
              accessible: true,
              risk: p.risk,
              description: p.desc,
              snippet: sample.slice(0, 60),
            });

            addFlaw({
              title: `High-Risk File Directly Accessible: ${p.path}`,
              category: 'INFO_DISCLOSURE',
              severity: p.risk,
              cvssScore: p.risk === 'CRITICAL' ? 9.8 : 8.2,
              owaspCategory: 'A01:2021 Broken Access Control',
              description: `The file ${p.path} was directly retrieved with HTTP 200 OK.`,
              impact: p.desc,
              evidence: `Path: ${p.path}, Status: 200 OK`,
              remediation: `Block web server access to all dotfiles and backup files matching '.*'.`,
              remediationCode: {
                nginx: 'location ~ /\\.(?!well-known) {\n  deny all;\n  return 404;\n}',
                apache: '<FilesMatch "^\\.">\n  Require all denied\n</FilesMatch>',
              },
            });
          }
        }
      } catch {
        // continue
      }
    }

    // 8. Port & Service Reconnaissance
    const portsToProbe = [
      { port: 80, service: 'HTTP (Web)', risk: 'SAFE' as const, desc: 'Standard plaintext web traffic port' },
      { port: 443, service: 'HTTPS (Encrypted Web)', risk: 'SAFE' as const, desc: 'Standard encrypted web traffic port' },
      { port: 8080, service: 'HTTP-Alt / Proxy', risk: 'WARNING' as const, desc: 'Alternative web port, frequently used for staging or internal proxy' },
      { port: 8443, service: 'HTTPS-Alt / Admin', risk: 'WARNING' as const, desc: 'Alternative secure web/management console' },
      { port: 21, service: 'FTP', risk: 'CRITICAL' as const, desc: 'Unencrypted file transfer service' },
      { port: 22, service: 'SSH', risk: 'WARNING' as const, desc: 'Remote shell management' },
      { port: 3306, service: 'MySQL Database', risk: 'CRITICAL' as const, desc: 'Relational database exposed to the public internet' },
      { port: 5432, service: 'PostgreSQL Database', risk: 'CRITICAL' as const, desc: 'PostgreSQL database exposed directly to public internet' },
    ];

    const portsResult: PortCheck[] = [];
    if (resolvedIp) {
      const probePromises = portsToProbe.map(async (p) => {
        const isOpen = await probePort(resolvedIp!, p.port, 1200);
        return {
          port: p.port,
          service: p.service,
          open: isOpen,
          risk: p.risk,
          description: p.desc,
        };
      });
      const results = await Promise.all(probePromises);
      portsResult.push(...results);

      // Flag dangerous open database or FTP ports
      for (const p of results) {
        if (p.open && (p.port === 3306 || p.port === 5432 || p.port === 21)) {
          addFlaw({
            title: `Dangerous Public Service Port Open: Port ${p.port} (${p.service})`,
            category: 'PORTS',
            severity: 'CRITICAL',
            cvssScore: 9.3,
            owaspCategory: 'A05:2021 Security Misconfiguration',
            description: `Port ${p.port} (${p.service}) was found open and accepting TCP handshakes on public IP ${resolvedIp}.`,
            impact: 'Direct database access exposes critical user records, tables, and credentials to automated credential brute-force or exploitation.',
            evidence: `IP: ${resolvedIp}:${p.port} (State: OPEN)`,
            remediation: 'Bind database daemons strictly to localhost (127.0.0.1) or block external access using cloud firewall security groups.',
          });
        }
      }
    }

    // 9. Compute Overall Security Score & Letter Grade
    let score = 100;
    const flawsCount = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: flaws.length,
    };

    for (const f of flaws) {
      if (f.severity === 'CRITICAL') {
        score -= 25;
        flawsCount.critical++;
      } else if (f.severity === 'HIGH') {
        score -= 15;
        flawsCount.high++;
      } else if (f.severity === 'MEDIUM') {
        score -= 7;
        flawsCount.medium++;
      } else if (f.severity === 'LOW') {
        score -= 3;
        flawsCount.low++;
      } else {
        flawsCount.info++;
      }
    }

    score = Math.max(0, Math.min(100, score));

    let securityGrade: SecurityGrade = 'A';
    if (score >= 95 && flawsCount.critical === 0 && flawsCount.high === 0) securityGrade = 'A+';
    else if (score >= 85 && flawsCount.critical === 0) securityGrade = 'A';
    else if (score >= 70 && flawsCount.critical === 0) securityGrade = 'B';
    else if (score >= 55) securityGrade = 'C';
    else if (score >= 40) securityGrade = 'D';
    else securityGrade = 'F';

    const passedChecksCount = headersAudit.filter((h) => h.status === 'PASS').length + (sslInfo?.valid ? 2 : 0) + (dnsRecords.spf?.valid ? 1 : 0) + (dnsRecords.dmarc?.valid ? 1 : 0);

    // 10. AI Deep Security Analysis via Gemini 3.8 Flash
    let aiAnalysis: AiAnalysis | undefined;

    if (deepAiScan && process.env.GEMINI_API_KEY) {
      try {
        const langNames: Record<string, string> = {
          en: 'English',
          es: 'Spanish',
          fr: 'French',
          de: 'German',
          ja: 'Japanese',
          zh: 'Simplified Chinese',
          pt: 'Portuguese',
          ar: 'Arabic',
        };
        const targetLangName = langNames[lang] || 'English';

        const prompt = `You are a Principal Cybersecurity Penetration Tester and Chief Information Security Officer (CISO).
Analyze this automated vulnerability scan report for domain "${hostname}" (URL: ${finalUrl}).
LANGUAGE REQUIREMENT: Write the entire analysis in ${targetLangName} language so that an international executive reading in ${targetLangName} can understand it immediately.

Audit Summary:
- Security Score: ${score}/100 (Grade: ${securityGrade})
- Total Flaws Found: ${flaws.length} (Critical: ${flawsCount.critical}, High: ${flawsCount.high}, Medium: ${flawsCount.medium}, Low: ${flawsCount.low})
- HTTPS Redirection: ${httpsRedirects ? 'Enforced' : 'Missing'}
- SSL/TLS: ${sslInfo?.valid ? `Valid (${sslInfo.protocol}, ${sslInfo.daysRemaining} days left)` : 'Invalid/Missing'}
- Detected Stack: ${techStack.map((t) => `${t.name} (${t.category})`).join(', ') || 'Standard Web Server'}
- Top Flaws: ${flaws.slice(0, 8).map((f) => `[${f.severity}] ${f.title}`).join('; ')}

Return a comprehensive JSON security executive analysis matching this exact structure (with all strings translated to ${targetLangName}):
{
  "executiveSummary": "Concise high-impact 2-3 sentence CISO summary of posture and risk profile.",
  "attackSurfaceOverview": "2-3 sentences evaluating the exposed attack surface, header hardening, and cryptographic state.",
  "topThreatVectors": [
    "Vector 1 describing primary exploit pathway",
    "Vector 2 describing data exposure or interception risk",
    "Vector 3 describing phishing/spoofing exposure"
  ],
  "remediationRoadmap": [
    {
      "step": 1,
      "action": "Immediate tactical remediation title",
      "priority": "CRITICAL",
      "estimatedEffort": "< 1 hour"
    },
    {
      "step": 2,
      "action": "Next high-priority hardening step",
      "priority": "HIGH",
      "estimatedEffort": "1-2 hours"
    },
    {
      "step": 3,
      "action": "Strategic hardening measure",
      "priority": "MEDIUM",
      "estimatedEffort": "Half day"
    }
  ],
  "complianceNotes": {
    "owaspTop10": "Assessment against OWASP Top 10 vulnerabilities detected",
    "pciDss": "Readiness status regarding PCI-DSS Requirement 4 (cryptography) and 6 (secure systems)",
    "iso27001": "ISO 27001 Annex A.8 technical security control alignment"
  }
}`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = geminiRes.text;
        if (text) {
          aiAnalysis = JSON.parse(text);
        }
      } catch (geminiErr) {
        console.error('Gemini AI synthesis fallback:', geminiErr);
      }
    }

    // Deterministic fallback if Gemini was unavailable or skipped
    if (!aiAnalysis) {
      aiAnalysis = {
        executiveSummary: `The automated audit for ${hostname} yielded a security posture score of ${score}/100 (Grade ${securityGrade}). ${
          flawsCount.critical > 0
            ? 'Critical vulnerability vectors require immediate intervention before exploitation.'
            : flawsCount.high > 0
            ? 'Several high-severity configuration and header flaws increase the external attack surface.'
            : 'The domain demonstrates good baseline hygiene with moderate hardening opportunities in security headers and email policies.'
        }`,
        attackSurfaceOverview: `The endpoint exhibits ${flaws.length} detected flaws across HTTP headers, transport layer encryption, and DNS email authentication. ${
          httpsRedirects ? 'HTTPS is enforced across standard entrypoints.' : 'Plaintext HTTP traffic is unredirected, exposing sessions to MitM interception.'
        }`,
        topThreatVectors: [
          flawsCount.critical > 0
            ? 'Direct exploitation of critical service misconfigurations or exposed sensitive repository/env files.'
            : 'Credential and token theft through Cross-Site Scripting (XSS) due to lack of Content-Security-Policy enforcement.',
          'Man-in-the-Middle (MitM) session stripping on public networks from missing or weak HSTS directives.',
          'Domain spoofing and spear-phishing campaigns leveraging unverified or permissive SPF/DMARC policies.',
        ],
        remediationRoadmap: [
          {
            step: 1,
            action: 'Deploy Strict-Transport-Security (HSTS) with 1-year max-age and includeSubDomains.',
            priority: 'HIGH',
            estimatedEffort: '30 mins',
          },
          {
            step: 2,
            action: 'Implement Content-Security-Policy (CSP) with restrictive script-src and object-src directives.',
            priority: 'HIGH',
            estimatedEffort: '2-4 hours',
          },
          {
            step: 3,
            action: 'Enforce DMARC policy with quarantine or reject mode to prevent brand impersonation.',
            priority: 'MEDIUM',
            estimatedEffort: '1 hour',
          },
          {
            step: 4,
            action: 'Suppress web server and runtime version tokens (Server, X-Powered-By) to prevent automated fingerprinting.',
            priority: 'LOW',
            estimatedEffort: '15 mins',
          },
        ],
        complianceNotes: {
          owaspTop10: `Primary findings correspond to OWASP A05:2021 (Security Misconfiguration) and A02:2021 (Cryptographic Failures).`,
          pciDss: `Requires mandatory TLS 1.2+ configuration, strict HSTS enablement, and removal of exposed administrative endpoints under Requirement 4 & 6.`,
          iso27001: `Aligns with ISO/IEC 27001:2022 Control A.8.20 (Network Security) and A.8.26 (Application Security Requirements).`,
        },
      };
    }

    const scanResult: ScanResult = {
      id: `SCAN-${Date.now().toString(36).toUpperCase()}`,
      url: inputUrl,
      hostname,
      ip: resolvedIp,
      scanTimestamp: new Date().toISOString(),
      scanDurationMs: Date.now() - startTime,
      httpStatus,
      finalUrl,
      httpsRedirects,
      responseTimeMs,
      overallScore: score,
      securityGrade,
      flawsCount,
      passedChecksCount,
      flaws,
      headersAudit,
      sslInfo: sslInfo || undefined,
      dnsRecords,
      cookies: cookieAudits,
      techStack,
      ports: portsResult,
      sensitiveEndpoints,
      robotsTxt: robotsTxtData,
      securityTxt: securityTxtData,
      aiAnalysis,
    };

    res.json(scanResult);
  } catch (err: any) {
    console.error('Scan processing error:', err);
    res.status(500).json({
      error: 'Vulnerability scan processing failed: ' + (err?.message || 'Unknown server error'),
    });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WEBSCANNER server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
