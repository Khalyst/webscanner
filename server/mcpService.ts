import dns from 'dns';
import { queryCrtShSubdomains, extractRootDomain } from './crtShService.ts';
import type {
  McpServerConfig,
  McpToolCallRequest,
  McpToolCallResponse,
  McpToolDefinition,
} from '../src/types/scanner.ts';

// In-memory registry of MCP servers
const INITIAL_MCP_SERVERS: McpServerConfig[] = [
  {
    id: 'crtsh-builtin',
    name: 'crt.sh Certificate Transparency MCP',
    type: 'builtin',
    endpoint: 'internal://crt.sh-agent',
    status: 'connected',
    latencyMs: 15,
    description: 'Passive Certificate Transparency log aggregator for discovering unlisted subdomains and shadow IT assets.',
    toolsCount: 1,
    isBuiltin: true,
    lastConnected: new Date().toISOString(),
  },
  {
    id: 'wayback-builtin',
    name: 'Wayback Machine Archive MCP',
    type: 'builtin',
    endpoint: 'internal://wayback-cdx-agent',
    status: 'connected',
    latencyMs: 25,
    description: 'Historical URL crawler querying Internet Archive CDX indices to locate exposed backup files (.bak, .sql, .env) and old API endpoints.',
    toolsCount: 1,
    isBuiltin: true,
    lastConnected: new Date().toISOString(),
  },
  {
    id: 'dns-intel-builtin',
    name: 'DNS Intelligence & SPF/DMARC MCP',
    type: 'builtin',
    endpoint: 'internal://dns-intel-agent',
    status: 'connected',
    latencyMs: 12,
    description: 'Inspects passive DNS infrastructure, MX mail routing, SPF/DMARC spoofing protections, and nameserver delegation.',
    toolsCount: 1,
    isBuiltin: true,
    lastConnected: new Date().toISOString(),
  },
  {
    id: 'ip-reputation-builtin',
    name: 'IP & ASN Threat Intelligence MCP',
    type: 'builtin',
    endpoint: 'internal://ip-reputation-agent',
    status: 'connected',
    latencyMs: 18,
    description: 'Checks host IP against bogon ranges, reverse PTR delegation, cloud provider ASN attribution, and threat risk.',
    toolsCount: 1,
    isBuiltin: true,
    lastConnected: new Date().toISOString(),
  },
];

let mcpServers: McpServerConfig[] = [...INITIAL_MCP_SERVERS];

export function getMcpServers(): McpServerConfig[] {
  return mcpServers;
}

export function addOrUpdateMcpServer(config: McpServerConfig): McpServerConfig {
  const existingIndex = mcpServers.findIndex((s) => s.id === config.id);
  if (existingIndex >= 0) {
    mcpServers[existingIndex] = { ...config, lastConnected: new Date().toISOString() };
    return mcpServers[existingIndex];
  } else {
    const newServer = {
      ...config,
      id: config.id || `mcp-srv-${Date.now().toString(36)}`,
      lastConnected: new Date().toISOString(),
    };
    mcpServers.push(newServer);
    return newServer;
  }
}

export function deleteMcpServer(id: string): boolean {
  const index = mcpServers.findIndex((s) => s.id === id);
  if (index >= 0 && !mcpServers[index].isBuiltin) {
    mcpServers.splice(index, 1);
    return true;
  }
  return false;
}

// Built-in MCP Tools Catalog
const BUILTIN_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'discover_subdomains',
    description: 'Query global SSL/TLS Certificate Transparency logs to find all registered subdomains and shadow infrastructure for a target domain.',
    serverName: 'crt.sh Certificate Transparency MCP',
    serverId: 'crtsh-builtin',
    category: 'OSINT',
    parameters: [
      {
        name: 'domain',
        type: 'string',
        description: 'Root domain or hostname to enumerate (e.g. example.com)',
        required: true,
      },
    ],
  },
  {
    name: 'search_historical_urls',
    description: 'Query Internet Archive CDX index to discover legacy endpoints, exposed configuration files, backup databases, or secret URLs.',
    serverName: 'Wayback Machine Archive MCP',
    serverId: 'wayback-builtin',
    category: 'RECON',
    parameters: [
      {
        name: 'domain',
        type: 'string',
        description: 'Target domain to crawl historical snapshots for',
        required: true,
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Max number of historical URLs to retrieve (default: 40)',
        required: false,
        default: 40,
      },
    ],
  },
  {
    name: 'inspect_dns_intel',
    description: 'Retrieve full DNS zone intelligence, mail exchanger (MX) infrastructure, and anti-spoofing policies (SPF/DMARC).',
    serverName: 'DNS Intelligence & SPF/DMARC MCP',
    serverId: 'dns-intel-builtin',
    category: 'NETWORK',
    parameters: [
      {
        name: 'domain',
        type: 'string',
        description: 'Hostname or apex domain to inspect',
        required: true,
      },
    ],
  },
  {
    name: 'probe_ip_reputation',
    description: 'Analyze an IP address for reverse DNS PTR attribution, private bogon exposure, and infrastructure provider.',
    serverName: 'IP & ASN Threat Intelligence MCP',
    serverId: 'ip-reputation-builtin',
    category: 'INTELLIGENCE',
    parameters: [
      {
        name: 'ip',
        type: 'string',
        description: 'IPv4 or IPv6 address to examine',
        required: true,
      },
    ],
  },
];

export async function getMcpTools(): Promise<McpToolDefinition[]> {
  const allTools: McpToolDefinition[] = [...BUILTIN_MCP_TOOLS];

  // Also query external custom MCP servers for their tools if connected
  for (const srv of mcpServers) {
    if (!srv.isBuiltin && srv.status === 'connected' && srv.endpoint) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${srv.endpoint.replace(/\/+$/, '')}/tools/list`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(srv.apiKey ? { Authorization: `Bearer ${srv.apiKey}` } : {}),
          },
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.tools)) {
            for (const t of data.tools) {
              allTools.push({
                name: t.name,
                description: t.description || 'Custom MCP Tool',
                serverName: srv.name,
                serverId: srv.id,
                category: 'CUSTOM',
                parameters: Array.isArray(t.parameters) ? t.parameters : [],
              });
            }
          }
        }
      } catch {
        // external server silent skip
      }
    }
  }

  return allTools;
}

// Tool Implementation Handlers
async function executeWaybackSearch(domain: string, limit = 40): Promise<any> {
  const root = extractRootDomain(domain);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=*.${encodeURIComponent(root)}/*&output=json&limit=${limit}&fl=original,timestamp,statuscode,mimetype&collapse=urlkey`;
    const res = await fetch(cdxUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SecurityScanner-MCP/1.0' },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { domain: root, count: 0, urls: [], note: `Wayback Archive returned HTTP ${res.status}` };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length <= 1) {
      return { domain: root, count: 0, urls: [], note: 'No archived URLs found in Wayback Index' };
    }

    // First row is header: ["original", "timestamp", "statuscode", "mimetype"]
    const rows = data.slice(1);
    const urls = rows.map((r: any[]) => ({
      url: r[0],
      timestamp: r[1],
      status: r[2],
      mimeType: r[3],
      isSensitive: /\.(env|sql|bak|old|config|git|yml|yaml|json|pem|key)($|\?)/i.test(r[0]),
    }));

    const sensitiveCount = urls.filter((u: any) => u.isSensitive).length;

    return {
      domain: root,
      count: urls.length,
      sensitiveUrlsDetected: sensitiveCount,
      urls,
      source: 'Internet Archive Wayback Machine CDX API',
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      domain: root,
      count: 0,
      urls: [],
      error: err?.message || 'Wayback request timed out',
    };
  }
}

async function executeDnsIntel(domain: string): Promise<any> {
  const root = extractRootDomain(domain);
  const results: any = { domain: root };

  try {
    const [mx, txt, ns] = await Promise.allSettled([
      dns.promises.resolveMx(root),
      dns.promises.resolveTxt(root),
      dns.promises.resolveNs(root),
    ]);

    results.mxRecords = mx.status === 'fulfilled' ? mx.value : [];
    results.txtRecords = txt.status === 'fulfilled' ? txt.value.map((t) => t.join(' ')) : [];
    results.nameServers = ns.status === 'fulfilled' ? ns.value : [];

    // Analyze SPF & DMARC
    const spfRecord = results.txtRecords.find((t: string) => t.toLowerCase().startsWith('v=spf1'));
    results.spfConfigured = !!spfRecord;
    results.spfRecord = spfRecord || 'None';

    try {
      const dmarcTxt = await dns.promises.resolveTxt(`_dmarc.${root}`);
      const dmarcJoined = dmarcTxt.map((t) => t.join(' ')).find((t) => t.toLowerCase().startsWith('v=dmarc1'));
      results.dmarcConfigured = !!dmarcJoined;
      results.dmarcRecord = dmarcJoined || 'None';
    } catch {
      results.dmarcConfigured = false;
      results.dmarcRecord = 'Missing _dmarc TXT record';
    }

    return results;
  } catch (err: any) {
    return { domain: root, error: err?.message || 'DNS query failed' };
  }
}

async function executeIpReputation(ip: string): Promise<any> {
  const trimmed = ip.trim();
  const isBogon = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|169\.254\.)/.test(trimmed);

  const intel: any = {
    ip: trimmed,
    isPrivateOrBogon: isBogon,
    checkedAt: new Date().toISOString(),
  };

  if (isBogon) {
    intel.classification = 'RFC 1918 Private / Bogon Address';
    intel.risk = 'SAFE_INTERNAL';
    return intel;
  }

  // Reverse PTR lookup
  try {
    const hostnames = await dns.promises.reverse(trimmed);
    intel.reversePtr = hostnames;
    intel.hasReverseDns = hostnames.length > 0;
  } catch {
    intel.reversePtr = [];
    intel.hasReverseDns = false;
  }

  intel.risk = 'NEUTRAL_PUBLIC';
  intel.recommendation = 'Check against external threat feeds (AbuseIPDB / Shodan) for historical abusive traffic.';
  return intel;
}

// Master Dispatcher for MCP Tool Calls
export async function executeMcpTool(request: McpToolCallRequest): Promise<McpToolCallResponse> {
  const startTime = Date.now();
  const { serverId, toolName, arguments: args } = request;

  try {
    // 1. Built-in Tools
    if (toolName === 'discover_subdomains') {
      const domain = args?.domain || args?.host || '';
      const audit = await queryCrtShSubdomains(domain);
      return {
        success: true,
        result: audit,
        executionTimeMs: Date.now() - startTime,
        toolName,
        serverId,
      };
    }

    if (toolName === 'search_historical_urls') {
      const domain = args?.domain || args?.host || '';
      const limit = Number(args?.limit) || 40;
      const res = await executeWaybackSearch(domain, limit);
      return {
        success: true,
        result: res,
        executionTimeMs: Date.now() - startTime,
        toolName,
        serverId,
      };
    }

    if (toolName === 'inspect_dns_intel') {
      const domain = args?.domain || args?.host || '';
      const res = await executeDnsIntel(domain);
      return {
        success: true,
        result: res,
        executionTimeMs: Date.now() - startTime,
        toolName,
        serverId,
      };
    }

    if (toolName === 'probe_ip_reputation') {
      const ip = args?.ip || '';
      const res = await executeIpReputation(ip);
      return {
        success: true,
        result: res,
        executionTimeMs: Date.now() - startTime,
        toolName,
        serverId,
      };
    }

    // 2. Custom External MCP Server
    const server = mcpServers.find((s) => s.id === serverId);
    if (!server || server.isBuiltin) {
      throw new Error(`Tool "${toolName}" not found on server "${serverId}".`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    const endpoint = `${server.endpoint.replace(/\/+$/, '')}/tools/call`;
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {}),
      },
      body: JSON.stringify({
        name: toolName,
        arguments: args || {},
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`External MCP Server returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      result: data,
      executionTimeMs: Date.now() - startTime,
      toolName,
      serverId,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Tool execution encountered an error',
      executionTimeMs: Date.now() - startTime,
      toolName,
      serverId,
    };
  }
}

// Test MCP Server Connection
export async function testMcpServer(server: McpServerConfig): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();

  if (server.isBuiltin) {
    return {
      success: true,
      message: `${server.name} is online and operational.`,
      latencyMs: 5,
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const testUrl = `${server.endpoint.replace(/\/+$/, '')}/tools/list`;
    const res = await fetch(testUrl, {
      signal: controller.signal,
      headers: {
        ...(server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {}),
      },
    });
    clearTimeout(timer);
    const latency = Date.now() - start;

    if (res.ok) {
      return {
        success: true,
        message: `Connected successfully! Latency: ${latency}ms`,
        latencyMs: latency,
      };
    } else {
      return {
        success: false,
        message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs: latency,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || 'Host unreachable'}`,
      latencyMs: Date.now() - start,
    };
  }
}
