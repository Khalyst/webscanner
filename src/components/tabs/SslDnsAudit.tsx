import React from 'react';
import {
  Lock,
  ShieldCheck,
  Mail,
  Clock,
  Key,
  Cookie,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { SslInfo, DnsRecords, CookieAudit } from '../../types/scanner';

interface SslDnsAuditProps {
  sslInfo?: SslInfo;
  dnsRecords: DnsRecords;
  cookies: CookieAudit[];
}

export const SslDnsAudit: React.FC<SslDnsAuditProps> = ({ sslInfo, dnsRecords, cookies }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* 1. TLS/SSL Cryptographic Audit */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.sslAuditTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.sslAuditDesc}
              </p>
            </div>
          </div>

          {sslInfo && (
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                sslInfo.valid
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                  : 'text-rose-400 bg-rose-950/40 border-rose-800/40'
              }`}
            >
              {sslInfo.valid ? t.certValid : t.certInvalid}
            </span>
          )}
        </div>

        {sslInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* Validity & Expiration */}
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.daysRemaining}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.daysRemaining}:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      sslInfo.daysRemaining < 15 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {sslInfo.daysRemaining} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.issuedOn}:</span>
                  <span className="text-slate-300">
                    {new Date(sslInfo.validFrom).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.expiresOn}:</span>
                  <span className="text-slate-300">
                    {new Date(sslInfo.validTo).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Expiry progress bar */}
              <div className="pt-2">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sslInfo.daysRemaining < 15 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, (sslInfo.daysRemaining / 90) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Issuer & Subject */}
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.issuerCa}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-slate-500 block">{t.issuerCa}:</span>
                  <span className="text-slate-200 font-semibold truncate block">
                    {sslInfo.issuer.organization || sslInfo.issuer.commonName || 'Unknown CA'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t.subjectCn}:</span>
                  <span className="text-slate-200 truncate block">
                    {sslInfo.subject.commonName || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Protocol & Cipher */}
            <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
              <div className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.activeCipher}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Protocol:</span>
                  <span className="text-emerald-400 font-bold">{sslInfo.protocol}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t.activeCipher}:</span>
                  <span className="text-slate-200 break-all text-[11px] block">
                    {sslInfo.cipherSuite}
                  </span>
                </div>
              </div>
            </div>

            {/* SANs (Subject Alternative Names) */}
            {sslInfo.sans.length > 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 p-3.5 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                  Subject Alternative Names (SANs - {sslInfo.sans.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {sslInfo.sans.map((san) => (
                    <span
                      key={san}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      {san}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 font-mono text-xs">
            {t.certInvalid}
          </div>
        )}
      </div>

      {/* 2. DNS & Email Spoofing Defense (SPF / DMARC) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.dnsEmailTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.dnsEmailDesc}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SPF Record */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">{t.spfTitle}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  dnsRecords.spf?.valid && dnsRecords.spf.policy !== 'PERMISSIVE'
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                    : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                }`}
              >
                {dnsRecords.spf?.policy || 'MISSING'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{dnsRecords.spf?.details}</p>
            {dnsRecords.spf?.record && (
              <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-cyan-300 break-all border border-slate-800/60">
                {dnsRecords.spf.record}
              </div>
            )}
          </div>

          {/* DMARC Record */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">{t.dmarcTitle}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  dnsRecords.dmarc?.valid && dnsRecords.dmarc.policy !== 'NONE'
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                    : 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                }`}
              >
                {dnsRecords.dmarc?.policy || 'MISSING'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{dnsRecords.dmarc?.details}</p>
            {dnsRecords.dmarc?.record && (
              <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-cyan-300 break-all border border-slate-800/60">
                {dnsRecords.dmarc.record}
              </div>
            )}
          </div>
        </div>

        {/* DNS Zone Records Table */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            {t.dnsRecordsTitle}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            {/* A Records */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
              <span className="text-slate-500 block mb-1">A (IPv4):</span>
              {dnsRecords.a && dnsRecords.a.length > 0 ? (
                <div className="space-y-0.5 text-slate-200">
                  {dnsRecords.a.map((ip) => (
                    <div key={ip} className="tabular-nums">{ip}</div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-600">None</span>
              )}
            </div>

            {/* AAAA Records */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
              <span className="text-slate-500 block mb-1">AAAA (IPv6):</span>
              {dnsRecords.aaaa && dnsRecords.aaaa.length > 0 ? (
                <div className="space-y-0.5 text-slate-200 truncate">
                  {dnsRecords.aaaa.map((ip) => (
                    <div key={ip} className="truncate tabular-nums" title={ip}>{ip}</div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-600">None</span>
              )}
            </div>

            {/* MX Records */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
              <span className="text-slate-500 block mb-1">MX (Mail Exchange):</span>
              {dnsRecords.mx && dnsRecords.mx.length > 0 ? (
                <div className="space-y-0.5 text-slate-200">
                  {dnsRecords.mx.map((m) => (
                    <div key={m.exchange} className="truncate" title={m.exchange}>
                      [{m.priority}] {m.exchange}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-600">None</span>
              )}
            </div>

            {/* NS Records */}
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
              <span className="text-slate-500 block mb-1">NS (Name Servers):</span>
              {dnsRecords.ns && dnsRecords.ns.length > 0 ? (
                <div className="space-y-0.5 text-slate-200">
                  {dnsRecords.ns.slice(0, 3).map((ns) => (
                    <div key={ns} className="truncate" title={ns}>{ns}</div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-600">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cookies Security Flags */}
      {cookies.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.cookieSecurityTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.cookieSecurityDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cookies.map((c) => (
              <div key={c.name} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                <div className="font-mono font-bold text-xs text-slate-200 truncate">
                  {c.name}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span
                    className={`flex items-center gap-1 ${
                      c.secure ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {c.secure ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    Secure
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      c.httpOnly ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {c.httpOnly ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    HttpOnly
                  </span>
                  <span className="text-slate-400">SameSite: {c.sameSite || 'None'}</span>
                </div>
                {c.issues.length > 0 && (
                  <div className="text-[11px] text-rose-300/90 bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                    {c.issues.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
