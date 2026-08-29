import React from 'react';
import { ArrowLeft, Circle, Square, RotateCcw } from 'lucide-react';

interface AndroidNavBarProps {
  onBack?: () => void;
  onHome?: () => void;
  onRecent?: () => void;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  onBack,
  onHome,
  onRecent,
}) => {
  return (
    <div
      id="android-system-nav-bar"
      className="w-full h-11 bg-slate-950 flex items-center justify-around px-8 text-slate-400 select-none z-20 shrink-0 border-t border-slate-900"
    >
      {/* Back Button (Triangle / Arrow) */}
      <button
        id="android-nav-back"
        onClick={onBack}
        className="p-2 hover:text-white active:scale-90 transition-all rounded-full hover:bg-slate-800/60"
        title="Back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Home Button (Circle) */}
      <button
        id="android-nav-home"
        onClick={onHome}
        className="p-2 hover:text-white active:scale-90 transition-all rounded-full hover:bg-slate-800/60"
        title="Home"
      >
        <Circle className="w-4 h-4" />
      </button>

      {/* Recent / Reload Button (Square) */}
      <button
        id="android-nav-recent"
        onClick={onRecent}
        className="p-2 hover:text-white active:scale-90 transition-all rounded-full hover:bg-slate-800/60"
        title="Overview / Refresh"
      >
        <Square className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
