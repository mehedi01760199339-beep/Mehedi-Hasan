import React, { useState, useEffect, useRef } from 'react';
import { OfflineView } from './OfflineView';
import { PullToRefreshContainer } from './PullToRefreshContainer';
import { Download, CheckCircle2 } from 'lucide-react';

interface WebViewContainerProps {
  url: string;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  onRefreshTrigger?: () => void;
}

export const WebViewContainer: React.FC<WebViewContainerProps> = ({
  url,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasIframeError, setHasIframeError] = useState(false);
  const [downloadToast, setDownloadToast] = useState<{ fileName: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const effectiveOnline = isOnline && !isSimulatedOffline && !hasIframeError;

  // Trigger reload
  const reloadPage = async () => {
    setIsRetrying(true);
    setIsLoading(true);
    setHasIframeError(false);
    setLoadProgress(20);

    const p1 = setTimeout(() => setLoadProgress(60), 300);
    const p2 = setTimeout(() => setLoadProgress(90), 600);

    setIframeKey((prev) => prev + 1);

    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRetrying(false);
    clearTimeout(p1);
    clearTimeout(p2);
  };

  const handleIframeLoad = () => {
    setLoadProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadProgress(0);
    }, 200);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasIframeError(true);
  };

  const triggerSampleDownload = (fileName = 'FunSky_Report.pdf') => {
    // Trigger direct client download to device's Download folder
    const blob = new Blob(
      [
        `FunSky WebView Download Package\nTimestamp: ${new Date().toISOString()}\nDestination: Phone/Internal Storage/Download\nStatus: Successfully Downloaded via Android DownloadManager`,
      ],
      { type: 'text/plain' }
    );
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    setDownloadToast({ fileName });
    setTimeout(() => {
      setDownloadToast(null);
    }, 4000);
  };

  useEffect(() => {
    if (isOnline && !isSimulatedOffline) {
      setHasIframeError(false);
      reloadPage();
    }
  }, [isOnline, isSimulatedOffline]);

  return (
    <div id="webview-main-container" className="relative flex-1 w-full h-full bg-slate-100 overflow-hidden flex flex-col">
      {/* Android Toast Notification for Download Complete */}
      {downloadToast && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 bg-slate-900/95 text-white text-xs font-medium rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-100">ডাউনলোড সম্পন্ন হয়েছে!</span>
            <span className="text-[11px] text-slate-300">
              {downloadToast.fileName} (Download ফোল্ডারে সেভ হয়েছে)
            </span>
          </div>
        </div>
      )}

      {/* Pull To Refresh Wrapped Container */}
      <PullToRefreshContainer
        onRefresh={reloadPage}
        isRefreshing={isRetrying}
        disabled={!effectiveOnline}
      >
        {!effectiveOnline ? (
          /* Pure Static Offline / Error Screen without any URL or site links */
          <OfflineView
            onRetry={reloadPage}
            isRetrying={isRetrying}
            isSimulated={isSimulatedOffline || hasIframeError}
            onToggleSimulated={onToggleSimulatedOffline}
          />
        ) : (
          /* Pure Fullscreen WebView Live Frame without any top toolbar */
          <div className="relative flex-1 w-full h-full bg-white flex flex-col">
            <iframe
              ref={iframeRef}
              key={iframeKey}
              id="webview-iframe"
              src={url}
              title="FunSky APK Frame"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              className="w-full h-full border-0 flex-1 bg-white"
              allow="camera; microphone; geolocation; clipboard-read; clipboard-write; downloads"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            />

            {/* Floating test download action (no URL displayed) */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
              <button
                onClick={() => triggerSampleDownload('FunSky_Statement.txt')}
                className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs text-xs font-medium rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 transition-all opacity-75 hover:opacity-100 cursor-pointer"
                title="ডাউনলোড টেস্ট করুন (Test Download to Phone Downloads)"
              >
                <Download className="w-3 h-3 text-teal-400" />
                <span className="text-[11px]">ডাউনলোড টেস্ট</span>
              </button>
            </div>
          </div>
        )}
      </PullToRefreshContainer>
    </div>
  );
};

