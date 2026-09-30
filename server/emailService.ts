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

export async function dispatchEmailAdvisory(
  payload: AdminAlertPayload,
  recipientEmail: string
): Promise<EmailDispatchResult> {
  const subject = `[SECURITY ALERT - URGENT] ${payload.hostname} Vulnerability & Patch Advisory (Grade ${payload.securityGrade})`;
  const htmlContent = generateAdvisoryHtml(payload);
  const textContent = generateAdvisoryPlaintext(payload);
  const fromAddress = process.env.SMTP_FROM || 'security-alerts@webscanner.local';

  // 1. Resend API
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

  // 2. SendGrid API
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

  // 3. SMTP Transport via Nodemailer
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
        message: `Security advisory email dispatched via SMTP relay (${process.env.SMTP_HOST}) to ${recipientEmail}`,
        deliveredTo: recipientEmail,
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'smtp',
        message: `SMTP dispatch failed: ${err?.message}`,
        error: err?.message,
      };
    }
  }

  // 4. Default Fallback Mode: Client-Side / Mailto Pre-filled
  return {
    success: true,
    mode: 'mailto_fallback',
    message: `Advisory formatted for ${recipientEmail}. Ready to open in local mail client or send via clipboard.`,
    deliveredTo: recipientEmail,
  };
}
