import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar } from './components/AndroidNavBar';
import { WebViewContainer } from './components/WebViewContainer';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { ViewMode } from './types';
import { Wifi, WifiOff, Smartphone, Monitor, Code, RefreshCw } from 'lucide-react';

const TARGET_URL = 'https://funsky.top/login.php?from=apk';

export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('phone');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Monitor real browser network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsLoading(true);
    setRefreshCount((prev) => prev + 1);
    setTimeout(() => setIsLoading(false), 800);
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'phone' ? 'fullscreen' : 'phone'));
  };

  const effectiveOnline = isOnline && !isSimulatedOffline;

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* AI Studio Dashboard Header & Tester Controls */}
      <header className="w-full bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            APK
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>FunSky Android WebView App</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-normal bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                নো টুলবার (Full Screen)
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              অফলাইন পেজ ও এরর হ্যান্ডলিং সক্রিয় • স্টাটিক নো-লিঙ্ক মোড
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          {/* Offline Mode Tester Toggle */}
          <button
            onClick={toggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isSimulatedOffline
                ? 'bg-rose-600 text-white shadow-rose-900/30 hover:bg-rose-500'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-750'
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isSimulatedOffline ? 'অফলাইন মোড বন্ধ করুন' : 'অফলাইন টেস্ট'}</span>
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={toggleViewMode}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {viewMode === 'phone' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {viewMode === 'phone' ? 'ফুল স্ক্রিন ভিউ' : 'ফোন ফ্রেম ভিউ'}
            </span>
          </button>

          {/* Android Code Project Modal */}
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-900/20"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Android Studio কোড</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {viewMode === 'phone' ? (
          /* Phone Frame Container */
          <div className="relative w-full max-w-[390px] h-[780px] max-h-[calc(100vh-100px)] bg-black rounded-[42px] p-3 shadow-2xl ring-1 ring-slate-700 flex flex-col items-center">
            {/* Phone Outer Bezel & Speaker / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Phone Screen */}
            <div className="relative w-full h-full bg-slate-900 rounded-[32px] overflow-hidden flex flex-col border border-slate-800 shadow-inner">
              {/* Android Status Bar */}
              <AndroidStatusBar isOnline={effectiveOnline} />

              {/* Pure WebView without any top toolbar */}
              <WebViewContainer
                key={refreshCount}
                url={TARGET_URL}
                isOnline={isOnline}
                isSimulatedOffline={isSimulatedOffline}
                onToggleSimulatedOffline={toggleSimulatedOffline}
                onRefreshTrigger={handleManualRefresh}
              />

              {/* Android System Nav Bar */}
              <AndroidNavBar
                onBack={handleManualRefresh}
                onHome={handleManualRefresh}
                onRecent={handleManualRefresh}
              />
            </div>
          </div>
        ) : (
          /* Full Responsive Screen View */
          <div className="w-full h-full max-w-6xl max-h-[calc(100vh-100px)] bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl">
            {/* Android Status Bar */}
            <AndroidStatusBar isOnline={effectiveOnline} />

            {/* Pure WebView without any top toolbar */}
            <WebViewContainer
              key={refreshCount}
              url={TARGET_URL}
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              onToggleSimulatedOffline={toggleSimulatedOffline}
              onRefreshTrigger={handleManualRefresh}
            />

            {/* Android System Nav Bar */}
            <AndroidNavBar
              onBack={handleManualRefresh}
              onHome={handleManualRefresh}
              onRecent={handleManualRefresh}
            />
          </div>
        )}
      </main>

      {/* Android Studio Code Modal */}
      <AndroidCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        url={TARGET_URL}
      />
    </div>
  );
}
