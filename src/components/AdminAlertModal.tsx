import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Mail,
  MessageSquare,
  Webhook,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  BellRing,
  Code,
  Check,
} from 'lucide-react';
import type { ScanResult, AdminAlertPayload } from '../types/scanner';
import { buildAdminAlertPayload } from '../utils/softwareUpdates';

interface AdminAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanResult;
}

type AlertTab = 'dispatch' | 'playbook' | 'advisory' | 'payload';
type AlertChannel = 'slack' | 'discord' | 'email' | 'webhook';

export const AdminAlertModal: React.FC<AdminAlertModalProps> = ({
  isOpen,
  onClose,
  scan,
}) => {
  const [activeTab, setActiveTab] = useState<AlertTab>('dispatch');
  const [channel, setChannel] = useState<AlertChannel>('slack');
  const [threshold, setThreshold] = useState<'CRITICAL' | 'HIGH' | 'ALL'>('HIGH');

  // Channel configuration states (persisted)
  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem('webscanner_admin_email') || `security@${scan.hostname}`;
  });

  const [slackWebhook, setSlackWebhook] = useState(() => {
    return localStorage.getItem('webscanner_slack_webhook') || '';
  });

  const [discordWebhook, setDiscordWebhook] = useState(() => {
    return localStorage.getItem('webscanner_discord_webhook') || '';
  });

  const [customWebhook, setCustomWebhook] = useState(() => {
    return localStorage.getItem('webscanner_custom_webhook') || '';
  });

  const [emailServerStatus, setEmailServerStatus] = useState<{
    configured: boolean;
    provider: string;
  } | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    deliveredAt?: string;
    httpCode?: number;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/alerts/email-status')
        .then((r) => r.json())
        .then((data) => setEmailServerStatus(data))
        .catch(() => setEmailServerStatus({ configured: false, provider: 'none' }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (adminEmail) localStorage.setItem('webscanner_admin_email', adminEmail);
  }, [adminEmail]);

  useEffect(() => {
    if (slackWebhook) localStorage.setItem('webscanner_slack_webhook', slackWebhook);
  }, [slackWebhook]);

  useEffect(() => {
    if (discordWebhook) localStorage.setItem('webscanner_discord_webhook', discordWebhook);
  }, [discordWebhook]);

  useEffect(() => {
    if (customWebhook) localStorage.setItem('webscanner_custom_webhook', customWebhook);
  }, [customWebhook]);

  if (!isOpen) return null;

  const activeWebhookUrl =
    channel === 'slack'
      ? slackWebhook
      : channel === 'discord'
      ? discordWebhook
      : channel === 'webhook'
      ? customWebhook
      : undefined;

  const alertPayload: AdminAlertPayload = buildAdminAlertPayload(
    scan,
    channel,
    adminEmail,
    activeWebhookUrl,
    threshold
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadPatchScript = () => {
    const script = scan.softwareUpdates?.patchScript || '#!/bin/bash\necho "No patches pending"';
    const blob = new Blob([script], { type: 'text/x-sh;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patch-${scan.hostname.replace(/[^a-z0-9]/gi, '_')}.sh`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDispatchAlert = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/alerts/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(alertPayload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || `HTTP ${response.status}: Alert delivery failed`);
      }

      setSendResult({
        success: true,
        message: resData.message || 'Alert successfully dispatched to administrator channel!',
        deliveredAt: resData.dispatchedAt || new Date().toISOString(),
        httpCode: resData.httpCode,
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || 'Failed to dispatch alert to webhook endpoint.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Generate Email Advisory text
  const emailSubject = `[SECURITY ALERT - URGENT] ${scan.hostname} Vulnerability & Patch Advisory (Grade ${scan.securityGrade})`;
  const emailBodyText = `WEBSCANNER AUTOMATED SECURITY ADVISORY
Target: ${scan.url}
Scan Timestamp: ${scan.scanTimestamp}
Security Posture: Grade ${scan.securityGrade} (${scan.overallScore}/100)
Critical Flaws: ${scan.flawsCount.critical}
High-Severity Flaws: ${scan.flawsCount.high}
Pending Outdated Updates: ${scan.softwareUpdates?.outdatedCount || 0}

=======================================================
TOP DETECTED VULNERABILITIES:
=======================================================
${
  alertPayload.vulnerabilities.length > 0
    ? alertPayload.vulnerabilities
        .map(
          (v, idx) =>
            `${idx + 1}. [${v.severity}] ${v.title}\n   Category: ${v.category}\n   Action: ${v.remediation}\n`
        )
        .join('\n')
    : 'None detected above current threshold.'
}

=======================================================
PENDING SOFTWARE UPDATES & CVE REMEDIATION:
=======================================================
${
  alertPayload.missingUpdates.length > 0
    ? alertPayload.missingUpdates
        .map(
          (u) =>
            `• Component: ${u.name}\n  Detected Version: ${u.detectedVersion || 'Legacy'}\n  Required Version: ${u.latestVersion}\n  Remediation: ${u.remediation}\n`
        )
        .join('\n')
    : 'All identified infrastructure components are up-to-date.'
}

=======================================================
ADMINISTRATOR ACTION REQUIRED:
=======================================================
1. Review the attached remediation steps and apply necessary OS/package updates.
2. Verify TLS certificate validity and enforce HTTPS with HSTS headers.
3. Re-run WEBSCANNER verification audit to validate remediation.

Report generated by WEBSCANNER Autonomous Audit Engine.`;

  const mailtoLink = `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBodyText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Administrator Security Alert System</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-800/80 text-rose-300">
                  CRITICAL INCIDENT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                Target: <span className="text-cyan-400">{scan.hostname}</span> • Posture: Grade {scan.securityGrade} ({scan.overallScore}/100)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 px-3 sm:px-6 bg-slate-950/40 text-xs font-mono shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dispatch'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Dispatch</span>
            <span className="hidden sm:inline">Dispatch Alert</span>
          </button>

          <button
            onClick={() => setActiveTab('playbook')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'playbook'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="sm:hidden">Playbook ({alertPayload.missingUpdates.length})</span>
            <span className="hidden sm:inline">Remediation Playbook ({alertPayload.missingUpdates.length} Updates)</span>
          </button>

          <button
            onClick={() => setActiveTab('advisory')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'advisory'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Email</span>
            <span className="hidden sm:inline">Email Advisory</span>
          </button>

          <button
            onClick={() => setActiveTab('payload')}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payload'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">SIEM JSON</span>
            <span className="hidden sm:inline">SIEM / JSON Payload</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">

          {/* TAB 1: DISPATCH ALERT */}
          {activeTab === 'dispatch' && (
            <div className="space-y-6">
              {/* Delivery Channel Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2 font-semibold uppercase tracking-wider">
                  Select Incident Alert Channel:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'slack', label: 'Slack Webhook', icon: MessageSquare, desc: 'Rich Block Kit Card' },
                    { id: 'discord', label: 'Discord Webhook', icon: Webhook, desc: 'High-Priority Embed' },
                    { id: 'email', label: 'Email Advisory', icon: Mail, desc: 'CISO / Sysadmin Mail' },
                    { id: 'webhook', label: 'SIEM / Webhook', icon: Send, desc: 'Custom JSON Payload' },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = channel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setChannel(ch.id as AlertChannel);
                          setSendResult(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/30'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="font-semibold text-xs font-mono">{ch.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endpoint Inputs */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                {channel === 'slack' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                      Slack Incoming Webhook URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tip: Create an Incoming Webhook in your Slack Workspace to receive real-time alerts in #security-alerts.
                    </p>
                  </div>
                )}

                {channel === 'discord' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                      Discord Webhook URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://discord.com/api/webhooks/1234567890/token"
                      value={discordWebhook}
                      onChange={(e) => setDiscordWebhook(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Generates a high-contrast embed in your designated Discord security operations channel.
                    </p>
                  </div>
                )}

                {channel === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <label className="block text-xs font-mono text-slate-300 font-semibold">
                          Administrator / DevOps Recipient Email:
                        </label>
                        {emailServerStatus && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              emailServerStatus.configured
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : 'bg-slate-800 text-cyan-400 border-slate-700'
                            }`}
                          >
                            {emailServerStatus.configured
                              ? `● Direct SMTP/Relay (${emailServerStatus.provider.toUpperCase()}) Active`
                              : '● Native Mail Client (mailto:) Operational'}
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        placeholder="security-admin@yourcompany.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Dispatches a comprehensive RFC-compliant security advisory with executive posture, severity matrix, and CVE checklist.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-cyan-400 font-bold">
                        <span>Email Dispatch Status: OPERATIONAL</span>
                        <span className="text-[10px] uppercase bg-cyan-950 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded">Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        • <strong className="text-white">Option A: Native Mail Client:</strong> Click <span className="text-cyan-300 font-semibold">"Open in Mail Client"</span> to immediately launch your local email app (Gmail, Outlook, Apple Mail) pre-filled with the full security advisory report.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        • <strong className="text-white">Option B: Server SMTP Relay:</strong> Click <span className="text-rose-400 font-semibold">"Send Email Alert"</span>. If <code className="text-cyan-300">SMTP_HOST</code> or <code className="text-cyan-300">RESEND_API_KEY</code> is set in environment, the server transmits it automatically.
                      </p>
                    </div>
                  </div>
                )}

                {channel === 'webhook' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                      Custom Webhook / SIEM Ingest URL (PagerDuty / Opsgenie):
                    </label>
                    <input
                      type="url"
                      placeholder="https://api.pagerduty.com/v2/enqueue or https://siem.internal/events"
                      value={customWebhook}
                      onChange={(e) => setCustomWebhook(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {/* Severity Filter Threshold */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-mono text-slate-400">Include Findings Threshold:</span>
                  <div className="flex items-center gap-1.5">
                    {(['CRITICAL', 'HIGH', 'ALL'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setThreshold(lvl)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                          threshold === lvl
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl === 'ALL' ? 'All Severities' : `${lvl}+ Only`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Incident Alert Preview Card */}
              <div className="rounded-xl border border-rose-900/60 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>OUTGOING INCIDENT DISPATCH PREVIEW</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {alertPayload.vulnerabilities.length} Flaws • {alertPayload.missingUpdates.length} Missing Updates
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <p>
                    <span className="text-slate-500">Subject:</span> [SECURITY ALERT] {scan.hostname} (Posture Grade {scan.securityGrade} • {scan.overallScore}/100)
                  </p>
                  <p>
                    <span className="text-slate-500">Critical Flaws:</span>{' '}
                    <span className="text-rose-400 font-bold">{scan.flawsCount.critical}</span> |{' '}
                    <span className="text-slate-500">High Flaws:</span>{' '}
                    <span className="text-amber-400 font-bold">{scan.flawsCount.high}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Outdated Software:</span>{' '}
                    <span className="text-amber-300 font-bold">{alertPayload.missingUpdates.length} components</span>
                  </p>
                </div>
              </div>

              {/* Result Notification */}
              {sendResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                    sendResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{sendResult.message}</p>
                    {sendResult.deliveredAt && (
                      <p className="text-[10px] text-emerald-400/80 mt-0.5">
                        Delivered timestamp: {sendResult.deliveredAt}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDispatchAlert}
                    disabled={isSending}
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs font-mono transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{channel === 'email' ? 'Dispatching Email...' : 'Dispatching Alert...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{channel === 'email' ? 'Send Email Alert' : 'Dispatch Alert Now'}</span>
                      </>
                    )}
                  </button>

                  {channel === 'email' && (
                    <a
                      href={mailtoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Mail Client</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(alertPayload, null, 2), 'payload-btn')}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  {copiedKey === 'payload-btn' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Payload</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Raw Payload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REMEDIATION PLAYBOOK & SCRIPT */}
          {activeTab === 'playbook' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Automated Sysadmin Patch Playbook</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready-to-run shell script to update outdated packages, rebuild containers, and fix security headers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(scan.softwareUpdates?.patchScript || '', 'script')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'script' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPatchScript}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sh</span>
                  </button>
                </div>
              </div>

              {/* Code viewer for patch script */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-400">
                  <span>patch-remediation.sh</span>
                  <span>Bash Shell Script</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
                  {scan.softwareUpdates?.patchScript || '# No patch commands available.'}
                </pre>
              </div>

              {/* Component Updates Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Detected Components & Patch Status ({scan.softwareUpdates?.items.length || 0})
                </h4>
                <div className="space-y-2">
                  {scan.softwareUpdates?.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{item.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'CRITICAL_UPDATE_REQUIRED'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : item.status === 'UPDATE_RECOMMENDED'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{item.riskSummary}</p>
                        {item.cves.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-rose-400 text-[10px] font-semibold">CVEs:</span>
                            {item.cves.map((c) => (
                              <span
                                key={c.cveId}
                                className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-[10px] text-rose-300"
                              >
                                {c.cveId} ({c.severity})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right sm:border-l sm:border-slate-800 sm:pl-4 space-y-1">
                        <div className="text-[11px] text-slate-400">
                          Detected: <span className="text-white font-bold">{item.detectedVersion || 'Unknown'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Target: <span className="text-cyan-400 font-bold">{item.latestVersion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMATTED EMAIL ADVISORY */}
          {activeTab === 'advisory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>Pre-Formatted Email Advisory for Sysadmins / DevOps</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready to copy and paste into internal email, ticket tracking (Jira/ServiceNow), or PagerDuty incident notes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(emailBodyText, 'email-advisory')}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedKey === 'email-advisory' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Advisory</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Subject:</span> {emailSubject}
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {emailBodyText}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: RAW JSON / SIEM INGEST */}
          {activeTab === 'payload' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span>SIEM & Webhook Machine-Readable Payload</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standard structured JSON payload for ingestion into Splunk, Elastic, Datadog, or SOAR pipelines.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(alertPayload, null, 2), 'raw-json')}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'raw-json' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <pre className="p-4 text-xs font-mono text-cyan-300 max-h-80 overflow-y-auto overflow-x-auto leading-relaxed">
                  {JSON.stringify(alertPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Alerts comply with RFC 822 & Webhook security practices</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
