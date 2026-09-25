import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  Check,
  X,
  QrCode,
  Shield,
  Zap,
  HardDriveDownload,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qrcode'>('android');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://webscanner.app';

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Generate a clean QR code URL using standard public QR API or clean fallback
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=02-06-23&color=38-189-248&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span>Download Mobile App</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
                  PWA Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Install WEBSCANNER on your smartphone or tablet with full offline security scanning.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Platform Tabs */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-slate-950 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qrcode')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Tab 1: Android / Chrome */}
        {activeTab === 'android' && (
          <div className="mt-5 space-y-4">
            {isInstalled ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold font-mono text-emerald-300">Application Already Installed</p>
                  <p className="text-[11px] text-emerald-400/80 mt-0.5">
                    WEBSCANNER is running in standalone native mode on your device.
                  </p>
                </div>
              </div>
            ) : isInstallable ? (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-center space-y-3">
                <p className="text-xs text-slate-300 font-mono">
                  Your browser supports direct 1-click installation to your home screen or app drawer!
                </p>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  {installSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Installed Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download & Install Mobile App</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <p className="text-xs font-mono font-bold text-slate-200">
                  How to Install on Android / Chrome:
                </p>
                <ol className="text-xs text-slate-300 font-mono space-y-2 list-decimal list-inside pl-1">
                  <li>
                    Open this URL in <strong>Google Chrome</strong> or <strong>Edge</strong> on your phone.
                  </li>
                  <li>
                    Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.
                  </li>
                  <li>
                    Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </li>
                  <li>
                    Confirm to add the WEBSCANNER icon to your app launcher.
                  </li>
                </ol>
              </div>
            )}

            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] text-slate-300">Instant Startup & Zero App Store Fees</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                <HardDriveDownload className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[11px] text-slate-300">Full Offline Service Worker Cache</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: iPhone / iPad (iOS Safari) */}
        {activeTab === 'ios' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
              <p className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                <Share className="w-4 h-4" />
                <span>Install on Apple iOS (Safari):</span>
              </p>

              <div className="space-y-3 text-xs font-mono text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <span>
                    Open this page in <strong>Safari</strong> on your iPhone or iPad.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <span>
                    Tap the <strong>Share button</strong>{' '}
                    <span className="inline-block p-1 bg-slate-800 rounded border border-slate-700 text-cyan-300">
                      <Share className="w-3 h-3 inline" />
                    </span>{' '}
                    in the bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <span>
                    Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>{' '}
                    <PlusSquare className="w-3 h-3 inline text-cyan-300 ml-1" />.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    4
                  </span>
                  <span>
                    Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner. The WEBSCANNER app icon will appear on your Home Screen!
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] font-mono text-blue-300/90 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Runs in full-screen standalone mode with no browser URL bar or navigation controls.</span>
            </div>
          </div>
        )}

        {/* Tab 3: QR Code (Desktop to Mobile) */}
        {activeTab === 'qrcode' && (
          <div className="mt-5 space-y-4 text-center">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-inner">
                <img
                  src={qrCodeApiUrl}
                  alt="Scan to open on mobile"
                  className="w-44 h-44 rounded-xl object-contain bg-slate-950"
                  loading="lazy"
                />
              </div>
              <p className="text-xs font-mono font-semibold text-slate-200 mt-3">
                Scan with your Phone Camera
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1 max-w-xs">
                Point your smartphone camera at the QR code above to immediately launch and install WEBSCANNER on your device.
              </p>
            </div>

            {/* Quick URL Copy */}
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-300 px-2 focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Progressive Web App (PWA) Standard</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
