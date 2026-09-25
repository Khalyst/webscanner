import { jsPDF } from 'jspdf';
import { translations, type SupportedLanguage } from '../i18n/translations';
import type { ScanResult } from '../types/scanner';

export function generateAuditPdf(scan: ScanResult, lang: SupportedLanguage = 'en'): void {
  const t = translations[lang] || translations.en;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${t.appName} // ${t.tagline}`, margin, y);
    doc.text(`TARGET: ${scan.hostname.toUpperCase()}`, pageWidth - margin, y, { align: 'right' });
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
  };

  // --- COVER / HEADER BANNER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(t.appName, margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(t.tagline, margin + 6, y + 16);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Target: ${scan.url}`, margin + 6, y + 24);
  doc.text(`Scan ID: ${scan.id}  ·  IP: ${scan.ip || 'Unknown'}  ·  Duration: ${scan.scanDurationMs}ms`, margin + 6, y + 29);
  doc.text(`Timestamp: ${new Date(scan.scanTimestamp).toUTCString()}`, margin + 6, y + 34);

  // Score Badge in Banner
  const scoreX = pageWidth - margin - 28;
  const scoreY = y + 5;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(scoreX, scoreY, 22, 28, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  if (scan.overallScore >= 80) doc.setTextColor(34, 197, 94); // emerald
  else if (scan.overallScore >= 60) doc.setTextColor(234, 179, 8); // yellow
  else doc.setTextColor(239, 68, 68); // red
  doc.text(`${scan.overallScore}`, scoreX + 11, scoreY + 11, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('SCORE / 100', scoreX + 11, scoreY + 16, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`GRADE ${scan.securityGrade}`, scoreX + 11, scoreY + 24, { align: 'center' });

  y += 44;

  // --- STATS SUMMARY BAR ---
  checkPageBreak(18);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');

  const statWidth = contentWidth / 5;
  const stats = [
    { label: t.criticalRisk.toUpperCase(), val: scan.flawsCount.critical, color: [220, 38, 38] },
    { label: t.highRisk.toUpperCase(), val: scan.flawsCount.high, color: [234, 88, 12] },
    { label: t.mediumRisk.toUpperCase(), val: scan.flawsCount.medium, color: [202, 138, 4] },
    { label: t.lowRisk.toUpperCase(), val: scan.flawsCount.low, color: [37, 99, 235] },
    { label: t.passedChecks.toUpperCase(), val: scan.passedChecksCount, color: [22, 163, 74] },
  ];

  stats.forEach((s, idx) => {
    const sx = margin + idx * statWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(s.color[0], s.color[1], s.color[2]);
    doc.text(String(s.val), sx + statWidth / 2, y + 6, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(s.label, sx + statWidth / 2, y + 10.5, { align: 'center' });
  });

  y += 19;

  // --- EXECUTIVE SUMMARY ---
  if (scan.aiAnalysis) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`1. ${t.cisoReportTitle}`, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(scan.aiAnalysis.executiveSummary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 4 + 4;

    if (scan.aiAnalysis.topThreatVectors && scan.aiAnalysis.topThreatVectors.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${t.threatPathwaysHeading}:`, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      scan.aiAnalysis.topThreatVectors.forEach((vec) => {
        const vLines = doc.splitTextToSize(`• ${vec}`, contentWidth - 4);
        doc.text(vLines, margin + 2, y);
        y += vLines.length * 3.8;
      });
      y += 3;
    }
  }

  // --- SECURITY FLAWS BREAKDOWN ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. ${t.navFlaws} (${scan.flaws.length})`, margin, y);
  y += 6;

  if (scan.flaws.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 163, 74);
    doc.text(t.noFlawsFound, margin, y);
    y += 8;
  } else {
    scan.flaws.forEach((flaw, idx) => {
      checkPageBreak(32);

      // Card container
      doc.setFillColor(254, 254, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 26, 1, 1, 'FD');

      // Severity bar on left edge
      if (flaw.severity === 'CRITICAL') doc.setFillColor(220, 38, 38);
      else if (flaw.severity === 'HIGH') doc.setFillColor(234, 88, 12);
      else if (flaw.severity === 'MEDIUM') doc.setFillColor(202, 138, 4);
      else doc.setFillColor(37, 99, 235);
      doc.rect(margin, y, 2.5, 26, 'F');

      // Title & ID
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const titleStr = `${idx + 1}. [${flaw.severity}] ${flaw.title}`;
      doc.text(doc.splitTextToSize(titleStr, contentWidth - 28), margin + 5, y + 4.5);

      // CVSS & OWASP
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${t.cvssScoreLabel}: ${flaw.cvssScore} · ${flaw.owaspCategory || flaw.category}`, margin + 5, y + 8.5);

      // Description & Impact
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const descLines = doc.splitTextToSize(`${t.exploitationImpact}: ${flaw.impact}`, contentWidth - 10);
      doc.text(descLines.slice(0, 2), margin + 5, y + 13);

      // Remediation summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      const remLines = doc.splitTextToSize(`Fix: ${flaw.remediation}`, contentWidth - 10);
      doc.text(remLines.slice(0, 2), margin + 5, y + 21);

      y += 29;
    });
  }

  // --- HTTP SECURITY HEADERS MATRIX ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. ${t.headersMatrixTitle}`, margin, y);
  y += 5;

  // Header Table Top
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('STATUS', margin + 3, y + 4.2);
  doc.text('HEADER NAME', margin + 20, y + 4.2);
  doc.text(t.recommendationLabel.toUpperCase(), margin + 70, y + 4.2);
  y += 6.5;

  scan.headersAudit.forEach((h) => {
    checkPageBreak(8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (h.status === 'PASS') {
      doc.setTextColor(22, 163, 74);
      doc.text('[PASS]', margin + 3, y + 4);
    } else if (h.status === 'WARN') {
      doc.setTextColor(202, 138, 4);
      doc.text('[WARN]', margin + 3, y + 4);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('[FAIL]', margin + 3, y + 4);
    }

    doc.setTextColor(15, 23, 42);
    doc.text(h.header, margin + 20, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const recText = h.value ? `${h.value.slice(0, 45)}...` : h.recommendation;
    doc.text(doc.splitTextToSize(recText, contentWidth - 72)[0] || '', margin + 70, y + 4);

    y += 5.5;
  });
  y += 4;

  // --- SSL/TLS & CRYPTOGRAPHIC POSTURE ---
  if (scan.sslInfo) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`4. ${t.sslAuditTitle}`, margin, y);
    y += 5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 22, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${t.issuerCa}: ${scan.sslInfo.issuer.organization || scan.sslInfo.issuer.commonName || 'Unknown CA'}`, margin + 4, y + 5);
    doc.text(`Protocol: ${scan.sslInfo.protocol}`, margin + 4, y + 10);
    doc.text(`${t.activeCipher}: ${scan.sslInfo.cipherSuite}`, margin + 4, y + 15);

    const sslStatusStr = scan.sslInfo.valid ? `${t.certValid} (${scan.sslInfo.daysRemaining} days left)` : t.certInvalid;
    doc.text(`Status: ${sslStatusStr}`, margin + 90, y + 5);
    doc.text(`${t.expiresOn}: ${new Date(scan.sslInfo.validTo).toLocaleDateString()}`, margin + 90, y + 10);
    doc.text(`HTTPS Redirect: ${scan.httpsRedirects ? 'Enforced' : 'Missing'}`, margin + 90, y + 15);

    y += 26;
  }

  // --- DNS & EMAIL SECURITY ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`5. ${t.dnsEmailTitle}`, margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 1, 1, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const spfStatus = scan.dnsRecords.spf?.valid ? `CONFIGURED (${scan.dnsRecords.spf.policy})` : 'MISSING';
  const dmarcStatus = scan.dnsRecords.dmarc?.valid ? `CONFIGURED (${scan.dnsRecords.dmarc.policy})` : 'MISSING';

  doc.text(`${t.spfTitle}: ${spfStatus}`, margin + 4, y + 5.5);
  doc.text(`${t.dmarcTitle}: ${dmarcStatus}`, margin + 4, y + 11.5);
  doc.text(`Name Servers: ${(scan.dnsRecords.ns || []).slice(0, 2).join(', ') || 'N/A'}`, margin + 85, y + 5.5);
  doc.text(`Mail Servers (MX): ${(scan.dnsRecords.mx || []).slice(0, 2).map((m) => m.exchange).join(', ') || 'None'}`, margin + 85, y + 11.5);

  y += 22;

  // --- FOOTER & PAGE NUMBERS ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Generated by ${t.appName} · ${t.footerRights}`, margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  // Trigger download
  const safeHost = scan.hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  doc.save(`${t.appName}-Audit-${safeHost}-${Date.now()}.pdf`);
}
