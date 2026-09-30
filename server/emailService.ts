import nodemailer from 'nodemailer';
import type { AdminAlertPayload } from '../src/types/scanner.ts';

export interface EmailDispatchResult {
  success: boolean;
  mode: 'smtp' | 'resend' | 'sendgrid' | 'mailto_fallback';
  message: string;
  deliveredTo?: string;
  error?: string;
}

export function isServerEmailConfigured(): {
  configured: boolean;
  provider: 'smtp' | 'resend' | 'sendgrid' | 'none';
} {
  if (process.env.RESEND_API_KEY) {
    return { configured: true, provider: 'resend' };
  }
  if (process.env.SENDGRID_API_KEY) {
    return { configured: true, provider: 'sendgrid' };
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return { configured: true, provider: 'smtp' };
  }
  return { configured: false, provider: 'none' };
}

export function generateAdvisoryHtml(payload: AdminAlertPayload): string {
  const isCritical = payload.criticalFlawsCount > 0;
  const gradeColor =
    payload.securityGrade.startsWith('A')
      ? '#10b981'
      : payload.securityGrade === 'B'
      ? '#06b6d4'
      : payload.securityGrade === 'C'
      ? '#f59e0b'
      : '#f43f5e';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Alert: ${payload.hostname}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 24px;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden;">
    
    <div style="background-color: ${isCritical ? '#450a0a' : '#1e1b4b'}; border-bottom: 2px solid ${isCritical ? '#dc2626' : '#6366f1'}; padding: 20px 24px;">
      <h1 style="margin: 0; font-size: 20px; color: #ffffff; letter-spacing: -0.5px;">
        🚨 URGENT: Security Incident Advisory
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; font-family: monospace;">
        Target: ${payload.hostname} (${payload.targetUrl})
      </p>
    </div>

    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px; background: #0f172a; border-radius: 8px; text-align: center; width: 33%;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-family: monospace;">Posture Grade</div>
            <div style="font-size: 26px; font-weight: bold; color: ${gradeColor}; font-family: monospace;">${payload.securityGrade}</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="padding: 12px; background: #0f172a; border-radius: 8px; text-align: center; width: 33%;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-family: monospace;">Critical Flaws</div>
            <div style="font-size: 26px; font-weight: bold; color: #f43f5e; font-family: monospace;">${payload.criticalFlawsCount}</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="padding: 12px; background: #0f172a; border-radius: 8px; text-align: center; width: 33%;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-family: monospace;">Pending Updates</div>
            <div style="font-size: 26px; font-weight: bold; color: #f59e0b; font-family: monospace;">${payload.outdatedUpdatesCount}</div>
          </td>
        </tr>
      </table>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #38bdf8; margin: 24px 0 8px 0; font-family: monospace;">
        Identified Vulnerabilities Requiring Attention
      </h3>
      <div style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 12px;">
        ${payload.vulnerabilities.length > 0 ? payload.vulnerabilities.map((v, i) => `
          <div style="padding: 8px 0; border-bottom: 1px solid #1e293b;">
            <strong style="color: ${v.severity === 'CRITICAL' ? '#f43f5e' : v.severity === 'HIGH' ? '#fb923c' : '#facc15'};">[${v.severity}]</strong>
            <span style="color: #f1f5f9; font-weight: 600;">${v.title}</span>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px;">Remediation: ${v.remediation}</p>
          </div>
        `).join('') : '<p style="color: #10b981; margin: 0;">No high-severity vulnerabilities detected.</p>'}
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #f59e0b; margin: 24px 0 8px 0; font-family: monospace;">
        Outdated Software Components & CVE Exploits
      </h3>
      <div style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 12px;">
        ${payload.missingUpdates.length > 0 ? payload.missingUpdates.map((u) => `
          <div style="padding: 8px 0; border-bottom: 1px solid #1e293b;">
            <strong style="color: #f1f5f9;">${u.name}</strong>:
            <span style="color: #f43f5e;">${u.detectedVersion || 'Legacy'}</span> &rarr;
            <span style="color: #10b981;">${u.latestVersion}</span>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px;">${u.remediation}</p>
          </div>
        `).join('') : '<p style="color: #10b981; margin: 0;">All components match active vendor patch baselines.</p>'}
      </div>

      <div style="margin-top: 24px; padding: 16px; background-color: #0284c715; border: 1px solid #0284c730; border-radius: 8px;">
        <h4 style="margin: 0 0 6px 0; color: #38bdf8; font-size: 13px;">Administrator Action Items</h4>
        <ol style="margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
          <li>Review the listed vulnerabilities and apply system updates immediately.</li>
          <li>Apply vendor patches to obsolete web servers, runtimes, and CMS plugins.</li>
          <li>Re-run the WEBSCANNER verification audit to validate remediation.</li>
        </ol>
      </div>

      <p style="margin-top: 24px; font-size: 11px; color: #64748b; font-family: monospace; text-align: center;">
        Automated Security Dispatch from WEBSCANNER Autonomous Audit Engine • ${new Date().toISOString()}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function generateAdvisoryPlaintext(payload: AdminAlertPayload): string {
  return `WEBSCANNER AUTOMATED SECURITY ADVISORY
Target: ${payload.targetUrl}
Hostname: ${payload.hostname}
Scan Timestamp: ${new Date().toISOString()}
Security Posture: Grade ${payload.securityGrade} (${payload.overallScore}/100)
Critical Flaws: ${payload.criticalFlawsCount}
High-Severity Flaws: ${payload.highFlawsCount}
Pending Outdated Component Updates: ${payload.outdatedUpdatesCount}

=======================================================
TOP DETECTED VULNERABILITIES:
=======================================================
${
  payload.vulnerabilities.length > 0
    ? payload.vulnerabilities
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
  payload.missingUpdates.length > 0
    ? payload.missingUpdates
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

Generated by WEBSCANNER Autonomous Audit Engine.`;
}

export interface SmtpTestConfig {
  host?: string;
  port?: number | string;
  user?: string;
  pass?: string;
  secure?: boolean;
  from?: string;
}

export interface SmtpTestResult {
  success: boolean;
  latencyMs: number;
  message: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  diagnostic?: {
    code?: string;
    command?: string;
    response?: string;
    details?: string;
    remediationTip?: string;
  };
}

export async function testSmtpConnection(config?: SmtpTestConfig): Promise<SmtpTestResult> {
  const host = (config?.host || process.env.SMTP_HOST || '').trim();
  const rawPort = config?.port || process.env.SMTP_PORT || '587';
  const port = parseInt(String(rawPort), 10) || 587;
  const user = (config?.user || process.env.SMTP_USER || '').trim();
  const pass = config?.pass !== undefined ? config.pass : (process.env.SMTP_PASS || '');
  const secure = config?.secure !== undefined ? Boolean(config.secure) : port === 465;

  if (!host) {
    return {
      success: false,
      latencyMs: 0,
      message: 'SMTP Hostname is required. Please provide a valid mail server (e.g. smtp.gmail.com).',
      host: '',
      port,
      secure,
      user,
      diagnostic: {
        code: 'MISSING_HOST',
        details: 'No SMTP hostname was provided in request configuration or server environment variables.',
        remediationTip: 'Enter a valid SMTP server address such as smtp.gmail.com, smtp.sendgrid.net, or mail.yourdomain.com.',
      },
    };
  }

  if (port < 1 || port > 65535) {
    return {
      success: false,
      latencyMs: 0,
      message: `Invalid SMTP port: ${port}. Must be between 1 and 65535.`,
      host,
      port,
      secure,
      user,
      diagnostic: {
        code: 'INVALID_PORT',
        details: 'The specified network port is outside the valid TCP range 1-65535.',
        remediationTip: 'Common SMTP ports are 587 (STARTTLS), 465 (SSL/TLS direct), or 25 (Standard unencrypted).',
      },
    };
  }

  const startTime = Date.now();

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      latencyMs,
      message: `SMTP connection established and authenticated successfully with ${host}:${port} (${latencyMs}ms).`,
      host,
      port,
      secure,
      user: user || '(anonymous)',
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errorCode = err.code || err.name || 'SMTP_ERROR';
    const errorDetails = err.message || 'Unknown SMTP error during handshake/auth';
    let remediationTip = 'Verify host network connectivity and ensure outbound TCP port is open.';

    if (
      errorCode === 'EAUTH' ||
      errorDetails.includes('Invalid login') ||
      errorDetails.includes('Username and Password not accepted')
    ) {
      remediationTip =
        'Authentication credentials rejected. Check your SMTP username and password. For Gmail or Office 365, ensure you are using an App Password instead of your primary account password.';
    } else if (errorCode === 'ETIMEDOUT' || errorCode === 'ESOCKETTIMEDOUT') {
      remediationTip = `Connection timed out after 8s attempting to connect to ${host}:${port}. Verify port number (587 for TLS, 465 for SSL) and verify that network/firewalls allow outbound SMTP traffic.`;
    } else if (errorCode === 'ECONNREFUSED') {
      remediationTip = `Connection refused by ${host} on port ${port}. Ensure the mail server daemon (Postfix, Exim, Exchange) is running and listening on this port.`;
    } else if (errorCode === 'ENOTFOUND') {
      remediationTip = `Hostname "${host}" could not be resolved via DNS. Check spelling of the mail server address.`;
    }

    return {
      success: false,
      latencyMs,
      message: `SMTP test failed: ${errorDetails}`,
      host,
      port,
      secure,
      user,
      diagnostic: {
        code: errorCode,
        command: err.command,
        response: err.response,
        details: errorDetails,
        remediationTip,
      },
    };
  }
}

export async function dispatchEmailAdvisory(
  payload: AdminAlertPayload,
  recipientEmail: string,
  customSmtp?: SmtpTestConfig
): Promise<EmailDispatchResult> {
  const subject = `[SECURITY ALERT - URGENT] ${payload.hostname} Vulnerability & Patch Advisory (Grade ${payload.securityGrade})`;
  const htmlContent = generateAdvisoryHtml(payload);
  const textContent = generateAdvisoryPlaintext(payload);
  const fromAddress = customSmtp?.from || process.env.SMTP_FROM || 'security-alerts@webscanner.local';

  // 1. Direct custom SMTP (if provided and configured in modal)
  if (customSmtp && customSmtp.host) {
    try {
      const port = parseInt(String(customSmtp.port || '587'), 10) || 587;
      const secure = customSmtp.secure !== undefined ? Boolean(customSmtp.secure) : port === 465;
      const transporter = nodemailer.createTransport({
        host: customSmtp.host,
        port,
        secure,
        auth: customSmtp.user ? { user: customSmtp.user, pass: customSmtp.pass || '' } : undefined,
        connectionTimeout: 10000,
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        mode: 'smtp',
        message: `Security advisory email dispatched via verified SMTP host (${customSmtp.host}:${port}) to ${recipientEmail}`,
        deliveredTo: recipientEmail,
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'smtp',
        message: `Direct SMTP dispatch failed: ${err?.message}`,
        error: err?.message,
      };
    }
  }

  // 2. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipientEmail],
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Resend returned HTTP ${res.status}`);
      }

      return {
        success: true,
        mode: 'resend',
        message: `Security advisory email dispatched via Resend to ${recipientEmail}`,
        deliveredTo: recipientEmail,
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'resend',
        message: `Resend dispatch failed: ${err?.message}`,
        error: err?.message,
      };
    }
  }

  // 3. SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipientEmail }] }],
          from: { email: fromAddress, name: 'WEBSCANNER Security Alerts' },
          subject,
          content: [
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`SendGrid returned HTTP ${res.status}: ${errText}`);
      }

      return {
        success: true,
        mode: 'sendgrid',
        message: `Security advisory email dispatched via SendGrid to ${recipientEmail}`,
        deliveredTo: recipientEmail,
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'sendgrid',
        message: `SendGrid dispatch failed: ${err?.message}`,
        error: err?.message,
      };
    }
  }

  // 4. Server-configured SMTP Transport via Nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        mode: 'smtp',
        message: `Security advisory email dispatched via server SMTP relay (${process.env.SMTP_HOST}) to ${recipientEmail}`,
        deliveredTo: recipientEmail,
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'smtp',
        message: `Server SMTP dispatch failed: ${err?.message}`,
        error: err?.message,
      };
    }
  }

  // 5. Default Fallback Mode: Client-Side / Mailto Pre-filled
  return {
    success: true,
    mode: 'mailto_fallback',
    message: `Advisory formatted for ${recipientEmail}. Ready to open in local mail client or send via clipboard.`,
    deliveredTo: recipientEmail,
  };
}
