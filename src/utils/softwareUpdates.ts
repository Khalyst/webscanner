import type {
  TechStackItem,
  SoftwareUpdateAudit,
  SoftwareUpdateItem,
  SoftwareUpdateStatus,
  ScanResult,
  AdminAlertPayload,
} from '../types/scanner.ts';

interface KnownSoftwareProfile {
  name: string;
  category: SoftwareUpdateItem['category'];
  latestVersion: string;
  minSecureVersion: string;
  eolVersions?: string[];
  cveAdvisories: Array<{
    appliesToVersionPattern: RegExp;
    cveId: string;
    summary: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    cvssScore: number;
  }>;
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

const KNOWN_SOFTWARE_PROFILES: KnownSoftwareProfile[] = [
  {
    name: 'nginx',
    category: 'Server',
    latestVersion: '1.26.2',
    minSecureVersion: '1.25.3',
    cveAdvisories: [
      {
        appliesToVersionPattern: /1\.(1[0-9]|2[0-4])\./,
        cveId: 'CVE-2023-44487',
        summary: 'HTTP/2 Rapid Reset DDoS vulnerability causing resource exhaustion',
        severity: 'HIGH',
        cvssScore: 7.5,
      },
      {
        appliesToVersionPattern: /1\.(1[0-8])\./,
        cveId: 'CVE-2021-23017',
        summary: '1-byte memory overwrite in resolver component enabling remote code execution',
        severity: 'CRITICAL',
        cvssScore: 9.8,
      },
    ],
    remediation: {
      commandGuide: 'Update nginx packages from official mainline/stable repository or rebuild container base image.',
      cliCommands: {
        debianUbuntu: 'sudo apt update && sudo apt --only-upgrade install nginx',
        rhelCentos: 'sudo dnf upgrade nginx',
        docker: 'docker pull nginx:1.26-alpine && docker compose up -d --force-recreate',
        generic: 'Compile latest source from https://nginx.org/en/download.html',
      },
      patchAdvisoryUrl: 'https://nginx.org/en/security_advisories.html',
    },
  },
  {
    name: 'apache',
    category: 'Server',
    latestVersion: '2.4.62',
    minSecureVersion: '2.4.58',
    cveAdvisories: [
      {
        appliesToVersionPattern: /2\.4\.(49|50)/,
        cveId: 'CVE-2021-41773',
        summary: 'Critical Path Traversal and Remote Code Execution flaw actively exploited in the wild',
        severity: 'CRITICAL',
        cvssScore: 9.8,
      },
      {
        appliesToVersionPattern: /2\.4\.([0-9]|[1-4][0-9]|5[0-7])/,
        cveId: 'CVE-2023-31122',
        summary: 'Out-of-bounds read in mod_macro and potential HTTP request smuggling',
        severity: 'HIGH',
        cvssScore: 7.5,
      },
      {
        appliesToVersionPattern: /2\.[0-2]\./,
        cveId: 'CVE-2017-9798',
        summary: 'Apache 2.2 series is officially End of Life (EOL) with unpatched memory exposure',
        severity: 'CRITICAL',
        cvssScore: 9.1,
      },
    ],
    remediation: {
      commandGuide: 'Upgrade Apache HTTPD daemon to version 2.4.62 or higher and verify mod_security rules.',
      cliCommands: {
        debianUbuntu: 'sudo apt update && sudo apt install --only-upgrade apache2',
        rhelCentos: 'sudo dnf upgrade httpd',
        docker: 'docker pull httpd:2.4.62-alpine && docker compose up -d',
        generic: 'https://httpd.apache.org/download.cgi',
      },
      patchAdvisoryUrl: 'https://httpd.apache.org/security/vulnerabilities_24.html',
    },
  },
  {
    name: 'php',
    category: 'Runtime',
    latestVersion: '8.3.14',
    minSecureVersion: '8.2.0',
    eolVersions: ['5.x', '7.0', '7.1', '7.2', '7.3', '7.4', '8.0'],
    cveAdvisories: [
      {
        appliesToVersionPattern: /(5\.|7\.|8\.0\.)/,
        cveId: 'CVE-2023-3824',
        summary: 'PHP version has reached End-of-Life (EOL). Critical buffer overflow in phar_dir_read allows RCE',
        severity: 'CRITICAL',
        cvssScore: 9.8,
      },
      {
        appliesToVersionPattern: /8\.1\./,
        cveId: 'CVE-2024-4577',
        summary: 'CGI argument injection vulnerability in Windows/Linux environments leading to remote execution',
        severity: 'CRITICAL',
        cvssScore: 9.8,
      },
    ],
    remediation: {
      commandGuide: 'Migrate to active supported PHP 8.2 or 8.3 runtime. Legacy PHP 7.x instances have zero official security patches.',
      cliCommands: {
        debianUbuntu: 'sudo add-apt-repository ppa:ondrej/php -y && sudo apt update && sudo apt install php8.3-fpm php8.3-cli',
        rhelCentos: 'sudo dnf module reset php && sudo dnf module enable php:8.3 && sudo dnf upgrade',
        docker: 'sed -i "s/php:[0-9.]*/php:8.3-fpm/g" Dockerfile',
      },
      patchAdvisoryUrl: 'https://www.php.net/supported-versions.php',
    },
  },
  {
    name: 'wordpress',
    category: 'CMS',
    latestVersion: '6.7.1',
    minSecureVersion: '6.5.0',
    cveAdvisories: [
      {
        appliesToVersionPattern: /(4\.|5\.|6\.[0-4]\.)/,
        cveId: 'CVE-2024-4439',
        summary: 'Stored Cross-Site Scripting via Avatar block affecting older core builds',
        severity: 'HIGH',
        cvssScore: 7.2,
      },
      {
        appliesToVersionPattern: /(4\.|5\.[0-8])/,
        cveId: 'CVE-2022-21661',
        summary: 'SQL Injection in WP_Query via WP_Tax_Query prior to 5.8.3',
        severity: 'CRITICAL',
        cvssScore: 9.8,
      },
    ],
    remediation: {
      commandGuide: 'Execute automated core update using WP-CLI or enable WordPress background security auto-updates.',
      cliCommands: {
        generic: 'wp core update && wp plugin update --all && wp theme update --all',
        docker: 'docker pull wordpress:6.7.1-apache',
      },
      patchAdvisoryUrl: 'https://wordpress.org/news/category/security/',
    },
  },
  {
    name: 'drupal',
    category: 'CMS',
    latestVersion: '10.3.6',
    minSecureVersion: '10.2.0',
    eolVersions: ['7.x', '8.x', '9.x'],
    cveAdvisories: [
      {
        appliesToVersionPattern: /(7\.|8\.|9\.)/,
        cveId: 'CVE-2023-3814',
        summary: 'Legacy Drupal release. Drupal 7 and 8 have reached official End-of-Life',
        severity: 'CRITICAL',
        cvssScore: 9.0,
      },
    ],
    remediation: {
      commandGuide: 'Upgrade Drupal codebase to version 10.x using Composer dependency manager.',
      cliCommands: {
        generic: 'composer update "drupal/core-*" --with-all-dependencies',
      },
      patchAdvisoryUrl: 'https://www.drupal.org/security',
    },
  },
  {
    name: 'next.js',
    category: 'Framework',
    latestVersion: '15.0.3',
    minSecureVersion: '14.2.0',
    cveAdvisories: [
      {
        appliesToVersionPattern: /(1[0-3]\.|14\.0\.|14\.1\.[01])/,
        cveId: 'CVE-2024-34351',
        summary: 'Server Actions SSRF (Server-Side Request Forgery) vulnerability in Next.js prior to 14.1.1',
        severity: 'HIGH',
        cvssScore: 7.5,
      },
    ],
    remediation: {
      commandGuide: 'Update next, react, and react-dom dependencies via npm or pnpm.',
      cliCommands: {
        generic: 'npm install next@latest react@latest react-dom@latest',
      },
      patchAdvisoryUrl: 'https://github.com/vercel/next.js/security/advisories',
    },
  },
  {
    name: 'jquery',
    category: 'Library',
    latestVersion: '3.7.1',
    minSecureVersion: '3.5.0',
    cveAdvisories: [
      {
        appliesToVersionPattern: /(1\.|2\.|3\.[0-4]\.)/,
        cveId: 'CVE-2020-11022',
        summary: 'Cross-Site Scripting (XSS) in jQuery.htmlPrefilter regex parsing even after sanitization',
        severity: 'MEDIUM',
        cvssScore: 6.1,
      },
    ],
    remediation: {
      commandGuide: 'Replace outdated jQuery bundle with jQuery 3.7.1 or migrate DOM queries to modern standard vanilla JavaScript (fetch/querySelector).',
      cliCommands: {
        generic: 'npm install jquery@3.7.1',
      },
      patchAdvisoryUrl: 'https://blog.jquery.com/2020/05/04/jquery-3-5-0-released/',
    },
  },
];

export function auditSoftwareUpdates(
  techStack: TechStackItem[],
  headers: Record<string, string> = {},
  htmlBody = ''
): SoftwareUpdateAudit {
  const items: SoftwareUpdateItem[] = [];

  // 1. Process explicitly detected TechStack items
  for (const tech of techStack) {
    const lowerName = tech.name.toLowerCase();
    const version = tech.version || extractVersionFromName(tech.name);

    // Match against known profile
    const profile = KNOWN_SOFTWARE_PROFILES.find((p) => lowerName.includes(p.name));
    if (profile) {
      const auditItem = evaluateComponent(profile, version || undefined, tech.name);
      if (!items.some((existing) => existing.id === auditItem.id)) {
        items.push(auditItem);
      }
    } else {
      // Generic component entry
      items.push({
        id: `update-${items.length + 1}`,
        name: tech.name,
        category: (tech.category as any) || 'Framework',
        detectedVersion: version || undefined,
        latestVersion: 'Active Release',
        isOutdated: false,
        status: version ? 'UPDATE_RECOMMENDED' : 'UNKNOWN_VERSION',
        cves: tech.cves?.map((c) => ({
          cveId: c.cveId,
          summary: c.summary,
          severity: c.severity,
        })) || [],
        riskSummary: version
          ? `Detected component ${tech.name} (version ${version}). Verify vendor security advisories regularly.`
          : `Component detected. Version signature concealed (security best practice).`,
        remediation: {
          commandGuide: `Ensure ${tech.name} dependencies are pinned to latest security patch levels.`,
          cliCommands: {
            generic: `Check vendor release page for ${tech.name} maintenance advisories.`,
          },
        },
      });
    }
  }

  // 2. Check headers for unlisted components (Server / X-Powered-By)
  const serverHdr = headers['server'] || '';
  if (serverHdr && !items.some((i) => serverHdr.toLowerCase().includes(i.name.toLowerCase()))) {
    for (const profile of KNOWN_SOFTWARE_PROFILES) {
      if (serverHdr.toLowerCase().includes(profile.name)) {
        const v = extractVersionFromString(serverHdr);
        items.push(evaluateComponent(profile, v, serverHdr));
      }
    }
  }

  const poweredBy = headers['x-powered-by'] || '';
  if (poweredBy && !items.some((i) => poweredBy.toLowerCase().includes(i.name.toLowerCase()))) {
    for (const profile of KNOWN_SOFTWARE_PROFILES) {
      if (poweredBy.toLowerCase().includes(profile.name)) {
        const v = extractVersionFromString(poweredBy);
        items.push(evaluateComponent(profile, v, poweredBy));
      }
    }
  }

  // 3. Fallback: If no software was directly fingerprinted, provide standard infrastructure baseline
  if (items.length === 0) {
    items.push({
      id: 'update-baseline',
      name: 'Web Application Server & Runtime',
      category: 'Server',
      detectedVersion: 'Concealed',
      latestVersion: 'Hardened Baseline',
      isOutdated: false,
      status: 'UP_TO_DATE',
      cves: [],
      riskSummary: 'Software version tokens are properly hidden from external HTTP responses, reducing attack surface.',
      remediation: {
        commandGuide: 'Maintain automated Linux OS package updates via unattended-upgrades or container rebuild pipelines.',
        cliCommands: {
          debianUbuntu: 'sudo apt update && sudo apt upgrade -y',
          rhelCentos: 'sudo dnf upgrade -y',
          docker: 'docker compose pull && docker compose up -d',
        },
      },
    });
  }

  const outdatedCount = items.filter((i) => i.isOutdated).length;
  const criticalUpdatesCount = items.filter(
    (i) => i.status === 'CRITICAL_UPDATE_REQUIRED' || i.cves.some((c) => c.severity === 'CRITICAL')
  ).length;

  let overallStatus: SoftwareUpdateAudit['overallStatus'] = 'SECURE';
  if (criticalUpdatesCount > 0) overallStatus = 'CRITICAL_ACTION_REQUIRED';
  else if (outdatedCount > 0) overallStatus = 'UPDATES_PENDING';

  const patchScript = generateBashPatchScript(items);

  return {
    totalComponents: items.length,
    outdatedCount,
    criticalUpdatesCount,
    items,
    overallStatus,
    generatedAt: new Date().toISOString(),
    patchScript,
  };
}

function evaluateComponent(
  profile: KnownSoftwareProfile,
  version: string | undefined,
  rawName: string
): SoftwareUpdateItem {
  let isOutdated = false;
  let isEndOfLife = false;
  let status: SoftwareUpdateStatus = 'UP_TO_DATE';
  const cves: SoftwareUpdateItem['cves'] = [];

  if (version) {
    // Check EOL
    if (profile.eolVersions?.some((eol) => version.startsWith(eol))) {
      isEndOfLife = true;
      isOutdated = true;
      status = 'CRITICAL_UPDATE_REQUIRED';
    }

    // Check CVE matching
    for (const advisory of profile.cveAdvisories) {
      if (advisory.appliesToVersionPattern.test(version)) {
        isOutdated = true;
        cves.push({
          cveId: advisory.cveId,
          summary: advisory.summary,
          severity: advisory.severity,
          cvssScore: advisory.cvssScore,
        });
      }
    }

    if (cves.some((c) => c.severity === 'CRITICAL') || isEndOfLife) {
      status = 'CRITICAL_UPDATE_REQUIRED';
    } else if (cves.length > 0 || isOutdated) {
      status = 'UPDATE_RECOMMENDED';
    }
  } else {
    status = 'UNKNOWN_VERSION';
  }

  let riskSummary = '';
  if (isEndOfLife) {
    riskSummary = `CRITICAL: Detected ${profile.name} ${version} is completely End-of-Life (EOL). No public security patches exist; immediate migration to ${profile.latestVersion} is mandatory.`;
  } else if (cves.length > 0) {
    riskSummary = `VULNERABLE: Detected ${profile.name} ${version} has ${cves.length} known CVE(s). Target is vulnerable to ${cves[0]?.cveId} (${cves[0]?.summary}).`;
  } else if (version) {
    riskSummary = `Component ${profile.name} version ${version} detected. Current stable target is ${profile.latestVersion}.`;
  } else {
    riskSummary = `Component ${profile.name} detected. Server banner does not leak specific version (good practice).`;
  }

  return {
    id: `update-${profile.name}-${Date.now().toString(36)}`,
    name: profile.name.toUpperCase(),
    category: profile.category,
    detectedVersion: version,
    latestVersion: profile.latestVersion,
    isOutdated,
    isEndOfLife,
    status,
    cves,
    riskSummary,
    remediation: profile.remediation,
  };
}

function extractVersionFromName(name: string): string | null {
  const match = name.match(/[\s/v]([0-9]+\.[0-9]+(\.[0-9]+)?)/i);
  return match ? match[1] : null;
}

function extractVersionFromString(str: string): string | undefined {
  const match = str.match(/([0-9]+\.[0-9]+(\.[0-9]+)?)/);
  return match ? match[1] : undefined;
}

export function generateBashPatchScript(items: SoftwareUpdateItem[]): string {
  const commands: string[] = [
    '#!/usr/bin/env bash',
    '# ====================================================================',
    '# WEBSCANNER - Automated Administrator Remediation & Patching Script',
    `# Generated: ${new Date().toISOString()}`,
    '# ====================================================================',
    'set -euo pipefail',
    '',
    'echo "==> [WEBSCANNER] Initiating Security Patch & Hardening Sequence..."',
    '',
    '# 1. Update OS Package Repositories',
    'if command -v apt-get >/dev/null 2>&1; then',
    '    echo "[+] Updating APT packages..."',
    '    sudo apt-get update -y',
  ];

  for (const item of items) {
    if (item.remediation.cliCommands.debianUbuntu) {
      commands.push(`    echo "[+] Patching ${item.name}..."`);
      commands.push(`    ${item.remediation.cliCommands.debianUbuntu}`);
    }
  }

  commands.push('elif command -v dnf >/dev/null 2>&1; then');
  commands.push('    echo "[+] Updating DNF packages..."');

  for (const item of items) {
    if (item.remediation.cliCommands.rhelCentos) {
      commands.push(`    echo "[+] Patching ${item.name}..."`);
      commands.push(`    ${item.remediation.cliCommands.rhelCentos}`);
    }
  }

  commands.push('fi');
  commands.push('');

  // Docker updates
  const dockerCmds = items.filter((i) => i.remediation.cliCommands.docker);
  if (dockerCmds.length > 0) {
    commands.push('# 2. Docker Container Base Image Upgrades');
    commands.push('if command -v docker >/dev/null 2>&1; then');
    for (const item of dockerCmds) {
      commands.push(`    echo "[+] Pulling patched image for ${item.name}..."`);
      commands.push(`    ${item.remediation.cliCommands.docker}`);
    }
    commands.push('fi');
    commands.push('');
  }

  // Generic and CLI commands (e.g. wp-cli, composer, npm)
  const genericCmds = items.filter((i) => i.remediation.cliCommands.generic);
  if (genericCmds.length > 0) {
    commands.push('# 3. Application & CMS Dependency Patching');
    for (const item of genericCmds) {
      commands.push(`echo "[+] Applying application-level updates for ${item.name}..."`);
      commands.push(`${item.remediation.cliCommands.generic}`);
    }
    commands.push('');
  }

  commands.push('echo "==> [SUCCESS] All pending security patches executed."');
  commands.push('echo "==> Please re-run WEBSCANNER audit to verify updated posture score."');

  return commands.join('\n');
}

export function buildAdminAlertPayload(
  scan: ScanResult,
  channel: AdminAlertPayload['channel'] = 'slack',
  adminEmail?: string,
  webhookUrl?: string,
  threshold: AdminAlertPayload['alertSeverity'] = 'HIGH'
): AdminAlertPayload {
  const filteredFlaws = scan.flaws.filter((f) => {
    if (threshold === 'CRITICAL') return f.severity === 'CRITICAL';
    if (threshold === 'HIGH') return f.severity === 'CRITICAL' || f.severity === 'HIGH';
    return true;
  });

  const missingUpdates = scan.softwareUpdates?.items
    .filter((i) => i.isOutdated || i.cves.length > 0)
    .map((i) => ({
      name: i.name,
      detectedVersion: i.detectedVersion,
      latestVersion: i.latestVersion,
      status: i.status,
      remediation: i.remediation.commandGuide,
    })) || [];

  return {
    targetUrl: scan.url,
    hostname: scan.hostname,
    adminEmail,
    webhookUrl,
    channel,
    alertSeverity: threshold,
    criticalFlawsCount: scan.flawsCount.critical,
    highFlawsCount: scan.flawsCount.high,
    outdatedUpdatesCount: missingUpdates.length,
    overallScore: scan.overallScore,
    securityGrade: scan.securityGrade,
    vulnerabilities: filteredFlaws.map((f) => ({
      title: f.title,
      severity: f.severity,
      category: f.category,
      description: f.description,
      remediation: f.remediation,
    })),
    missingUpdates,
    remediationScript: scan.softwareUpdates?.patchScript || '# No patch script generated',
    timestamp: new Date().toISOString(),
  };
}
