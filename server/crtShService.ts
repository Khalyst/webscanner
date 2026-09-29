import dns from 'dns';
import type { SubdomainAudit, SubdomainCategory, SubdomainEntry } from '../src/types/scanner.ts';

interface CrtShRecord {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
}

// Extract base or search domain
export function extractRootDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split(':')[0];
  cleaned = cleaned.replace(/^\.+|\.+$/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    // Check for common second-level domains e.g. co.uk, com.au, org.uk
    const sldList = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br', 'co.za', 'com.sg', 'edu.au', 'gov.uk'];
    const lastTwo = parts.slice(-2).join('.');
    if (sldList.includes(lastTwo) && parts.length > 2) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }
  return cleaned;
}

export function categorizeSubdomain(name: string): SubdomainCategory {
  const lower = name.toLowerCase();
  if (/(^|\.)(dev|stage|staging|test|qa|uat|beta|demo|sandbox|lab|preview|canary|poc|preprod)(\.|$)/i.test(lower)) {
    return 'DEV_STAGING';
  }
  if (/(^|\.)(admin|portal|cpanel|whm|webmail|login|signin|dashboard|internal|corp|vpn|manage|auth0|keycloak|sso|gateway|bastion)(\.|$)/i.test(lower)) {
    return 'ADMIN_PORTAL';
  }
  if (/(^|\.)(api|graphql|rest|ws|socket|service|rpc|backend|node|identity)(\.|$)/i.test(lower)) {
    return 'API_SERVICE';
  }
  if (/(^|\.)(mail|smtp|pop|imap|mx|ns\d*|dns\d*|router|fw|firewall|ssh|proxy|relay)(\.|$)/i.test(lower)) {
    return 'INFRASTRUCTURE';
  }
  if (/(^|\.)(s3|bucket|storage|cdn|static|assets|media|files|upload|img|images|download)(\.|$)/i.test(lower)) {
    return 'STORAGE';
  }
  return 'GENERAL';
}

// Quick DNS resolver with timeout
async function resolveIpWithTimeout(hostname: string, timeoutMs = 1200): Promise<{ isResolving: boolean; resolvedIp?: string }> {
  return new Promise((resolve) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve({ isResolving: false });
      }
    }, timeoutMs);

    dns.promises.lookup(hostname)
      .then((res) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve({ isResolving: true, resolvedIp: res.address });
        }
      })
      .catch(() => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve({ isResolving: false });
        }
      });
  });
}

export async function queryCrtShSubdomains(inputDomain: string): Promise<SubdomainAudit> {
  const rootDomain = extractRootDomain(inputDomain);
  const nowIso = new Date().toISOString();

  const audit: SubdomainAudit = {
    domain: rootDomain,
    queriedAt: nowIso,
    totalFound: 0,
    uniqueSubdomains: [],
    subdomains: [],
    categoriesCount: {
      devStaging: 0,
      adminPortal: 0,
      apiService: 0,
      infrastructure: 0,
      storage: 0,
      general: 0,
    },
    hasWildcardCerts: false,
    source: 'crt.sh (Certificate Transparency Logs)',
  };

  if (!rootDomain || !rootDomain.includes('.')) {
    return audit;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const crtUrl = `https://crt.sh/?q=%.${encodeURIComponent(rootDomain)}&output=json`;
    const res = await fetch(crtUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (SecurityScanner/1.0; OSINT Recon Agent)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.log(`[crt.sh] HTTP ${res.status} returned for domain ${rootDomain}`);
      return audit;
    }

    const records = (await res.json()) as CrtShRecord[];
    if (!Array.isArray(records)) {
      return audit;
    }

    const subdomainMap = new Map<string, {
      loggedAt?: string;
      issuerName?: string;
      isWildcard: boolean;
    }>();

    for (const rec of records) {
      const rawNames = (rec.name_value || rec.common_name || '').split('\n');
      for (let raw of rawNames) {
        raw = raw.trim().toLowerCase();
        if (!raw) continue;

        let isWildcard = false;
        if (raw.startsWith('*.')) {
          isWildcard = true;
          raw = raw.slice(2);
          audit.hasWildcardCerts = true;
        }

        // Must end with root domain
        if (!raw.endsWith(rootDomain) && raw !== rootDomain) {
          continue;
        }

        // Avoid invalid characters
        if (!/^[a-z0-9.-]+$/.test(raw)) {
          continue;
        }

        const existing = subdomainMap.get(raw);
        if (!existing) {
          subdomainMap.set(raw, {
            loggedAt: rec.entry_timestamp || rec.not_before,
            issuerName: rec.issuer_name,
            isWildcard,
          });
        } else if (isWildcard) {
          existing.isWildcard = true;
        }
      }
    }

    const uniqueList = Array.from(subdomainMap.keys()).sort((a, b) => {
      // Prioritize high-value categories
      const catA = categorizeSubdomain(a);
      const catB = categorizeSubdomain(b);
      const priority = { DEV_STAGING: 1, ADMIN_PORTAL: 2, API_SERVICE: 3, INFRASTRUCTURE: 4, STORAGE: 5, GENERAL: 6 };
      return priority[catA] - priority[catB];
    });

    audit.totalFound = uniqueList.length;
    audit.uniqueSubdomains = uniqueList;

    // Probe active DNS resolution for up to the first 25 priority subdomains
    const subdomainsToProbe = uniqueList.slice(0, 25);
    const probePromises = subdomainsToProbe.map(async (sub) => {
      const meta = subdomainMap.get(sub);
      const dnsResult = await resolveIpWithTimeout(sub, 1000);
      const category = categorizeSubdomain(sub);

      return {
        subdomain: sub,
        loggedAt: meta?.loggedAt,
        issuerName: meta?.issuerName,
        isWildcard: !!meta?.isWildcard,
        category,
        isResolving: dnsResult.isResolving,
        resolvedIp: dnsResult.resolvedIp,
      } as SubdomainEntry;
    });

    const probedEntries = await Promise.all(probePromises);

    // Remaining entries (unprobed for performance)
    const remainingEntries: SubdomainEntry[] = uniqueList.slice(25).map((sub) => {
      const meta = subdomainMap.get(sub);
      return {
        subdomain: sub,
        loggedAt: meta?.loggedAt,
        issuerName: meta?.issuerName,
        isWildcard: !!meta?.isWildcard,
        category: categorizeSubdomain(sub),
      };
    });

    audit.subdomains = [...probedEntries, ...remainingEntries];

    // Compute category counts
    for (const item of audit.subdomains) {
      switch (item.category) {
        case 'DEV_STAGING':
          audit.categoriesCount.devStaging++;
          break;
        case 'ADMIN_PORTAL':
          audit.categoriesCount.adminPortal++;
          break;
        case 'API_SERVICE':
          audit.categoriesCount.apiService++;
          break;
        case 'INFRASTRUCTURE':
          audit.categoriesCount.infrastructure++;
          break;
        case 'STORAGE':
          audit.categoriesCount.storage++;
          break;
        case 'GENERAL':
          audit.categoriesCount.general++;
          break;
      }
    }

    return audit;
  } catch (err: any) {
    console.log(`[crt.sh] Passive reconnaissance failed for ${rootDomain}: ${err?.message || err}`);
    return audit;
  }
}
