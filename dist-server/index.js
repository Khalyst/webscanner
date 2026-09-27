// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import tls from "tls";
import net from "net";
import http from "http";
import dotenv from "dotenv";

// server/aiRouter.ts
import { GoogleGenAI } from "@google/genai";
var PROVIDER_METADATA = {
  offline: {
    name: "Native Deterministic Rule Engine",
    defaultModel: "Deterministic CISO Engine v1.0",
    availableModels: ["Deterministic CISO Engine v1.0"],
    isLocal: true,
    description: "Default Engine: 100% free, private, local algorithmic CVSS scoring. Zero API keys, zero cloud credits used."
  },
  gemini: {
    name: "Google Gemini (User API Key)",
    defaultModel: "gemini-3.8-flash",
    availableModels: ["gemini-3.8-flash", "gemini-3.1-pro-preview"],
    isLocal: false,
    description: "Bring Your Own Key (BYOK). Enter your own Gemini API key in the UI. Host account is never used."
  },
  openai: {
    name: "OpenAI (User API Key)",
    defaultModel: "gpt-4o",
    availableModels: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
    isLocal: false,
    description: "State-of-the-art vulnerability synthesis via OpenAI GPT-4o with your own API key."
  },
  anthropic: {
    name: "Anthropic Claude (User API Key)",
    defaultModel: "claude-3-5-sonnet-20241022",
    availableModels: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
    isLocal: false,
    description: "Deep cybersecurity analysis and strategic remediation reasoning with your own Anthropic API key."
  },
  ollama: {
    name: "Ollama (Local / On-Premise)",
    defaultModel: "llama3",
    availableModels: ["llama3", "mistral", "deepseek-r1", "qwen2.5"],
    isLocal: true,
    description: "100% private, on-premise local inference with zero telemetry or cloud API fees."
  },
  mistral: {
    name: "Mistral AI (User API Key)",
    defaultModel: "mistral-large-latest",
    availableModels: ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
    isLocal: false,
    description: "High-performance European sovereign enterprise foundation models with your own API key."
  },
  custom: {
    name: "Custom / Any AI Provider",
    defaultModel: "deepseek-chat",
    availableModels: ["deepseek-chat", "llama-3.3-70b-versatile", "meta-llama/llama-3.3-70b-instruct", "sonar-pro"],
    isLocal: false,
    description: "Bring any AI: DeepSeek, Groq, OpenRouter, Perplexity, LM Studio, vLLM, or custom endpoint."
  }
};
function getAvailableAiProviders() {
  const activeProvider = process.env.DEFAULT_AI_PROVIDER || "offline";
  const providers = Object.entries(PROVIDER_METADATA).map(([id, meta]) => {
    const pId = id;
    let isConfigured = false;
    if (pId === "offline") isConfigured = true;
    else if (pId === "ollama") isConfigured = true;
    else if (pId === "gemini") isConfigured = false;
    else if (pId === "openai") isConfigured = false;
    else if (pId === "anthropic") isConfigured = false;
    else if (pId === "mistral") isConfigured = false;
    else if (pId === "custom") isConfigured = true;
    return {
      id: pId,
      name: meta.name,
      defaultModel: meta.defaultModel,
      availableModels: meta.availableModels,
      isConfigured,
      isLocal: meta.isLocal,
      description: meta.description
    };
  });
  return {
    activeProvider,
    providers
  };
}
function generateOfflineRuleBasedAnalysis(params) {
  const {
    hostname,
    score,
    securityGrade,
    flaws,
    flawsCount,
    httpsRedirects
  } = params;
  return {
    provider: "offline",
    providerName: PROVIDER_METADATA.offline.name,
    modelUsed: PROVIDER_METADATA.offline.defaultModel,
    executiveSummary: `The automated audit for ${hostname} yielded a security posture score of ${score}/100 (Grade ${securityGrade}). ${flawsCount.critical > 0 ? "Critical vulnerability vectors require immediate intervention before exploitation." : flawsCount.high > 0 ? "Several high-severity configuration and header flaws increase the external attack surface." : "The domain demonstrates good baseline hygiene with moderate hardening opportunities in security headers and email policies."}`,
    attackSurfaceOverview: `The endpoint exhibits ${flaws.length} detected flaws across HTTP headers, transport layer encryption, and DNS email authentication. ${httpsRedirects ? "HTTPS is enforced across standard entrypoints." : "Plaintext HTTP traffic is unredirected, exposing sessions to MitM interception."}`,
    topThreatVectors: [
      flawsCount.critical > 0 ? "Direct exploitation of critical service misconfigurations or exposed sensitive repository/env files." : "Credential and token theft through Cross-Site Scripting (XSS) due to lack of Content-Security-Policy enforcement.",
      "Man-in-the-Middle (MitM) session stripping on public networks from missing or weak HSTS directives.",
      "Domain spoofing and spear-phishing campaigns leveraging unverified or permissive SPF/DMARC policies."
    ],
    remediationRoadmap: [
      {
        step: 1,
        action: "Deploy Strict-Transport-Security (HSTS) with 1-year max-age and includeSubDomains.",
        priority: "HIGH",
        estimatedEffort: "30 mins"
      },
      {
        step: 2,
        action: "Implement Content-Security-Policy (CSP) with restrictive script-src and object-src directives.",
        priority: "HIGH",
        estimatedEffort: "2-4 hours"
      },
      {
        step: 3,
        action: "Enforce DMARC policy with quarantine or reject mode to prevent brand impersonation.",
        priority: "MEDIUM",
        estimatedEffort: "1 hour"
      },
      {
        step: 4,
        action: "Suppress web server and runtime version tokens (Server, X-Powered-By) to prevent automated fingerprinting.",
        priority: "LOW",
        estimatedEffort: "15 mins"
      }
    ],
    complianceNotes: {
      owaspTop10: "Primary findings correspond to OWASP A05:2021 (Security Misconfiguration) and A02:2021 (Cryptographic Failures).",
      pciDss: "Requires mandatory TLS 1.2+ configuration, strict HSTS enablement, and removal of exposed administrative endpoints under Requirement 4 & 6.",
      iso27001: "Aligns with ISO/IEC 27001:2022 Control A.8.20 (Network Security) and A.8.26 (Application Security Requirements)."
    }
  };
}
async function synthesizeSecurityReport(params) {
  const {
    provider = process.env.DEFAULT_AI_PROVIDER || "offline",
    model,
    lang = "en",
    hostname,
    finalUrl,
    score,
    securityGrade,
    flaws,
    flawsCount,
    techStack,
    sslInfo,
    httpsRedirects,
    customConfig
  } = params;
  const langNames = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    ja: "Japanese",
    zh: "Simplified Chinese",
    pt: "Portuguese",
    ar: "Arabic"
  };
  const targetLangName = langNames[lang] || "English";
  const prompt = `You are a Principal Cybersecurity Penetration Tester and Chief Information Security Officer (CISO).
Analyze this automated vulnerability scan report for domain "${hostname}" (URL: ${finalUrl}).
LANGUAGE REQUIREMENT: Write the entire analysis in ${targetLangName} language so that an international executive reading in ${targetLangName} can understand it immediately.

Audit Summary:
- Security Score: ${score}/100 (Grade: ${securityGrade})
- Total Flaws Found: ${flaws.length} (Critical: ${flawsCount.critical}, High: ${flawsCount.high}, Medium: ${flawsCount.medium}, Low: ${flawsCount.low})
- HTTPS Redirection: ${httpsRedirects ? "Enforced" : "Missing"}
- SSL/TLS: ${sslInfo?.valid ? `Valid (${sslInfo.protocol}, ${sslInfo.daysRemaining} days left)` : "Invalid/Missing"}
- Detected Stack: ${techStack.map((t) => `${t.name} (${t.category})`).join(", ") || "Standard Web Server"}
- Top Flaws: ${flaws.slice(0, 8).map((f) => `[${f.severity}] ${f.title}`).join("; ")}

Return a valid JSON object matching this exact structure (with all human-readable text translated to ${targetLangName}):
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
  if (provider === "gemini") {
    const userApiKey = customConfig?.apiKey;
    if (!userApiKey) {
      console.log("Gemini requested without user-provided API key. Running Native Deterministic Rule Engine to protect host account.");
      const offlineResult = generateOfflineRuleBasedAnalysis(params);
      return {
        ...offlineResult,
        executiveSummary: `[Notice: Bring-Your-Own-Key Mode Active] To prevent unauthorized usage of the host's Gemini account quota, please enter your own Gemini API key in the AI Provider menu to activate Gemini live synthesis. Scanning was completed instantly using the 100% free Native Deterministic Rule Engine.

${offlineResult.executiveSummary}`
      };
    }
    try {
      const userAi = new GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const activeModel = model || PROVIDER_METADATA.gemini.defaultModel;
      const response = await userAi.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          provider: "gemini",
          providerName: PROVIDER_METADATA.gemini.name,
          modelUsed: activeModel
        };
      }
    } catch (err) {
      console.warn("User Gemini key synthesis failed, falling back to deterministic engine:", err);
    }
  }
  const openAiKey = customConfig?.apiKey || process.env.OPENAI_API_KEY;
  if (provider === "openai" && openAiKey) {
    try {
      const activeModel = model || process.env.OPENAI_MODEL || PROVIDER_METADATA.openai.defaultModel;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: "system", content: "You are a Principal Cybersecurity Penetration Tester and CISO. You output only valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...parsed,
            provider: "openai",
            providerName: PROVIDER_METADATA.openai.name,
            modelUsed: activeModel
          };
        }
      }
    } catch (err) {
      console.warn("OpenAI synthesis failed:", err);
    }
  }
  const anthropicKey = customConfig?.apiKey || process.env.ANTHROPIC_API_KEY;
  if (provider === "anthropic" && anthropicKey) {
    try {
      const activeModel = model || process.env.ANTHROPIC_MODEL || PROVIDER_METADATA.anthropic.defaultModel;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: activeModel,
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: `${prompt}

IMPORTANT: Respond with pure raw JSON only. Do not wrap in markdown quotes or preamble.`
            }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.content?.[0]?.text;
        if (content) {
          const cleanJson = content.replace(/^```json/m, "").replace(/```$/m, "").trim();
          const parsed = JSON.parse(cleanJson);
          return {
            ...parsed,
            provider: "anthropic",
            providerName: PROVIDER_METADATA.anthropic.name,
            modelUsed: activeModel
          };
        }
      }
    } catch (err) {
      console.warn("Anthropic synthesis failed:", err);
    }
  }
  if (provider === "ollama") {
    try {
      const baseUrl = customConfig?.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
      const activeModel = model || customConfig?.model || process.env.OLLAMA_MODEL || PROVIDER_METADATA.ollama.defaultModel;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12e3);
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeModel,
          prompt,
          format: "json",
          stream: false
        })
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          const parsed = JSON.parse(data.response);
          return {
            ...parsed,
            provider: "ollama",
            providerName: PROVIDER_METADATA.ollama.name,
            modelUsed: `${activeModel} (Local Inference)`
          };
        }
      }
    } catch (err) {
      console.warn("Ollama local inference failed or not reachable:", err);
    }
  }
  const mistralKey = customConfig?.apiKey || process.env.MISTRAL_API_KEY;
  if (provider === "mistral" && mistralKey) {
    try {
      const activeModel = model || process.env.MISTRAL_MODEL || PROVIDER_METADATA.mistral.defaultModel;
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mistralKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: "system", content: "You are a Principal Cybersecurity Penetration Tester and CISO." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...parsed,
            provider: "mistral",
            providerName: PROVIDER_METADATA.mistral.name,
            modelUsed: activeModel
          };
        }
      }
    } catch (err) {
      console.warn("Mistral AI synthesis failed:", err);
    }
  }
  if (provider === "custom" || customConfig?.baseUrl) {
    try {
      const customBaseUrl = (customConfig?.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
      const customModel = customConfig?.model || model || "deepseek-chat";
      const customApiKey = customConfig?.apiKey || process.env.CUSTOM_AI_API_KEY || "";
      const customProviderName = customConfig?.providerName || "Custom AI";
      const headers = {
        "Content-Type": "application/json"
      };
      if (customApiKey) {
        headers["Authorization"] = `Bearer ${customApiKey}`;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2e4);
      const endpoint = customBaseUrl.endsWith("/chat/completions") ? customBaseUrl : `${customBaseUrl}/chat/completions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: customModel,
          messages: [
            {
              role: "system",
              content: "You are a Principal Cybersecurity Penetration Tester and CISO. You output only valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleanJson = content.replace(/^```json/m, "").replace(/```$/m, "").trim();
          const parsed = JSON.parse(cleanJson);
          return {
            ...parsed,
            provider: "custom",
            providerName: customProviderName,
            modelUsed: `${customModel} (${customProviderName})`
          };
        }
      } else {
        const errText = await res.text().catch(() => "");
        console.warn(`Custom AI provider endpoint returned error ${res.status}:`, errText);
      }
    } catch (err) {
      console.warn("Custom AI provider execution failed:", err);
    }
  }
  return generateOfflineRuleBasedAnalysis(params);
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json());
app.get("/api/ai-providers", (_req, res) => {
  res.json(getAvailableAiProviders());
});
function isPrivateIp(ip) {
  if (!ip) return false;
  if (ip === "127.0.0.1" || ip === "localhost" || ip === "::1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  return false;
}
function probePort(host, port, timeout = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpen = false;
    socket.setTimeout(timeout);
    socket.on("connect", () => {
      isOpen = true;
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}
function inspectTlsCertificate(hostname, port = 443, timeout = 3e3) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          const authError = socket.authorizationError;
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol() || "TLSv1.2";
          if (!cert || !cert.valid_to) {
            socket.destroy();
            resolve(null);
            return;
          }
          const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString() : "";
          const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString() : "";
          const validToDate = new Date(cert.valid_to);
          const now = /* @__PURE__ */ new Date();
          const daysRemaining = Math.round((validToDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
          const expired = daysRemaining <= 0;
          let sans = [];
          if (cert.subjectaltname) {
            sans = cert.subjectaltname.split(",").map((s) => s.trim().replace(/^DNS:/, ""));
          }
          const toCertStr = (v) => Array.isArray(v) ? v.join(", ") : v;
          socket.destroy();
          resolve({
            valid: authorized && !expired,
            issuer: {
              commonName: toCertStr(cert.issuer?.CN),
              organization: toCertStr(cert.issuer?.O),
              country: toCertStr(cert.issuer?.C)
            },
            subject: {
              commonName: toCertStr(cert.subject?.CN),
              organization: toCertStr(cert.subject?.O)
            },
            validFrom,
            validTo,
            daysRemaining,
            expired,
            protocol,
            cipherSuite: cipher ? `${cipher.name} (${cipher.standardName || cipher.version})` : "Unknown",
            sans,
            authorized,
            authorizationError: authError ? String(authError) : void 0
          });
        } catch {
          socket.destroy();
          resolve(null);
        }
      }
    );
    socket.on("error", () => {
      socket.destroy();
      resolve(null);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(null);
    });
  });
}
async function fetchWithTimeout(url, options = {}, timeout = 6e3) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}
app.post("/api/scan", async (req, res) => {
  const startTime = Date.now();
  let { url: inputUrl, deepAiScan = true, lang = "en", aiProvider, aiModel, customAiConfig } = req.body;
  if (!inputUrl || typeof inputUrl !== "string") {
    res.status(400).json({ error: "Valid URL is required" });
    return;
  }
  inputUrl = inputUrl.trim();
  let targetProtocol = "https:";
  if (inputUrl.startsWith("http://")) {
    targetProtocol = "http:";
  } else if (!inputUrl.startsWith("https://")) {
    inputUrl = "https://" + inputUrl;
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  if (isPrivateIp(hostname)) {
    res.status(400).json({ error: "Scanning localhost or private subnets is prohibited." });
    return;
  }
  const flaws = [];
  let flawCounter = 1;
  const addFlaw = (flaw) => {
    flaws.push({
      ...flaw,
      id: `FLAW-${flawCounter++}`
    });
  };
  try {
    const dnsRecords = {
      dnssec: false
    };
    let resolvedIp;
    try {
      const aRecords = await dns.promises.resolve4(hostname).catch(() => []);
      if (aRecords.length > 0) {
        dnsRecords.a = aRecords;
        resolvedIp = aRecords[0];
        if (isPrivateIp(resolvedIp)) {
          res.status(400).json({ error: "Host resolves to private IP address." });
          return;
        }
      }
    } catch {
    }
    try {
      const aaaaRecords = await dns.promises.resolve6(hostname).catch(() => []);
      if (aaaaRecords.length > 0) dnsRecords.aaaa = aaaaRecords;
    } catch {
    }
    try {
      const mxRecords = await dns.promises.resolveMx(hostname).catch(() => []);
      if (mxRecords.length > 0) {
        dnsRecords.mx = mxRecords.map((m) => ({ exchange: m.exchange, priority: m.priority }));
      }
    } catch {
    }
    try {
      const nsRecords = await dns.promises.resolveNs(hostname).catch(() => []);
      if (nsRecords.length > 0) dnsRecords.ns = nsRecords;
    } catch {
    }
    try {
      const cnameRecords = await dns.promises.resolveCname(hostname).catch(() => []);
      if (cnameRecords.length > 0) dnsRecords.cname = cnameRecords;
    } catch {
    }
    try {
      const soaRecord = await dns.promises.resolveSoa(hostname).catch(() => null);
      if (soaRecord) {
        dnsRecords.soa = {
          nsname: soaRecord.nsname,
          hostmaster: soaRecord.hostmaster,
          serial: soaRecord.serial
        };
      }
    } catch {
    }
    try {
      const txtRecords = await dns.promises.resolveTxt(hostname).catch(() => []);
      const flatTxt = txtRecords.map((t) => t.join(""));
      dnsRecords.txt = flatTxt;
      const spfRecord = flatTxt.find((t) => t.startsWith("v=spf1"));
      if (spfRecord) {
        let policy = "SOFT";
        if (spfRecord.includes("-all")) policy = "STRICT";
        else if (spfRecord.includes("~all")) policy = "SOFT";
        else if (spfRecord.includes("+all") || spfRecord.includes("?all")) policy = "PERMISSIVE";
        dnsRecords.spf = {
          record: spfRecord,
          valid: true,
          policy,
          details: `Configured with ${policy} policy (${spfRecord.slice(0, 60)}${spfRecord.length > 60 ? "..." : ""})`
        };
        if (policy === "PERMISSIVE") {
          addFlaw({
            title: "Permissive SPF Record (+all or ?all)",
            category: "DNS_EMAIL",
            severity: "MEDIUM",
            cvssScore: 5.3,
            owaspCategory: "A05:2021 Security Misconfiguration",
            description: "The SPF record allows any host to send mail on behalf of this domain, facilitating email spoofing and phishing attacks.",
            impact: "Attackers can impersonate your domain in phishing emails with high deliverability.",
            evidence: spfRecord,
            remediation: "Change SPF qualifier mechanism to -all (hard fail) or ~all (soft fail)."
          });
        }
      } else {
        dnsRecords.spf = {
          valid: false,
          policy: "MISSING",
          details: "No SPF TXT record discovered for domain."
        };
        addFlaw({
          title: "Missing SPF Email Authentication Record",
          category: "DNS_EMAIL",
          severity: "MEDIUM",
          cvssScore: 5,
          owaspCategory: "A05:2021 Security Misconfiguration",
          description: "No Sender Policy Framework (SPF) record was detected for this domain. Any mail server can forge emails purporting to originate from this domain.",
          impact: "Increases susceptibility to CEO fraud, brand impersonation, and phishing scams targeting clients or staff.",
          remediation: 'Add a TXT record to your root DNS zone: "v=spf1 include:_spf.yourprovider.com ~all".'
        });
      }
      try {
        const dmarcTxt = await dns.promises.resolveTxt(`_dmarc.${hostname}`).catch(() => []);
        const dmarcRecord = dmarcTxt.map((t) => t.join("")).find((t) => t.startsWith("v=DMARC1"));
        if (dmarcRecord) {
          let policy = "NONE";
          if (/p=reject/i.test(dmarcRecord)) policy = "REJECT";
          else if (/p=quarantine/i.test(dmarcRecord)) policy = "QUARANTINE";
          else if (/p=none/i.test(dmarcRecord)) policy = "NONE";
          dnsRecords.dmarc = {
            record: dmarcRecord,
            valid: true,
            policy,
            details: `DMARC policy configured to ${policy}`
          };
          if (policy === "NONE") {
            addFlaw({
              title: "Weak DMARC Policy (p=none)",
              category: "DNS_EMAIL",
              severity: "LOW",
              cvssScore: 3.7,
              owaspCategory: "A05:2021 Security Misconfiguration",
              description: "The DMARC policy is set to monitoring-only (p=none), meaning fraudulent spoofed emails will not be rejected or quarantined by recipient mail servers.",
              impact: "Unauthenticated emails will still be delivered to recipient inboxes.",
              evidence: dmarcRecord,
              remediation: "Transition DMARC policy to p=quarantine or p=reject once mail sources have been verified."
            });
          }
        } else {
          dnsRecords.dmarc = {
            valid: false,
            policy: "MISSING",
            details: "No DMARC record found at _dmarc." + hostname
          };
          addFlaw({
            title: "Missing DMARC Policy Record",
            category: "DNS_EMAIL",
            severity: "MEDIUM",
            cvssScore: 5.2,
            owaspCategory: "A05:2021 Security Misconfiguration",
            description: "No DMARC record found. DMARC enables domain owners to specify how unauthenticated emails should be handled and receive delivery telemetry.",
            impact: "Domain can be spoofed in executive spear-phishing campaigns without visibility.",
            remediation: "Publish a TXT record at _dmarc." + hostname + ' with "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@' + hostname + '".'
          });
        }
      } catch {
        dnsRecords.dmarc = {
          valid: false,
          policy: "MISSING",
          details: "Failed to query _dmarc." + hostname
        };
      }
    } catch {
    }
    let httpsRedirects = false;
    try {
      const httpRes = await fetchWithTimeout(`http://${hostname}`, {
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WEBSCANNER/1.0"
        }
      });
      const location = httpRes.headers.get("location") || "";
      if ([301, 302, 307, 308].includes(httpRes.status) && location.startsWith("https://")) {
        httpsRedirects = true;
      } else {
        addFlaw({
          title: "Insecure Plaintext HTTP Allowed (No Strict HTTPS Redirect)",
          category: "SSL_TLS",
          severity: "HIGH",
          cvssScore: 7.4,
          owaspCategory: "A02:2021 Cryptographic Failures",
          description: "The server does not automatically redirect plain HTTP traffic on port 80 to encrypted HTTPS. Communication can be intercepted or modified in transit.",
          impact: "Adversaries on local networks or ISPs can conduct Man-in-the-Middle (MitM) eavesdropping, session hijacking, or inject malicious scripts.",
          evidence: `HTTP Status: ${httpRes.status}, Location: ${location || "None"}`,
          remediation: "Configure server to return 301 Permanent Redirect for all HTTP requests to HTTPS.",
          remediationCode: {
            nginx: "server {\n  listen 80;\n  server_name " + hostname + ";\n  return 301 https://$host$request_uri;\n}",
            apache: "RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"
          }
        });
      }
    } catch {
    }
    const sslInfo = await inspectTlsCertificate(hostname);
    if (sslInfo) {
      if (!sslInfo.authorized) {
        addFlaw({
          title: "Untrusted or Self-Signed SSL/TLS Certificate",
          category: "SSL_TLS",
          severity: "CRITICAL",
          cvssScore: 9.1,
          owaspCategory: "A02:2021 Cryptographic Failures",
          description: `The certificate is not trusted by public Certificate Authorities: ${sslInfo.authorizationError || "Untrusted root CA"}.`,
          impact: "Users encounter terrifying browser security interstitial warnings. Active traffic interception is trivial without warning verification.",
          evidence: sslInfo.authorizationError,
          remediation: "Deploy a valid, publicly trusted certificate issued by Let's Encrypt, DigiCert, or Cloudflare."
        });
      } else if (sslInfo.expired) {
        addFlaw({
          title: "Expired SSL/TLS Certificate",
          category: "SSL_TLS",
          severity: "CRITICAL",
          cvssScore: 8.8,
          owaspCategory: "A02:2021 Cryptographic Failures",
          description: `The SSL certificate expired on ${sslInfo.validTo}. Browsers will terminate TLS connections with invalid cert errors.`,
          impact: "Complete service denial for HTTPS traffic; browser warning blocks standard visitors.",
          evidence: `Expired ${Math.abs(sslInfo.daysRemaining)} days ago`,
          remediation: "Renew and reload SSL certificate immediately."
        });
      } else if (sslInfo.daysRemaining < 15) {
        addFlaw({
          title: "SSL/TLS Certificate Expiring Imminently",
          category: "SSL_TLS",
          severity: "HIGH",
          cvssScore: 6.5,
          owaspCategory: "A02:2021 Cryptographic Failures",
          description: `The SSL certificate will expire in ${sslInfo.daysRemaining} days (${sslInfo.validTo}).`,
          impact: "Service disruption if certificate is not renewed before cutoff.",
          evidence: `${sslInfo.daysRemaining} days remaining`,
          remediation: "Automate renewal with Certbot or host provider auto-renewal."
        });
      }
      if (sslInfo.protocol === "TLSv1" || sslInfo.protocol === "TLSv1.1") {
        addFlaw({
          title: "Deprecated TLS Protocol Version in Use",
          category: "SSL_TLS",
          severity: "HIGH",
          cvssScore: 7.5,
          owaspCategory: "A02:2021 Cryptographic Failures",
          description: `The server negotiated ${sslInfo.protocol}, which has been officially deprecated by IETF due to known cryptographic weaknesses (BEAST, POODLE).`,
          impact: "Susceptible to cryptographic downgrade attacks and compliance failure (PCI-DSS violation).",
          evidence: sslInfo.protocol,
          remediation: "Disable TLS 1.0 and TLS 1.1; enforce TLS 1.2 and TLS 1.3 exclusively.",
          remediationCode: {
            nginx: "ssl_protocols TLSv1.2 TLSv1.3;\nssl_prefer_server_ciphers on;",
            apache: "SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1"
          }
        });
      }
    } else {
      addFlaw({
        title: "TLS/HTTPS Handshake Failed on Port 443",
        category: "SSL_TLS",
        severity: "CRITICAL",
        cvssScore: 9,
        owaspCategory: "A02:2021 Cryptographic Failures",
        description: "Unable to establish secure TLS connection to port 443. The site may not have HTTPS enabled.",
        impact: "Site cannot provide end-to-end encryption for sensitive visitor credentials or communications.",
        remediation: "Install and bind an SSL/TLS certificate to port 443."
      });
    }
    let httpStatus = 0;
    let finalUrl = inputUrl;
    let responseTimeMs = 0;
    const rawHeaders = {};
    let responseBody = "";
    const cookieAudits = [];
    try {
      const fetchStart = Date.now();
      const resPrimary = await fetchWithTimeout(inputUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WEBSCANNER/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      responseTimeMs = Date.now() - fetchStart;
      httpStatus = resPrimary.status;
      finalUrl = resPrimary.url || inputUrl;
      resPrimary.headers.forEach((val, key) => {
        rawHeaders[key.toLowerCase()] = val;
      });
      try {
        const text = await resPrimary.text();
        responseBody = text.slice(0, 1e5);
      } catch {
      }
      const rawCookies = resPrimary.headers.get("set-cookie");
      if (rawCookies) {
        const cookieStrings = rawCookies.split(/,(?=[^;]+=[^;]+)/);
        for (const cStr of cookieStrings) {
          const parts = cStr.split(";").map((s) => s.trim());
          const nameValue = parts[0] || "";
          const cName = nameValue.split("=")[0] || "cookie";
          const isSecure = parts.some((p) => p.toLowerCase() === "secure");
          const isHttpOnly = parts.some((p) => p.toLowerCase() === "httponly");
          const sameSitePart = parts.find((p) => p.toLowerCase().startsWith("samesite="));
          const sameSite = sameSitePart ? sameSitePart.split("=")[1] : void 0;
          const issues = [];
          if (!isSecure) issues.push("Missing Secure attribute");
          if (!isHttpOnly) issues.push("Missing HttpOnly attribute");
          if (!sameSite) issues.push("Missing SameSite attribute");
          cookieAudits.push({
            name: cName,
            secure: isSecure,
            httpOnly: isHttpOnly,
            sameSite,
            issues
          });
          if (!isSecure) {
            addFlaw({
              title: `Cookie '${cName}' Missing 'Secure' Attribute`,
              category: "COOKIES",
              severity: "MEDIUM",
              cvssScore: 5.4,
              owaspCategory: "A05:2021 Security Misconfiguration",
              description: `The cookie '${cName}' lacks the Secure flag, allowing it to be transmitted unencrypted if an HTTP request is made.`,
              impact: "Network eavesdroppers can capture session authentication tokens in plaintext over untrusted WiFi.",
              remediation: 'Append "; Secure" to the Set-Cookie header directive.'
            });
          }
          if (!isHttpOnly) {
            addFlaw({
              title: `Cookie '${cName}' Missing 'HttpOnly' Attribute`,
              category: "COOKIES",
              severity: "LOW",
              cvssScore: 4.3,
              owaspCategory: "A05:2021 Security Misconfiguration",
              description: `The cookie '${cName}' does not set the HttpOnly flag, making it accessible to client-side document.cookie JavaScript API.`,
              impact: "If a Cross-Site Scripting (XSS) vulnerability exists, the attacker can trivially exfiltrate user session cookies.",
              remediation: 'Append "; HttpOnly" to the Set-Cookie header directive.'
            });
          }
        }
      }
    } catch (err) {
      httpStatus = 0;
      addFlaw({
        title: "Target Web Application Unreachable",
        category: "RECON",
        severity: "HIGH",
        cvssScore: 7,
        owaspCategory: "A05:2021 Security Misconfiguration",
        description: `Failed to connect to web endpoint ${inputUrl}: ${err?.message || "Connection error"}.`,
        impact: "Service is down or blocking scanner requests.",
        remediation: "Verify DNS records, firewall ingress rules, and web server daemon state."
      });
    }
    const headersAudit = [];
    const hsts = rawHeaders["strict-transport-security"];
    if (hsts) {
      const hasSubdomains = /includesubdomains/i.test(hsts);
      const hasPreload = /preload/i.test(hsts);
      const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
      if (maxAge >= 15768e3) {
        headersAudit.push({
          header: "Strict-Transport-Security",
          present: true,
          value: hsts,
          status: "PASS",
          recommendation: "Good: Strong HSTS policy enforced.",
          description: "Enforces HTTPS and prevents SSL-stripping man-in-the-middle attacks.",
          severity: "INFO"
        });
      } else {
        headersAudit.push({
          header: "Strict-Transport-Security",
          present: true,
          value: hsts,
          status: "WARN",
          recommendation: "Increase max-age to at least 31536000 (1 year) and include subdomains.",
          description: "HSTS max-age is lower than recommended 6-12 months.",
          severity: "LOW"
        });
        addFlaw({
          title: "HSTS max-age Duration Too Low",
          category: "HEADERS",
          severity: "LOW",
          cvssScore: 3.1,
          owaspCategory: "A05:2021 Security Misconfiguration",
          description: `Strict-Transport-Security max-age is ${maxAge}s, which is below the recommended 31536000s (1 year).`,
          impact: "Clients revert to insecure HTTP sooner if they have not visited recently.",
          evidence: hsts,
          remediation: "Set: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
          remediationCode: {
            nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
            apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"'
          }
        });
      }
    } else {
      headersAudit.push({
        header: "Strict-Transport-Security",
        present: false,
        status: "FAIL",
        recommendation: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        description: "Enforces HTTPS connections and immunizes against SSL-stripping MitM attacks.",
        severity: "HIGH"
      });
      addFlaw({
        title: "Missing HTTP Strict-Transport-Security (HSTS) Header",
        category: "HEADERS",
        severity: "HIGH",
        cvssScore: 7.2,
        owaspCategory: "A02:2021 Cryptographic Failures",
        description: "HSTS instructs browsers to exclusively load the site via HTTPS, refusing any fallback to plaintext HTTP even if linked.",
        impact: "Users are vulnerable to SSL-stripping tools (e.g. sslstrip), DNS spoofing, and rogue public Wi-Fi access points.",
        remediation: "Send the Strict-Transport-Security header on all HTTPS responses.",
        remediationCode: {
          nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
          apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
          express: "app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));"
        }
      });
    }
    const csp = rawHeaders["content-security-policy"];
    if (csp) {
      const hasUnsafeInline = csp.includes("'unsafe-inline'");
      const hasUnsafeEval = csp.includes("'unsafe-eval'");
      const hasWildcard = csp.includes("*");
      if (hasUnsafeInline || hasUnsafeEval) {
        headersAudit.push({
          header: "Content-Security-Policy",
          present: true,
          value: csp.slice(0, 100) + "...",
          status: "WARN",
          recommendation: "Avoid 'unsafe-inline' or 'unsafe-eval'; migrate to nonces or SHA-256 hashes.",
          description: "CSP is present but contains permissive directives that reduce XSS resistance.",
          severity: "MEDIUM"
        });
        addFlaw({
          title: "Permissive CSP Directives Detected ('unsafe-inline' or 'unsafe-eval')",
          category: "HEADERS",
          severity: "MEDIUM",
          cvssScore: 5.8,
          owaspCategory: "A03:2021 Injection",
          description: "The Content-Security-Policy allows 'unsafe-inline' or 'unsafe-eval', enabling inline script injection.",
          impact: "Substantially reduces browser protection against Cross-Site Scripting (XSS) attacks.",
          evidence: csp.slice(0, 120),
          remediation: "Refactor inline scripts to external modules with cryptographic nonces or hashes."
        });
      } else {
        headersAudit.push({
          header: "Content-Security-Policy",
          present: true,
          value: csp.slice(0, 80) + "...",
          status: "PASS",
          recommendation: "Good: Restrictive Content-Security-Policy implemented.",
          description: "Mitigates Cross-Site Scripting (XSS) and data injection attacks.",
          severity: "INFO"
        });
      }
    } else {
      headersAudit.push({
        header: "Content-Security-Policy",
        present: false,
        status: "FAIL",
        recommendation: "Add: default-src 'self'; script-src 'self'; object-src 'none';",
        description: "Restricts sources from which scripts, styles, and media can be loaded.",
        severity: "HIGH"
      });
      addFlaw({
        title: "Missing Content-Security-Policy (CSP) Header",
        category: "HEADERS",
        severity: "HIGH",
        cvssScore: 7.5,
        owaspCategory: "A03:2021 Injection",
        description: "Content-Security-Policy (CSP) is the single most effective browser defense against Cross-Site Scripting (XSS) and data exfiltration.",
        impact: "If any XSS flaw exists on the application, injected script payloads execute unrestricted with access to DOM, cookies, and tokens.",
        remediation: "Deploy a Content-Security-Policy starting with default-src 'self' and restrict object-src 'none'.",
        remediationCode: {
          nginx: `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';" always;`,
          apache: `Header set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';"`,
          express: "app.use(helmet.contentSecurityPolicy());"
        }
      });
    }
    const xfo = rawHeaders["x-frame-options"];
    const cspHasFrameAncestors = csp && csp.includes("frame-ancestors");
    if (xfo || cspHasFrameAncestors) {
      headersAudit.push({
        header: "X-Frame-Options",
        present: true,
        value: xfo || "Protected via CSP frame-ancestors",
        status: "PASS",
        recommendation: "Good: Clickjacking protection active.",
        description: "Prevents the site from being rendered inside an iframe on malicious origins.",
        severity: "INFO"
      });
    } else {
      headersAudit.push({
        header: "X-Frame-Options",
        present: false,
        status: "FAIL",
        recommendation: "Add: X-Frame-Options: DENY or SAMEORIGIN",
        description: "Protects visitors against Clickjacking and UI redressing attacks.",
        severity: "MEDIUM"
      });
      addFlaw({
        title: "Missing Anti-Clickjacking Protection (X-Frame-Options / frame-ancestors)",
        category: "HEADERS",
        severity: "MEDIUM",
        cvssScore: 5.7,
        owaspCategory: "A05:2021 Security Misconfiguration",
        description: "The site does not restrict framing via X-Frame-Options or CSP frame-ancestors. Malicious websites can overlay transparent iframes.",
        impact: "Attackers can trick authenticated users into clicking buttons or executing unwanted state-changing transactions (Clickjacking).",
        remediation: "Configure X-Frame-Options: DENY or SAMEORIGIN.",
        remediationCode: {
          nginx: 'add_header X-Frame-Options "DENY" always;',
          apache: 'Header always set X-Frame-Options "DENY"',
          express: 'app.use(helmet.frameguard({ action: "deny" }));'
        }
      });
    }
    const xcto = rawHeaders["x-content-type-options"];
    if (xcto && xcto.toLowerCase().includes("nosniff")) {
      headersAudit.push({
        header: "X-Content-Type-Options",
        present: true,
        value: xcto,
        status: "PASS",
        recommendation: "Good: MIME sniffing disabled.",
        description: "Prevents browsers from MIME-sniffing a response away from declared content-type.",
        severity: "INFO"
      });
    } else {
      headersAudit.push({
        header: "X-Content-Type-Options",
        present: false,
        status: "FAIL",
        recommendation: "Add: X-Content-Type-Options: nosniff",
        description: "Forces browser to strictly respect declared Content-Type, mitigating MIME confusion exploits.",
        severity: "LOW"
      });
      addFlaw({
        title: "Missing 'X-Content-Type-Options: nosniff' Header",
        category: "HEADERS",
        severity: "LOW",
        cvssScore: 4,
        owaspCategory: "A05:2021 Security Misconfiguration",
        description: "Without nosniff, older or lax browsers may execute text/plain or image uploads as JavaScript if HTML/JS tags are discovered inside.",
        impact: "Can enable Cross-Site Scripting (XSS) via user-uploaded media or avatars.",
        remediation: "Add X-Content-Type-Options: nosniff to all responses.",
        remediationCode: {
          nginx: 'add_header X-Content-Type-Options "nosniff" always;',
          apache: 'Header always set X-Content-Type-Options "nosniff"'
        }
      });
    }
    const refPolicy = rawHeaders["referrer-policy"];
    if (refPolicy) {
      headersAudit.push({
        header: "Referrer-Policy",
        present: true,
        value: refPolicy,
        status: "PASS",
        recommendation: "Good: Referrer header disclosure restricted.",
        description: "Controls how much referrer information should be included with requests.",
        severity: "INFO"
      });
    } else {
      headersAudit.push({
        header: "Referrer-Policy",
        present: false,
        status: "WARN",
        recommendation: "Add: Referrer-Policy: strict-origin-when-cross-origin",
        description: "Protects sensitive URL query parameters (tokens, IDs) from leaking to 3rd party domains.",
        severity: "LOW"
      });
      addFlaw({
        title: "Missing Referrer-Policy Header",
        category: "HEADERS",
        severity: "LOW",
        cvssScore: 3.4,
        owaspCategory: "A05:2021 Security Misconfiguration",
        description: "Without a Referrer-Policy, the browser might transmit full path and query strings to external domains clicked by the user.",
        impact: "Accidental leakage of secret tokens, session identifiers, or PII contained in URL parameters.",
        remediation: "Set Referrer-Policy: strict-origin-when-cross-origin.",
        remediationCode: {
          nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
          apache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"'
        }
      });
    }
    const permPolicy = rawHeaders["permissions-policy"] || rawHeaders["feature-policy"];
    if (permPolicy) {
      headersAudit.push({
        header: "Permissions-Policy",
        present: true,
        value: permPolicy.slice(0, 70) + (permPolicy.length > 70 ? "..." : ""),
        status: "PASS",
        recommendation: "Good: Browser APIs restricted via Permissions-Policy.",
        description: "Controls which browser features (camera, microphone, geolocation) can be invoked.",
        severity: "INFO"
      });
    } else {
      headersAudit.push({
        header: "Permissions-Policy",
        present: false,
        status: "WARN",
        recommendation: "Add: Permissions-Policy: camera=(), microphone=(), geolocation=()",
        description: "Disables sensitive device hardware APIs if not needed.",
        severity: "LOW"
      });
      addFlaw({
        title: "Missing Permissions-Policy Header",
        category: "HEADERS",
        severity: "LOW",
        cvssScore: 2.8,
        owaspCategory: "A05:2021 Security Misconfiguration",
        description: "No Permissions-Policy defined to restrict embedded frames or scripts from requesting sensitive hardware APIs (webcam, mic, accelerometer, geolocation).",
        impact: "Third-party advertising widgets or embedded scripts could prompt users for hardware permissions.",
        remediation: "Specify Permissions-Policy: camera=(), microphone=(), geolocation=()."
      });
    }
    const coop = rawHeaders["cross-origin-opener-policy"];
    if (coop) {
      headersAudit.push({
        header: "Cross-Origin-Opener-Policy",
        present: true,
        value: coop,
        status: "PASS",
        recommendation: "Good: COOP isolates browsing context.",
        description: "Mitigates Spectre-style cross-origin data leakage.",
        severity: "INFO"
      });
    } else {
      headersAudit.push({
        header: "Cross-Origin-Opener-Policy",
        present: false,
        status: "WARN",
        recommendation: "Consider: Cross-Origin-Opener-Policy: same-origin",
        description: "Isolates top-level document from cross-origin popup windows.",
        severity: "LOW"
      });
    }
    const techStack = [];
    const serverHeader = rawHeaders["server"];
    if (serverHeader) {
      techStack.push({
        name: serverHeader,
        category: "Server"
      });
      if (/\d+\.\d+/.test(serverHeader)) {
        addFlaw({
          title: `Server Version Disclosure in HTTP Header: '${serverHeader}'`,
          category: "INFO_DISCLOSURE",
          severity: "LOW",
          cvssScore: 4.1,
          owaspCategory: "A05:2021 Security Misconfiguration",
          description: `The web server explicitly broadcasts its exact software version in the 'Server' header: ${serverHeader}.`,
          impact: "Allows malicious actors to lookup version-specific CVE vulnerabilities and automate targeted exploit payloads.",
          evidence: `Server: ${serverHeader}`,
          remediation: "Disable server signature tokens in production configuration.",
          remediationCode: {
            nginx: "server_tokens off;",
            apache: "ServerTokens Prod\nServerSignature Off"
          }
        });
      }
    }
    const poweredBy = rawHeaders["x-powered-by"];
    if (poweredBy) {
      techStack.push({
        name: poweredBy,
        category: "Framework"
      });
      addFlaw({
        title: `Backend Technology Leaked via 'X-Powered-By: ${poweredBy}'`,
        category: "INFO_DISCLOSURE",
        severity: "LOW",
        cvssScore: 4.3,
        owaspCategory: "A05:2021 Security Misconfiguration",
        description: `The application reveals its underlying runtime or framework (${poweredBy}) via the X-Powered-By header.`,
        impact: "Facilitates technology fingerprinting and reconnaissance for framework-specific 0-day or 1-day vulnerabilities.",
        evidence: `X-Powered-By: ${poweredBy}`,
        remediation: "Suppress or strip the X-Powered-By header in application or proxy settings.",
        remediationCode: {
          express: 'app.disable("x-powered-by");',
          apache: "Header unset X-Powered-By",
          nginx: "proxy_hide_header X-Powered-By;"
        }
      });
    }
    if (rawHeaders["cf-ray"] || rawHeaders["cf-cache-status"]) {
      techStack.push({ name: "Cloudflare", category: "CDN" });
    }
    if (rawHeaders["x-amz-cf-id"] || rawHeaders["x-amz-cf-pop"]) {
      techStack.push({ name: "AWS CloudFront", category: "CDN" });
    }
    if (rawHeaders["x-fastly-request-id"]) {
      techStack.push({ name: "Fastly", category: "CDN" });
    }
    if (rawHeaders["x-akamai-transformed"]) {
      techStack.push({ name: "Akamai", category: "CDN" });
    }
    if (responseBody) {
      if (responseBody.includes("wp-content") || responseBody.includes("wp-includes")) {
        techStack.push({
          name: "WordPress",
          category: "CMS",
          cves: [
            {
              cveId: "CVE-2023-2745",
              summary: "WordPress Core directory traversal & privilege escalation vulnerabilities",
              severity: "HIGH"
            }
          ]
        });
      }
      if (responseBody.includes("Drupal.settings") || responseBody.includes("drupal.js")) {
        techStack.push({ name: "Drupal", category: "CMS" });
      }
      if (responseBody.includes("Shopify.theme") || responseBody.includes("cdn.shopify.com")) {
        techStack.push({ name: "Shopify", category: "CMS" });
      }
      if (responseBody.includes("_next/static") || responseBody.includes("__NEXT_DATA__")) {
        techStack.push({ name: "Next.js", category: "Framework" });
      }
      if (responseBody.includes("react-root") || responseBody.includes("data-reactroot")) {
        techStack.push({ name: "React", category: "Framework" });
      }
      const generatorMatch = responseBody.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
      if (generatorMatch && generatorMatch[1]) {
        techStack.push({
          name: generatorMatch[1],
          category: "CMS"
        });
        addFlaw({
          title: `CMS Version Leaked via HTML Generator Meta Tag`,
          category: "INFO_DISCLOSURE",
          severity: "LOW",
          cvssScore: 3.5,
          owaspCategory: "A05:2021 Security Misconfiguration",
          description: `The page exposes software and version details in an HTML meta tag: "${generatorMatch[1]}".`,
          impact: "Automated crawlers easily index outdated instances for mass automated exploitation.",
          evidence: generatorMatch[0],
          remediation: "Remove the generator tag from the site header templates."
        });
      }
    }
    const sensitiveEndpoints = [];
    let robotsTxtData;
    let securityTxtData;
    try {
      const robotsRes = await fetchWithTimeout(`https://${hostname}/robots.txt`, {}, 3e3);
      if (robotsRes.ok) {
        const text = await robotsRes.text();
        const lines = text.split("\n");
        const disallowed = lines.filter((l) => l.trim().toLowerCase().startsWith("disallow:")).map((l) => l.split(":")[1]?.trim() || "").filter(Boolean);
        const sitemaps = lines.filter((l) => l.trim().toLowerCase().startsWith("sitemap:")).map((l) => l.split(":").slice(1).join(":").trim()).filter(Boolean);
        robotsTxtData = {
          exists: true,
          disallowedPaths: disallowed.slice(0, 20),
          sitemaps: sitemaps.slice(0, 5),
          raw: text.slice(0, 800)
        };
        const sensitiveKeywords = ["admin", "backup", "portal", "internal", "api", "dashboard", "private", "phpmyadmin", "staging"];
        const exposedSensitive = disallowed.filter((p) => sensitiveKeywords.some((k) => p.toLowerCase().includes(k)));
        if (exposedSensitive.length > 0) {
          addFlaw({
            title: "Sensitive Administrative Routes Exposed in robots.txt",
            category: "INFO_DISCLOSURE",
            severity: "LOW",
            cvssScore: 3.8,
            owaspCategory: "A01:2021 Broken Access Control",
            description: `The robots.txt file reveals paths to potentially private endpoints: ${exposedSensitive.slice(0, 5).join(", ")}.`,
            impact: "Attackers inspect robots.txt as an reconnaissance blueprint to locate hidden administrative interfaces.",
            evidence: exposedSensitive.slice(0, 5).join(", "),
            remediation: "Enforce authentication and network-level access controls rather than relying on robots.txt for obscurity."
          });
        }
      }
    } catch {
    }
    try {
      const secTxtRes = await fetchWithTimeout(`https://${hostname}/.well-known/security.txt`, {}, 3e3);
      if (secTxtRes.ok) {
        const text = await secTxtRes.text();
        const contactMatch = text.match(/Contact:\s*([^\n\r]+)/i);
        securityTxtData = {
          exists: true,
          contact: contactMatch ? contactMatch[1].trim() : "Defined",
          raw: text.slice(0, 500)
        };
      } else {
        securityTxtData = { exists: false };
      }
    } catch {
      securityTxtData = { exists: false };
    }
    const probePaths = [
      { path: "/.git/HEAD", risk: "CRITICAL", desc: "Exposed Git repository metadata allows full source code reconstruction." },
      { path: "/.env", risk: "CRITICAL", desc: "Environment configuration file containing database credentials and secret API keys." },
      { path: "/wp-config.php.bak", risk: "HIGH", desc: "Backup file containing plaintext database passwords." }
    ];
    for (const p of probePaths) {
      try {
        const checkRes = await fetchWithTimeout(`https://${hostname}${p.path}`, { method: "GET" }, 2500);
        if (checkRes.status === 200) {
          const sample = (await checkRes.text()).slice(0, 100);
          const isRealGit = p.path.includes(".git") && sample.includes("ref:");
          const isRealEnv = p.path.includes(".env") && (sample.includes("=") && !sample.includes("<!DOCTYPE"));
          if (isRealGit || isRealEnv) {
            sensitiveEndpoints.push({
              path: p.path,
              status: checkRes.status,
              accessible: true,
              risk: p.risk,
              description: p.desc,
              snippet: sample.slice(0, 60)
            });
            addFlaw({
              title: `High-Risk File Directly Accessible: ${p.path}`,
              category: "INFO_DISCLOSURE",
              severity: p.risk,
              cvssScore: p.risk === "CRITICAL" ? 9.8 : 8.2,
              owaspCategory: "A01:2021 Broken Access Control",
              description: `The file ${p.path} was directly retrieved with HTTP 200 OK.`,
              impact: p.desc,
              evidence: `Path: ${p.path}, Status: 200 OK`,
              remediation: `Block web server access to all dotfiles and backup files matching '.*'.`,
              remediationCode: {
                nginx: "location ~ /\\.(?!well-known) {\n  deny all;\n  return 404;\n}",
                apache: '<FilesMatch "^\\.">\n  Require all denied\n</FilesMatch>'
              }
            });
          }
        }
      } catch {
      }
    }
    const portsToProbe = [
      { port: 80, service: "HTTP (Web)", risk: "SAFE", desc: "Standard plaintext web traffic port" },
      { port: 443, service: "HTTPS (Encrypted Web)", risk: "SAFE", desc: "Standard encrypted web traffic port" },
      { port: 8080, service: "HTTP-Alt / Proxy", risk: "WARNING", desc: "Alternative web port, frequently used for staging or internal proxy" },
      { port: 8443, service: "HTTPS-Alt / Admin", risk: "WARNING", desc: "Alternative secure web/management console" },
      { port: 21, service: "FTP", risk: "CRITICAL", desc: "Unencrypted file transfer service" },
      { port: 22, service: "SSH", risk: "WARNING", desc: "Remote shell management" },
      { port: 3306, service: "MySQL Database", risk: "CRITICAL", desc: "Relational database exposed to the public internet" },
      { port: 5432, service: "PostgreSQL Database", risk: "CRITICAL", desc: "PostgreSQL database exposed directly to public internet" }
    ];
    const portsResult = [];
    if (resolvedIp) {
      const probePromises = portsToProbe.map(async (p) => {
        const isOpen = await probePort(resolvedIp, p.port, 1200);
        return {
          port: p.port,
          service: p.service,
          open: isOpen,
          risk: p.risk,
          description: p.desc
        };
      });
      const results = await Promise.all(probePromises);
      portsResult.push(...results);
      for (const p of results) {
        if (p.open && (p.port === 3306 || p.port === 5432 || p.port === 21)) {
          addFlaw({
            title: `Dangerous Public Service Port Open: Port ${p.port} (${p.service})`,
            category: "PORTS",
            severity: "CRITICAL",
            cvssScore: 9.3,
            owaspCategory: "A05:2021 Security Misconfiguration",
            description: `Port ${p.port} (${p.service}) was found open and accepting TCP handshakes on public IP ${resolvedIp}.`,
            impact: "Direct database access exposes critical user records, tables, and credentials to automated credential brute-force or exploitation.",
            evidence: `IP: ${resolvedIp}:${p.port} (State: OPEN)`,
            remediation: "Bind database daemons strictly to localhost (127.0.0.1) or block external access using cloud firewall security groups."
          });
        }
      }
    }
    let score = 100;
    const flawsCount = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: flaws.length
    };
    for (const f of flaws) {
      if (f.severity === "CRITICAL") {
        score -= 25;
        flawsCount.critical++;
      } else if (f.severity === "HIGH") {
        score -= 15;
        flawsCount.high++;
      } else if (f.severity === "MEDIUM") {
        score -= 7;
        flawsCount.medium++;
      } else if (f.severity === "LOW") {
        score -= 3;
        flawsCount.low++;
      } else {
        flawsCount.info++;
      }
    }
    score = Math.max(0, Math.min(100, score));
    let securityGrade = "A";
    if (score >= 95 && flawsCount.critical === 0 && flawsCount.high === 0) securityGrade = "A+";
    else if (score >= 85 && flawsCount.critical === 0) securityGrade = "A";
    else if (score >= 70 && flawsCount.critical === 0) securityGrade = "B";
    else if (score >= 55) securityGrade = "C";
    else if (score >= 40) securityGrade = "D";
    else securityGrade = "F";
    const passedChecksCount = headersAudit.filter((h) => h.status === "PASS").length + (sslInfo?.valid ? 2 : 0) + (dnsRecords.spf?.valid ? 1 : 0) + (dnsRecords.dmarc?.valid ? 1 : 0);
    let aiAnalysis;
    if (deepAiScan) {
      aiAnalysis = await synthesizeSecurityReport({
        provider: aiProvider,
        model: aiModel,
        lang,
        hostname,
        finalUrl,
        score,
        securityGrade,
        flaws,
        flawsCount,
        techStack,
        sslInfo: sslInfo || void 0,
        httpsRedirects,
        customConfig: customAiConfig
      });
    }
    const scanResult = {
      id: `SCAN-${Date.now().toString(36).toUpperCase()}`,
      url: inputUrl,
      hostname,
      ip: resolvedIp,
      scanTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
      sslInfo: sslInfo || void 0,
      dnsRecords,
      cookies: cookieAudits,
      techStack,
      ports: portsResult,
      sensitiveEndpoints,
      robotsTxt: robotsTxtData,
      securityTxt: securityTxtData,
      aiAnalysis
    };
    res.json(scanResult);
  } catch (err) {
    console.error("Scan processing error:", err);
    res.status(500).json({
      error: "Vulnerability scan processing failed: " + (err?.message || "Unknown server error")
    });
  }
});
async function setupServer() {
  const server = http.createServer(app);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`WEBSCANNER server running on http://0.0.0.0:${PORT}`);
  });
}
setupServer();
