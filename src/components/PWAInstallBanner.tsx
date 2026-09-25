import React, { useState } from 'react';
import { Smartphone, Download, X, Check, Shield } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenMobileModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenMobileModal }) => {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('webscanner_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already installed or explicitly dismissed in this session, do not render banner
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('webscanner_pwa_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledSuccess(true);
        setTimeout(() => handleDismiss(), 2500);
      }
    } else {
      onOpenMobileModal();
    }
  };

  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-blue-950/90 border-b border-cyan-800/50 px-4 py-2 text-xs font-mono text-cyan-200 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <p className="truncate">
            <span className="font-bold text-white">Download WEBSCANNER Mobile:</span>{' '}
            <span className="text-cyan-300/80 hidden sm:inline">
              Install native standalone app on Android & iPhone with offline security audit support.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDirectInstall}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            {installedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-950" />
                <span>Installed</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isInstallable ? 'Install App' : 'Download Mobile'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
