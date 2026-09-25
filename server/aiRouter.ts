import { GoogleGenAI } from '@google/genai';
import type { AiAnalysis, AiProviderId, AiProviderInfo, SecurityFlaw, SecurityGrade, TechStackItem, SslInfo } from '../src/types/scanner';

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const PROVIDER_METADATA: Record<AiProviderId, { name: string; defaultModel: string; availableModels: string[]; isLocal: boolean; description: string }> = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-3.8-flash',
    availableModels: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
    isLocal: false,
    description: 'Flagship reasoning and multimodal threat modeling by Google DeepMind.',
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
    isLocal: false,
    description: 'State-of-the-art vulnerability synthesis via OpenAI GPT-4o.',
  },
  anthropic: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet-20241022',
    availableModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    isLocal: false,
    description: 'Deep cybersecurity analysis and strategic remediation reasoning by Anthropic.',
  },
  ollama: {
    name: 'Ollama (Local / On-Premise)',
    defaultModel: 'llama3',
    availableModels: ['llama3', 'mistral', 'deepseek-r1', 'qwen2.5'],
    isLocal: true,
    description: '100% private, on-premise local inference with zero telemetry or cloud API fees.',
  },
  mistral: {
    name: 'Mistral AI',
    defaultModel: 'mistral-large-latest',
    availableModels: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
    isLocal: false,
    description: 'High-performance European sovereign enterprise foundation models.',
  },
  offline: {
    name: 'Native Deterministic Rule Engine',
    defaultModel: 'Deterministic CISO Engine v1.0',
    availableModels: ['Deterministic CISO Engine v1.0'],
    isLocal: true,
    description: 'Zero external dependencies; instant algorithmic CVSS vulnerability scoring.',
  },
  custom: {
    name: 'Custom / Any AI Provider',
    defaultModel: 'deepseek-chat',
    availableModels: ['deepseek-chat', 'llama-3.3-70b-versatile', 'meta-llama/llama-3.3-70b-instruct', 'sonar-pro'],
    isLocal: false,
    description: 'Bring any AI: DeepSeek, Groq, OpenRouter, Perplexity, LM Studio, vLLM, or custom endpoint.',
  },
};

export function getAvailableAiProviders(): { activeProvider: AiProviderId; providers: AiProviderInfo[] } {
  const activeProvider = (process.env.DEFAULT_AI_PROVIDER as AiProviderId) || 'gemini';

  const providers: AiProviderInfo[] = Object.entries(PROVIDER_METADATA).map(([id, meta]) => {
    const pId = id as AiProviderId;
    let isConfigured = false;

    if (pId === 'gemini') isConfigured = !!process.env.GEMINI_API_KEY;
    else if (pId === 'openai') isConfigured = !!process.env.OPENAI_API_KEY;
    else if (pId === 'anthropic') isConfigured = !!process.env.ANTHROPIC_API_KEY;
    else if (pId === 'mistral') isConfigured = !!process.env.MISTRAL_API_KEY;
    else if (pId === 'ollama') isConfigured = true; // Local server endpoint
    else if (pId === 'offline') isConfigured = true; // Always available
    else if (pId === 'custom') isConfigured = true; // User-provided config or endpoint

    return {
      id: pId,
      name: meta.name,
      defaultModel: meta.defaultModel,
      availableModels: meta.availableModels,
      isConfigured,
      isLocal: meta.isLocal,
      description: meta.description,
    };
  });

  return {
    activeProvider,
    providers,
  };
}

export interface SynthesisParams {
  provider?: AiProviderId;
  model?: string;
  lang?: string;
  hostname: string;
  finalUrl: string;
  score: number;
  securityGrade: SecurityGrade;
  flaws: SecurityFlaw[];
  flawsCount: { critical: number; high: number; medium: number; low: number; info: number; total: number };
  techStack: TechStackItem[];
  sslInfo?: SslInfo;
  httpsRedirects: boolean;
  customConfig?: {
    providerName?: string;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
  };
}

export async function synthesizeSecurityReport(params: SynthesisParams): Promise<AiAnalysis> {
  const {
    provider = (process.env.DEFAULT_AI_PROVIDER as AiProviderId) || 'gemini',
    model,
    lang = 'en',
    hostname,
    finalUrl,
    score,
    securityGrade,
    flaws,
    flawsCount,
    techStack,
    sslInfo,
    httpsRedirects,
    customConfig,
  } = params;

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

  // 1. Google Gemini
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    try {
      const activeModel = model || PROVIDER_METADATA.gemini.defaultModel;
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          provider: 'gemini',
          providerName: PROVIDER_METADATA.gemini.name,
          modelUsed: activeModel,
        };
      }
    } catch (err) {
      console.warn('Gemini synthesis failed, attempting fallback:', err);
    }
  }

  // 2. OpenAI
  const openAiKey = customConfig?.apiKey || process.env.OPENAI_API_KEY;
  if (provider === 'openai' && openAiKey) {
    try {
      const activeModel = model || process.env.OPENAI_MODEL || PROVIDER_METADATA.openai.defaultModel;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: 'system', content: 'You are a Principal Cybersecurity Penetration Tester and CISO. You output only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...parsed,
            provider: 'openai',
            providerName: PROVIDER_METADATA.openai.name,
            modelUsed: activeModel,
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI synthesis failed:', err);
    }
  }

  // 3. Anthropic Claude
  const anthropicKey = customConfig?.apiKey || process.env.ANTHROPIC_API_KEY;
  if (provider === 'anthropic' && anthropicKey) {
    try {
      const activeModel = model || process.env.ANTHROPIC_MODEL || PROVIDER_METADATA.anthropic.defaultModel;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: activeModel,
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nIMPORTANT: Respond with pure raw JSON only. Do not wrap in markdown quotes or preamble.`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content?.[0]?.text;
        if (content) {
          const cleanJson = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
          const parsed = JSON.parse(cleanJson);
          return {
            ...parsed,
            provider: 'anthropic',
            providerName: PROVIDER_METADATA.anthropic.name,
            modelUsed: activeModel,
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic synthesis failed:', err);
    }
  }

  // 4. Ollama (Self-Hosted / Local LLM)
  if (provider === 'ollama') {
    try {
      const baseUrl = customConfig?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const activeModel = model || customConfig?.model || process.env.OLLAMA_MODEL || PROVIDER_METADATA.ollama.defaultModel;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for local inference

      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeModel,
          prompt,
          format: 'json',
          stream: false,
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          const parsed = JSON.parse(data.response);
          return {
            ...parsed,
            provider: 'ollama',
            providerName: PROVIDER_METADATA.ollama.name,
            modelUsed: `${activeModel} (Local Inference)`,
          };
        }
      }
    } catch (err) {
      console.warn('Ollama local inference failed or not reachable:', err);
    }
  }

  // 5. Mistral AI
  const mistralKey = customConfig?.apiKey || process.env.MISTRAL_API_KEY;
  if (provider === 'mistral' && mistralKey) {
    try {
      const activeModel = model || process.env.MISTRAL_MODEL || PROVIDER_METADATA.mistral.defaultModel;
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: 'system', content: 'You are a Principal Cybersecurity Penetration Tester and CISO.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...parsed,
            provider: 'mistral',
            providerName: PROVIDER_METADATA.mistral.name,
            modelUsed: activeModel,
          };
        }
      }
    } catch (err) {
      console.warn('Mistral AI synthesis failed:', err);
    }
  }

  // 6. Custom / Any AI Provider (OpenAI-compatible endpoints: DeepSeek, Groq, OpenRouter, Perplexity, LM Studio, etc.)
  if (provider === 'custom' || customConfig?.baseUrl) {
    try {
      const customBaseUrl = (customConfig?.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
      const customModel = customConfig?.model || model || 'deepseek-chat';
      const customApiKey = customConfig?.apiKey || process.env.CUSTOM_AI_API_KEY || '';
      const customProviderName = customConfig?.providerName || 'Custom AI';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customApiKey) {
        headers['Authorization'] = `Bearer ${customApiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const endpoint = customBaseUrl.endsWith('/chat/completions')
        ? customBaseUrl
        : `${customBaseUrl}/chat/completions`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: customModel,
          messages: [
            {
              role: 'system',
              content: 'You are a Principal Cybersecurity Penetration Tester and CISO. You output only valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleanJson = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
          const parsed = JSON.parse(cleanJson);
          return {
            ...parsed,
            provider: 'custom',
            providerName: customProviderName,
            modelUsed: `${customModel} (${customProviderName})`,
          };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`Custom AI provider endpoint returned error ${res.status}:`, errText);
      }
    } catch (err) {
      console.warn('Custom AI provider execution failed:', err);
    }
  }

  // 7. Native Deterministic Rule Engine (Offline Fallback)
  return {
    provider: 'offline',
    providerName: PROVIDER_METADATA.offline.name,
    modelUsed: PROVIDER_METADATA.offline.defaultModel,
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
      owaspTop10: 'Primary findings correspond to OWASP A05:2021 (Security Misconfiguration) and A02:2021 (Cryptographic Failures).',
      pciDss: 'Requires mandatory TLS 1.2+ configuration, strict HSTS enablement, and removal of exposed administrative endpoints under Requirement 4 & 6.',
      iso27001: 'Aligns with ISO/IEC 27001:2022 Control A.8.20 (Network Security) and A.8.26 (Application Security Requirements).',
    },
  };
}
