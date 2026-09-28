import React, { useState, useEffect } from 'react';
import {
  X,
  Network,
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  Trash2,
  RefreshCw,
  Terminal,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
} from 'lucide-react';
import type {
  McpServerConfig,
  McpToolDefinition,
  McpToolCallResponse,
} from '../types/scanner';

interface McpHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDomain?: string;
  onScanTarget?: (url: string) => void;
}

export const McpHubModal: React.FC<McpHubModalProps> = ({
  isOpen,
  onClose,
  defaultDomain = 'example.com',
  onScanTarget,
}) => {
  const [activeTab, setActiveTab] = useState<'servers' | 'tools' | 'guide'>('servers');
  const [servers, setServers] = useState<McpServerConfig[]>([]);
  const [tools, setTools] = useState<McpToolDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Server Form State
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'http' | 'sse'>('http');
  const [newEndpoint, setNewEndpoint] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [serverTestStatus, setServerTestStatus] = useState<string>('');

  // Tool Runner State
  const [selectedTool, setSelectedTool] = useState<McpToolDefinition | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({ domain: defaultDomain });
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [toolResult, setToolResult] = useState<McpToolCallResponse | null>(null);

  // Load servers and tools on mount
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [serversRes, toolsRes] = await Promise.all([
        fetch('/api/mcp/servers'),
        fetch('/api/mcp/tools'),
      ]);

      if (serversRes.ok) {
        const sData = await serversRes.json();
        setServers(sData);
      }
      if (toolsRes.ok) {
        const tData = await toolsRes.json();
        setTools(tData);
        if (tData.length > 0 && !selectedTool) {
          setSelectedTool(tData[0]);
          initToolArgs(tData[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load MCP hub data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const initToolArgs = (tool: McpToolDefinition) => {
    const args: Record<string, any> = {};
    for (const p of tool.parameters) {
      if (p.name === 'domain' || p.name === 'host') {
        args[p.name] = defaultDomain;
      } else if (p.name === 'ip') {
        args[p.name] = '1.1.1.1';
      } else if (p.default !== undefined) {
        args[p.name] = p.default;
      } else {
        args[p.name] = '';
      }
    }
    setToolArgs(args);
  };

  const handleSelectTool = (tool: McpToolDefinition) => {
    setSelectedTool(tool);
    initToolArgs(tool);
    setToolResult(null);
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setIsExecutingTool(true);
    setToolResult(null);

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: selectedTool.serverId,
          toolName: selectedTool.name,
          arguments: toolArgs,
        }),
      });

      const data = await res.json();
      setToolResult(data);
    } catch (err: any) {
      setToolResult({
        success: false,
        error: err?.message || 'Tool call network error',
        executionTimeMs: 0,
        toolName: selectedTool.name,
        serverId: selectedTool.serverId,
      });
    } finally {
      setIsExecutingTool(false);
    }
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEndpoint) return;

    try {
      const payload: McpServerConfig = {
        id: `mcp-${Date.now().toString(36)}`,
        name: newName,
        type: newType,
        endpoint: newEndpoint,
        status: 'connected',
        description: newDescription || 'Custom MCP Server',
        toolsCount: 0,
        isBuiltin: false,
        apiKey: newApiKey || undefined,
      };

      const res = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddingServer(false);
        setNewName('');
        setNewEndpoint('');
        setNewApiKey('');
        setNewDescription('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add MCP server:', err);
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      await fetch(`/api/mcp/servers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to delete server:', err);
    }
  };

  const handleTestServer = async (srv: McpServerConfig) => {
    setServerTestStatus('Testing ' + srv.name + '...');
    try {
      const res = await fetch('/api/mcp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(srv),
      });
      const data = await res.json();
      setServerTestStatus(data.message || (data.success ? 'Success' : 'Failed'));
    } catch (err: any) {
      setServerTestStatus('Test failed: ' + err?.message);
    }
    setTimeout(() => setServerTestStatus(''), 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
                  Model Context Protocol (MCP) Hub
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  MCP v1.0 Spec
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  {servers.length} Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized OSINT tool integration server enabling autonomous AI security agents to discover and exploit intelligence.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 border-b border-slate-800 bg-slate-950/20 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('servers')}
            className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'servers'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connected MCP Servers ({servers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Tool Runner ({tools.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>OSINT Agent Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: Connected Servers */}
          {activeTab === 'servers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-mono">
                    Registered MCP Tool Servers
                  </h4>
                  <p className="text-xs text-slate-400">
                    Connect local or remote MCP servers via JSON-RPC over Stream/HTTP or Server-Sent Events (SSE).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingServer(!isAddingServer)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/80 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingServer ? 'Cancel' : 'Add Custom MCP Server'}</span>
                </button>
              </div>

              {serverTestStatus && (
                <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800 text-xs font-mono text-purple-200 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span>{serverTestStatus}</span>
                </div>
              )}

              {/* Add Server Form */}
              {isAddingServer && (
                <form
                  onSubmit={handleAddServer}
                  className="p-4 rounded-xl bg-slate-950 border border-purple-900/60 space-y-3 animate-in fade-in"
                >
                  <h5 className="text-xs font-bold text-purple-300 font-mono uppercase tracking-wider">
                    Register New MCP Server
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Server Name:
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Shodan Recon MCP"
                        className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Transport Protocol:
                      </label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-purple-400"
                      >
                        <option value="http">Streamable HTTP (JSON-RPC 2.0)</option>
                        <option value="sse">Server-Sent Events (SSE)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Endpoint URL:
                      </label>
                      <input
                        type="url"
                        required
                        value={newEndpoint}
                        onChange={(e) => setNewEndpoint(e.target.value)}
                        placeholder="http://localhost:8080/mcp or https://api.mcp-service.io"
                        className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Bearer Token / API Key (Optional):
                      </label>
                      <input
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="Bearer token or authorization key"
                        className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                        Description:
                      </label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="OSINT reconnaissance server"
                        className="w-full bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingServer(false)}
                      className="px-3 py-1.5 rounded bg-slate-900 text-slate-300 border border-slate-700 hover:text-white text-xs font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs font-mono transition-colors cursor-pointer"
                    >
                      Save MCP Server
                    </button>
                  </div>
                </form>
              )}

              {/* Servers List */}
              <div className="space-y-3">
                {servers.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{srv.name}</span>
                        {srv.isBuiltin ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                            Built-in OSINT
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800/60 uppercase">
                            {srv.type}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Connected</span>
                          {srv.latencyMs && (
                            <span className="text-slate-500">({srv.latencyMs}ms)</span>
                          )}
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="text-[10px] text-slate-500 truncate">
                        Endpoint: <code>{srv.endpoint}</code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestServer(srv)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] transition-colors cursor-pointer"
                      >
                        Ping / Test
                      </button>

                      {!srv.isBuiltin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteServer(srv.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove server"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Interactive Tool Runner */}
          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Tool Selector */}
              <div className="md:col-span-5 space-y-2 border-r-0 md:border-r border-slate-800/80 pr-0 md:pr-4">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Available MCP Tools
                </div>

                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {tools.map((t) => {
                    const isSelected = selectedTool?.name === t.name;
                    return (
                      <div
                        key={t.name}
                        onClick={() => handleSelectTool(t)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer text-xs font-mono ${
                          isSelected
                            ? 'bg-purple-950/60 border-purple-500/80 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-purple-300">{t.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Execution Form & Output */}
              <div className="md:col-span-7 space-y-4">
                {selectedTool && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-purple-400" />
                          <span>Tool: <code>{selectedTool.name}</code></span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selectedTool.serverName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {selectedTool.description}
                      </p>
                    </div>

                    {/* Parameters Input */}
                    <div className="space-y-2 text-xs font-mono">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Tool Arguments (JSON-RPC Schema):
                      </div>

                      {selectedTool.parameters.map((param) => (
                        <div key={param.name}>
                          <label className="text-[11px] text-slate-300 block mb-1">
                            <code>{param.name}</code>
                            {param.required && <span className="text-rose-400 ml-1">*</span>}
                            <span className="text-[10px] text-slate-500 ml-2">({param.type})</span>
                          </label>
                          <input
                            type="text"
                            value={toolArgs[param.name] ?? ''}
                            onChange={(e) =>
                              setToolArgs({ ...toolArgs, [param.name]: e.target.value })
                            }
                            placeholder={param.description}
                            className="w-full bg-slate-950 text-slate-100 px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-purple-400 text-xs font-mono"
                          />
                        </div>
                      ))}

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isExecutingTool}
                          onClick={handleExecuteTool}
                          className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                        >
                          {isExecutingTool ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Executing Tool via MCP...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Execute MCP Tool Call</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Result Output Inspector */}
                    {toolResult && (
                      <div className="space-y-1.5 pt-2 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-purple-400" />
                            <span>Response Inspector</span>
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Latency: {toolResult.executionTimeMs}ms
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-[300px]">
                          {toolResult.success ? (
                            <pre className="text-emerald-300">
                              {JSON.stringify(toolResult.result, null, 2)}
                            </pre>
                          ) : (
                            <div className="text-rose-400 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-bold">Execution Error:</div>
                                <div>{toolResult.error}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs font-mono leading-relaxed text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>What is the Model Context Protocol (MCP)?</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  Model Context Protocol (MCP) is an open standard that allows Large Language Models (LLMs) and Autonomous AI Agents to connect to external security tools, databases, and OSINT aggregators securely and deterministically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. Passive Reconnaissance</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    The Agent calls <code>crt.sh</code> to map out subdomains and <code>Wayback Machine</code> to locate old backups without sending any packets to the target server.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    <span>2. Infrastructure Correlation</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    DNS records, IP reputation, and ASN mapping are correlated automatically to identify cloud boundaries, CDNs, and vulnerable hosting providers.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. Standardized JSON-RPC</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    All tools expose strict JSON schemas, allowing zero-shot tool usage with Gemini, Claude 3.5 Sonnet, GPT-4o, and DeepSeek.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>4. Extensible Ecosystem</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Plug in external community MCP servers such as Shodan MCP, GitHub Secret Scanner MCP, or Playwright Headless Browser MCP.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>MCP Service Engine Online</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
