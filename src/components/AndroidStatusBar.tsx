import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, BatteryMedium, BatteryCharging, SignalHigh, SignalZero } from 'lucide-react';

interface AndroidStatusBarProps {
  isOnline: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isOnline }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).replace(/\s*(AM|PM)/i, '')
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android-status-bar"
      style={{ backgroundColor: '#004D40' }}
      className="w-full h-8 px-4 flex items-center justify-between text-[#ffffff] text-xs font-semibold select-none z-20 shrink-0"
    >
      {/* Left: Clock */}
      <div className="flex items-center gap-1.5 font-medium tracking-tight text-[#ffffff]">
        <span className="text-[#ffffff]">{time || '10:30'}</span>
      </div>

      {/* Center: Camera Cutout Dot */}
      <div className="w-3.5 h-3.5 rounded-full bg-black/80 border border-white/20 shadow-inner"></div>

      {/* Right: Icons (Cellular, Wifi/Offline, Battery) all #ffffff */}
      <div className="flex items-center gap-2 text-[#ffffff]">
        {isOnline ? (
          <>
            <span className="text-[10px] tracking-wider text-[#ffffff] font-mono font-bold">5G</span>
            <SignalHigh className="w-3.5 h-3.5 text-[#ffffff]" />
            <Wifi className="w-3.5 h-3.5 text-[#ffffff]" />
          </>
        ) : (
          <>
            <SignalZero className="w-3.5 h-3.5 text-[#ffffff]/80" />
            <WifiOff className="w-3.5 h-3.5 text-[#ffffff] animate-pulse" />
          </>
        )}
        <div className="flex items-center gap-0.5 text-[10px] text-[#ffffff] font-mono">
          <span className="text-[#ffffff]">88%</span>
          <BatteryMedium className="w-4 h-4 text-[#ffffff]" />
        </div>
      </div>
    </div>
  );
};
