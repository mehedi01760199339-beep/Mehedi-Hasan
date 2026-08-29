import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertCircle, Signal, CheckCircle2, ShieldAlert } from 'lucide-react';

interface OfflineViewProps {
  onRetry: () => void;
  isRetrying: boolean;
  isSimulated?: boolean;
  onToggleSimulated?: () => void;
}

export const OfflineView: React.FC<OfflineViewProps> = ({
  onRetry,
  isRetrying,
  isSimulated,
  onToggleSimulated,
}) => {
  const [checkingNetwork, setCheckingNetwork] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const runDiagnostics = () => {
    setCheckingNetwork(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setCheckingNetwork(false);
      if (navigator.onLine && !isSimulated) {
        setDiagnosticResult('ইন্টারনেট সংযোগ পাওয়া গেছে! দয়া করে রিফ্রেশ করুন।');
      } else {
        setDiagnosticResult('ইন্টারনেট পাওয়া যায়নি। দয়া করে আপনার সংযোগ পরীক্ষা করুন।');
      }
    }, 1000);
  };

  return (
    <div
      id="offline-error-container"
      className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 select-none overflow-y-auto"
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Visual Icon Illustration */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-teal-50 border-8 border-teal-100/70 flex items-center justify-center shadow-inner">
            <WifiOff className="w-10 h-10 text-teal-800 animate-pulse" />
          </div>
          <span className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </span>
        </div>

        {/* Error Text in Bangla (Static No Links) */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            সংযোগ বিচ্ছিন্ন রয়েছে
          </h2>
          <p className="text-sm font-medium text-slate-600 leading-relaxed px-2">
            সার্ভার বা ইন্টারনেটের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। দয়া করে আপনার নেটওয়ার্ক চেক করে আবার চেষ্টা করুন।
          </p>
        </div>

        {/* Retry and Actions */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            id="offline-retry-btn"
            onClick={onRetry}
            disabled={isRetrying}
            style={{ backgroundColor: '#004D40' }}
            className="w-full h-12 hover:opacity-95 active:scale-[0.99] text-white font-medium rounded-xl shadow-md shadow-teal-900/20 flex items-center justify-center gap-2.5 transition-all duration-150 disabled:opacity-75 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'লোড হচ্ছে...' : 'পুনরায় চেষ্টা করুন'}</span>
          </button>

          <button
            id="offline-diagnose-btn"
            onClick={runDiagnostics}
            disabled={checkingNetwork}
            className="w-full h-10 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Signal className={`w-3.5 h-3.5 ${checkingNetwork ? 'animate-bounce text-teal-700' : 'text-slate-500'}`} />
            <span>{checkingNetwork ? 'যাচাই করা হচ্ছে...' : 'নেটওয়ার্ক পরীক্ষা'}</span>
          </button>
        </div>

        {/* Diagnostic Feedback */}
        {diagnosticResult && (
          <div className="w-full p-3 rounded-lg bg-teal-50 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-2 text-left animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>{diagnosticResult}</span>
          </div>
        )}

        {/* Static Troubleshooting Info - Zero Links */}
        <div className="w-full bg-white rounded-xl p-3.5 border border-slate-200/90 text-left shadow-xs text-xs space-y-2 text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-800" />
            <span>সম্ভাব্য সমাধান:</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600">
            <li>ওয়াইফাই বা মোবাইল ইন্টারনেট অন আছে কিনা দেখুন</li>
            <li>ডিভাইস রিস্টার্ট বা ফ্লাইট মোড অন/অফ করুন</li>
            <li>স্ক্রিনটি নিচের দিকে টেনে রিফ্রেশ করুন</li>
          </ul>
        </div>

        {/* Simulation switch for testing */}
        {onToggleSimulated && (
          <div className="pt-1">
            <button
              onClick={onToggleSimulated}
              className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer"
            >
              {isSimulated ? 'অফলাইন টেস্ট বন্ধ করুন' : 'অফলাইন টেস্ট করুন'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

