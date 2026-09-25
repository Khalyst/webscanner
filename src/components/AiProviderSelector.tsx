import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bot,
  Check,
  ChevronDown,
  Sparkles,
  Server,
  Cpu,
  Info,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Key,
  Globe,
  Plus,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import type { AiProviderId, AiProviderInfo, CustomAiConfig } from '../types/scanner';

interface AiProviderSelectorProps {
  selectedProvider: AiProviderId;
  selectedModel: string;
  onSelect: (provider: AiProviderId, model: string, customConfig?: CustomAiConfig) => void;
  disabled?: boolean;
}

const PRESET_CUSTOM_PROVIDERS = [
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    tag: 'DeepSeek V3 / R1',
  },
  {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    tag: 'Ultra-Fast LPU',
  },
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.3-70b-instruct',
    tag: 'Aggregator',
  },
  {
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    model: 'sonar-pro',
    tag: 'Search & Grounded',
  },
  {
    name: 'LM Studio / Local',
    baseUrl: 'http://localhost:1234/v1',
    model: 'local-model',
    tag: 'Local OpenAI API',
  },
];

export const AiProviderSelector: React.FC<AiProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<AiProviderInfo[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom provider state (persisted in localStorage)
  const [customName, setCustomName] = useState(() => {
    try {
      return localStorage.getItem('webscanner_custom_provider_name') || 'DeepSeek';
    } catch {
      return 'DeepSeek';
    }
  });

  const [customBaseUrl, setCustomBaseUrl] = useState(() => {
    try {
      return localStorage.getItem('webscanner_custom_base_url') || 'https://api.deepseek.com/v1';
    } catch {
      return 'https://api.deepseek.com/v1';
    }
  });

  const [customModelInput, setCustomModelInput] = useState(() => {
    try {
      return localStorage.getItem('webscanner_custom_model') || 'deepseek-chat';
    } catch {
      return 'deepseek-chat';
    }
  });

  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('webscanner_custom_api_key') || '';
    } catch {
      return '';
    }
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditingCustomModel, setIsEditingCustomModel] = useState(false);
  const [freeformModelInput, setFreeformModelInput] = useState('');

  // Save custom state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('webscanner_custom_provider_name', customName);
      localStorage.setItem('webscanner_custom_base_url', customBaseUrl);
      localStorage.setItem('webscanner_custom_model', customModelInput);
      if (customApiKey) {
        localStorage.setItem('webscanner_custom_api_key', customApiKey);
      } else {
        localStorage.removeItem('webscanner_custom_api_key');
      }
    } catch {
      // ignore
    }
  }, [customName, customBaseUrl, customModelInput, customApiKey]);

  useEffect(() => {
    // Fetch available providers from server
    fetch('/api/ai-providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) {
          setProviders(data.providers);
        }
      })
      .catch(() => {
        setProviders([
          {
            id: 'gemini',
            name: 'Google Gemini',
            defaultModel: 'gemini-3.8-flash',
            availableModels: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
            isConfigured: true,
            isLocal: false,
            description: 'Flagship reasoning and threat modeling by Google DeepMind.',
          },
          {
            id: 'custom',
            name: 'Custom / Any AI Provider',
            defaultModel: 'deepseek-chat',
            availableModels: ['deepseek-chat', 'llama-3.3-70b-versatile', 'sonar-pro'],
            isConfigured: true,
            isLocal: false,
            description: 'Use any custom AI: DeepSeek, Groq, OpenRouter, Perplexity, LM Studio, etc.',
          },
          {
            id: 'openai',
            name: 'OpenAI',
            defaultModel: 'gpt-4o',
            availableModels: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
            isConfigured: false,
            isLocal: false,
            description: 'State-of-the-art vulnerability synthesis via OpenAI GPT-4o.',
          },
          {
            id: 'anthropic',
            name: 'Anthropic Claude',
            defaultModel: 'claude-3-5-sonnet-20241022',
            availableModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
            isConfigured: false,
            isLocal: false,
            description: 'Deep cybersecurity analysis and strategic remediation reasoning by Anthropic.',
          },
          {
            id: 'ollama',
            name: 'Ollama (Local / On-Premise)',
            defaultModel: 'llama3',
            availableModels: ['llama3', 'mistral', 'deepseek-r1', 'qwen2.5'],
            isConfigured: true,
            isLocal: true,
            description: '100% private, on-premise local inference with zero telemetry.',
          },
          {
            id: 'mistral',
            name: 'Mistral AI',
            defaultModel: 'mistral-large-latest',
            availableModels: ['mistral-large-latest', 'mistral-small-latest'],
            isConfigured: false,
            isLocal: false,
            description: 'High-performance European sovereign enterprise foundation models.',
          },
          {
            id: 'offline',
            name: 'Native Deterministic Rule Engine',
            defaultModel: 'Deterministic CISO Engine v1.0',
            availableModels: ['Deterministic CISO Engine v1.0'],
            isConfigured: true,
            isLocal: true,
            description: 'Zero external dependencies; instant algorithmic CVSS vulnerability scoring.',
          },
        ]);
      });

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const activeProviderInfo = providers.find((p) => p.id === selectedProvider) || providers[0];

  const getProviderIcon = (id: AiProviderId) => {
    switch (id) {
      case 'gemini':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'custom':
        return <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />;
      case 'openai':
      case 'anthropic':
      case 'mistral':
        return <Bot className="w-3.5 h-3.5 text-purple-400" />;
      case 'ollama':
        return <Server className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Filtered providers based on search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase().trim();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.availableModels.some((m) => m.toLowerCase().includes(q))
    );
  }, [providers, searchQuery]);

  const handleApplyCustomProvider = (
    name = customName,
    baseUrl = customBaseUrl,
    model = customModelInput,
    apiKey = customApiKey
  ) => {
    const config: CustomAiConfig = {
      providerName: name || 'Custom AI',
      baseUrl: baseUrl || 'https://api.openai.com/v1',
      model: model || 'deepseek-chat',
      apiKey: apiKey || undefined,
    };
    onSelect('custom', config.model, config);
  };

  const handleSelectPreset = (preset: typeof PRESET_CUSTOM_PROVIDERS[0]) => {
    setCustomName(preset.name);
    setCustomBaseUrl(preset.baseUrl);
    setCustomModelInput(preset.model);
    handleApplyCustomProvider(preset.name, preset.baseUrl, preset.model, customApiKey);
  };

  const handleSelectStandardProvider = (p: AiProviderInfo, model: string) => {
    if (p.id === 'custom') {
      handleApplyCustomProvider();
    } else {
      // If user has a custom API key stored for openai/anthropic/mistral, send it
      const customConfig: CustomAiConfig | undefined = customApiKey
        ? {
            providerName: p.name,
            model,
            baseUrl: '',
            apiKey: customApiKey,
          }
        : undefined;
      onSelect(p.id, model, customConfig);
    }
  };

  const displayName = selectedProvider === 'custom' ? (customName || 'Custom AI') : activeProviderInfo?.name;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm"
        title="Choose or type any AI Model Provider"
      >
        {getProviderIcon(selectedProvider)}
        <span className="font-semibold text-slate-200">{displayName}</span>
        <span className="text-[10px] text-slate-400 hidden sm:inline truncate max-w-[120px]">
          ({selectedModel || (selectedProvider === 'custom' ? customModelInput : activeProviderInfo?.defaultModel)})
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Rolling Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-104 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-2.5 pt-1 pb-2 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI-Agnostic Intelligence Engine</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                Any Model
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Choose from built-in models or freely write your own AI provider, endpoint, and model ID.
            </p>

            {/* Search & Write Input */}
            <div className="mt-2.5 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or type any AI provider / model..."
                className="w-full bg-slate-950 text-slate-100 placeholder:text-slate-500 text-xs font-mono pl-8 pr-3 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Quick Action when typing custom provider */}
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => {
                  setCustomName(searchQuery.trim());
                  handleApplyCustomProvider(searchQuery.trim(), customBaseUrl, customModelInput, customApiKey);
                  setSearchQuery('');
                }}
                className="mt-2 w-full px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 text-amber-300 text-xs font-mono flex items-center justify-between transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Use as custom provider: <strong>&ldquo;{searchQuery.trim()}&rdquo;</strong></span>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-700/60 shrink-0 ml-1">
                  Select
                </span>
              </button>
            )}
          </div>

          {/* Providers List */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 p-1 space-y-1 flex-1 pr-1">
            {/* Custom AI Provider Option */}
            <div
              className={`p-3 rounded-xl transition-all cursor-pointer border ${
                selectedProvider === 'custom'
                  ? 'bg-slate-800/90 border-amber-500/50 shadow-sm'
                  : 'hover:bg-slate-800/40 border-slate-800/80 bg-slate-950/30'
              }`}
              onClick={() => handleApplyCustomProvider()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-white font-mono flex items-center gap-1.5">
                      <span>{customName || 'Custom / Any AI Provider'}</span>
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-mono block">
                      OpenAI-compatible &bull; {customModelInput}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    Any LLM
                  </span>
                  {selectedProvider === 'custom' && <Check className="w-4 h-4 text-amber-400 ml-1" />}
                </div>
              </div>

              {/* Custom Provider Detailed Inputs (visible when selected or expanded) */}
              {selectedProvider === 'custom' && (
                <div
                  className="mt-3 pt-3 border-t border-slate-700/60 space-y-2.5 text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Preset quick-chips */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Quick Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CUSTOM_PROVIDERS.map((pr) => (
                        <button
                          key={pr.name}
                          type="button"
                          onClick={() => handleSelectPreset(pr)}
                          className={`px-2 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                            customName === pr.name
                              ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          {pr.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Provider Name & Model Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Provider Name:
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => {
                          setCustomName(e.target.value);
                          handleApplyCustomProvider(e.target.value, customBaseUrl, customModelInput, customApiKey);
                        }}
                        placeholder="e.g. DeepSeek, Groq"
                        className="w-full bg-slate-950 text-slate-200 px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-400 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Model Identifier:
                      </label>
                      <input
                        type="text"
                        value={customModelInput}
                        onChange={(e) => {
                          setCustomModelInput(e.target.value);
                          handleApplyCustomProvider(customName, customBaseUrl, e.target.value, customApiKey);
                        }}
                        placeholder="e.g. deepseek-chat, llama-3.3-70b"
                        className="w-full bg-slate-950 text-amber-300 px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-400 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Base URL Input */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      API Endpoint URL (Base URL):
                    </label>
                    <input
                      type="text"
                      value={customBaseUrl}
                      onChange={(e) => {
                        setCustomBaseUrl(e.target.value);
                        handleApplyCustomProvider(customName, e.target.value, customModelInput, customApiKey);
                      }}
                      placeholder="https://api.deepseek.com/v1"
                      className="w-full bg-slate-950 text-slate-300 px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-400 text-xs font-mono"
                    />
                  </div>

                  {/* API Key Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3 h-3 text-slate-400" />
                        API Key (Saved locally in browser):
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showApiKey ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => {
                        setCustomApiKey(e.target.value);
                        handleApplyCustomProvider(customName, customBaseUrl, customModelInput, e.target.value);
                      }}
                      placeholder="sk-..."
                      className="w-full bg-slate-950 text-slate-200 px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-400 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Standard Built-in Providers */}
            {filteredProviders
              .filter((p) => p.id !== 'custom')
              .map((p) => {
                const isSelected = p.id === selectedProvider;

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border border-cyan-500/40'
                        : 'hover:bg-slate-800/40 border border-transparent'
                    }`}
                    onClick={() => {
                      handleSelectStandardProvider(p, p.defaultModel);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center">
                          {getProviderIcon(p.id)}
                        </div>
                        <span className="font-semibold text-xs text-slate-100 font-mono">
                          {p.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        {p.isLocal ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            Local / Private
                          </span>
                        ) : p.isConfigured ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Ready
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            Cloud API
                          </span>
                        )}

                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 pl-8 leading-snug">
                      {p.description}
                    </p>

                    {/* Model Selector & Freeform Model Input */}
                    {isSelected && (
                      <div
                        className="mt-2.5 pl-8 space-y-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">Model:</span>
                          {!isEditingCustomModel ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <select
                                value={selectedModel}
                                onChange={(e) => {
                                  if (e.target.value === '__custom__') {
                                    setIsEditingCustomModel(true);
                                    setFreeformModelInput(selectedModel);
                                  } else {
                                    handleSelectStandardProvider(p, e.target.value);
                                  }
                                }}
                                className="bg-slate-950 text-cyan-300 text-xs font-mono px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-400 cursor-pointer flex-1"
                              >
                                {p.availableModels.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                                <option value="__custom__">+ Write custom model...</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingCustomModel(true);
                                  setFreeformModelInput(selectedModel);
                                }}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[10px] font-mono border border-slate-700 cursor-pointer"
                                title="Write custom model ID"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="text"
                                value={freeformModelInput}
                                onChange={(e) => setFreeformModelInput(e.target.value)}
                                placeholder="Write any model ID..."
                                className="bg-slate-950 text-cyan-300 text-xs font-mono px-2 py-1 rounded border border-cyan-500 focus:outline-none flex-1"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (freeformModelInput.trim()) {
                                    handleSelectStandardProvider(p, freeformModelInput.trim());
                                  }
                                  setIsEditingCustomModel(false);
                                }}
                                className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold font-mono cursor-pointer"
                              >
                                Set
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingCustomModel(false)}
                                className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px] font-mono cursor-pointer"
                              >
                                &times;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Footer Note */}
          <div className="p-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Free to use any AI endpoint & model.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
